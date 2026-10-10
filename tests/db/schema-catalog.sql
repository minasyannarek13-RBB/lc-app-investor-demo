\set ON_ERROR_STOP on
select json_build_object(
  'postgres_version', version(),
  'tables', (select json_agg(row_to_json(t) order by t.name) from (select c.oid::regclass::text name, c.relrowsecurity rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage') and c.relkind='r') t),
  'functions', (select json_agg(row_to_json(t) order by t.name) from (select p.oid::regprocedure::text name,p.prosecdef security_definer,p.proconfig settings from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','auth','storage') and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')) t),
  'triggers', (select json_agg(row_to_json(t) order by t.table_name,t.name) from (select tgrelid::regclass::text table_name,tgname name,tgenabled enabled,pg_get_triggerdef(oid) definition from pg_trigger where not tgisinternal) t),
  'indexes', (select json_agg(row_to_json(t) order by t.name) from (select i.indexrelid::regclass::text name,i.indrelid::regclass::text table_name,i.indisvalid valid,pg_get_indexdef(i.indexrelid) definition from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage')) t),
  'constraints', (select json_agg(row_to_json(t) order by t.table_name,t.name) from (select conrelid::regclass::text table_name,conname name,convalidated validated,pg_get_constraintdef(oid) definition from pg_constraint where conrelid in(select c.oid from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage'))) t),
  'policies', (select json_agg(row_to_json(t) order by t.schemaname,t.tablename,t.policyname) from (select * from pg_policies where schemaname in ('public','storage')) t)
);

do $$ begin
 if exists(select 1 from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not i.indisvalid) then raise exception 'Invalid application index'; end if;
 if exists(select 1 from pg_constraint where connamespace='public'::regnamespace and not convalidated) then raise exception 'Unvalidated application constraint'; end if;
 if exists(select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage') and not t.tgisinternal and t.tgenabled='D') then raise exception 'Disabled application trigger'; end if;
end $$;
