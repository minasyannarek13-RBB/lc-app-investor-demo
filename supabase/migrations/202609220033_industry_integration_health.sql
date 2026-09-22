-- LC App tenant-scoped integration health snapshots.
-- Readable by active organization members; writable only through privileged backend/service boundaries.
-- Stores operational readiness only. Never stores credentials, gameplay, funds, wagering, KYC/AML or settlement data.

begin;

create table if not exists public.industry_integration_health (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  component text not null,
  status text not null default 'unknown',
  summary text,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_integration_health_component_check check (component in ('creator_mapping','handoff','event_delivery','catalog','support')),
  constraint industry_integration_health_status_check check (status in ('unknown','healthy','degraded','unavailable','disabled')),
  constraint industry_integration_health_summary_length check (summary is null or char_length(summary) <= 500),
  unique (organization_id, component)
);

create index if not exists industry_integration_health_org_idx
  on public.industry_integration_health(organization_id, status, checked_at desc);

alter table public.industry_integration_health enable row level security;

create trigger industry_integration_health_set_updated_at
  before update on public.industry_integration_health
  for each row execute function public.set_updated_at();

create policy "industry_integration_health_member_select"
  on public.industry_integration_health for select to authenticated
  using (public.is_industry_org_member(organization_id));

-- Deliberately no authenticated INSERT/UPDATE/DELETE policies.
-- Health is evidence from a privileged backend check, not a tenant self-attestation.
comment on table public.industry_integration_health is
  'Tenant-scoped operational health snapshots. Authenticated organization members may read; privileged backend processes own writes. Excludes credentials and regulated gambling data.';

commit;
