-- Prevent duplicate client retries from inflating attributable return evidence.
-- A user may contribute at most one handoff_return for the same journey/Creator/session.

begin;

create unique index if not exists product_events_handoff_return_once_idx
  on public.product_events (user_id, journey_id, creator_id, creator_session_id)
  where event_name = 'handoff_return';

comment on index public.product_events_handoff_return_once_idx is
  'Idempotency guard for attributable return evidence; duplicate client retries cannot create multiple returns for the same user journey, Creator and session.';

commit;
