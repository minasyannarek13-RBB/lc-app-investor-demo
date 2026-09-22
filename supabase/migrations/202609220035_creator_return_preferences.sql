-- Player-owned return preferences for approved creators/dealers.
-- This stores notification intent only. Delivery remains a separate trusted backend concern.

begin;

create table if not exists public.creator_return_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  live_alerts boolean not null default true,
  schedule_alerts boolean not null default true,
  schedule_lead_minutes integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, creator_id),
  constraint creator_return_preferences_not_self check (user_id <> creator_id),
  constraint creator_return_preferences_lead_check check (schedule_lead_minutes between 0 and 1440)
);

create index if not exists creator_return_preferences_creator_idx
  on public.creator_return_preferences(creator_id)
  where live_alerts is true or schedule_alerts is true;

alter table public.creator_return_preferences enable row level security;

create or replace function public.protect_creator_return_preference_write()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null
     or new.user_id <> auth.uid()
     or not public.is_active_profile(auth.uid())
     or not public.is_approved_creator(new.creator_id) then
    raise exception 'invalid creator return preference' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'creator return preference owner cannot change' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.protect_creator_return_preference_write() from public, anon, authenticated;

drop trigger if exists creator_return_preferences_protect_write on public.creator_return_preferences;
create trigger creator_return_preferences_protect_write
  before insert or update on public.creator_return_preferences
  for each row execute function public.protect_creator_return_preference_write();

create policy "creator_return_preferences_select_own"
  on public.creator_return_preferences for select to authenticated
  using (auth.uid() = user_id and public.is_active_profile(auth.uid()));

create policy "creator_return_preferences_insert_own"
  on public.creator_return_preferences for insert to authenticated
  with check (
    auth.uid() = user_id
    and public.is_active_profile(auth.uid())
    and public.is_approved_creator(creator_id)
  );

create policy "creator_return_preferences_update_own"
  on public.creator_return_preferences for update to authenticated
  using (auth.uid() = user_id and public.is_active_profile(auth.uid()))
  with check (
    auth.uid() = user_id
    and public.is_active_profile(auth.uid())
    and public.is_approved_creator(creator_id)
  );

create policy "creator_return_preferences_delete_own"
  on public.creator_return_preferences for delete to authenticated
  using (auth.uid() = user_id and public.is_active_profile(auth.uid()));

revoke all on table public.creator_return_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.creator_return_preferences to authenticated;

comment on table public.creator_return_preferences is
  'Private player-owned intent for creator live/schedule return alerts. Does not claim or perform message delivery.';

commit;
