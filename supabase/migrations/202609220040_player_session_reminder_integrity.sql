-- Keep session reminders inside the approved public Creator -> Schedule/Live -> Return loop.
-- Players may remind only on eligible public sessions; identity is immutable and stale reminders are cleaned up.

begin;

create or replace function public.protect_player_session_reminder_write()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  session_creator uuid;
begin
  if auth.uid() is null
    or new.user_id <> auth.uid()
    or not public.is_active_profile(auth.uid())
  then
    raise exception 'invalid session reminder owner' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and (
    new.user_id is distinct from old.user_id
    or new.session_id is distinct from old.session_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'session reminder identity cannot change' using errcode = '42501';
  end if;

  select s.creator_id
    into session_creator
    from public.creator_sessions s
   where s.id = new.session_id
     and s.visibility = 'public'
     and s.status in ('scheduled', 'live');

  if session_creator is null
    or not public.is_approved_creator(session_creator)
    or public.is_blocked_pair(new.user_id, session_creator)
  then
    raise exception 'session is not eligible for reminders' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.protect_player_session_reminder_write() from public, anon, authenticated;

drop trigger if exists player_session_reminders_protect_write on public.player_session_reminders;
create trigger player_session_reminders_protect_write
  before insert or update on public.player_session_reminders
  for each row execute function public.protect_player_session_reminder_write();

create or replace function public.cleanup_ineligible_session_reminders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.visibility <> 'public' or new.status not in ('scheduled', 'live') then
    delete from public.player_session_reminders where session_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.cleanup_ineligible_session_reminders() from public, anon, authenticated;

drop trigger if exists creator_sessions_cleanup_ineligible_reminders on public.creator_sessions;
create trigger creator_sessions_cleanup_ineligible_reminders
  after update of status, visibility on public.creator_sessions
  for each row execute function public.cleanup_ineligible_session_reminders();

create or replace function public.cleanup_blocked_pair_session_reminders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.player_session_reminders r
  using public.creator_sessions s
  where r.session_id = s.id
    and r.user_id in (new.blocker_id, new.blocked_id)
    and s.creator_id in (new.blocker_id, new.blocked_id)
    and r.user_id <> s.creator_id;
  return new;
end;
$$;

revoke all on function public.cleanup_blocked_pair_session_reminders() from public, anon, authenticated;

drop trigger if exists user_blocks_cleanup_session_reminders on public.user_blocks;
create trigger user_blocks_cleanup_session_reminders
  after insert on public.user_blocks
  for each row execute function public.cleanup_blocked_pair_session_reminders();

-- Repair stale reminders created before the eligibility invariant existed.
delete from public.player_session_reminders r
where not exists (
  select 1
  from public.creator_sessions s
  where s.id = r.session_id
    and s.visibility = 'public'
    and s.status in ('scheduled', 'live')
    and public.is_approved_creator(s.creator_id)
    and not public.is_blocked_pair(r.user_id, s.creator_id)
);

comment on function public.protect_player_session_reminder_write() is
  'Fail-closed reminder gate: active player, immutable identity, approved Creator, public scheduled/live session and no block relationship.';

commit;
