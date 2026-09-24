-- Bind an LC Creator session to one tenant-scoped, approved operator handoff mapping.
-- This is routing metadata only. LC still owns no gameplay, wallet, wagering, KYC/AML or settlement.

begin;

create table if not exists public.industry_creator_session_handoffs (
  session_id uuid primary key references public.creator_sessions(id) on delete cascade,
  mapping_id uuid not null references public.industry_creator_table_mappings(id) on delete cascade,
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  configured_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists industry_creator_session_handoffs_org_idx
  on public.industry_creator_session_handoffs(organization_id, updated_at desc);

alter table public.industry_creator_session_handoffs enable row level security;
revoke all on table public.industry_creator_session_handoffs from public, anon, authenticated;
grant select on table public.industry_creator_session_handoffs to authenticated;

drop policy if exists "industry_creator_session_handoffs_member_select" on public.industry_creator_session_handoffs;
create policy "industry_creator_session_handoffs_member_select"
  on public.industry_creator_session_handoffs for select
  to authenticated
  using (
    exists (
      select 1
      from public.industry_organization_members member
      join public.industry_organizations org on org.id = member.organization_id
      join public.profiles profile on profile.id = member.user_id
      where member.organization_id = industry_creator_session_handoffs.organization_id
        and member.user_id = auth.uid()
        and member.status = 'active'
        and org.status = 'active'
        and profile.account_status = 'active'
    )
  );

create or replace function public.configure_creator_session_handoff(
  target_session_id uuid,
  target_mapping_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mapping_org_id uuid;
  mapping_creator_id uuid;
  session_creator_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select m.organization_id, m.creator_id
    into mapping_org_id, mapping_creator_id
  from public.industry_creator_table_mappings m
  join public.industry_organizations o on o.id = m.organization_id
  join public.industry_handoff_destinations d
    on d.id = m.handoff_destination_id
   and d.organization_id = m.organization_id
  where m.id = target_mapping_id
    and m.status = 'active'
    and o.status = 'active'
    and d.status = 'approved'
    and d.approved_at is not null
    and d.destination_url ~ '^https://'
  for update of m;

  if not found or not public.is_industry_org_manager(mapping_org_id) then
    raise exception 'approved_mapping_manager_required' using errcode = '42501';
  end if;

  select creator_id into session_creator_id
  from public.creator_sessions
  where id = target_session_id
    and provenance = 'user_generated'
    and status in ('scheduled', 'live')
  for update;

  if not found or session_creator_id <> mapping_creator_id then
    raise exception 'matching_creator_session_required' using errcode = '42501';
  end if;

  insert into public.industry_creator_session_handoffs(
    session_id, mapping_id, organization_id, configured_by
  ) values (
    target_session_id, target_mapping_id, mapping_org_id, auth.uid()
  )
  on conflict (session_id) do update
    set mapping_id = excluded.mapping_id,
        organization_id = excluded.organization_id,
        configured_by = excluded.configured_by,
        updated_at = now();
end;
$$;

revoke all on function public.configure_creator_session_handoff(uuid, uuid) from public, anon;
grant execute on function public.configure_creator_session_handoff(uuid, uuid) to authenticated;

create or replace function public.resolve_live_session_operator_handoff(target_session_id uuid)
returns table(destination_label text, destination_url text)
language sql
stable
security definer
set search_path = public
as $$
  select d.label, d.destination_url
  from public.industry_creator_session_handoffs sh
  join public.creator_sessions s on s.id = sh.session_id
  join public.industry_creator_table_mappings m
    on m.id = sh.mapping_id
   and m.organization_id = sh.organization_id
   and m.creator_id = s.creator_id
  join public.industry_organizations o on o.id = sh.organization_id
  join public.industry_handoff_destinations d
    on d.id = m.handoff_destination_id
   and d.organization_id = sh.organization_id
  join public.creator_profiles cp on cp.user_id = s.creator_id
  join public.profiles p on p.id = s.creator_id
  where sh.session_id = target_session_id
    and s.status = 'live'
    and s.visibility = 'public'
    and s.provenance = 'user_generated'
    and m.status = 'active'
    and o.status = 'active'
    and d.status = 'approved'
    and d.approved_at is not null
    and d.destination_url ~ '^https://'
    and cp.verification_status = 'verified'
    and cp.profile_status = 'published'
    and cp.onboarding_completed = true
    and p.account_status = 'active'
  limit 1;
$$;

revoke all on function public.resolve_live_session_operator_handoff(uuid) from public;
grant execute on function public.resolve_live_session_operator_handoff(uuid) to anon, authenticated;

comment on table public.industry_creator_session_handoffs is
  'Tenant-scoped routing metadata binding one LC Creator session to one approved operator handoff mapping.';
comment on function public.resolve_live_session_operator_handoff(uuid) is
  'Fail-closed public resolver for a live public verified Creator session explicitly bound by an authorized tenant manager to an approved HTTPS operator destination.';

commit;
