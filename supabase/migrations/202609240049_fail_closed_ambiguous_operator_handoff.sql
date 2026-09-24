-- Prevent a creator/table reference shared by multiple eligible tenants from
-- silently routing a player to whichever mapping happened to update last.
-- Ambiguous routing now fails closed until operator context is explicit.

begin;

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
  with eligible as (
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
  )
  select min(label), min(destination_url)
  from eligible
  having count(*) = 1;
$$;

revoke all on function public.resolve_licensed_operator_handoff(uuid, text) from public;
grant execute on function public.resolve_licensed_operator_handoff(uuid, text) to anon, authenticated;

comment on function public.resolve_licensed_operator_handoff(uuid, text) is
  'Fail-closed public resolver. Returns a destination only when exactly one active verified creator/table mapping resolves to an admin-approved same-tenant HTTPS operator destination.';

commit;
