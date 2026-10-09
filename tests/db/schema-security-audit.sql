\set ON_ERROR_STOP on

do $$
declare
  exposed_function text;
begin
  if exists (
    select 1
    from pg_tables
    where schemaname = 'public'
      and not rowsecurity
  ) then
    raise exception 'public table without RLS detected';
  end if;

  if has_schema_privilege('anon', 'public', 'CREATE')
     or has_schema_privilege('authenticated', 'public', 'CREATE') then
    raise exception 'browser role can create objects in public schema';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname in ('public', 'storage')
      and cmd <> 'SELECT'
      and roles && array['anon', 'public']::name[]
  ) then
    raise exception 'anonymous write policy detected';
  end if;

  select p.oid::regprocedure::text
  into exposed_function
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and p.prorettype <> 'trigger'::regtype
    and has_function_privilege('public', p.oid, 'EXECUTE')
  limit 1;

  if exposed_function is not null then
    raise exception 'SECURITY DEFINER function executable by PUBLIC: %', exposed_function;
  end if;

  select p.oid::regprocedure::text
  into exposed_function
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and not exists (
      select 1
      from unnest(coalesce(p.proconfig, array[]::text[])) setting
      where setting like 'search_path=%'
    )
  limit 1;

  if exposed_function is not null then
    raise exception 'SECURITY DEFINER function lacks fixed search_path: %', exposed_function;
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'account_status', 'SELECT')
     or has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
     or has_table_privilege('authenticated', 'public.profiles', 'INSERT')
     or has_table_privilege('authenticated', 'public.profiles', 'DELETE') then
    raise exception 'profiles foundation ACL exposes a privileged operation';
  end if;

  if has_table_privilege('authenticated', 'public.user_settings', 'DELETE')
     or not has_table_privilege('authenticated', 'public.user_settings', 'SELECT,INSERT,UPDATE') then
    raise exception 'user_settings foundation ACL mismatch';
  end if;

  if has_function_privilege('anon', 'public.get_own_profile()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.get_own_profile()', 'EXECUTE') then
    raise exception 'get_own_profile execute ACL mismatch';
  end if;

  if has_function_privilege('authenticated', 'public.admin_set_profile_account_status(uuid,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.admin_set_creator_verification(uuid,text,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.admin_set_profile_account_status(uuid,text)', 'EXECUTE') then
    raise exception 'administrative function execute ACL mismatch';
  end if;
end;
$$;

select 'LC schema security audit passed' as status;
