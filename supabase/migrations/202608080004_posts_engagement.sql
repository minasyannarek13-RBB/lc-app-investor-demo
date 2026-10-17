-- Social MVP: posts, post_likes, comments
-- No denormalized like_count / comment_count columns -- counted via COUNT().

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text,
  media_url  text,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint posts_status_check check (status in ('active', 'removed')),
  constraint posts_body_length check (body is null or char_length(body) <= 2000),
  constraint posts_body_or_media check (coalesce(char_length(body), 0) > 0 or media_url is not null)
);

create index if not exists posts_author_id_idx on public.posts (author_id);
-- Supports the chronological feed query: ORDER BY created_at DESC, id DESC
-- with keyset pagination -- no OFFSET, no fan-out/materialized table.
create index if not exists posts_feed_idx on public.posts (created_at desc, id desc);

alter table public.posts enable row level security;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Immutable fields + moderator-only status changes, regardless of which RLS
-- policy allowed the UPDATE to proceed.
create or replace function public.protect_post_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'post id cannot be changed';
  end if;
  if new.author_id is distinct from old.author_id then
    raise exception 'post author cannot be changed';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'post created_at cannot be changed';
  end if;
  if new.status is distinct from old.status and not public.is_moderator() then
    raise exception 'only moderators or admins can change post status';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_protect_moderation_fields on public.posts;
create trigger posts_protect_moderation_fields
  before update on public.posts
  for each row execute function public.protect_post_moderation_fields();

-- SELECT: three permissive policies, combined with OR.
-- 1) Anyone authenticated can see an active, non-deleted post from an
--    active author, as long as neither party has blocked the other.
drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible"
  on public.posts for select
  to authenticated
  using (
    status = 'active'
    and deleted_at is null
    and not public.is_blocked_pair(auth.uid(), author_id)
    and exists (
      select 1 from public.profiles p
      where p.id = posts.author_id
        and p.account_status = 'active'
    )
  );

-- 2) Authors always see their own posts (including removed/deleted, for
--    their own UI state).
drop policy if exists "posts_select_own" on public.posts;
create policy "posts_select_own"
  on public.posts for select
  to authenticated
  using (auth.uid() = author_id);

-- 3) Moderators/admins see everything, including blocked-pair and removed
--    content, for review purposes.
drop policy if exists "posts_select_moderator" on public.posts;
create policy "posts_select_moderator"
  on public.posts for select
  to authenticated
  using (public.is_moderator());

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and status = 'active'
    and deleted_at is null
  );

-- Author can edit/soft-delete their own post (body, media_url, deleted_at).
-- Cannot set status themselves -- enforced by the trigger above.
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Moderator/admin can update any post (in practice: status = 'removed').
-- Column-level restriction is enforced by the trigger above.
drop policy if exists "posts_update_moderation" on public.posts;
create policy "posts_update_moderation"
  on public.posts for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- No DELETE policy -- removal is soft (deleted_at by the author, status by
-- moderators), never a hard delete from the client.

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts(id) on delete cascade,
  author_id         uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body              text not null,
  status            text not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  constraint comments_status_check check (status in ('active', 'removed')),
  constraint comments_body_length check (char_length(body) between 1 and 1000)
);

-- Composite index covers both "comments for a post, chronological" and
-- plain post_id lookups (leading column) -- a separate bare created_at
-- index would be redundant since there is no global comment feed.
create index if not exists comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index if not exists comments_author_id_idx on public.comments (author_id);
create index if not exists comments_parent_comment_id_idx on public.comments (parent_comment_id);

alter table public.comments enable row level security;

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

create or replace function public.protect_comment_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'comment id cannot be changed';
  end if;
  if new.post_id is distinct from old.post_id then
    raise exception 'comment post cannot be changed';
  end if;
  if new.author_id is distinct from old.author_id then
    raise exception 'comment author cannot be changed';
  end if;
  if new.parent_comment_id is distinct from old.parent_comment_id then
    raise exception 'comment parent cannot be changed';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'comment created_at cannot be changed';
  end if;
  if new.status is distinct from old.status and not public.is_moderator() then
    raise exception 'only moderators or admins can change comment status';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_protect_moderation_fields on public.comments;
create trigger comments_protect_moderation_fields
  before update on public.comments
  for each row execute function public.protect_comment_moderation_fields();

-- SELECT: visible only if the comment itself, its parent post, and the
-- post's author all pass the same active/not-deleted/not-blocked checks.
-- Direct client queries against comments cannot bypass post-level blocking.
drop policy if exists "comments_select_visible" on public.comments;
create policy "comments_select_visible"
  on public.comments for select
  to authenticated
  using (
    status = 'active'
    and deleted_at is null
    and not public.is_blocked_pair(auth.uid(), author_id)
    and exists (
      select 1
      from public.posts p
      join public.profiles pa on pa.id = p.author_id
      where p.id = comments.post_id
        and p.status = 'active'
        and p.deleted_at is null
        and pa.account_status = 'active'
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

drop policy if exists "comments_select_own" on public.comments;
create policy "comments_select_own"
  on public.comments for select
  to authenticated
  using (auth.uid() = author_id);

drop policy if exists "comments_select_moderator" on public.comments;
create policy "comments_select_moderator"
  on public.comments for select
  to authenticated
  using (public.is_moderator());

-- INSERT: must own the comment, and the target post must be
-- visible/accessible (active, not deleted, author not blocked).
-- Reply-depth validation (single-level replies only) is enforced by a
-- trigger below, not here: a policy on `comments` cannot subquery
-- `comments` itself -- Postgres's RLS rewriter treats that as infinite
-- recursion at parse time, even though it would not actually recurse.
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and status = 'active'
    and deleted_at is null
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'active'
        and p.deleted_at is null
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

-- Single-level reply enforcement, done as a trigger instead of an RLS
-- policy subquery (see note above). Runs for every insert regardless of
-- which permissive policy allowed it through.
create or replace function public.validate_comment_reply_depth()
returns trigger
language plpgsql
as $$
begin
  if new.parent_comment_id is not null then
    if not exists (
      select 1 from public.comments pc
      where pc.id = new.parent_comment_id
        and pc.post_id = new.post_id
        and pc.status = 'active'
        and pc.deleted_at is null
        and pc.parent_comment_id is null
    ) then
      raise exception 'replies are limited to a single level';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists comments_validate_reply_depth on public.comments;
create trigger comments_validate_reply_depth
  before insert on public.comments
  for each row execute function public.validate_comment_reply_depth();

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "comments_update_moderation" on public.comments;
create policy "comments_update_moderation"
  on public.comments for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ---------------------------------------------------------------------------
-- post_likes
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_likes_pkey primary key (post_id, user_id)
);

-- post_id is already the leading PK column; user_id needs its own index
-- ("posts liked by user X").
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

alter table public.post_likes enable row level security;

-- Likes are only visible if the underlying post is visible AND the liker
-- is not part of a blocked relationship with the viewer.
drop policy if exists "post_likes_select_visible" on public.post_likes;
create policy "post_likes_select_visible"
  on public.post_likes for select
  to authenticated
  using (
    not public.is_blocked_pair(auth.uid(), post_likes.user_id)
    and exists (
      select 1
      from public.posts p
      join public.profiles pa on pa.id = p.author_id
      where p.id = post_likes.post_id
        and p.status = 'active'
        and p.deleted_at is null
        and pa.account_status = 'active'
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own"
  on public.post_likes for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'active'
        and p.deleted_at is null
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own"
  on public.post_likes for delete
  to authenticated
  using (auth.uid() = user_id);
