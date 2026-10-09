-- Make foundation ACLs deterministic and ensure account suspension removes
-- moderation, report creation and avatar mutation capabilities.

begin;

revoke create on schema public from public, anon, authenticated;

revoke all on table public.profiles from public, anon, authenticated;
grant select (
  id, username, display_name, avatar_url, bio, country, languages,
  created_at, last_seen_at, role
) on table public.profiles to authenticated;
grant update (
  username, display_name, avatar_url, bio, country, languages,
  onboarding_completed, terms_accepted_at, privacy_accepted_at,
  age_confirmed, last_seen_at, updated_at
) on table public.profiles to authenticated;

revoke all on table public.user_settings from public, anon, authenticated;
grant select, insert, update on table public.user_settings to authenticated;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_status = 'active'
      and role in ('moderator', 'admin')
  );
$$;

revoke all on function public.is_moderator() from public, anon;
grant execute on function public.is_moderator() to authenticated;

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_id
    and public.is_active_profile(reporter_id)
  );

drop policy if exists "avatar_owner_insert" on storage.objects;
create policy "avatar_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_profile(auth.uid())
  );

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_profile(auth.uid())
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_profile(auth.uid())
  );

drop policy if exists "avatar_owner_delete" on storage.objects;
create policy "avatar_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_profile(auth.uid())
  );

grant execute on function public.admin_set_profile_account_status(uuid, text)
  to service_role;

commit;
