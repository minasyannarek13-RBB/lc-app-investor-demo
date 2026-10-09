-- Social MVP: follows + user_blocks
create extension if not exists pgcrypto with schema public;

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  constraint follows_pkey primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

-- follower_id is already the leading PK column (covers "who does X follow").
-- following_id needs its own index (covers "who follows X" / follower counts).
create index if not exists follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

-- ---------------------------------------------------------------------------
-- user_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_pkey primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_id)
);

-- blocker_id is already the leading PK column. blocked_id needs its own
-- index -- it is the lookup direction used by the block-check helper below.
create index if not exists user_blocks_blocked_id_idx on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

-- ---------------------------------------------------------------------------
-- Shared block-check helper
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER is required here: user_blocks RLS only lets a user read
-- rows where they are the blocker. To decide "is A and B a blocked pair"
-- from *either* user's perspective (e.g. B checking whether A blocked them),
-- the check must read rows the calling user is not otherwise allowed to
-- SELECT directly. This function only ever returns a boolean -- it exposes
-- no row contents -- so the privilege escalation surface is minimal.
create or replace function public.is_blocked_pair(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks
    where (blocker_id = user_a and blocked_id = user_b)
       or (blocker_id = user_b and blocked_id = user_a)
  );
$$;

revoke all on function public.is_blocked_pair(uuid, uuid) from public;
grant execute on function public.is_blocked_pair(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- follows policies
-- ---------------------------------------------------------------------------
drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all"
  on public.follows for select
  to authenticated
  using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
  on public.follows for insert
  to authenticated
  with check (
    auth.uid() = follower_id
    and not public.is_blocked_pair(follower_id, following_id)
  );

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- user_blocks policies (fully private -- block lists are never public)
-- ---------------------------------------------------------------------------
drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own"
  on public.user_blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own"
  on public.user_blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own"
  on public.user_blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- Block -> follow cleanup
-- ---------------------------------------------------------------------------
-- Must be SECURITY DEFINER: deleting the reverse-direction follow row
-- (blocked_id -> blocker_id) belongs to the *other* user, which
-- follows_delete_own would not permit for the blocking user's session.
create or replace function public.handle_new_block()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and following_id = new.blocked_id)
     or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end;
$$;

drop trigger if exists user_blocks_cleanup_follows on public.user_blocks;
create trigger user_blocks_cleanup_follows
  after insert on public.user_blocks
  for each row execute function public.handle_new_block();
