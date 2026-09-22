-- Append-only audit trail for tenant creator/table mapping configuration.
-- Records LC configuration changes only; it does not represent gameplay or operator activity.

begin;

create table if not exists public.industry_creator_table_mapping_audit (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.industry_organizations(id) on delete cascade,
  mapping_id uuid not null references public.industry_creator_table_mappings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  creator_id uuid not null references public.profiles(id) on delete restrict,
  external_table_ref text not null,
  game_label text,
  mapping_status text not null,
  created_at timestamptz not null default now(),
  constraint industry_creator_table_mapping_audit_action_check check (action in ('created','updated','paused')),
  constraint industry_creator_table_mapping_audit_status_check check (mapping_status in ('active','paused'))
);

create index if not exists industry_creator_table_mapping_audit_org_idx
  on public.industry_creator_table_mapping_audit(organization_id, created_at desc);

alter table public.industry_creator_table_mapping_audit enable row level security;
revoke all on table public.industry_creator_table_mapping_audit from public, anon, authenticated;
grant select on table public.industry_creator_table_mapping_audit to authenticated;

drop policy if exists "industry_creator_table_mapping_audit_member_select" on public.industry_creator_table_mapping_audit;
create policy "industry_creator_table_mapping_audit_member_select"
  on public.industry_creator_table_mapping_audit for select
  to authenticated
  using (
    exists (
      select 1
      from public.industry_organization_members m
      join public.industry_organizations o on o.id = m.organization_id
      join public.profiles p on p.id = m.user_id
      where m.organization_id = industry_creator_table_mapping_audit.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and o.status = 'active'
        and p.account_status = 'active'
    )
  );

create or replace function public.audit_industry_creator_table_mapping()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_action text;
begin
  if tg_op = 'INSERT' then
    event_action := 'created';
  elsif old.status <> new.status and new.status = 'paused' then
    event_action := 'paused';
  else
    event_action := 'updated';
  end if;

  insert into public.industry_creator_table_mapping_audit(
    organization_id, mapping_id, actor_id, action, creator_id,
    external_table_ref, game_label, mapping_status
  ) values (
    new.organization_id, new.id, auth.uid(), event_action, new.creator_id,
    new.external_table_ref, new.game_label, new.status
  );
  return new;
end;
$$;

revoke all on function public.audit_industry_creator_table_mapping() from public, anon, authenticated;

drop trigger if exists industry_creator_table_mapping_audit_trigger on public.industry_creator_table_mappings;
create trigger industry_creator_table_mapping_audit_trigger
after insert or update on public.industry_creator_table_mappings
for each row execute function public.audit_industry_creator_table_mapping();

comment on table public.industry_creator_table_mapping_audit is
  'Append-only tenant-visible audit history for LC creator/table configuration changes.';

commit;
