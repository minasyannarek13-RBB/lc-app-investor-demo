-- Keep creator return intent attached to the core Follow -> Return loop.
-- Preferences cannot exist for an unfollowed creator, and unfollow cleans them up.

begin;

create or replace function public.require_follow_for_creator_return_preference()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
      from public.follows f
     where f.follower_id = new.user_id
       and f.following_id = new.creator_id
  ) then
    raise exception 'follow required for creator return preference' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.require_follow_for_creator_return_preference() from public, anon, authenticated;

drop trigger if exists creator_return_preferences_require_follow on public.creator_return_preferences;
create trigger creator_return_preferences_require_follow
  before insert or update on public.creator_return_preferences
  for each row execute function public.require_follow_for_creator_return_preference();

create or replace function public.remove_creator_return_preference_on_unfollow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.creator_return_preferences
   where user_id = old.follower_id
     and creator_id = old.following_id;
  return old;
end;
$$;

revoke all on function public.remove_creator_return_preference_on_unfollow() from public, anon, authenticated;

drop trigger if exists follows_remove_creator_return_preference on public.follows;
create trigger follows_remove_creator_return_preference
  after delete on public.follows
  for each row execute function public.remove_creator_return_preference_on_unfollow();

-- Repair orphaned preferences created before this invariant existed.
delete from public.creator_return_preferences p
where not exists (
  select 1
    from public.follows f
   where f.follower_id = p.user_id
     and f.following_id = p.creator_id
);

comment on function public.require_follow_for_creator_return_preference() is
  'Fail-closed invariant: return alert intent is valid only while the player follows the creator.';
comment on function public.remove_creator_return_preference_on_unfollow() is
  'Removes private creator return intent when the corresponding follow ends.';

commit;
