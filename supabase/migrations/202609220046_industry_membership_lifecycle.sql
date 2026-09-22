-- LC App tenant membership lifecycle. Owner-controlled; prevents owner lockout and client role escalation.
begin;

create or replace function public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role text;
  target_role text;
  active_owner_count integer;
begin
  if actor is null or not public.is_active_profile(actor) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select m.role into actor_role
  from public.industry_organization_members m
  join public.industry_organizations o on o.id = m.organization_id
  where m.organization_id = org_id
    and m.user_id = actor
    and m.status = 'active'
    and o.status = 'active'
  for update of m;

  if not found or actor_role <> 'owner' then
    raise exception 'organization_owner_required' using errcode = '42501';
  end if;

  if next_role not in ('owner','admin','analyst','viewer')
     or next_status not in ('active','suspended','removed') then
    raise exception 'invalid_membership_state' using errcode = '22023';
  end if;

  select role into target_role
  from public.industry_organization_members
  where organization_id = org_id and user_id = target_user
  for update;

  if not found then
    raise exception 'membership_not_found' using errcode = '22023';
  end if;

  if target_role = 'owner' and (next_role <> 'owner' or next_status <> 'active') then
    select count(*) into active_owner_count
    from public.industry_organization_members
    where organization_id = org_id and role = 'owner' and status = 'active';
    if active_owner_count <= 1 then
      raise exception 'last_active_owner_required' using errcode = '42501';
    end if;
  end if;

  update public.industry_organization_members
  set role = next_role, status = next_status, updated_at = now()
  where organization_id = org_id and user_id = target_user;
end;
$$;

revoke all on function public.manage_industry_org_member(uuid, uuid, text, text) from public, anon;
grant execute on function public.manage_industry_org_member(uuid, uuid, text, text) to authenticated;

comment on function public.manage_industry_org_member(uuid, uuid, text, text) is
  'Owner-only tenant membership lifecycle. Prevents removal/demotion of the last active owner.';

commit;
