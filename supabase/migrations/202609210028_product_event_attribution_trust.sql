-- Prevent browser clients from self-certifying attribution as direct.
-- Authenticated events remain useful observational evidence, but only a privileged
-- server-side writer may assert direct attribution after independent correlation.

begin;

create or replace function public.enforce_product_event_attribution_trust()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Browser/client requests carry the authenticated Postgres role. A client may
  -- submit contextual or unattributed evidence, but cannot mint trusted evidence.
  if auth.role() = 'authenticated' and new.attribution_confidence = 'direct' then
    new.attribution_confidence := 'contextual';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_product_event_attribution_trust() from public, anon, authenticated;

drop trigger if exists product_events_attribution_trust on public.product_events;
create trigger product_events_attribution_trust
  before insert or update of attribution_confidence
  on public.product_events
  for each row execute function public.enforce_product_event_attribution_trust();

comment on function public.enforce_product_event_attribution_trust() is
  'Fail-closed attribution trust boundary: authenticated clients cannot self-assert direct attribution; privileged server-side correlation is required.';

commit;
