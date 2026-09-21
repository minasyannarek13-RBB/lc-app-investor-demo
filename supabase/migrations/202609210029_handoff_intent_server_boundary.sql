-- A browser viewing LC's conceptual handoff screen is not evidence that a user
-- actually left for a licensed operator. Handoff intent becomes measurable only
-- at a privileged server boundary that can validate an approved destination.

begin;

create or replace function public.enforce_product_event_handoff_boundary()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' and new.event_name = 'handoff_intent' then
    raise exception 'handoff_intent_requires_server_boundary'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_product_event_handoff_boundary() from public, anon, authenticated;

drop trigger if exists product_events_handoff_boundary on public.product_events;
create trigger product_events_handoff_boundary
  before insert or update of event_name
  on public.product_events
  for each row execute function public.enforce_product_event_handoff_boundary();

comment on function public.enforce_product_event_handoff_boundary() is
  'Fail-closed measurement boundary: browser clients cannot record operator handoff intent; an approved server-side destination/correlation path must do so.';

commit;
