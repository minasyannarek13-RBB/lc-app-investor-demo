-- Prevent invitation acceptance from mutating an existing tenant role.

begin;

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
  if exists (
    select 1 from public.industry_organization_members m
    where m.organization_id = invite.organization_id
      and m.user_id = auth.uid()
  ) then
    raise exception 'already_organization_member' using errcode = '23505';
  end if;

  insert into public.industry_organization_members(organization_id, user_id, role, status)
  values (invite.organization_id, auth.uid(), invite.role, 'active');

  update public.industry_organization_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invite.id;

  return invite.organization_id;
end;
$$;

revoke all on function public.accept_industry_org_invitation(text) from public, anon;
grant execute on function public.accept_industry_org_invitation(text) to authenticated;

commit;
