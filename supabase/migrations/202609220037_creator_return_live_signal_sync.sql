-- Keep the newer per-Creator return preference aligned with the existing in-app Live signal path.
-- This closes a product/privacy gap where live_alerts=false could otherwise leave legacy Live signals enabled.

begin;

create or replace function public.sync_creator_return_live_alert_preference()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_creator_id uuid;
  v_enabled boolean;
begin
  v_user_id := coalesce(new.user_id, old.user_id);
  v_creator_id := coalesce(new.creator_id, old.creator_id);
  v_enabled := case when tg_op = 'DELETE' then true else new.live_alerts end;

  update public.follows
     set live_alerts_enabled = v_enabled
   where follower_id = v_user_id
     and following_id = v_creator_id;

  if not v_enabled then
    delete from public.return_signals
     where recipient_id = v_user_id
       and creator_id = v_creator_id
       and signal_type = 'creator_live';
  elsif public.is_active_profile(v_user_id)
    and public.is_approved_creator(v_creator_id)
    and not public.is_blocked_pair(v_user_id, v_creator_id)
  then
    insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
    select v_user_id, v_creator_id, s.id, 'creator_live'
      from public.creator_sessions s
     where s.creator_id = v_creator_id
       and s.status = 'live'
       and s.visibility = 'public'
    on conflict (recipient_id, session_id, signal_type) do nothing;
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.sync_creator_return_live_alert_preference() from public, anon, authenticated;

drop trigger if exists creator_return_preferences_sync_live_signal on public.creator_return_preferences;
create trigger creator_return_preferences_sync_live_signal
  after insert or update of live_alerts or delete on public.creator_return_preferences
  for each row execute function public.sync_creator_return_live_alert_preference();

-- Repair existing rows so persisted preference and actual in-app signal behavior agree.
update public.follows f
   set live_alerts_enabled = p.live_alerts
  from public.creator_return_preferences p
 where p.user_id = f.follower_id
   and p.creator_id = f.following_id
   and f.live_alerts_enabled is distinct from p.live_alerts;

delete from public.return_signals s
using public.creator_return_preferences p
where p.user_id = s.recipient_id
  and p.creator_id = s.creator_id
  and p.live_alerts is false
  and s.signal_type = 'creator_live';

comment on function public.sync_creator_return_live_alert_preference() is
  'Synchronizes player-owned per-Creator Live alert intent with app-owned in-app Live signals; no external delivery is implied.';

commit;
