-- Proposed local correction. Hosted application requires separate owner approval.
begin;

create schema if not exists lc_private;
revoke all on schema lc_private from public, anon, authenticated;

create or replace function lc_private.is_blocked_pair(user_a uuid, user_b uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = user_a and blocked_id = user_b)
       or (blocker_id = user_b and blocked_id = user_a)
  );
$$;
revoke all on function lc_private.is_blocked_pair(uuid, uuid) from public, anon, authenticated;

-- Privileged notification/reminder fanout can evaluate pairs unrelated to its actor.
-- Preserve that behavior without granting clients an unrestricted helper.
do $$
declare caller record;
begin
  for caller in
    select p.oid, p.prosecdef, p.oid::regprocedure::text as signature, pg_get_functiondef(p.oid) as definition
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
      and p.proname <> 'is_blocked_pair'
      and position('public.is_blocked_pair(' in p.prosrc) > 0
  loop
    if not caller.prosecdef and caller.signature in ('protect_player_session_reminder_write()', 'public.protect_player_session_reminder_write()') then
      continue;
    end if;
    if not caller.prosecdef then
      raise exception 'Unreviewed invoker caller: %', caller.oid::regprocedure;
    end if;
    execute replace(caller.definition, 'public.is_blocked_pair(', 'lc_private.is_blocked_pair(');
  end loop;
end;
$$;

create or replace function public.is_blocked_pair(user_a uuid, user_b uuid)
returns boolean
language plpgsql stable security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or user_a is null or user_b is null
     or (actor <> user_a and actor <> user_b) then
    raise exception 'Block relationship access denied' using errcode = '42501';
  end if;
  return lc_private.is_blocked_pair(user_a, user_b);
end;
$$;
revoke all on function public.is_blocked_pair(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_pair(uuid, uuid) to authenticated;

commit;
