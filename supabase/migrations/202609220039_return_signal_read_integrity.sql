-- Make in-app return signal read state server-owned and monotonic.
-- Browser clients may mark their own signal read, but cannot forge timestamps or rewrite history.

begin;

create or replace function public.protect_return_signal_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.recipient_id is distinct from old.recipient_id
    or new.creator_id is distinct from old.creator_id
    or new.session_id is distinct from old.session_id
    or new.signal_type is distinct from old.signal_type
    or new.created_at is distinct from old.created_at
  then
    raise exception 'return signal immutable fields cannot be changed' using errcode = '42501';
  end if;

  if old.read_at is not null then
    if new.read_at is distinct from old.read_at then
      raise exception 'return signal read state is immutable once read' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.read_at is null then
    raise exception 'return signal update must mark the signal read' using errcode = '42501';
  end if;

  -- Ignore client-supplied timestamps. The database is authoritative for response timing.
  new.read_at := now();
  return new;
end;
$$;

revoke all on function public.protect_return_signal_update() from public, anon, authenticated;

comment on function public.protect_return_signal_update() is
  'Allows a recipient-owned signal to transition unread -> read exactly once and stamps read_at on the database clock.';

commit;
