-- LC App pilot foundation: tenant-scoped creator/table mapping.
-- This is LC configuration metadata only. It does not imply or create an operator/provider integration.

begin;

create table if not exists public.industry_creator_table_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  external_table_ref text not null,
  game_label text,
  status text not null default 'active',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_creator_table_mapping_ref_length check (char_length(external_table_ref) between 1 and 160),
  constraint industry_creator_table_mapping_game_length check (game_label is null or char_length(game_label) <= 80),
  constraint industry_creator_table_mapping_status_check check (status in ('active','paused')),
  constraint industry_creator_table_mapping_unique unique (organization_id, creator_id, external_table_ref)
);

create index if not exists industry_creator_table_mappings_org_idx
  on public.industry_creator_table_mappings(organization_id, status, updated_at desc);
create index if not exists industry_creator_table_mappings_creator_idx
  on public.industry_creator_table_mappings(creator_id, status);

alter table public.industry_creator_table_mappings enable row level security;
revoke all on table public.industry_creator_table_mappings from public, anon, authenticated;
grant select on table public.industry_creator_table_mappings to authenticated;

drop policy if exists "industry_creator_table_mappings_member_select" on public.industry_creator_table_mappings;
create policy "industry_creator_table_mappings_member_select"
  on public.industry_creator_table_mappings for select
  to authenticated
  using (
    exists (
      select 1
      from public.industry_organization_members m
      join public.industry_organizations o on o.id = m.organization_id
      join public.profiles p on p.id = m.user_id
      where m.organization_id = industry_creator_table_mappings.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and o.status = 'active'
        and p.account_status = 'active'
    )
  );

create or replace function public.configure_industry_creator_table_mapping(
  org_id uuid,
  mapped_creator_id uuid,
  table_ref text,
  mapped_game_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  mapping_id uuid;
  normalized_ref text := btrim(coalesce(table_ref, ''));
  normalized_game text := nullif(btrim(coalesce(mapped_game_label, '')), '');
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;
  if not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  if char_length(normalized_ref) not between 1 and 160 then
    raise exception 'invalid_table_reference' using errcode = '22023';
  end if;
  if normalized_game is not null and char_length(normalized_game) > 80 then
    raise exception 'invalid_game_label' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.creator_profiles cp
    join public.profiles p on p.id = cp.user_id
    where cp.user_id = mapped_creator_id
      and cp.verification_status = 'verified'
      and cp.profile_status = 'published'
      and cp.onboarding_completed = true
      and p.account_status = 'active'
  ) then
    raise exception 'verified_published_creator_required' using errcode = '42501';
  end if;

  insert into public.industry_creator_table_mappings(
    organization_id, creator_id, external_table_ref, game_label, status, created_by
  ) values (
    org_id, mapped_creator_id, normalized_ref, normalized_game, 'active', auth.uid()
  )
  on conflict (organization_id, creator_id, external_table_ref) do update
    set game_label = excluded.game_label,
        status = 'active',
        updated_at = now()
  returning id into mapping_id;

  return mapping_id;
end;
$$;

revoke all on function public.configure_industry_creator_table_mapping(uuid, uuid, text, text) from public, anon;
grant execute on function public.configure_industry_creator_table_mapping(uuid, uuid, text, text) to authenticated;

create or replace function public.pause_industry_creator_table_mapping(mapping_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.industry_creator_table_mappings
  where id = mapping_id;

  if not found or not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;

  update public.industry_creator_table_mappings
  set status = 'paused', updated_at = now()
  where id = mapping_id;
end;
$$;

revoke all on function public.pause_industry_creator_table_mapping(uuid) from public, anon;
grant execute on function public.pause_industry_creator_table_mapping(uuid) to authenticated;

comment on table public.industry_creator_table_mappings is
  'Tenant configuration linking verified LC creators to operator/provider table references. Metadata only; no gameplay or funds boundary.';

commit;
