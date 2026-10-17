-- Social MVP: authorization prerequisites
--
-- The verified live foundation already defines the approved role values:
-- user, moderator, admin.
-- This migration must not modify the existing profiles.role constraint.

-- Shared authorization helper used by every RLS policy/trigger below that
-- needs to distinguish moderation-capable accounts. Reads only the caller's
-- own profiles row, which "Users can read own profile" already permits, so
-- SECURITY INVOKER is sufficient -- no elevated privileges required.
create or replace function public.is_moderator()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('moderator', 'admin')
  );
$$;

revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to authenticated;
