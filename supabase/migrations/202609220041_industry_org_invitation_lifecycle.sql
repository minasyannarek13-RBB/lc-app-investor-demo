-- LC App pilot foundation: tenant-scoped, token-based team invitations.
-- Invitations reveal no account email and never allow client-side role escalation.

begin;

create table if not exists public.industry_organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  role text not null,
  token_hash text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint industry_org_invites_role_check check (role in ('admin','analyst','viewer')),
  constraint industry_org_invites_status_check check (status in ('pending','accepted','revoked','expired')),
  constraint industry_org_invites_expiry_check check (expires_at > created_at),
  constraint industry_org_invites_acceptance_check check (
    (status = 'accepted' and accepted_by is not null and accepted_at is not null)
    or (status <> 'accepted' and accepted_by is null and accepted_at is null)
  )
);

create index if not exists industry_org_invites_org_status_idx
  on public.industry_organization_invitations(organization_id, status, created_at desc);

alter table public.industry_organization_invitations enable row level security;
revoke all on table public.industry_organization_invitations from public, anon, authenticated;
grant select on table public.industry_organization_invitations to authenticated;

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
      and m.status = 'active'
      and m.role in ('owner','admin')
      and o.status = 'active'
      and p.account_status = 'active'
  );
$$;

revoke all on function public.is_industry_org_manager(uuid) from public, anon;
grant execute on function public.is_industry_org_manager(uuid) to authenticated;

drop policy if exists "industry_org_invitations_manager_select" on public.industry_organization_invitations;
create policy "industry_org_invitations_manager_select"
  on public.industry_organization_invitations for select
  to authenticated
  using (public.is_industry_org_manager(organization_id));

create or replace function public.create_industry_org_invitation(org_id uuid, invited_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  raw_token text;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select m.role into actor_role
  from public.industry_organization_members m
  join public.industry_organizations o on o.id = m.organization_id
  where m.organization_id = org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
    and o.status = 'active';

  if actor_role not in ('owner','admin') then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  if invited_role not in ('admin','analyst','viewer') then
    raise exception 'invalid_invitation_role' using errcode = '22023';
  end if;
  if actor_role = 'admin' and invited_role = 'admin' then
    raise exception 'owner_required_for_admin_invite' using errcode = '42501';
  end if;

  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into public.industry_organization_invitations(organization_id, role, token_hash, created_by)
  values (org_id, invited_role, encode(digest(raw_token, 'sha256'), 'hex'), auth.uid());
  return raw_token;
end;
$$;

revoke all on function public.create_industry_org_invitation(uuid, text) from public, anon;
grant execute on function public.create_industry_org_invitation(uuid, text) to authenticated;

create or replace function public.accept_industry_org_invitation(raw_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.industry_organization_invitations%rowtype;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;
  if char_length(coalesce(raw_token, '')) <> 64 then
    raise exception 'invalid_invitation' using errcode = '22023';
  end if;

  select * into invite
  from public.industry_organization_invitations
  where token_hash = encode(digest(raw_token, 'sha256'), 'hex')
  for update;

  if not found or invite.status <> 'pending' or invite.expires_at <= now() then
    raise exception 'invalid_or_expired_invitation' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.industry_organizations o
    where o.id = invite.organization_id and o.status = 'active'
  ) then
    raise exception 'organization_unavailable' using errcode = '42501';
  end if;

  insert into public.industry_organization_members(organization_id, user_id, role, status)
  values (invite.organization_id, auth.uid(), invite.role, 'active')
  on conflict (organization_id, user_id) do update
    set role = excluded.role,
        status = 'active',
        updated_at = now();

  update public.industry_organization_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invite.id;

  return invite.organization_id;
end;
$$;

revoke all on function public.accept_industry_org_invitation(text) from public, anon;
grant execute on function public.accept_industry_org_invitation(text) to authenticated;

create or replace function public.revoke_industry_org_invitation(invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.industry_organization_invitations
  where id = invitation_id and status = 'pending';
  if not found or not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  update public.industry_organization_invitations
  set status = 'revoked'
  where id = invitation_id and status = 'pending';
end;
$$;

revoke all on function public.revoke_industry_org_invitation(uuid) from public, anon;
grant execute on function public.revoke_industry_org_invitation(uuid) to authenticated;

comment on table public.industry_organization_invitations is
  'Tenant team invitation records. Raw invitation tokens are returned once and never stored.';

commit;
