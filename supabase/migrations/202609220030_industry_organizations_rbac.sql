-- LC App pilot foundation: tenant organizations and fail-closed membership RBAC.
-- Organization creation requires an already-approved industry profile.
-- Membership roles are authorization data and are never client-editable.

begin;

create table if not exists public.industry_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtype text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_organizations_name_length check (char_length(name) between 2 and 120),
  constraint industry_organizations_subtype_check check (subtype in ('operator','provider','aggregator','other')),
  constraint industry_organizations_status_check check (status in ('active','suspended','closed'))
);

create table if not exists public.industry_organization_members (
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id),
  constraint industry_organization_members_role_check check (role in ('owner','admin','analyst','viewer')),
  constraint industry_organization_members_status_check check (status in ('active','suspended','removed'))
);

create index if not exists industry_org_members_user_idx
  on public.industry_organization_members(user_id, status);

alter table public.industry_organizations enable row level security;
alter table public.industry_organization_members enable row level security;

create or replace function public.is_industry_org_member(org_id uuid, member_id uuid default auth.uid())
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
      and m.user_id = member_id
      and m.status = 'active'
      and o.status = 'active'
      and p.account_status = 'active'
  );
$$;

revoke all on function public.is_industry_org_member(uuid, uuid) from public;
grant execute on function public.is_industry_org_member(uuid, uuid) to authenticated;

drop policy if exists "industry_organizations_member_select" on public.industry_organizations;
create policy "industry_organizations_member_select"
  on public.industry_organizations for select
  to authenticated
  using (public.is_industry_org_member(id, auth.uid()));

drop policy if exists "industry_organization_members_member_select" on public.industry_organization_members;
create policy "industry_organization_members_member_select"
  on public.industry_organization_members for select
  to authenticated
  using (public.is_industry_org_member(organization_id, auth.uid()));

-- No INSERT/UPDATE/DELETE RLS policies are granted to authenticated clients.
-- Provisioning and membership changes must cross a privileged backend boundary.

create or replace function public.create_industry_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  profile_row public.industry_profiles%rowtype;
  org_id uuid;
begin
  if actor is null or not public.is_active_profile(actor) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select * into profile_row
  from public.industry_profiles
  where user_id = actor;

  if not found or profile_row.access_status <> 'approved' then
    raise exception 'approved_industry_access_required' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(org_name, ''))) not between 2 and 120 then
    raise exception 'invalid_organization_name' using errcode = '22023';
  end if;

  insert into public.industry_organizations(name, subtype, created_by)
  values (trim(org_name), profile_row.subtype, actor)
  returning id into org_id;

  insert into public.industry_organization_members(organization_id, user_id, role)
  values (org_id, actor, 'owner');

  return org_id;
end;
$$;

revoke all on function public.create_industry_organization(text) from public;
grant execute on function public.create_industry_organization(text) to authenticated;

comment on table public.industry_organizations is
  'Approved operator/provider tenant boundary for LC pilot workspaces.';
comment on table public.industry_organization_members is
  'Protected tenant membership and RBAC. Client users cannot assign or elevate roles.';

commit;
