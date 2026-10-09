-- Reconstructed from the authoritative LC Frontend/Supabase API Contract.
-- The recovered 001 file documents these live-foundation behaviors but does not
-- define them. This additive migration makes a clean migration chain usable and
-- removes direct client reads of private profile/account fields.

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text := 'user_' || left(replace(new.id::text, '-', ''), 12);
  generated_display_name text := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    'New player'
  );
begin
  insert into public.profiles(id, username, display_name)
  values (new.id, generated_username, left(generated_display_name, 80))
  on conflict (id) do nothing;

  insert into public.user_settings(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_active" on public.profiles;
create policy "profiles_select_active"
  on public.profiles for select
  to authenticated
  using (account_status = 'active');

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id and account_status = 'active')
  with check (auth.uid() = id and account_status = 'active');

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert
  to authenticated
  with check (auth.uid() = user_id and public.is_active_profile(user_id));

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id and public.is_active_profile(user_id))
  with check (auth.uid() = user_id and public.is_active_profile(user_id));

revoke select on table public.profiles from anon, authenticated;
grant select (
  id, username, display_name, avatar_url, bio, country, languages,
  created_at, last_seen_at, role
) on table public.profiles to authenticated;
grant update (
  username, display_name, avatar_url, bio, country, languages,
  onboarding_completed, terms_accepted_at, privacy_accepted_at,
  age_confirmed, last_seen_at, updated_at
) on table public.profiles to authenticated;

create or replace function public.get_own_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(p)
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_own_profile() from public, anon;
grant execute on function public.get_own_profile() to authenticated;

comment on function public.get_own_profile() is
  'Owner-only full profile response. Public table SELECT is restricted to non-sensitive profile columns.';

commit;
