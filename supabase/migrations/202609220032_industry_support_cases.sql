-- LC App tenant-scoped pilot support lifecycle.
-- Support cases cover LC configuration/handoff issues only; LC does not own gameplay,
-- wallet, wagering, KYC/AML, settlement or responsible-gaming execution.

begin;

create table if not exists public.industry_support_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  category text not null,
  subject text not null,
  description text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint industry_support_cases_category_check check (category in ('access','creator_mapping','handoff','analytics','configuration','other')),
  constraint industry_support_cases_status_check check (status in ('open','in_progress','resolved','closed')),
  constraint industry_support_cases_priority_check check (priority in ('low','normal','high','urgent')),
  constraint industry_support_cases_subject_length check (char_length(subject) between 3 and 160),
  constraint industry_support_cases_description_length check (char_length(description) between 3 and 5000),
  constraint industry_support_cases_closed_at_check check ((status = 'closed' and closed_at is not null) or (status <> 'closed' and closed_at is null))
);

create index if not exists industry_support_cases_org_status_idx
  on public.industry_support_cases(organization_id, status, updated_at desc);

alter table public.industry_support_cases enable row level security;

create trigger industry_support_cases_set_updated_at
  before update on public.industry_support_cases
  for each row execute function public.set_updated_at();

-- Every active tenant member can see their tenant's cases. Cross-tenant reads fail closed.
create policy "industry_support_cases_member_select"
  on public.industry_support_cases for select to authenticated
  using (public.is_industry_org_member(organization_id));

-- Any active tenant member may open a case, but only for themselves and their active tenant.
create policy "industry_support_cases_member_insert"
  on public.industry_support_cases for insert to authenticated
  with check (
    public.is_industry_org_member(organization_id)
    and opened_by = auth.uid()
    and status = 'open'
    and closed_at is null
  );

-- Tenant managers may maintain lifecycle fields. Moving a case between tenants or changing
-- its original reporter is forbidden by WITH CHECK and immutable-field trigger below.
create policy "industry_support_cases_manager_update"
  on public.industry_support_cases for update to authenticated
  using (public.is_industry_org_manager(organization_id))
  with check (public.is_industry_org_manager(organization_id));

create or replace function public.guard_industry_support_case_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_id is distinct from old.organization_id
     or new.opened_by is distinct from old.opened_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Support case ownership fields are immutable';
  end if;
  return new;
end;
$$;

revoke all on function public.guard_industry_support_case_identity() from public;

create trigger industry_support_cases_guard_identity
  before update on public.industry_support_cases
  for each row execute function public.guard_industry_support_case_identity();

-- No client DELETE policy. Retention/deletion is an administrative data-lifecycle action.
comment on table public.industry_support_cases is
  'Tenant-scoped LC pilot support cases. Excludes operator-owned gambling, funds, KYC/AML and settlement operations.';

commit;
