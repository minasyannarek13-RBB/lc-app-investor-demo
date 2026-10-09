-- Harden notification attribution and constrain every browser-owned event metadata shape.
-- This is additive: existing event identifiers, RLS, attribution and return idempotency remain unchanged.

begin;

create or replace function public.enforce_product_event_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_creator uuid;
  session_status text;
  session_visibility text;
begin
  if new.creator_id is not null then
    if not public.is_approved_creator(new.creator_id) then
      raise exception 'product event Creator is not publicly eligible' using errcode = '23514';
    end if;

    if exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = new.user_id and b.blocked_id = new.creator_id)
         or (b.blocker_id = new.creator_id and b.blocked_id = new.user_id)
    ) then
      raise exception 'product event Creator context is blocked' using errcode = '23514';
    end if;
  end if;

  if new.creator_session_id is not null then
    select s.creator_id, s.status, s.visibility
      into session_creator, session_status, session_visibility
      from public.creator_sessions s
     where s.id = new.creator_session_id;

    if session_creator is null or new.creator_id is null or session_creator <> new.creator_id then
      raise exception 'product event session context does not match Creator' using errcode = '23514';
    end if;

    if new.event_name = 'schedule_reminder'
       and (session_visibility <> 'public' or session_status <> 'scheduled') then
      raise exception 'schedule reminder requires a public scheduled session' using errcode = '23514';
    end if;

    if new.event_name in ('live_session_open', 'handoff_intent')
       and (session_visibility <> 'public' or session_status <> 'live') then
      raise exception 'live intent requires a public live session' using errcode = '23514';
    end if;

    if new.event_name = 'notification_response' and session_visibility <> 'public' then
      raise exception 'notification response requires public session context when a session is supplied' using errcode = '23514';
    end if;
  end if;

  if new.event_name in (
    'creator_impression', 'creator_profile_open', 'creator_follow',
    'live_session_open', 'schedule_reminder', 'handoff_intent',
    'handoff_return', 'notification_response'
  ) and new.creator_id is null then
    raise exception 'product event requires Creator context' using errcode = '23514';
  end if;

  if new.event_name in (
    'live_session_open', 'schedule_reminder', 'handoff_intent', 'handoff_return'
  ) and new.creator_session_id is null then
    raise exception 'product event requires session context' using errcode = '23514';
  end if;

  if new.event_name = 'handoff_return' and not exists (
    select 1
      from public.product_events prior
     where prior.user_id = new.user_id
       and prior.event_name = 'handoff_intent'
       and prior.journey_id = new.journey_id
       and prior.creator_id = new.creator_id
       and prior.creator_session_id = new.creator_session_id
       and prior.created_at <= coalesce(new.created_at, now())
       and prior.created_at >= coalesce(new.created_at, now()) - interval '30 days'
  ) then
    raise exception 'handoff return requires matching prior handoff intent' using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_product_event_metadata_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_keys text[];
  metadata_key text;
  metadata_value jsonb;
  scalar_value text;
begin
  if jsonb_typeof(new.metadata) <> 'object' then
    raise exception 'product event metadata must be an object' using errcode = '23514';
  end if;

  allowed_keys := case new.event_name
    when 'product_open' then array['surface']::text[]
    when 'creator_impression' then array['surface','position','filter','recommendation_reasons','experience']::text[]
    when 'discovery_search' then array['has_query','result_count','interaction','filter']::text[]
    when 'creator_follow' then array['action']::text[]
    when 'schedule_reminder' then array['action']::text[]
    when 'handoff_intent' then array['action']::text[]
    when 'notification_response' then array['notification_type']::text[]
    else array[]::text[]
  end;

  if exists (
    select 1 from jsonb_object_keys(new.metadata) as keys(key)
     where not (keys.key = any(allowed_keys))
  ) then
    raise exception 'product event metadata contains an unexpected key' using errcode = '23514';
  end if;

  for metadata_key, metadata_value in select key, value from jsonb_each(new.metadata)
  loop
    if jsonb_typeof(metadata_value) = 'object' then
      raise exception 'nested product event metadata is not allowed' using errcode = '23514';
    end if;

    scalar_value := metadata_value #>> '{}';
    case
      when metadata_key in ('surface', 'filter', 'interaction', 'experience', 'notification_type') then
        if jsonb_typeof(metadata_value) <> 'string' or char_length(scalar_value) not between 1 and 80 then
          raise exception 'invalid product event metadata text value' using errcode = '23514';
        end if;
      when metadata_key = 'action' then
        if jsonb_typeof(metadata_value) <> 'string'
           or scalar_value not in ('follow', 'set', 'outbound_navigation') then
          raise exception 'invalid product event action' using errcode = '23514';
        end if;
      when metadata_key = 'position' then
        if jsonb_typeof(metadata_value) <> 'number'
           or scalar_value !~ '^[0-9]+$'
           or scalar_value::numeric not between 1 and 100 then
          raise exception 'invalid product event position' using errcode = '23514';
        end if;
      when metadata_key = 'result_count' then
        if jsonb_typeof(metadata_value) <> 'number'
           or scalar_value !~ '^[0-9]+$'
           or scalar_value::numeric not between 0 and 10000 then
          raise exception 'invalid product event result count' using errcode = '23514';
        end if;
      when metadata_key = 'has_query' then
        if jsonb_typeof(metadata_value) <> 'boolean' then
          raise exception 'invalid product event query flag' using errcode = '23514';
        end if;
      when metadata_key = 'recommendation_reasons' then
        if jsonb_typeof(metadata_value) <> 'array'
           or jsonb_array_length(metadata_value) > 4
           or exists (
             select 1 from jsonb_array_elements(metadata_value) as items(item)
              where jsonb_typeof(items.item) <> 'string'
                 or char_length(items.item #>> '{}') not between 1 and 80
           ) then
          raise exception 'invalid recommendation reasons metadata' using errcode = '23514';
        end if;
      else
        raise exception 'unsupported product event metadata key' using errcode = '23514';
    end case;
  end loop;

  return new;
end;
$$;

revoke all on function public.enforce_product_event_context() from public, anon, authenticated;
revoke all on function public.enforce_product_event_metadata_allowlist() from public, anon, authenticated;

drop trigger if exists product_events_metadata_allowlist on public.product_events;
create trigger product_events_metadata_allowlist
  before insert or update of event_name, metadata
  on public.product_events
  for each row execute function public.enforce_product_event_metadata_allowlist();

comment on function public.enforce_product_event_context() is
  'Fail-closed event context guard. Notification responses accept trusted Creator-only targets or matching public Creator/session targets; handoff return remains anchored to prior intent.';

comment on function public.enforce_product_event_metadata_allowlist() is
  'Per-event metadata allowlist with bounded scalar values and a bounded string-array exception for recommendation reasons.';

commit;
