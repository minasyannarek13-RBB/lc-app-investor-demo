-- Harden tenant creator/table mapping pause mutation for suspended/disabled callers.
-- Keep this as a follow-up migration so already-applied migration history remains immutable.

begin;

create or replace function public.pause_industry_creator_table_mapping(mapping_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select organization_id into org_id
  from public.industry_creator_table_mappings
  where id = mapping_id;

  if not found or not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;

  update public.industry_creator_table_mappings
  set status = 'paused', updated_at = now()
  where id = mapping_id;
end;
$$;

revoke all on function public.pause_industry_creator_table_mapping(uuid) from public, anon;
grant execute on function public.pause_industry_creator_table_mapping(uuid) to authenticated;

commit;
