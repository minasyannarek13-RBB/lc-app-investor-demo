-- Reconstructed from the authoritative LC Frontend/Supabase API Contract.
-- The recovered 001 file documents this live-foundation behavior but does not
-- define it. Avatars are public, limited to 5 MB and PNG/JPEG/WebP, while each
-- authenticated user may mutate objects only inside their own UUID folder.

begin;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "avatar_owner_insert" on storage.objects;
create policy "avatar_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_owner_delete" on storage.objects;
create policy "avatar_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
