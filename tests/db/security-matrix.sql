\set ON_ERROR_STOP on

select 'LC database migration chain applied' as status;

do $$
begin
  if (select count(*) from pg_tables where schemaname = 'public') < 20 then
    raise exception 'expected LC product tables were not created';
  end if;
  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and not rowsecurity
  ) then
    raise exception 'public table without RLS detected';
  end if;
end;
$$;

insert into auth.users(id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'player1@example.test', '{"display_name":"Player One"}'),
  ('22222222-2222-4222-8222-222222222222', 'player2@example.test', '{"display_name":"Player Two"}'),
  ('33333333-3333-4333-8333-333333333333', 'creator1@example.test', '{"display_name":"Creator One"}'),
  ('44444444-4444-4444-8444-444444444444', 'creator2@example.test', '{"display_name":"Creator Two"}'),
  ('55555555-5555-4555-8555-555555555555', 'operator1@example.test', '{"display_name":"Operator One"}'),
  ('66666666-6666-4666-8666-666666666666', 'operator2@example.test', '{"display_name":"Operator Two"}'),
  ('77777777-7777-4777-8777-777777777777', 'admin@example.test', '{"display_name":"Admin"}');

select set_config('lc_app.profile_system_maintenance', 'on', false);
update public.profiles
set onboarding_completed = true,
    age_confirmed = true,
    terms_accepted_at = now(),
    privacy_accepted_at = now();
update public.profiles
set role = 'admin'
where id = '77777777-7777-4777-8777-777777777777';
select set_config('lc_app.profile_system_maintenance', 'off', false);

insert into public.account_personas(user_id, persona, industry_subtype, onboarding_status, is_current) values
  ('11111111-1111-4111-8111-111111111111', 'player', null, 'completed', true),
  ('22222222-2222-4222-8222-222222222222', 'player', null, 'completed', true),
  ('33333333-3333-4333-8333-333333333333', 'creator', null, 'completed', true),
  ('44444444-4444-4444-8444-444444444444', 'creator', null, 'completed', true),
  ('55555555-5555-4555-8555-555555555555', 'industry', 'operator', 'completed', true),
  ('66666666-6666-4666-8666-666666666666', 'industry', 'operator', 'completed', true);

insert into public.creator_profiles(
  user_id, headline, verification_status, profile_status, onboarding_completed
) values
  ('33333333-3333-4333-8333-333333333333', 'Approved creator', 'verified', 'published', true),
  ('44444444-4444-4444-8444-444444444444', 'Draft creator', 'not_requested', 'draft', true);

insert into public.creator_sessions(
  id, creator_id, title, game, table_name, starts_at, status, visibility, provenance
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '33333333-3333-4333-8333-333333333333', 'Approved live', 'Blackjack', 'TABLE-ONE', now() + interval '5 minutes', 'scheduled', 'public', 'user_generated'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '33333333-3333-4333-8333-333333333333', 'Approved schedule', 'Blackjack', 'TABLE-TWO', now() + interval '1 hour', 'scheduled', 'public', 'user_generated'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '44444444-4444-4444-8444-444444444444', 'Private draft', 'Roulette', 'PRIVATE', now() + interval '2 hours', 'scheduled', 'private', 'user_generated');

update public.creator_sessions set status = 'live'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

insert into public.industry_profiles(
  user_id, subtype, company_name, job_title, work_email, onboarding_completed, access_status
) values
  ('55555555-5555-4555-8555-555555555555', 'operator', 'Operator One', 'Owner', 'owner1@example.test', true, 'approved'),
  ('66666666-6666-4666-8666-666666666666', 'operator', 'Operator Two', 'Owner', 'owner2@example.test', true, 'approved');

insert into public.industry_organizations(id, name, subtype, created_by) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Tenant One', 'operator', '55555555-5555-4555-8555-555555555555'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Tenant Two', 'operator', '66666666-6666-4666-8666-666666666666');

insert into public.industry_organization_members(organization_id, user_id, role) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '55555555-5555-4555-8555-555555555555', 'owner'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '66666666-6666-4666-8666-666666666666', 'owner');

insert into public.industry_handoff_destinations(
  id, organization_id, label, destination_url, status, approved_at, created_by
) values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Synthetic Operator One', 'https://operator-one.example.test/play', 'approved', now(), '55555555-5555-4555-8555-555555555555'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Synthetic Operator Two', 'https://operator-two.example.test/play', 'approved', now(), '66666666-6666-4666-8666-666666666666');

insert into public.industry_creator_table_mappings(
  id, organization_id, creator_id, external_table_ref, game_label, status, created_by, handoff_destination_id
) values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '33333333-3333-4333-8333-333333333333', 'TABLE-ONE', 'Blackjack', 'active', '55555555-5555-4555-8555-555555555555', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '33333333-3333-4333-8333-333333333333', 'TABLE-SHARED', 'Blackjack', 'active', '55555555-5555-4555-8555-555555555555', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '33333333-3333-4333-8333-333333333333', 'TABLE-SHARED', 'Blackjack', 'active', '66666666-6666-4666-8666-666666666666', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2');

insert into public.industry_creator_session_handoffs(
  session_id, mapping_id, organization_id, configured_by
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  '55555555-5555-4555-8555-555555555555'
);

insert into public.notifications(recipient_id, actor_id, type, target_type, target_id)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'new_follower', 'profile', '22222222-2222-4222-8222-222222222222'
);

insert into public.reports(id, reporter_id, target_type, target_id, reason, description)
values (
  '99999999-9999-4999-8999-999999999999',
  '22222222-2222-4222-8222-222222222222',
  'profile', '33333333-3333-4333-8333-333333333333', 'other',
  'Synthetic moderation fixture'
);

select 'LC synthetic security fixtures created' as status;
