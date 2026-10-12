-- Local corrective migration; no hosted application authorised.
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

  if actor_role is null or actor_role not in ('owner','admin') then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  if invited_role is null or invited_role not in ('admin','analyst','viewer') then
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
