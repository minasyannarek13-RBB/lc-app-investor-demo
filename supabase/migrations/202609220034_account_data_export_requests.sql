-- User-owned privacy data export request workflow.
-- Records a private request for authorised export preparation. Browser clients
-- cannot mark exports ready, attach download locations, or expose another user's request.

begin;

create table if not exists public.account_data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  constraint account_data_export_requests_status_check check (status in ('pending','processing','completed','rejected','expired')),
  constraint account_data_export_requests_completed_check check ((status = 'completed' and completed_at is not null) or (status <> 'completed' and completed_at is null)),
  constraint account_data_export_requests_expiry_check check (expires_at is null or expires_at > requested_at)
);

create unique index if not exists account_data_export_requests_one_open
  on public.account_data_export_requests(user_id)
  where status in ('pending','processing');
create index if not exists account_data_export_requests_requested_idx
  on public.account_data_export_requests(requested_at desc);

alter table public.account_data_export_requests enable row level security;

create or replace function public.protect_account_data_export_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if auth.uid() is null or new.user_id <> auth.uid() or not public.is_active_profile(auth.uid()) then
    raise exception 'invalid account data export request owner' using errcode = '42501';
  end if;
  if (
    select count(*) from public.account_data_export_requests
    where user_id = auth.uid() and requested_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'account data export request rate limit exceeded' using errcode = '22023';
  end if;
  new.status := 'pending';
  new.requested_at := now();
  new.completed_at := null;
  new.expires_at := null;
  return new;
end;
$$;

revoke all on function public.protect_account_data_export_request_insert() from public, anon, authenticated;

drop trigger if exists account_data_export_requests_protect_insert on public.account_data_export_requests;
create trigger account_data_export_requests_protect_insert
  before insert on public.account_data_export_requests
  for each row execute function public.protect_account_data_export_request_insert();

create policy "account_data_export_requests_select_own"
  on public.account_data_export_requests for select to authenticated
  using (auth.uid() = user_id);
create policy "account_data_export_requests_insert_own"
  on public.account_data_export_requests for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and completed_at is null
    and expires_at is null
  );

-- Deliberately no authenticated UPDATE or DELETE policy. Export preparation,
-- completion and expiry are privileged backend data-lifecycle actions.
revoke all on table public.account_data_export_requests from public, anon, authenticated;
grant select, insert on table public.account_data_export_requests to authenticated;

comment on table public.account_data_export_requests is
  'Private user-owned privacy export requests awaiting authorised backend processing; contains no export payload or download secret.';

commit;