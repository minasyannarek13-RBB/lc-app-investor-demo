-- Enforce per-Creator Live alert intent at signal generation time.
-- The sync migration updates follows.live_alerts_enabled, but the legacy generator
-- must also consume that flag or a later Live transition can recreate muted signals.

begin;

create or replace function public.create_creator_live_return_signals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'live' or new.visibility <> 'public'
    or (tg_op = 'UPDATE' and old.status = 'live' and old.visibility = 'public')
  then
    return new;
  end if;

  insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
  select f.follower_id, new.creator_id, new.id, 'creator_live'
  from public.follows f
  join public.creator_profiles cp
    on cp.user_id = new.creator_id
   and cp.verification_status = 'verified'
   and cp.profile_status = 'published'
  left join public.return_signal_preferences pref on pref.user_id = f.follower_id
  where f.following_id = new.creator_id
    and f.live_alerts_enabled is true
    and coalesce(pref.creator_live_enabled, true)
    and public.is_active_profile(f.follower_id)
    and not public.is_blocked_pair(f.follower_id, new.creator_id)
  on conflict (recipient_id, session_id, signal_type) do nothing;

  return new;
end;
$$;

revoke all on function public.create_creator_live_return_signals() from public, anon, authenticated;

comment on function public.create_creator_live_return_signals() is
  'Creates in-app Creator Live return signals only for eligible followers whose global and per-Creator Live alert intents are enabled.';

commit;
