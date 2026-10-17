\set ON_ERROR_STOP on
begin;
insert into public.user_blocks(blocker_id, blocked_id)
values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')
on conflict do nothing;
insert into public.posts(id,author_id,body) values
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee91','22222222-2222-4222-8222-222222222222','Synthetic blocked author post');

-- Reproduce the production body and grants using synthetic local rows only.
savepoint baseline;
create or replace function public.is_blocked_pair(user_a uuid, user_b uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_blocks
where (blocker_id=user_a and blocked_id=user_b) or (blocker_id=user_b and blocked_id=user_a)); $$;
grant execute on function public.is_blocked_pair(uuid,uuid) to anon;
set local role anon;
do $$ begin
  if not public.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')
     or public.is_blocked_pair('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333') then
    raise exception 'Baseline disclosure not reproduced';
  end if;
end $$;
rollback to baseline;

set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
  if (select count(*) from public.posts where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeee91') <> 1 then
    raise exception 'Unblocked post visibility changed';
  end if;
  begin
    perform public.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
    raise exception 'Third-party pair leaked';
  exception when insufficient_privilege then null; end;
  begin
    perform lc_private.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
    raise exception 'Private helper exposed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if exists (select 1 from public.posts where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeee91') then
    raise exception 'Blocked post leaked through RLS';
  end if;
  begin
    insert into public.follows(follower_id,following_id) values
    ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
    raise exception 'Blocked follow accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.post_likes(post_id,user_id) values
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee91','11111111-1111-4111-8111-111111111111');
    raise exception 'Blocked like accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.comments(post_id,author_id,body) values
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee91','11111111-1111-4111-8111-111111111111','Denied synthetic comment');
    raise exception 'Blocked comment accepted';
  exception when insufficient_privilege then null; end;
  if not public.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')
     or not public.is_blocked_pair('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111')
     or public.is_blocked_pair('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333') then
    raise exception 'Participant semantics changed';
  end if;
  begin
    perform public.is_blocked_pair(null,'11111111-1111-4111-8111-111111111111');
    raise exception 'NULL pair permitted';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','',true);
do $$ begin
  begin
    perform public.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
    raise exception 'Missing actor permitted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if has_function_privilege('anon','public.is_blocked_pair(uuid,uuid)','execute')
     or has_function_privilege('authenticated','lc_private.is_blocked_pair(uuid,uuid)','execute') then
    raise exception 'Unexpected helper grant';
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname<>'is_blocked_pair' and p.prosecdef
      and position('public.is_blocked_pair(' in p.prosrc)>0) then
    raise exception 'Internal callers were not migrated';
  end if;
  if not lc_private.is_blocked_pair('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222') then
    raise exception 'Privileged pair evaluation changed';
  end if;
end $$;
rollback;
select 'PASS blocked-pair baseline disclosure, actor isolation, participant symmetry, NULL/missing actor, private ACL, internal callers; synthetic rows rolled back' result;
