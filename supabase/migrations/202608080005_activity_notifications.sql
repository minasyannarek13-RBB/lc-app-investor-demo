-- Social MVP: activity_events + notifications
-- Both tables are written exclusively by SECURITY DEFINER trigger functions.
-- Neither table grants any INSERT policy to authenticated/anon -- clients
-- cannot manufacture activity events or notifications.

-- ---------------------------------------------------------------------------
-- activity_events (internal, append-only log; not exposed to clients)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id           bigint generated always as identity primary key,
  actor_id     uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  verb         text not null,
  target_type  text not null,
  target_id    uuid not null,
  created_at   timestamptz not null default now(),
  constraint activity_events_verb_check check (verb in ('followed', 'post_liked', 'commented', 'replied')),
  constraint activity_events_target_type_check check (target_type in ('profile', 'post', 'comment'))
);

create index if not exists activity_events_recipient_id_idx on public.activity_events (recipient_id, created_at desc);
create index if not exists activity_events_actor_id_idx on public.activity_events (actor_id, created_at desc);

alter table public.activity_events enable row level security;
-- Deliberately zero policies: RLS enabled + no policies = deny-all for every
-- non-owner role. Rows are written only by the SECURITY DEFINER functions
-- below, which run as the migration/table-owner role and bypass RLS.

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id     uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  target_type  text not null,
  target_id    uuid,
  event_id     bigint references public.activity_events(id) on delete set null,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint notifications_type_check check (type in ('new_follower', 'post_like', 'comment', 'comment_reply')),
  constraint notifications_target_type_check check (target_type in ('profile', 'post', 'comment'))
);

-- Primary inbox query: unread-first / chronological retrieval per recipient.
create index if not exists notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_recipient_unread_idx on public.notifications (recipient_id, read_at) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (auth.uid() = recipient_id);

-- Recipient may update their own notification (to mark read); the trigger
-- below restricts this to the read_at column only. No INSERT/DELETE policy
-- for clients.
drop policy if exists "notifications_update_own_read_state" on public.notifications;
create policy "notifications_update_own_read_state"
  on public.notifications for update
  to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create or replace function public.protect_notification_fields()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.recipient_id is distinct from old.recipient_id
    or new.actor_id is distinct from old.actor_id
    or new.type is distinct from old.type
    or new.target_type is distinct from old.target_type
    or new.target_id is distinct from old.target_id
    or new.event_id is distinct from old.event_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'only read_at may be updated on notifications';
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_protect_fields on public.notifications;
create trigger notifications_protect_fields
  before update on public.notifications
  for each row execute function public.protect_notification_fields();

-- ---------------------------------------------------------------------------
-- Trigger functions: activity_events + notifications fan-out
-- ---------------------------------------------------------------------------
-- Each function: skips self-notification, skips blocked pairs, writes one
-- activity_events row and (at most) one notifications row per recipient, in
-- the same transaction as the source action. SECURITY DEFINER is required
-- because these functions write to tables with no client INSERT policy.

create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id bigint;
begin
  if new.follower_id = new.following_id then
    return new;
  end if;

  if public.is_blocked_pair(new.follower_id, new.following_id) then
    return new;
  end if;

  insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
  values (new.follower_id, new.following_id, 'followed', 'profile', new.following_id)
  returning id into v_event_id;

  insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
  values (new.following_id, new.follower_id, 'new_follower', 'profile', new.following_id, v_event_id);

  return new;
end;
$$;

drop trigger if exists follows_notify on public.follows;
create trigger follows_notify
  after insert on public.follows
  for each row execute function public.notify_new_follower();

create or replace function public.notify_post_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
  v_event_id  bigint;
begin
  select author_id into v_author_id from public.posts where id = new.post_id;

  if v_author_id is null or v_author_id = new.user_id then
    return new;
  end if;

  if public.is_blocked_pair(new.user_id, v_author_id) then
    return new;
  end if;

  insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
  values (new.user_id, v_author_id, 'post_liked', 'post', new.post_id)
  returning id into v_event_id;

  insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
  values (v_author_id, new.user_id, 'post_like', 'post', new.post_id, v_event_id);

  return new;
end;
$$;

drop trigger if exists post_likes_notify on public.post_likes;
create trigger post_likes_notify
  after insert on public.post_likes
  for each row execute function public.notify_post_like();

create or replace function public.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_author_id   uuid;
  v_parent_author_id uuid;
  v_event_id         bigint;
begin
  select author_id into v_post_author_id from public.posts where id = new.post_id;

  if new.parent_comment_id is not null then
    select author_id into v_parent_author_id from public.comments where id = new.parent_comment_id;

    if v_parent_author_id is not null
       and v_parent_author_id <> new.author_id
       and not public.is_blocked_pair(new.author_id, v_parent_author_id) then
      insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
      values (new.author_id, v_parent_author_id, 'replied', 'comment', new.id)
      returning id into v_event_id;

      insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
      values (v_parent_author_id, new.author_id, 'comment_reply', 'comment', new.id, v_event_id);
    end if;
  end if;

  -- Also notify the post author, unless they are the commenter or were
  -- already notified above as the parent-comment author.
  if v_post_author_id is not null
     and v_post_author_id <> new.author_id
     and v_post_author_id is distinct from v_parent_author_id
     and not public.is_blocked_pair(new.author_id, v_post_author_id) then
    insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
    values (new.author_id, v_post_author_id, 'commented', 'post', new.post_id)
    returning id into v_event_id;

    insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
    values (v_post_author_id, new.author_id, 'comment', 'post', new.post_id, v_event_id);
  end if;

  return new;
end;
$$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_comment();
