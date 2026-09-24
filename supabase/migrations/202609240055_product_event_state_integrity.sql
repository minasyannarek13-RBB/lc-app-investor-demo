-- Keep measurement evidence aligned with persisted product state.
-- Browser retries or stale UI actions must not turn unfollows/reminder removals into positive funnel events.

begin;

create or replace function public.enforce_product_event_state_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_name = 'creator_follow' and not exists (
    select 1
      from public.follows f
     where f.follower_id = new.user_id
       and f.following_id = new.creator_id
  ) then
    raise exception 'creator_follow requires persisted follow state'
      using errcode = '23514';
  end if;

  if new.event_name = 'schedule_reminder' and not exists (
    select 1
      from public.player_session_reminders r
     where r.user_id = new.user_id
       and r.session_id = new.creator_session_id
  ) then
    raise exception 'schedule_reminder requires persisted reminder state'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_product_event_state_integrity() from public, anon, authenticated;

drop trigger if exists product_events_state_integrity on public.product_events;
create trigger product_events_state_integrity
  before insert or update of event_name, creator_id, creator_session_id
  on public.product_events
  for each row execute function public.enforce_product_event_state_integrity();

comment on function public.enforce_product_event_state_integrity() is
  'Measurement integrity guard: positive follow/reminder events require matching persisted LC product state.';

commit;
