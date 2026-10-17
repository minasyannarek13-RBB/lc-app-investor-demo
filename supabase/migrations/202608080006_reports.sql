-- Social MVP: reports (basic moderation foundation)
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null,
  target_id    uuid not null,
  reason       text not null,
  description  text,
  status       text not null default 'open',
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  constraint reports_target_type_check check (target_type in ('post', 'comment', 'profile')),
  constraint reports_reason_check check (reason in ('spam', 'abuse', 'illegal_content', 'other')),
  constraint reports_status_check check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  -- Prevents one user from spamming duplicate reports against the same target.
  constraint reports_unique_per_target unique (reporter_id, target_type, target_id)
);

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

alter table public.reports enable row level security;

-- Regular users: create reports, read only their own submissions.
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Moderators/admins: full read access to the report queue.
drop policy if exists "reports_select_moderation_queue" on public.reports;
create policy "reports_select_moderation_queue"
  on public.reports for select
  to authenticated
  using (public.is_moderator());

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Only moderators/admins can update a report (resolution state). Regular
-- reporters have no UPDATE policy at all, so their own reports are
-- immutable once submitted.
drop policy if exists "reports_update_moderation" on public.reports;
create policy "reports_update_moderation"
  on public.reports for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- No DELETE policy for anyone -- reports are retained as a moderation trail.

-- Client only ever needs to send `status`; reviewed_by/reviewed_at are
-- always server-stamped from auth.uid()/now(), never trusted from the
-- client payload. All other fields are immutable after creation.
create or replace function public.protect_report_fields()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.reporter_id is distinct from old.reporter_id
    or new.target_type is distinct from old.target_type
    or new.target_id is distinct from old.target_id
    or new.reason is distinct from old.reason
    or new.description is distinct from old.description
    or new.created_at is distinct from old.created_at
  then
    raise exception 'only status may be updated on reports';
  end if;

  if new.status is distinct from old.status then
    new.reviewed_by = auth.uid();
    new.reviewed_at = now();
  elsif new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'review metadata is server-managed';
  end if;

  return new;
end;
$$;

drop trigger if exists reports_protect_fields on public.reports;
create trigger reports_protect_fields
  before update on public.reports
  for each row execute function public.protect_report_fields();
