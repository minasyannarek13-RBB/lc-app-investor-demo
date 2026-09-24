-- LC App pilot handoff resolution.
-- Connects an active creator/table mapping to one admin-approved HTTPS destination.
-- LC still owns no gameplay, wallet, wagering, KYC/AML or settlement capability.

begin;

alter table public.industry_creator_table_mappings
  add column if not exists handoff_destination_id uuid
  references public.industry_handoff_destinations(id) on delete set null;

create index if not exists industry_creator_table_mappings_handoff_idx
  on public.industry_creator_table_mappings(handoff_destination_id)
  where status = 'active' and handoff_destination_id is not null;

create or replace function public.assign_industry_creator_table_handoff(
  mapping_id uuid,
  destination_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mapping_org_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select organization_id into mapping_org_id
  from public.industry_creator_table_mappings
  where id = mapping_id
    and status = 'active'
  for update;

  if not found or not public.is_industry_org_manager(mapping_org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.industry_handoff_destinations d
    join public.industry_organizations o on o.id = d.organization_id
    where d.id = destination_id
      and d.organization_id = mapping_org_id
      and d.status = 'approved'
      and d.approved_at is not null
      and o.status = 'active'
      and d.destination_url ~ '^https://'
  ) then
    raise exception 'approved_same_org_destination_required' using errcode = '42501';
  end if;

  update public.industry_creator_table_mappings
  set handoff_destination_id = destination_id,
      updated_at = now()
  where id = mapping_id;
end;
$$;

revoke all on function public.assign_industry_creator_table_handoff(uuid, uuid) from public, anon;
grant execute on function public.assign_industry_creator_table_handoff(uuid, uuid) to authenticated;

create or replace function public.resolve_licensed_operator_handoff(
  mapped_creator_id uuid,
  table_ref text
)
returns table(destination_label text, destination_url text)
language sql
stable
security definer
set search_path = public
as $$
  select d.label, d.destination_url
  from public.industry_creator_table_mappings m
  join public.industry_organizations o on o.id = m.organization_id
  join public.industry_handoff_destinations d
    on d.id = m.handoff_destination_id
   and d.organization_id = m.organization_id
  join public.creator_profiles cp on cp.user_id = m.creator_id
  join public.profiles p on p.id = m.creator_id
  where m.creator_id = mapped_creator_id
    and m.external_table_ref = btrim(coalesce(table_ref, ''))
    and m.status = 'active'
    and o.status = 'active'
    and d.status = 'approved'
    and d.approved_at is not null
    and d.destination_url ~ '^https://'
    and cp.verification_status = 'verified'
    and cp.profile_status = 'published'
    and cp.onboarding_completed = true
    and p.account_status = 'active'
  order by m.updated_at desc
  limit 1;
$$;

revoke all on function public.resolve_licensed_operator_handoff(uuid, text) from public;
grant execute on function public.resolve_licensed_operator_handoff(uuid, text) to anon, authenticated;

comment on function public.resolve_licensed_operator_handoff(uuid, text) is
  'Fail-closed public resolver for an active verified creator/table mapping and admin-approved same-tenant HTTPS operator destination.';

commit;
