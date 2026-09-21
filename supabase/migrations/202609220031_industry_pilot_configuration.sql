-- LC App operator/provider pilot configuration.
-- Keeps creator mapping and licensed-operator handoff configuration tenant-scoped.
-- No gameplay, wallet, wagering, KYC/AML or settlement capability is introduced.

begin;

create or replace function public.is_industry_org_manager(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.industry_organization_members m
    join public.industry_organizations o on o.id = m.organization_id
    join public.profiles p on p.id = m.user_id
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
      and m.status = 'active'
      and o.status = 'active'
      and p.account_status = 'active'
  );
$$;

revoke all on function public.is_industry_org_manager(uuid) from public;
grant execute on function public.is_industry_org_manager(uuid) to authenticated;

create table if not exists public.industry_creator_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  external_reference text,
  status text not null default 'pending',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_creator_mappings_status_check check (status in ('pending','approved','suspended','removed')),
  constraint industry_creator_mappings_external_ref_length check (external_reference is null or char_length(external_reference) <= 160),
  unique (organization_id, creator_id)
);

create table if not exists public.industry_handoff_destinations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  label text not null,
  destination_url text not null,
  status text not null default 'draft',
  approved_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_handoff_destinations_label_length check (char_length(label) between 2 and 120),
  constraint industry_handoff_destinations_url_length check (char_length(destination_url) between 12 and 2048),
  constraint industry_handoff_destinations_https_check check (destination_url ~ '^https://'),
  constraint industry_handoff_destinations_status_check check (status in ('draft','approved','suspended','retired')),
  constraint industry_handoff_destinations_approval_check check ((status = 'approved' and approved_at is not null) or status <> 'approved')
);

create index if not exists industry_creator_mappings_org_idx on public.industry_creator_mappings(organization_id, status);
create index if not exists industry_handoff_destinations_org_idx on public.industry_handoff_destinations(organization_id, status);

alter table public.industry_creator_mappings enable row level security;
alter table public.industry_handoff_destinations enable row level security;

create trigger industry_creator_mappings_set_updated_at
  before update on public.industry_creator_mappings
  for each row execute function public.set_updated_at();
create trigger industry_handoff_destinations_set_updated_at
  before update on public.industry_handoff_destinations
  for each row execute function public.set_updated_at();

create policy "industry_creator_mappings_member_select"
  on public.industry_creator_mappings for select to authenticated
  using (public.is_industry_org_member(organization_id));
create policy "industry_handoff_destinations_member_select"
  on public.industry_handoff_destinations for select to authenticated
  using (public.is_industry_org_member(organization_id));

-- Managers may prepare mappings/configuration. Approval remains outside client control.
create policy "industry_creator_mappings_manager_insert"
  on public.industry_creator_mappings for insert to authenticated
  with check (
    public.is_industry_org_manager(organization_id)
    and created_by = auth.uid()
    and status = 'pending'
  );
create policy "industry_creator_mappings_manager_update"
  on public.industry_creator_mappings for update to authenticated
  using (public.is_industry_org_manager(organization_id))
  with check (
    public.is_industry_org_manager(organization_id)
    and status in ('pending','removed')
  );
create policy "industry_handoff_destinations_manager_insert"
  on public.industry_handoff_destinations for insert to authenticated
  with check (
    public.is_industry_org_manager(organization_id)
    and created_by = auth.uid()
    and status = 'draft'
    and approved_at is null
  );
create policy "industry_handoff_destinations_manager_update"
  on public.industry_handoff_destinations for update to authenticated
  using (public.is_industry_org_manager(organization_id))
  with check (
    public.is_industry_org_manager(organization_id)
    and status in ('draft','retired')
    and approved_at is null
  );

-- No client DELETE policies. Approved/suspended state changes require a privileged backend/admin boundary.
comment on table public.industry_creator_mappings is
  'Tenant-scoped creator mapping for pilots. Client managers can propose mappings but cannot approve them.';
comment on table public.industry_handoff_destinations is
  'Tenant-scoped HTTPS licensed-operator handoff destinations. Client managers can draft but cannot approve destinations.';

commit;
