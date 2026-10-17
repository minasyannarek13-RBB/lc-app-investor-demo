--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11 (Homebrew)
-- Dumped by pg_dump version 17.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user);
$$;


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;


--
-- Name: accept_industry_org_invitation(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_industry_org_invitation(raw_token text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  invite public.industry_organization_invitations%rowtype;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;
  if char_length(coalesce(raw_token, '')) <> 64 then
    raise exception 'invalid_invitation' using errcode = '22023';
  end if;

  select * into invite
  from public.industry_organization_invitations
  where token_hash = encode(digest(raw_token, 'sha256'), 'hex')
  for update;

  if not found or invite.status <> 'pending' or invite.expires_at <= now() then
    raise exception 'invalid_or_expired_invitation' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.industry_organizations o
    where o.id = invite.organization_id and o.status = 'active'
  ) then
    raise exception 'organization_unavailable' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.industry_organization_members m
    where m.organization_id = invite.organization_id
      and m.user_id = auth.uid()
  ) then
    raise exception 'already_organization_member' using errcode = '23505';
  end if;

  insert into public.industry_organization_members(organization_id, user_id, role, status)
  values (invite.organization_id, auth.uid(), invite.role, 'active');

  update public.industry_organization_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invite.id;

  return invite.organization_id;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: creator_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_profiles (
    user_id uuid NOT NULL,
    headline text,
    games text[] DEFAULT '{}'::text[] NOT NULL,
    languages text[] DEFAULT '{}'::text[] NOT NULL,
    location_region text,
    affiliation_type text DEFAULT 'unlisted'::text NOT NULL,
    affiliation_name text,
    affiliation_verification_status text DEFAULT 'unverified'::text NOT NULL,
    verification_status text DEFAULT 'not_requested'::text NOT NULL,
    profile_status text DEFAULT 'draft'::text NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT creator_profiles_affiliation_name_length CHECK (((affiliation_name IS NULL) OR (char_length(affiliation_name) <= 120))),
    CONSTRAINT creator_profiles_affiliation_type_check CHECK ((affiliation_type = ANY (ARRAY['operator'::text, 'studio'::text, 'provider'::text, 'independent'::text, 'unlisted'::text]))),
    CONSTRAINT creator_profiles_affiliation_verification_status_check CHECK ((affiliation_verification_status = ANY (ARRAY['unverified'::text, 'submitted'::text, 'under_review'::text, 'verified'::text, 'rejected'::text]))),
    CONSTRAINT creator_profiles_games_limit CHECK (((array_length(games, 1) IS NULL) OR (array_length(games, 1) <= 12))),
    CONSTRAINT creator_profiles_headline_length CHECK (((headline IS NULL) OR (char_length(headline) <= 120))),
    CONSTRAINT creator_profiles_languages_limit CHECK (((array_length(languages, 1) IS NULL) OR (array_length(languages, 1) <= 12))),
    CONSTRAINT creator_profiles_location_length CHECK (((location_region IS NULL) OR (char_length(location_region) <= 80))),
    CONSTRAINT creator_profiles_profile_status_check CHECK ((profile_status = ANY (ARRAY['draft'::text, 'published'::text, 'hidden'::text]))),
    CONSTRAINT creator_profiles_verification_status_check CHECK ((verification_status = ANY (ARRAY['not_requested'::text, 'submitted'::text, 'under_review'::text, 'verified'::text, 'rejected'::text])))
);


--
-- Name: TABLE creator_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.creator_profiles IS 'Creator/dealer product profile. Affiliation and verification are user-claimed unless privileged process changes status.';


--
-- Name: admin_set_creator_verification(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text DEFAULT NULL::text) RETURNS public.creator_profiles
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
declare
  v_profile public.creator_profiles;
begin
  if auth.uid() is not null or coalesce(auth.role(), '') in ('anon', 'authenticated') then
    raise exception 'creator approval is not available through client auth'
      using errcode = '42501';
  end if;

  if p_verification_status not in ('submitted', 'under_review', 'verified', 'rejected') then
    raise exception 'invalid creator verification status'
      using errcode = '22023';
  end if;

  if p_affiliation_verification_status is not null
     and p_affiliation_verification_status not in ('unverified', 'submitted', 'under_review', 'verified', 'rejected') then
    raise exception 'invalid affiliation verification status'
      using errcode = '22023';
  end if;

  perform set_config('lc_app.creator_approval_maintenance', 'on', true);

  update public.creator_profiles
     set verification_status = p_verification_status,
         affiliation_verification_status = coalesce(
           p_affiliation_verification_status,
           affiliation_verification_status
         ),
         profile_status = case
           when p_verification_status = 'verified' then profile_status
           else 'draft'
         end,
         updated_at = now()
   where user_id = p_user_id
   returning * into v_profile;

  if not found then
    raise exception 'creator profile not found'
      using errcode = 'P0002';
  end if;

  return v_profile;
end;
$$;


--
-- Name: FUNCTION admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text) IS 'Server/Supabase-admin creator verification workflow; never callable through browser auth.';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username public.citext NOT NULL,
    display_name text NOT NULL,
    avatar_url text,
    bio text,
    country text,
    languages text[] DEFAULT '{}'::text[] NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    terms_accepted_at timestamp with time zone,
    privacy_accepted_at timestamp with time zone,
    age_confirmed boolean DEFAULT false NOT NULL,
    account_status text DEFAULT 'active'::text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    last_seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_account_status_check CHECK ((account_status = ANY (ARRAY['active'::text, 'suspended'::text, 'disabled'::text]))),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'moderator'::text, 'admin'::text]))),
    CONSTRAINT profiles_username_format CHECK ((username OPERATOR(public.~) '^[A-Za-z0-9_]{3,32}$'::public.citext))
);


--
-- Name: admin_set_profile_account_status(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_profile_account_status(p_user_id uuid, p_account_status text) RETURNS public.profiles
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is not null then
    raise exception 'profile account status maintenance is not available through client auth'
      using errcode = '42501';
  end if;

  if p_account_status not in ('active', 'suspended', 'disabled') then
    raise exception 'invalid account_status: %', p_account_status
      using errcode = '22023';
  end if;

  perform set_config('lc_app.profile_system_maintenance', 'on', true);

  update public.profiles
     set account_status = p_account_status,
         updated_at = now()
   where id = p_user_id
   returning * into v_profile;

  if not found then
    raise exception 'profile not found: %', p_user_id
      using errcode = 'P0002';
  end if;

  return v_profile;
end;
$$;


--
-- Name: FUNCTION admin_set_profile_account_status(p_user_id uuid, p_account_status text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.admin_set_profile_account_status(p_user_id uuid, p_account_status text) IS 'Supabase SQL-admin maintenance helper for account_status. Not granted to anon/authenticated and blocked when called through client auth.';


--
-- Name: assign_industry_creator_table_handoff(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_industry_creator_table_handoff(mapping_id uuid, destination_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  mapping_org_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select organization_id into mapping_org_id
  from public.industry_creator_table_mappings
  where id = mapping_id
    and status = 'active'
  for update;

  if not found or not public.is_industry_org_manager(mapping_org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.industry_handoff_destinations d
    join public.industry_organizations o on o.id = d.organization_id
    where d.id = destination_id
      and d.organization_id = mapping_org_id
      and d.status = 'approved'
      and d.approved_at is not null
      and o.status = 'active'
      and d.destination_url ~ '^https://'
  ) then
    raise exception 'approved_same_org_destination_required' using errcode = '42501';
  end if;

  update public.industry_creator_table_mappings
  set handoff_destination_id = destination_id,
      updated_at = now()
  where id = mapping_id;
end;
$$;


--
-- Name: audit_industry_creator_table_mapping(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.audit_industry_creator_table_mapping() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  event_action text;
begin
  if tg_op = 'INSERT' then
    event_action := 'created';
  elsif old.status <> new.status and new.status = 'paused' then
    event_action := 'paused';
  else
    event_action := 'updated';
  end if;

  insert into public.industry_creator_table_mapping_audit(
    organization_id, mapping_id, actor_id, action, creator_id,
    external_table_ref, game_label, mapping_status
  ) values (
    new.organization_id, new.id, auth.uid(), event_action, new.creator_id,
    new.external_table_ref, new.game_label, new.status
  );
  return new;
end;
$$;


--
-- Name: can_manage_user_generated_creator_session(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    auth.uid() = target_creator_id
    and public.is_active_profile(target_creator_id)
    and exists (
      select 1
      from public.account_personas ap
      where ap.user_id = target_creator_id
        and ap.persona = 'creator'
        and ap.onboarding_status = 'completed'
    )
    and exists (
      select 1
      from public.creator_profiles cp
      where cp.user_id = target_creator_id
        and cp.onboarding_completed is true
    )
    and (
      target_visibility <> 'public'
      or public.is_approved_creator(target_creator_id)
    );
$$;


--
-- Name: FUNCTION can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) IS 'Checks whether the current authenticated user has completed Creator persona/profile state before creating or updating user-generated creator sessions.';


--
-- Name: can_publish_creator_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_publish_creator_profile(target_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    public.is_active_profile(target_user_id)
    and exists (
      select 1
      from public.account_personas ap
      where ap.user_id = target_user_id
        and ap.persona = 'creator'
        and ap.onboarding_status = 'completed'
    )
    and exists (
      select 1
      from public.creator_profiles cp
      where cp.user_id = target_user_id
        and cp.onboarding_completed is true
        and cp.verification_status = 'verified'
    );
$$;


--
-- Name: FUNCTION can_publish_creator_profile(target_user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.can_publish_creator_profile(target_user_id uuid) IS 'True when an active, completed Creator is server-verified and may choose to publish their profile.';


--
-- Name: can_set_creator_session_reminder(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    auth.uid() = target_user_id
    and public.is_active_profile(target_user_id)
    and exists (
      select 1
      from public.creator_sessions cs
      where cs.id = target_session_id
        and cs.creator_id <> target_user_id
        and cs.status = 'scheduled'
        and cs.visibility = 'public'
        and cs.starts_at > now()
        and public.is_approved_creator(cs.creator_id)
        and not public.is_blocked_pair(target_user_id, cs.creator_id)
    );
$$;


--
-- Name: FUNCTION can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid) IS 'Fail-closed eligibility for visible app-owned schedule return intent; excludes private, terminal, past, unapproved and blocked Creator sessions.';


--
-- Name: cleanup_blocked_pair_session_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_blocked_pair_session_reminders() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  delete from public.player_session_reminders r
  using public.creator_sessions s
  where r.session_id = s.id
    and r.user_id in (new.blocker_id, new.blocked_id)
    and s.creator_id in (new.blocker_id, new.blocked_id)
    and r.user_id <> s.creator_id;
  return new;
end;
$$;


--
-- Name: cleanup_ineligible_session_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_ineligible_session_reminders() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.visibility <> 'public' or new.status not in ('scheduled', 'live') then
    delete from public.player_session_reminders where session_id = new.id;
  end if;
  return new;
end;
$$;


--
-- Name: configure_creator_session_handoff(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.configure_creator_session_handoff(target_session_id uuid, target_mapping_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  mapping_org_id uuid;
  mapping_creator_id uuid;
  session_creator_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select m.organization_id, m.creator_id
    into mapping_org_id, mapping_creator_id
  from public.industry_creator_table_mappings m
  join public.industry_organizations o on o.id = m.organization_id
  join public.industry_handoff_destinations d
    on d.id = m.handoff_destination_id
   and d.organization_id = m.organization_id
  where m.id = target_mapping_id
    and m.status = 'active'
    and o.status = 'active'
    and d.status = 'approved'
    and d.approved_at is not null
    and d.destination_url ~ '^https://'
  for update of m;

  if not found or not public.is_industry_org_manager(mapping_org_id) then
    raise exception 'approved_mapping_manager_required' using errcode = '42501';
  end if;

  select creator_id into session_creator_id
  from public.creator_sessions
  where id = target_session_id
    and provenance = 'user_generated'
    and status in ('scheduled', 'live')
  for update;

  if not found or session_creator_id <> mapping_creator_id then
    raise exception 'matching_creator_session_required' using errcode = '42501';
  end if;

  insert into public.industry_creator_session_handoffs(
    session_id, mapping_id, organization_id, configured_by
  ) values (
    target_session_id, target_mapping_id, mapping_org_id, auth.uid()
  )
  on conflict (session_id) do update
    set mapping_id = excluded.mapping_id,
        organization_id = excluded.organization_id,
        configured_by = excluded.configured_by,
        updated_at = now();
end;
$$;


--
-- Name: configure_industry_creator_table_mapping(uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.configure_industry_creator_table_mapping(org_id uuid, mapped_creator_id uuid, table_ref text, mapped_game_label text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  mapping_id uuid;
  normalized_ref text := btrim(coalesce(table_ref, ''));
  normalized_game text := nullif(btrim(coalesce(mapped_game_label, '')), '');
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;
  if not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  if char_length(normalized_ref) not between 1 and 160 then
    raise exception 'invalid_table_reference' using errcode = '22023';
  end if;
  if normalized_game is not null and char_length(normalized_game) > 80 then
    raise exception 'invalid_game_label' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.creator_profiles cp
    join public.profiles p on p.id = cp.user_id
    where cp.user_id = mapped_creator_id
      and cp.verification_status = 'verified'
      and cp.profile_status = 'published'
      and cp.onboarding_completed = true
      and p.account_status = 'active'
  ) then
    raise exception 'verified_published_creator_required' using errcode = '42501';
  end if;

  insert into public.industry_creator_table_mappings(
    organization_id, creator_id, external_table_ref, game_label, status, created_by
  ) values (
    org_id, mapped_creator_id, normalized_ref, normalized_game, 'active', auth.uid()
  )
  on conflict (organization_id, creator_id, external_table_ref) do update
    set game_label = excluded.game_label,
        status = 'active',
        updated_at = now()
  returning id into mapping_id;

  return mapping_id;
end;
$$;


--
-- Name: create_creator_live_return_signals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_creator_live_return_signals() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.status <> 'live' or new.visibility <> 'public'
    or (tg_op = 'UPDATE' and old.status = 'live' and old.visibility = 'public')
  then
    return new;
  end if;

  insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
  select f.follower_id, new.creator_id, new.id, 'creator_live'
  from public.follows f
  join public.creator_profiles cp
    on cp.user_id = new.creator_id
   and cp.verification_status = 'verified'
   and cp.profile_status = 'published'
  left join public.return_signal_preferences pref on pref.user_id = f.follower_id
  where f.following_id = new.creator_id
    and f.live_alerts_enabled is true
    and coalesce(pref.creator_live_enabled, true)
    and public.is_active_profile(f.follower_id)
    and not public.is_blocked_pair(f.follower_id, new.creator_id)
  on conflict (recipient_id, session_id, signal_type) do nothing;

  return new;
end;
$$;


--
-- Name: FUNCTION create_creator_live_return_signals(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_creator_live_return_signals() IS 'Creates in-app Creator Live return signals only for eligible followers whose global and per-Creator Live alert intents are enabled.';


--
-- Name: create_industry_org_invitation(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_industry_org_invitation(org_id uuid, invited_role text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  actor_role text;
  raw_token text;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select m.role into actor_role
  from public.industry_organization_members m
  join public.industry_organizations o on o.id = m.organization_id
  where m.organization_id = org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
    and o.status = 'active';

  if actor_role not in ('owner','admin') then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  if invited_role not in ('admin','analyst','viewer') then
    raise exception 'invalid_invitation_role' using errcode = '22023';
  end if;
  if actor_role = 'admin' and invited_role = 'admin' then
    raise exception 'owner_required_for_admin_invite' using errcode = '42501';
  end if;

  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into public.industry_organization_invitations(organization_id, role, token_hash, created_by)
  values (org_id, invited_role, encode(digest(raw_token, 'sha256'), 'hex'), auth.uid());
  return raw_token;
end;
$$;


--
-- Name: create_industry_organization(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_industry_organization(org_name text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  actor uuid := auth.uid();
  profile_row public.industry_profiles%rowtype;
  org_id uuid;
begin
  if actor is null or not public.is_active_profile(actor) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select * into profile_row
  from public.industry_profiles
  where user_id = actor;

  if not found or profile_row.access_status <> 'approved' then
    raise exception 'approved_industry_access_required' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(org_name, ''))) not between 2 and 120 then
    raise exception 'invalid_organization_name' using errcode = '22023';
  end if;

  insert into public.industry_organizations(name, subtype, created_by)
  values (trim(org_name), profile_row.subtype, actor)
  returning id into org_id;

  insert into public.industry_organization_members(organization_id, user_id, role)
  values (org_id, actor, 'owner');

  return org_id;
end;
$$;


--
-- Name: create_live_signal_on_follow(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_live_signal_on_follow() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not new.live_alerts_enabled
    or new.follower_id = new.following_id
    or not public.is_active_profile(new.follower_id)
    or not public.is_active_profile(new.following_id)
    or not public.is_approved_creator(new.following_id)
    or public.is_blocked_pair(new.follower_id, new.following_id)
  then
    return new;
  end if;

  insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
  select new.follower_id, new.following_id, s.id, 'creator_live'
  from public.creator_sessions s
  left join public.return_signal_preferences pref on pref.user_id = new.follower_id
  where s.creator_id = new.following_id
    and s.status = 'live'
    and s.visibility = 'public'
    and coalesce(pref.creator_live_enabled, true)
  on conflict (recipient_id, session_id, signal_type) do nothing;

  return new;
end;
$$;


--
-- Name: FUNCTION create_live_signal_on_follow(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_live_signal_on_follow() IS 'Creates an in-app Creator Live signal when a player follows a verified published Creator who is already live.';


--
-- Name: create_live_signals_on_preference_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_live_signals_on_preference_enable() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  -- Global mute must take effect immediately, including signals that already exist.
  if not new.creator_live_enabled then
    delete from public.return_signals
     where recipient_id = new.user_id
       and signal_type = 'creator_live';
    return new;
  end if;

  -- No work for an already-enabled preference or an inactive account.
  if (tg_op = 'UPDATE' and old.creator_live_enabled)
    or not public.is_active_profile(new.user_id)
  then
    return new;
  end if;

  -- Enabling restores only currently valid Live signals and preserves
  -- per-Creator mute choices introduced by migration 025.
  insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
  select new.user_id, f.following_id, s.id, 'creator_live'
  from public.follows f
  join public.creator_profiles cp
    on cp.user_id = f.following_id
   and cp.verification_status = 'verified'
   and cp.profile_status = 'published'
  join public.creator_sessions s
    on s.creator_id = f.following_id
   and s.status = 'live'
   and s.visibility = 'public'
  where f.follower_id = new.user_id
    and f.live_alerts_enabled
    and public.is_active_profile(f.following_id)
    and not public.is_blocked_pair(new.user_id, f.following_id)
  on conflict (recipient_id, session_id, signal_type) do nothing;

  return new;
end;
$$;


--
-- Name: FUNCTION create_live_signals_on_preference_enable(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_live_signals_on_preference_enable() IS 'Synchronizes global Creator Live signal preference: mute deletes existing app-owned Live signals; enable restores only eligible current signals while respecting per-Creator alert preferences.';


--
-- Name: enforce_creator_session_state_machine(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_creator_session_state_machine() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.provenance <> 'user_generated' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'scheduled' then
      raise exception 'new Creator sessions must start as scheduled'
        using errcode = '23514';
    end if;
    if new.starts_at <= now() then
      raise exception 'new Creator sessions must be scheduled in the future'
        using errcode = '23514';
    end if;
  elsif not (
    (old.status = 'scheduled' and new.status in ('scheduled', 'live', 'cancelled'))
    or (old.status = 'live' and new.status in ('live', 'completed', 'cancelled'))
    or (old.status = 'completed' and new.status = 'completed')
    or (old.status = 'cancelled' and new.status = 'cancelled')
  ) then
    raise exception 'invalid Creator session status transition: % to %', old.status, new.status
      using errcode = '23514';
  end if;

  if new.status in ('completed', 'cancelled') then
    new.visibility := 'private';
  end if;

  if new.status = 'scheduled' and new.visibility = 'public' and new.starts_at <= now() then
    raise exception 'a public scheduled Creator session must be in the future'
      using errcode = '23514';
  end if;

  if new.status = 'live' then
    if new.visibility <> 'public' then
      raise exception 'a Live Creator session must be public'
        using errcode = '23514';
    end if;
    if not public.is_approved_creator(new.creator_id) then
      raise exception 'Creator is not approved to publish a Live session'
        using errcode = '42501';
    end if;

    -- Lock the Creator row so concurrent transitions cannot both become Live.
    perform 1
      from public.creator_profiles cp
     where cp.user_id = new.creator_id
     for update;

    if exists (
      select 1
        from public.creator_sessions other
       where other.creator_id = new.creator_id
         and other.status = 'live'
         and other.id <> new.id
    ) then
      raise exception 'Creator already has a Live session'
        using errcode = '23514', hint = 'already_live';
    end if;
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION enforce_creator_session_state_machine(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_creator_session_state_machine() IS 'Fail-closed Creator session lifecycle with truthful future schedule and one-Live-session concurrency guard.';


--
-- Name: enforce_product_event_attribution_trust(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_attribution_trust() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  -- Browser/client requests carry the authenticated Postgres role. A client may
  -- submit contextual or unattributed evidence, but cannot mint trusted evidence.
  if auth.role() = 'authenticated' and new.attribution_confidence = 'direct' then
    new.attribution_confidence := 'contextual';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION enforce_product_event_attribution_trust(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_product_event_attribution_trust() IS 'Fail-closed attribution trust boundary: authenticated clients cannot self-assert direct attribution; privileged server-side correlation is required.';


--
-- Name: enforce_product_event_context(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_context() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  session_creator uuid;
  session_status text;
  session_visibility text;
begin
  if new.creator_id is not null then
    if not public.is_approved_creator(new.creator_id) then
      raise exception 'product event Creator is not publicly eligible' using errcode = '23514';
    end if;

    if exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = new.user_id and b.blocked_id = new.creator_id)
         or (b.blocker_id = new.creator_id and b.blocked_id = new.user_id)
    ) then
      raise exception 'product event Creator context is blocked' using errcode = '23514';
    end if;
  end if;

  if new.creator_session_id is not null then
    select s.creator_id, s.status, s.visibility
      into session_creator, session_status, session_visibility
      from public.creator_sessions s
     where s.id = new.creator_session_id;

    if session_creator is null or new.creator_id is null or session_creator <> new.creator_id then
      raise exception 'product event session context does not match Creator' using errcode = '23514';
    end if;

    if new.event_name = 'schedule_reminder'
       and (session_visibility <> 'public' or session_status <> 'scheduled') then
      raise exception 'schedule reminder requires a public scheduled session' using errcode = '23514';
    end if;

    if new.event_name in ('live_session_open', 'handoff_intent')
       and (session_visibility <> 'public' or session_status <> 'live') then
      raise exception 'live intent requires a public live session' using errcode = '23514';
    end if;

    if new.event_name = 'notification_response' and session_visibility <> 'public' then
      raise exception 'notification response requires public session context when a session is supplied' using errcode = '23514';
    end if;
  end if;

  if new.event_name in (
    'creator_impression', 'creator_profile_open', 'creator_follow',
    'live_session_open', 'schedule_reminder', 'handoff_intent',
    'handoff_return', 'notification_response'
  ) and new.creator_id is null then
    raise exception 'product event requires Creator context' using errcode = '23514';
  end if;

  if new.event_name in (
    'live_session_open', 'schedule_reminder', 'handoff_intent', 'handoff_return'
  ) and new.creator_session_id is null then
    raise exception 'product event requires session context' using errcode = '23514';
  end if;

  if new.event_name = 'handoff_return' and not exists (
    select 1
      from public.product_events prior
     where prior.user_id = new.user_id
       and prior.event_name = 'handoff_intent'
       and prior.journey_id = new.journey_id
       and prior.creator_id = new.creator_id
       and prior.creator_session_id = new.creator_session_id
       and prior.created_at <= coalesce(new.created_at, now())
       and prior.created_at >= coalesce(new.created_at, now()) - interval '30 days'
  ) then
    raise exception 'handoff return requires matching prior handoff intent' using errcode = '23514';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION enforce_product_event_context(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_product_event_context() IS 'Fail-closed event context guard. Notification responses accept trusted Creator-only targets or matching public Creator/session targets; handoff return remains anchored to prior intent.';


--
-- Name: enforce_product_event_handoff_boundary(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_handoff_boundary() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if auth.role() = 'authenticated' and new.event_name = 'handoff_intent' then
    raise exception 'handoff_intent_requires_server_boundary'
      using errcode = '42501';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION enforce_product_event_handoff_boundary(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_product_event_handoff_boundary() IS 'Fail-closed measurement boundary: browser clients cannot record operator handoff intent; an approved server-side destination/correlation path must do so.';


--
-- Name: enforce_product_event_metadata_allowlist(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_metadata_allowlist() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
declare
  allowed_keys text[];
  metadata_key text;
  metadata_value jsonb;
  scalar_value text;
begin
  if jsonb_typeof(new.metadata) <> 'object' then
    raise exception 'product event metadata must be an object' using errcode = '23514';
  end if;

  allowed_keys := case new.event_name
    when 'product_open' then array['surface']::text[]
    when 'creator_impression' then array['surface','position','filter','recommendation_reasons','experience']::text[]
    when 'discovery_search' then array['has_query','result_count','interaction','filter']::text[]
    when 'creator_follow' then array['action']::text[]
    when 'schedule_reminder' then array['action']::text[]
    when 'handoff_intent' then array['action']::text[]
    when 'notification_response' then array['notification_type']::text[]
    else array[]::text[]
  end;

  if exists (
    select 1 from jsonb_object_keys(new.metadata) as keys(key)
     where not (keys.key = any(allowed_keys))
  ) then
    raise exception 'product event metadata contains an unexpected key' using errcode = '23514';
  end if;

  for metadata_key, metadata_value in select key, value from jsonb_each(new.metadata)
  loop
    if jsonb_typeof(metadata_value) = 'object' then
      raise exception 'nested product event metadata is not allowed' using errcode = '23514';
    end if;

    scalar_value := metadata_value #>> '{}';
    case
      when metadata_key in ('surface', 'filter', 'interaction', 'experience', 'notification_type') then
        if jsonb_typeof(metadata_value) <> 'string' or char_length(scalar_value) not between 1 and 80 then
          raise exception 'invalid product event metadata text value' using errcode = '23514';
        end if;
      when metadata_key = 'action' then
        if jsonb_typeof(metadata_value) <> 'string'
           or scalar_value not in ('follow', 'set', 'outbound_navigation') then
          raise exception 'invalid product event action' using errcode = '23514';
        end if;
      when metadata_key = 'position' then
        if jsonb_typeof(metadata_value) <> 'number'
           or scalar_value !~ '^[0-9]+$'
           or scalar_value::numeric not between 1 and 100 then
          raise exception 'invalid product event position' using errcode = '23514';
        end if;
      when metadata_key = 'result_count' then
        if jsonb_typeof(metadata_value) <> 'number'
           or scalar_value !~ '^[0-9]+$'
           or scalar_value::numeric not between 0 and 10000 then
          raise exception 'invalid product event result count' using errcode = '23514';
        end if;
      when metadata_key = 'has_query' then
        if jsonb_typeof(metadata_value) <> 'boolean' then
          raise exception 'invalid product event query flag' using errcode = '23514';
        end if;
      when metadata_key = 'recommendation_reasons' then
        if jsonb_typeof(metadata_value) <> 'array'
           or jsonb_array_length(metadata_value) > 4
           or exists (
             select 1 from jsonb_array_elements(metadata_value) as items(item)
              where jsonb_typeof(items.item) <> 'string'
                 or char_length(items.item #>> '{}') not between 1 and 80
           ) then
          raise exception 'invalid recommendation reasons metadata' using errcode = '23514';
        end if;
      else
        raise exception 'unsupported product event metadata key' using errcode = '23514';
    end case;
  end loop;

  return new;
end;
$_$;


--
-- Name: FUNCTION enforce_product_event_metadata_allowlist(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_product_event_metadata_allowlist() IS 'Per-event metadata allowlist with bounded scalar values and a bounded string-array exception for recommendation reasons.';


--
-- Name: enforce_product_event_rate_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_rate_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if (
    select count(*)
    from public.product_events
    where user_id = new.user_id
      and created_at >= now() - interval '1 minute'
  ) >= 120 then
    raise exception 'product event rate limit exceeded'
      using errcode = '54000';
  end if;
  return new;
end;
$$;


--
-- Name: enforce_product_event_state_integrity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_product_event_state_integrity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.event_name = 'creator_follow' and not exists (
    select 1
      from public.follows f
     where f.follower_id = new.user_id
       and f.following_id = new.creator_id
  ) then
    raise exception 'creator_follow requires persisted follow state'
      using errcode = '23514';
  end if;

  if new.event_name = 'schedule_reminder' and not exists (
    select 1
      from public.player_session_reminders r
     where r.user_id = new.user_id
       and r.session_id = new.creator_session_id
  ) then
    raise exception 'schedule_reminder requires persisted reminder state'
      using errcode = '23514';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION enforce_product_event_state_integrity(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.enforce_product_event_state_integrity() IS 'Measurement integrity guard: positive follow/reminder events require matching persisted LC product state.';


--
-- Name: get_own_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_own_profile() RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select to_jsonb(p)
  from public.profiles p
  where p.id = auth.uid();
$$;


--
-- Name: FUNCTION get_own_profile(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_own_profile() IS 'Owner-only full profile response. Public table SELECT is restricted to non-sensitive profile columns.';


--
-- Name: guard_industry_support_case_identity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.guard_industry_support_case_identity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.organization_id is distinct from old.organization_id
     or new.opened_by is distinct from old.opened_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Support case ownership fields are immutable';
  end if;
  return new;
end;
$$;


--
-- Name: handle_new_block(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_block() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and following_id = new.blocked_id)
     or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


--
-- Name: is_active_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_active_profile(profile_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = profile_id
      and account_status = 'active'
  );
$$;


--
-- Name: is_approved_creator(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_approved_creator(target_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    public.can_publish_creator_profile(target_user_id)
    and exists (
      select 1
      from public.creator_profiles cp
      where cp.user_id = target_user_id
        and cp.profile_status = 'published'
    );
$$;


--
-- Name: FUNCTION is_approved_creator(target_user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_approved_creator(target_user_id uuid) IS 'True only when an eligible verified Creator has deliberately published their profile.';


--
-- Name: is_blocked_pair(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_blocked_pair(user_a uuid, user_b uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_blocks
    where (blocker_id = user_a and blocked_id = user_b)
       or (blocker_id = user_b and blocked_id = user_a)
  );
$$;


--
-- Name: is_industry_org_manager(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_industry_org_manager(org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.industry_organization_members m
    join public.industry_organizations o on o.id = m.organization_id
    join public.profiles p on p.id = m.user_id
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner','admin')
      and o.status = 'active'
      and p.account_status = 'active'
  );
$$;


--
-- Name: is_industry_org_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_industry_org_member(org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.industry_organization_members m
    join public.industry_organizations o on o.id = m.organization_id
    join public.profiles p on p.id = m.user_id
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and o.status = 'active'
      and p.account_status = 'active'
  );
$$;


--
-- Name: is_moderator(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_moderator() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_status = 'active'
      and role in ('moderator', 'admin')
  );
$$;


--
-- Name: manage_industry_org_member(uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  actor uuid := auth.uid();
  actor_role text;
  target_role text;
  active_owner_count integer;
begin
  if actor is null or not public.is_active_profile(actor) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  -- Lock the tenant itself first. Every membership mutation through this RPC now
  -- serializes on one stable row before owner count is read or membership changes.
  perform 1
  from public.industry_organizations o
  where o.id = org_id
    and o.status = 'active'
  for update;

  if not found then
    raise exception 'active_organization_required' using errcode = '42501';
  end if;

  select m.role into actor_role
  from public.industry_organization_members m
  where m.organization_id = org_id
    and m.user_id = actor
    and m.status = 'active'
  for update;

  if not found or actor_role <> 'owner' then
    raise exception 'organization_owner_required' using errcode = '42501';
  end if;

  if next_role not in ('owner','admin','analyst','viewer')
     or next_status not in ('active','suspended','removed') then
    raise exception 'invalid_membership_state' using errcode = '22023';
  end if;

  select role into target_role
  from public.industry_organization_members
  where organization_id = org_id and user_id = target_user
  for update;

  if not found then
    raise exception 'membership_not_found' using errcode = '22023';
  end if;

  if target_role = 'owner' and (next_role <> 'owner' or next_status <> 'active') then
    select count(*) into active_owner_count
    from public.industry_organization_members
    where organization_id = org_id and role = 'owner' and status = 'active';

    if active_owner_count <= 1 then
      raise exception 'last_active_owner_required' using errcode = '42501';
    end if;
  end if;

  update public.industry_organization_members
  set role = next_role, status = next_status, updated_at = now()
  where organization_id = org_id and user_id = target_user;
end;
$$;


--
-- Name: FUNCTION manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text) IS 'Owner-only tenant membership lifecycle. Serializes membership changes per tenant and prevents removal/demotion of the last active owner.';


--
-- Name: notify_comment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_comment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_post_author_id   uuid;
  v_parent_author_id uuid;
  v_event_id         bigint;
begin
  select author_id into v_post_author_id from public.posts where id = new.post_id;

  if new.parent_comment_id is not null then
    select author_id into v_parent_author_id from public.comments where id = new.parent_comment_id;

    if v_parent_author_id is not null
       and v_parent_author_id <> new.author_id
       and not public.is_blocked_pair(new.author_id, v_parent_author_id) then
      insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
      values (new.author_id, v_parent_author_id, 'replied', 'comment', new.id)
      returning id into v_event_id;

      insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
      values (v_parent_author_id, new.author_id, 'comment_reply', 'comment', new.id, v_event_id);
    end if;
  end if;

  -- Also notify the post author, unless they are the commenter or were
  -- already notified above as the parent-comment author.
  if v_post_author_id is not null
     and v_post_author_id <> new.author_id
     and v_post_author_id is distinct from v_parent_author_id
     and not public.is_blocked_pair(new.author_id, v_post_author_id) then
    insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
    values (new.author_id, v_post_author_id, 'commented', 'post', new.post_id)
    returning id into v_event_id;

    insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
    values (v_post_author_id, new.author_id, 'comment', 'post', new.post_id, v_event_id);
  end if;

  return new;
end;
$$;


--
-- Name: notify_new_follower(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_new_follower() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_event_id bigint;
begin
  if new.follower_id = new.following_id then
    return new;
  end if;

  if public.is_blocked_pair(new.follower_id, new.following_id) then
    return new;
  end if;

  insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
  values (new.follower_id, new.following_id, 'followed', 'profile', new.following_id)
  returning id into v_event_id;

  insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
  values (new.following_id, new.follower_id, 'new_follower', 'profile', new.following_id, v_event_id);

  return new;
end;
$$;


--
-- Name: notify_post_like(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_post_like() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_author_id uuid;
  v_event_id  bigint;
begin
  select author_id into v_author_id from public.posts where id = new.post_id;

  if v_author_id is null or v_author_id = new.user_id then
    return new;
  end if;

  if public.is_blocked_pair(new.user_id, v_author_id) then
    return new;
  end if;

  insert into public.activity_events (actor_id, recipient_id, verb, target_type, target_id)
  values (new.user_id, v_author_id, 'post_liked', 'post', new.post_id)
  returning id into v_event_id;

  insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, event_id)
  values (v_author_id, new.user_id, 'post_like', 'post', new.post_id, v_event_id);

  return new;
end;
$$;


--
-- Name: pause_industry_creator_table_mapping(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pause_industry_creator_table_mapping(mapping_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  org_id uuid;
begin
  if auth.uid() is null or not public.is_active_profile(auth.uid()) then
    raise exception 'active_account_required' using errcode = '42501';
  end if;

  select organization_id into org_id
  from public.industry_creator_table_mappings
  where id = mapping_id;

  if not found or not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;

  update public.industry_creator_table_mappings
  set status = 'paused', updated_at = now()
  where id = mapping_id;
end;
$$;


--
-- Name: privatize_creator_sessions_on_unpublish(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.privatize_creator_sessions_on_unpublish() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if old.profile_status = 'published' and new.profile_status <> 'published' then
    update public.creator_sessions
       set visibility = 'private',
           updated_at = now()
     where creator_id = new.user_id
       and visibility = 'public'
       and provenance = 'user_generated';
  end if;

  return new;
end;
$$;


--
-- Name: protect_account_data_export_request_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_account_data_export_request_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


--
-- Name: protect_account_deletion_request_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_account_deletion_request_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'invalid account deletion request owner' using errcode = '42501';
  end if;
  if (
    select count(*) from public.account_deletion_requests
    where user_id = auth.uid() and requested_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'account deletion request rate limit exceeded' using errcode = '22023';
  end if;
  new.status := 'pending';
  new.requested_at := now();
  new.cancelled_at := null;
  new.completed_at := null;
  return new;
end;
$$;


--
-- Name: protect_account_deletion_request_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_account_deletion_request_update() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if auth.uid() is null
    or old.user_id <> auth.uid()
    or new.user_id is distinct from old.user_id
    or new.id is distinct from old.id
    or new.requested_at is distinct from old.requested_at
    or old.status <> 'pending'
    or new.status <> 'cancelled'
    or new.cancelled_at is null
    or new.completed_at is distinct from old.completed_at
  then
    raise exception 'invalid account deletion request transition' using errcode = '42501';
  end if;
  return new;
end;
$$;


--
-- Name: protect_account_persona_identity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_account_persona_identity() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.persona is distinct from old.persona
    or new.industry_subtype is distinct from old.industry_subtype
    or new.created_at is distinct from old.created_at
  then
    raise exception 'account persona identity fields cannot be changed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;


--
-- Name: protect_comment_moderation_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_comment_moderation_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.id is distinct from old.id then
    raise exception 'comment id cannot be changed';
  end if;
  if new.post_id is distinct from old.post_id then
    raise exception 'comment post cannot be changed';
  end if;
  if new.author_id is distinct from old.author_id then
    raise exception 'comment author cannot be changed';
  end if;
  if new.parent_comment_id is distinct from old.parent_comment_id then
    raise exception 'comment parent cannot be changed';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'comment created_at cannot be changed';
  end if;
  if new.status is distinct from old.status and not public.is_moderator() then
    raise exception 'only moderators or admins can change comment status';
  end if;
  return new;
end;
$$;


--
-- Name: protect_creator_profile_status_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_creator_profile_status_fields() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
    raise exception 'creator profile identity fields cannot be changed'
      using errcode = '42501';
  end if;

  if current_setting('lc_app.creator_approval_maintenance', true) = 'on' then
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status then
    if not (auth.uid() = old.user_id and old.verification_status = 'not_requested' and new.verification_status = 'submitted') then
      raise exception 'creator verification status is protected'
        using errcode = '42501';
    end if;
  end if;

  if new.affiliation_verification_status is distinct from old.affiliation_verification_status then
    if not (auth.uid() = old.user_id and old.affiliation_verification_status = 'unverified' and new.affiliation_verification_status = 'submitted') then
      raise exception 'creator affiliation status is protected'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;


--
-- Name: protect_creator_return_preference_write(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_creator_return_preference_write() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if auth.uid() is null
     or new.user_id <> auth.uid()
     or not public.is_active_profile(auth.uid())
     or not public.is_approved_creator(new.creator_id) then
    raise exception 'invalid creator return preference' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'creator return preference owner cannot change' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: protect_creator_session_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_creator_session_fields() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.id is distinct from old.id
    or new.creator_id is distinct from old.creator_id
    or new.created_at is distinct from old.created_at
    or new.provenance is distinct from old.provenance
  then
    raise exception 'creator session system fields cannot be changed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;


--
-- Name: protect_industry_profile_access_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_industry_profile_access_status() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.user_id is distinct from old.user_id
    or new.created_at is distinct from old.created_at
    or new.access_status is distinct from old.access_status
  then
    raise exception 'industry profile protected fields cannot be changed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;


--
-- Name: protect_notification_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_notification_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.id is distinct from old.id
    or new.recipient_id is distinct from old.recipient_id
    or new.actor_id is distinct from old.actor_id
    or new.type is distinct from old.type
    or new.target_type is distinct from old.target_type
    or new.target_id is distinct from old.target_id
    or new.event_id is distinct from old.event_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'only read_at may be updated on notifications';
  end if;
  return new;
end;
$$;


--
-- Name: protect_partnership_access_request_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_partnership_access_request_fields() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.industry_subtype is distinct from old.industry_subtype
    or new.created_at is distinct from old.created_at
    or new.status is distinct from old.status
  then
    raise exception 'partnership access request protected fields cannot be changed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;


--
-- Name: protect_pilot_measurement_brief(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_pilot_measurement_brief() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.industry_subtype is distinct from old.industry_subtype
    or new.created_at is distinct from old.created_at
  then
    raise exception 'pilot measurement brief protected fields cannot be changed' using errcode = '42501';
  end if;

  if old.status <> 'draft' then
    raise exception 'submitted pilot measurement briefs cannot be changed by the owner' using errcode = '42501';
  end if;

  if new.status not in ('draft', 'submitted') then
    raise exception 'pilot measurement brief review status is protected' using errcode = '42501';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION protect_pilot_measurement_brief(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.protect_pilot_measurement_brief() IS 'Owners may edit only their own draft or submit it; service-role review transitions remain backend-only.';


--
-- Name: protect_player_session_reminder_write(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_player_session_reminder_write() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
declare
  session_creator uuid;
begin
  if auth.uid() is null
    or new.user_id <> auth.uid()
    or not public.is_active_profile(auth.uid())
  then
    raise exception 'invalid session reminder owner' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and (
    new.user_id is distinct from old.user_id
    or new.session_id is distinct from old.session_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'session reminder identity cannot change' using errcode = '42501';
  end if;

  select s.creator_id
    into session_creator
    from public.creator_sessions s
   where s.id = new.session_id
     and s.visibility = 'public'
     and s.status in ('scheduled', 'live');

  if session_creator is null
    or not public.is_approved_creator(session_creator)
    or public.is_blocked_pair(new.user_id, session_creator)
  then
    raise exception 'session is not eligible for reminders' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: FUNCTION protect_player_session_reminder_write(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.protect_player_session_reminder_write() IS 'Fail-closed reminder gate: active player, immutable identity, approved Creator, public scheduled/live session and no block relationship.';


--
-- Name: protect_post_moderation_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_post_moderation_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.id is distinct from old.id then
    raise exception 'post id cannot be changed';
  end if;
  if new.author_id is distinct from old.author_id then
    raise exception 'post author cannot be changed';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'post created_at cannot be changed';
  end if;
  if new.status is distinct from old.status and not public.is_moderator() then
    raise exception 'only moderators or admins can change post status';
  end if;
  return new;
end;
$$;


--
-- Name: protect_profile_system_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_profile_system_fields() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
declare
  protected_key text;
begin
  if current_setting('lc_app.profile_system_maintenance', true) = 'on' then
    return new;
  end if;

  foreach protected_key in array array[
    'id',
    'role',
    'account_status',
    'created_at',
    'admin_notes',
    'admin_flags',
    'moderation_status',
    'moderation_reason',
    'moderated_by',
    'moderated_at',
    'suspended_by',
    'suspended_at',
    'disabled_by',
    'disabled_at'
  ]
  loop
    if (to_jsonb(new) -> protected_key) is distinct from (to_jsonb(old) -> protected_key) then
      raise exception 'profiles.% cannot be changed by client update', protected_key
        using errcode = '42501';
    end if;
  end loop;

  select key
  into protected_key
  from jsonb_object_keys(to_jsonb(new)) as keys(key)
  where (
    key like 'admin_%'
    or key like 'moderator_%'
    or key like 'system_%'
    or key like 'internal_%'
    or key in ('is_admin', 'is_moderator', 'permissions', 'privileges', 'permission_level')
  )
  and (to_jsonb(new) -> key) is distinct from (to_jsonb(old) -> key)
  limit 1;

  if protected_key is not null then
    raise exception 'profiles.% cannot be changed by client update', protected_key
      using errcode = '42501';
  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION protect_profile_system_fields(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.protect_profile_system_fields() IS 'Prevents authenticated browser/client profile updates from changing role, account_status, identity, timestamp, and privileged/system fields.';


--
-- Name: protect_report_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_report_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: protect_return_signal_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_return_signal_update() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  if new.id is distinct from old.id
    or new.recipient_id is distinct from old.recipient_id
    or new.creator_id is distinct from old.creator_id
    or new.session_id is distinct from old.session_id
    or new.signal_type is distinct from old.signal_type
    or new.created_at is distinct from old.created_at
  then
    raise exception 'return signal immutable fields cannot be changed' using errcode = '42501';
  end if;

  if old.read_at is not null then
    if new.read_at is distinct from old.read_at then
      raise exception 'return signal read state is immutable once read' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.read_at is null then
    raise exception 'return signal update must mark the signal read' using errcode = '42501';
  end if;

  -- Ignore client-supplied timestamps. The database is authoritative for response timing.
  new.read_at := now();
  return new;
end;
$$;


--
-- Name: FUNCTION protect_return_signal_update(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.protect_return_signal_update() IS 'Allows a recipient-owned signal to transition unread -> read exactly once and stamps read_at on the database clock.';


--
-- Name: remove_creator_return_preference_on_unfollow(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_creator_return_preference_on_unfollow() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  delete from public.creator_return_preferences
   where user_id = old.follower_id
     and creator_id = old.following_id;
  return old;
end;
$$;


--
-- Name: FUNCTION remove_creator_return_preference_on_unfollow(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.remove_creator_return_preference_on_unfollow() IS 'Removes private creator return intent when the corresponding follow ends.';


--
-- Name: remove_follows_on_user_block(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_follows_on_user_block() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  delete from public.follows
   where (follower_id = new.blocker_id and following_id = new.blocked_id)
      or (follower_id = new.blocked_id and following_id = new.blocker_id);
  delete from public.return_signals
   where (recipient_id = new.blocker_id and creator_id = new.blocked_id)
      or (recipient_id = new.blocked_id and creator_id = new.blocker_id);
  delete from public.player_session_reminders r
  using public.creator_sessions cs
  where r.session_id = cs.id
    and (
      (r.user_id = new.blocker_id and cs.creator_id = new.blocked_id)
      or (r.user_id = new.blocked_id and cs.creator_id = new.blocker_id)
    );
  return new;
end;
$$;


--
-- Name: FUNCTION remove_follows_on_user_block(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.remove_follows_on_user_block() IS 'Severs follows in both directions after a user-owned block is created.';


--
-- Name: remove_ineligible_creator_live_return_signals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_ineligible_creator_live_return_signals() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.status <> 'live' or new.visibility <> 'public' then
    delete from public.return_signals
    where session_id = new.id
      and signal_type = 'creator_live';
  end if;
  return new;
end;
$$;


--
-- Name: remove_ineligible_creator_session_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_ineligible_creator_session_reminders() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if old.starts_at is distinct from new.starts_at
    or new.status <> 'scheduled'
    or new.visibility <> 'public'
    or new.starts_at <= now()
    or not public.is_approved_creator(new.creator_id)
  then
    delete from public.player_session_reminders
    where session_id = new.id;
  end if;
  return new;
end;
$$;


--
-- Name: require_follow_for_creator_return_preference(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.require_follow_for_creator_return_preference() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
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


--
-- Name: FUNCTION require_follow_for_creator_return_preference(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.require_follow_for_creator_return_preference() IS 'Fail-closed invariant: return alert intent is valid only while the player follows the creator.';


--
-- Name: resolve_licensed_operator_handoff(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) RETURNS TABLE(destination_label text, destination_url text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  with eligible as (
    select d.label, d.destination_url
    from public.industry_creator_table_mappings m
    join public.industry_organizations o on o.id = m.organization_id
    join public.industry_handoff_destinations d
      on d.id = m.handoff_destination_id
     and d.organization_id = m.organization_id
    join public.creator_profiles cp on cp.user_id = m.creator_id
    join public.profiles p on p.id = m.creator_id
    where m.creator_id = mapped_creator_id
      and m.external_table_ref = btrim(coalesce(table_ref, ''))
      and m.status = 'active'
      and o.status = 'active'
      and d.status = 'approved'
      and d.approved_at is not null
      and d.destination_url ~ '^https://'
      and cp.verification_status = 'verified'
      and cp.profile_status = 'published'
      and cp.onboarding_completed = true
      and p.account_status = 'active'
  )
  select min(label), min(destination_url)
  from eligible
  having count(*) = 1;
$$;


--
-- Name: FUNCTION resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) IS 'Fail-closed public resolver. Returns a destination only when exactly one active verified creator/table mapping resolves to an admin-approved same-tenant HTTPS operator destination.';


--
-- Name: resolve_live_session_operator_handoff(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) RETURNS TABLE(destination_label text, destination_url text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select d.label, d.destination_url
  from public.industry_creator_session_handoffs sh
  join public.creator_sessions s on s.id = sh.session_id
  join public.industry_creator_table_mappings m
    on m.id = sh.mapping_id
   and m.organization_id = sh.organization_id
   and m.creator_id = s.creator_id
  join public.industry_organizations o on o.id = sh.organization_id
  join public.industry_handoff_destinations d
    on d.id = m.handoff_destination_id
   and d.organization_id = sh.organization_id
  join public.creator_profiles cp on cp.user_id = s.creator_id
  join public.profiles p on p.id = s.creator_id
  where sh.session_id = target_session_id
    and s.status = 'live'
    and s.visibility = 'public'
    and s.provenance = 'user_generated'
    and m.status = 'active'
    and o.status = 'active'
    and d.status = 'approved'
    and d.approved_at is not null
    and d.destination_url ~ '^https://'
    and cp.verification_status = 'verified'
    and cp.profile_status = 'published'
    and cp.onboarding_completed = true
    and p.account_status = 'active'
  limit 1;
$$;


--
-- Name: FUNCTION resolve_live_session_operator_handoff(target_session_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) IS 'Fail-closed public resolver for a live public verified Creator session explicitly bound by an authorized tenant manager to an approved HTTPS operator destination.';


--
-- Name: revoke_industry_org_invitation(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.revoke_industry_org_invitation(invitation_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.industry_organization_invitations
  where id = invitation_id and status = 'pending';
  if not found or not public.is_industry_org_manager(org_id) then
    raise exception 'organization_manager_required' using errcode = '42501';
  end if;
  update public.industry_organization_invitations
  set status = 'revoked'
  where id = invitation_id and status = 'pending';
end;
$$;


--
-- Name: set_creator_live_alert_preference(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null
    or p_creator_id is null
    or p_enabled is null
    or v_user_id = p_creator_id
    or not public.is_active_profile(v_user_id)
    or not public.is_active_profile(p_creator_id)
    or not public.is_approved_creator(p_creator_id)
    or public.is_blocked_pair(v_user_id, p_creator_id)
  then
    raise exception 'Creator Live alert preference is not available' using errcode = '42501';
  end if;

  update public.follows
     set live_alerts_enabled = p_enabled
   where follower_id = v_user_id
     and following_id = p_creator_id;

  if not found then
    raise exception 'Follow relationship required' using errcode = '42501';
  end if;

  if not p_enabled then
    delete from public.return_signals
     where recipient_id = v_user_id
       and creator_id = p_creator_id
       and signal_type = 'creator_live';
  else
    insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
    select v_user_id, p_creator_id, s.id, 'creator_live'
      from public.creator_sessions s
      left join public.return_signal_preferences pref on pref.user_id = v_user_id
     where s.creator_id = p_creator_id
       and s.status = 'live'
       and s.visibility = 'public'
       and coalesce(pref.creator_live_enabled, true)
    on conflict (recipient_id, session_id, signal_type) do nothing;
  end if;

  return p_enabled;
end;
$$;


--
-- Name: FUNCTION set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean) IS 'Safely mutes or enables Live signals for one followed, approved Creator; muting preserves the follow.';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: sync_creator_return_live_alert_preference(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_creator_return_live_alert_preference() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_user_id uuid;
  v_creator_id uuid;
  v_enabled boolean;
begin
  v_user_id := coalesce(new.user_id, old.user_id);
  v_creator_id := coalesce(new.creator_id, old.creator_id);
  v_enabled := case when tg_op = 'DELETE' then true else new.live_alerts end;

  update public.follows
     set live_alerts_enabled = v_enabled
   where follower_id = v_user_id
     and following_id = v_creator_id;

  if not v_enabled then
    delete from public.return_signals
     where recipient_id = v_user_id
       and creator_id = v_creator_id
       and signal_type = 'creator_live';
  elsif public.is_active_profile(v_user_id)
    and public.is_approved_creator(v_creator_id)
    and not public.is_blocked_pair(v_user_id, v_creator_id)
  then
    insert into public.return_signals (recipient_id, creator_id, session_id, signal_type)
    select v_user_id, v_creator_id, s.id, 'creator_live'
      from public.creator_sessions s
     where s.creator_id = v_creator_id
       and s.status = 'live'
       and s.visibility = 'public'
    on conflict (recipient_id, session_id, signal_type) do nothing;
  end if;

  return coalesce(new, old);
end;
$$;


--
-- Name: FUNCTION sync_creator_return_live_alert_preference(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.sync_creator_return_live_alert_preference() IS 'Synchronizes player-owned per-Creator Live alert intent with app-owned in-app Live signals; no external delivery is implied.';


--
-- Name: validate_comment_reply_depth(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_comment_reply_depth() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.parent_comment_id is not null then
    if not exists (
      select 1 from public.comments pc
      where pc.id = new.parent_comment_id
        and pc.post_id = new.post_id
        and pc.status = 'active'
        and pc.deleted_at is null
        and pc.parent_comment_id is null
    ) then
      raise exception 'replies are limited to a single level';
    end if;
  end if;
  return new;
end;
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(path text) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $$
  select string_to_array(trim(both '/' from path), '/');
$$;


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    id uuid NOT NULL,
    email text,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: account_data_export_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_data_export_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    expires_at timestamp with time zone,
    CONSTRAINT account_data_export_requests_completed_check CHECK ((((status = 'completed'::text) AND (completed_at IS NOT NULL)) OR ((status <> 'completed'::text) AND (completed_at IS NULL)))),
    CONSTRAINT account_data_export_requests_expiry_check CHECK (((expires_at IS NULL) OR (expires_at > requested_at))),
    CONSTRAINT account_data_export_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'rejected'::text, 'expired'::text])))
);


--
-- Name: TABLE account_data_export_requests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.account_data_export_requests IS 'Private user-owned privacy export requests awaiting authorised backend processing; contains no export payload or download secret.';


--
-- Name: account_deletion_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_deletion_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    cancelled_at timestamp with time zone,
    completed_at timestamp with time zone,
    CONSTRAINT account_deletion_requests_cancelled_check CHECK (((status = 'cancelled'::text) = (cancelled_at IS NOT NULL))),
    CONSTRAINT account_deletion_requests_completed_check CHECK (((status = 'completed'::text) = (completed_at IS NOT NULL))),
    CONSTRAINT account_deletion_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'cancelled'::text, 'completed'::text, 'rejected'::text])))
);


--
-- Name: TABLE account_deletion_requests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.account_deletion_requests IS 'Private user-owned requests awaiting authorised deletion processing; not proof of immediate deletion.';


--
-- Name: account_personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_personas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    persona text NOT NULL,
    industry_subtype text,
    onboarding_status text DEFAULT 'started'::text NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT account_personas_industry_subtype_check CHECK ((((persona <> 'industry'::text) AND (industry_subtype IS NULL)) OR ((persona = 'industry'::text) AND (industry_subtype = ANY (ARRAY['operator'::text, 'provider'::text, 'aggregator'::text, 'other'::text]))))),
    CONSTRAINT account_personas_onboarding_status_check CHECK ((onboarding_status = ANY (ARRAY['started'::text, 'completed'::text]))),
    CONSTRAINT account_personas_persona_check CHECK ((persona = ANY (ARRAY['player'::text, 'creator'::text, 'industry'::text])))
);


--
-- Name: TABLE account_personas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.account_personas IS 'Product persona state for LC App. Not an authorization role.';


--
-- Name: activity_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_events (
    id bigint NOT NULL,
    actor_id uuid NOT NULL,
    recipient_id uuid,
    verb text NOT NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT activity_events_target_type_check CHECK ((target_type = ANY (ARRAY['profile'::text, 'post'::text, 'comment'::text]))),
    CONSTRAINT activity_events_verb_check CHECK ((verb = ANY (ARRAY['followed'::text, 'post_liked'::text, 'commented'::text, 'replied'::text])))
);


--
-- Name: activity_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.activity_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.activity_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    author_id uuid NOT NULL,
    parent_comment_id uuid,
    body text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT comments_body_length CHECK (((char_length(body) >= 1) AND (char_length(body) <= 1000))),
    CONSTRAINT comments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'removed'::text])))
);


--
-- Name: creator_return_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_return_preferences (
    user_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    live_alerts boolean DEFAULT true NOT NULL,
    schedule_alerts boolean DEFAULT true NOT NULL,
    schedule_lead_minutes integer DEFAULT 15 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT creator_return_preferences_lead_check CHECK (((schedule_lead_minutes >= 0) AND (schedule_lead_minutes <= 1440))),
    CONSTRAINT creator_return_preferences_not_self CHECK ((user_id <> creator_id))
);


--
-- Name: TABLE creator_return_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.creator_return_preferences IS 'Private player-owned intent for creator live/schedule return alerts. Does not claim or perform message delivery.';


--
-- Name: creator_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    title text,
    game text NOT NULL,
    table_name text,
    operator_name text,
    provider_name text,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone,
    status text DEFAULT 'scheduled'::text NOT NULL,
    visibility text DEFAULT 'public'::text NOT NULL,
    provenance text DEFAULT 'user_generated'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT creator_sessions_game_length CHECK (((char_length(game) >= 2) AND (char_length(game) <= 80))),
    CONSTRAINT creator_sessions_operator_length CHECK (((operator_name IS NULL) OR (char_length(operator_name) <= 120))),
    CONSTRAINT creator_sessions_provenance_check CHECK ((provenance = ANY (ARRAY['demo'::text, 'user_generated'::text, 'partner'::text, 'system'::text]))),
    CONSTRAINT creator_sessions_provider_length CHECK (((provider_name IS NULL) OR (char_length(provider_name) <= 120))),
    CONSTRAINT creator_sessions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'live'::text, 'cancelled'::text, 'completed'::text]))),
    CONSTRAINT creator_sessions_table_length CHECK (((table_name IS NULL) OR (char_length(table_name) <= 120))),
    CONSTRAINT creator_sessions_time_order CHECK (((ends_at IS NULL) OR (ends_at > starts_at))),
    CONSTRAINT creator_sessions_title_length CHECK (((title IS NULL) OR (char_length(title) <= 120))),
    CONSTRAINT creator_sessions_visibility_check CHECK ((visibility = ANY (ARRAY['public'::text, 'private'::text])))
);


--
-- Name: TABLE creator_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.creator_sessions IS 'Creator-owned public/private Live Casino session schedule records.';


--
-- Name: follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follows (
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    live_alerts_enabled boolean DEFAULT true NOT NULL,
    CONSTRAINT follows_no_self_follow CHECK ((follower_id <> following_id))
);


--
-- Name: COLUMN follows.live_alerts_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.follows.live_alerts_enabled IS 'Player-owned per-Creator preference for app-owned in-app Live signals.';


--
-- Name: industry_creator_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_creator_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    external_reference text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_creator_mappings_external_ref_length CHECK (((external_reference IS NULL) OR (char_length(external_reference) <= 160))),
    CONSTRAINT industry_creator_mappings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'suspended'::text, 'removed'::text])))
);


--
-- Name: TABLE industry_creator_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_creator_mappings IS 'Tenant-scoped creator mapping for pilots. Client managers can propose mappings but cannot approve them.';


--
-- Name: industry_creator_session_handoffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_creator_session_handoffs (
    session_id uuid NOT NULL,
    mapping_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    configured_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE industry_creator_session_handoffs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_creator_session_handoffs IS 'Tenant-scoped routing metadata binding one LC Creator session to one approved operator handoff mapping.';


--
-- Name: industry_creator_table_mapping_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_creator_table_mapping_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    mapping_id uuid NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    creator_id uuid NOT NULL,
    external_table_ref text NOT NULL,
    game_label text,
    mapping_status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_creator_table_mapping_audit_action_check CHECK ((action = ANY (ARRAY['created'::text, 'updated'::text, 'paused'::text]))),
    CONSTRAINT industry_creator_table_mapping_audit_status_check CHECK ((mapping_status = ANY (ARRAY['active'::text, 'paused'::text])))
);


--
-- Name: TABLE industry_creator_table_mapping_audit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_creator_table_mapping_audit IS 'Append-only tenant-visible audit history for LC creator/table configuration changes.';


--
-- Name: industry_creator_table_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_creator_table_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    external_table_ref text NOT NULL,
    game_label text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    handoff_destination_id uuid,
    CONSTRAINT industry_creator_table_mapping_game_length CHECK (((game_label IS NULL) OR (char_length(game_label) <= 80))),
    CONSTRAINT industry_creator_table_mapping_ref_length CHECK (((char_length(external_table_ref) >= 1) AND (char_length(external_table_ref) <= 160))),
    CONSTRAINT industry_creator_table_mapping_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text])))
);


--
-- Name: TABLE industry_creator_table_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_creator_table_mappings IS 'Tenant configuration linking verified LC creators to operator/provider table references. Metadata only; no gameplay or funds boundary.';


--
-- Name: industry_handoff_destinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_handoff_destinations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    label text NOT NULL,
    destination_url text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    approved_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_handoff_destinations_approval_check CHECK ((((status = 'approved'::text) AND (approved_at IS NOT NULL)) OR (status <> 'approved'::text))),
    CONSTRAINT industry_handoff_destinations_https_check CHECK ((destination_url ~ '^https://'::text)),
    CONSTRAINT industry_handoff_destinations_label_length CHECK (((char_length(label) >= 2) AND (char_length(label) <= 120))),
    CONSTRAINT industry_handoff_destinations_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'suspended'::text, 'retired'::text]))),
    CONSTRAINT industry_handoff_destinations_url_length CHECK (((char_length(destination_url) >= 12) AND (char_length(destination_url) <= 2048)))
);


--
-- Name: TABLE industry_handoff_destinations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_handoff_destinations IS 'Tenant-scoped HTTPS licensed-operator handoff destinations. Client managers can draft but cannot approve destinations.';


--
-- Name: industry_integration_health; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_integration_health (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    component text NOT NULL,
    status text DEFAULT 'unknown'::text NOT NULL,
    summary text,
    checked_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_integration_health_component_check CHECK ((component = ANY (ARRAY['creator_mapping'::text, 'handoff'::text, 'event_delivery'::text, 'catalog'::text, 'support'::text]))),
    CONSTRAINT industry_integration_health_status_check CHECK ((status = ANY (ARRAY['unknown'::text, 'healthy'::text, 'degraded'::text, 'unavailable'::text, 'disabled'::text]))),
    CONSTRAINT industry_integration_health_summary_length CHECK (((summary IS NULL) OR (char_length(summary) <= 500)))
);


--
-- Name: TABLE industry_integration_health; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_integration_health IS 'Tenant-scoped operational health snapshots. Authenticated organization members may read; privileged backend processes own writes. Excludes credentials and regulated gambling data.';


--
-- Name: industry_organization_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_organization_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    role text NOT NULL,
    token_hash text NOT NULL,
    created_by uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    accepted_by uuid,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_org_invites_acceptance_check CHECK ((((status = 'accepted'::text) AND (accepted_by IS NOT NULL) AND (accepted_at IS NOT NULL)) OR ((status <> 'accepted'::text) AND (accepted_by IS NULL) AND (accepted_at IS NULL)))),
    CONSTRAINT industry_org_invites_expiry_check CHECK ((expires_at > created_at)),
    CONSTRAINT industry_org_invites_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'analyst'::text, 'viewer'::text]))),
    CONSTRAINT industry_org_invites_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'revoked'::text, 'expired'::text])))
);


--
-- Name: TABLE industry_organization_invitations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_organization_invitations IS 'Tenant team invitation records. Raw invitation tokens are returned once and never stored.';


--
-- Name: industry_organization_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_organization_members (
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_organization_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'analyst'::text, 'viewer'::text]))),
    CONSTRAINT industry_organization_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'removed'::text])))
);


--
-- Name: TABLE industry_organization_members; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_organization_members IS 'Protected tenant membership and RBAC. Client users cannot assign or elevate roles.';


--
-- Name: industry_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subtype text NOT NULL,
    created_by uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_organizations_name_length CHECK (((char_length(name) >= 2) AND (char_length(name) <= 120))),
    CONSTRAINT industry_organizations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'closed'::text]))),
    CONSTRAINT industry_organizations_subtype_check CHECK ((subtype = ANY (ARRAY['operator'::text, 'provider'::text, 'aggregator'::text, 'other'::text])))
);


--
-- Name: TABLE industry_organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_organizations IS 'Approved operator/provider tenant boundary for LC pilot workspaces.';


--
-- Name: industry_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_profiles (
    user_id uuid NOT NULL,
    subtype text NOT NULL,
    company_name text NOT NULL,
    job_title text NOT NULL,
    work_email text NOT NULL,
    website_url text,
    interests text[] DEFAULT '{}'::text[] NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    access_status text DEFAULT 'not_requested'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT industry_profiles_access_status_check CHECK ((access_status = ANY (ARRAY['not_requested'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT industry_profiles_company_length CHECK (((char_length(company_name) >= 2) AND (char_length(company_name) <= 120))),
    CONSTRAINT industry_profiles_interests_limit CHECK (((array_length(interests, 1) IS NULL) OR (array_length(interests, 1) <= 12))),
    CONSTRAINT industry_profiles_job_length CHECK (((char_length(job_title) >= 2) AND (char_length(job_title) <= 120))),
    CONSTRAINT industry_profiles_subtype_check CHECK ((subtype = ANY (ARRAY['operator'::text, 'provider'::text, 'aggregator'::text, 'other'::text]))),
    CONSTRAINT industry_profiles_website_length CHECK (((website_url IS NULL) OR (char_length(website_url) <= 300))),
    CONSTRAINT industry_profiles_work_email_length CHECK (((char_length(work_email) >= 3) AND (char_length(work_email) <= 254)))
);


--
-- Name: TABLE industry_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_profiles IS 'Industry persona profile for operators, providers, aggregators and other iGaming companies.';


--
-- Name: industry_support_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_support_cases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    opened_by uuid NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    CONSTRAINT industry_support_cases_category_check CHECK ((category = ANY (ARRAY['access'::text, 'creator_mapping'::text, 'handoff'::text, 'analytics'::text, 'configuration'::text, 'other'::text]))),
    CONSTRAINT industry_support_cases_closed_at_check CHECK ((((status = 'closed'::text) AND (closed_at IS NOT NULL)) OR ((status <> 'closed'::text) AND (closed_at IS NULL)))),
    CONSTRAINT industry_support_cases_description_length CHECK (((char_length(description) >= 3) AND (char_length(description) <= 5000))),
    CONSTRAINT industry_support_cases_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT industry_support_cases_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]))),
    CONSTRAINT industry_support_cases_subject_length CHECK (((char_length(subject) >= 3) AND (char_length(subject) <= 160)))
);


--
-- Name: TABLE industry_support_cases; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.industry_support_cases IS 'Tenant-scoped LC pilot support cases. Excludes operator-owned gambling, funds, KYC/AML and settlement operations.';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    type text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    event_id bigint,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_target_type_check CHECK ((target_type = ANY (ARRAY['profile'::text, 'post'::text, 'comment'::text]))),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['new_follower'::text, 'post_like'::text, 'comment'::text, 'comment_reply'::text])))
);


--
-- Name: partnership_access_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnership_access_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    industry_subtype text NOT NULL,
    request_note text,
    status text DEFAULT 'submitted'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT partnership_access_requests_note_length CHECK (((request_note IS NULL) OR (char_length(request_note) <= 500))),
    CONSTRAINT partnership_access_requests_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT partnership_access_requests_subtype_check CHECK ((industry_subtype = ANY (ARRAY['operator'::text, 'provider'::text, 'aggregator'::text, 'other'::text])))
);


--
-- Name: TABLE partnership_access_requests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.partnership_access_requests IS 'User-submitted request-access records. Client cannot self-approve.';


--
-- Name: pilot_measurement_briefs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pilot_measurement_briefs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    industry_subtype text NOT NULL,
    primary_hypothesis text NOT NULL,
    attribution_window_days integer DEFAULT 7 NOT NULL,
    observed_events text[] DEFAULT '{}'::text[] NOT NULL,
    feed_readiness text DEFAULT 'not_available'::text NOT NULL,
    handoff_readiness text DEFAULT 'not_available'::text NOT NULL,
    notes text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pilot_measurement_briefs_events_check CHECK ((((cardinality(observed_events) >= 1) AND (cardinality(observed_events) <= 10)) AND (observed_events <@ ARRAY['creator_impression'::text, 'creator_profile_open'::text, 'creator_follow'::text, 'live_session_open'::text, 'schedule_reminder'::text, 'handoff_intent'::text, 'handoff_return'::text, 'notification_response'::text]))),
    CONSTRAINT pilot_measurement_briefs_feed_check CHECK ((feed_readiness = ANY (ARRAY['not_available'::text, 'documentation_available'::text, 'sandbox_available'::text]))),
    CONSTRAINT pilot_measurement_briefs_handoff_check CHECK ((handoff_readiness = ANY (ARRAY['not_available'::text, 'conceptual'::text, 'sandbox_available'::text]))),
    CONSTRAINT pilot_measurement_briefs_hypothesis_check CHECK ((primary_hypothesis = ANY (ARRAY['creator_handoff'::text, 'creator_return'::text, 'live_signal_response'::text, 'creator_source_attribution'::text]))),
    CONSTRAINT pilot_measurement_briefs_notes_length CHECK (((notes IS NULL) OR (char_length(notes) <= 1000))),
    CONSTRAINT pilot_measurement_briefs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT pilot_measurement_briefs_subtype_check CHECK ((industry_subtype = ANY (ARRAY['operator'::text, 'provider'::text, 'aggregator'::text, 'other'::text]))),
    CONSTRAINT pilot_measurement_briefs_window_check CHECK (((attribution_window_days >= 1) AND (attribution_window_days <= 30)))
);


--
-- Name: TABLE pilot_measurement_briefs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.pilot_measurement_briefs IS 'User-owned operator/provider pilot hypotheses and instrumentation readiness. Values are self-reported and are not performance, approval or integration claims.';


--
-- Name: player_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_preferences (
    user_id uuid NOT NULL,
    favorite_games text[] DEFAULT '{}'::text[] NOT NULL,
    preferred_languages text[] DEFAULT '{}'::text[] NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT player_preferences_games_limit CHECK (((array_length(favorite_games, 1) IS NULL) OR (array_length(favorite_games, 1) <= 12))),
    CONSTRAINT player_preferences_languages_limit CHECK (((array_length(preferred_languages, 1) IS NULL) OR (array_length(preferred_languages, 1) <= 12)))
);


--
-- Name: player_session_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_session_reminders (
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT player_session_reminders_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text])))
);


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    body text,
    media_url text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT posts_body_length CHECK (((body IS NULL) OR (char_length(body) <= 2000))),
    CONSTRAINT posts_body_or_media CHECK (((COALESCE(char_length(body), 0) > 0) OR (media_url IS NOT NULL))),
    CONSTRAINT posts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'removed'::text])))
);


--
-- Name: product_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_name text NOT NULL,
    event_key uuid NOT NULL,
    journey_id uuid NOT NULL,
    creator_id uuid,
    creator_session_id uuid,
    campaign_source text,
    campaign_name text,
    attribution_confidence text DEFAULT 'unattributed'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_events_attribution_confidence_check CHECK ((attribution_confidence = ANY (ARRAY['direct'::text, 'contextual'::text, 'unattributed'::text]))),
    CONSTRAINT product_events_campaign_name_length CHECK (((campaign_name IS NULL) OR (char_length(campaign_name) <= 80))),
    CONSTRAINT product_events_campaign_source_length CHECK (((campaign_source IS NULL) OR (char_length(campaign_source) <= 80))),
    CONSTRAINT product_events_metadata_object CHECK (((jsonb_typeof(metadata) = 'object'::text) AND (octet_length((metadata)::text) <= 2048))),
    CONSTRAINT product_events_name_check CHECK ((event_name = ANY (ARRAY['product_open'::text, 'creator_impression'::text, 'discovery_search'::text, 'creator_profile_open'::text, 'creator_follow'::text, 'live_session_open'::text, 'schedule_reminder'::text, 'handoff_intent'::text, 'handoff_return'::text, 'notification_response'::text])))
);


--
-- Name: TABLE product_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.product_events IS 'Authenticated LC-owned discovery, follow, live, handoff and return events. Metrics remain hypotheses until validated with agreed partner attribution.';


--
-- Name: COLUMN product_events.attribution_confidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_events.attribution_confidence IS 'direct, contextual or unattributed classification; not proof of commercial causality.';


--
-- Name: COLUMN product_events.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_events.metadata IS 'Small non-sensitive event context only. Never store gameplay, funds, KYC/AML, wagering or settlement data.';


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'open'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reports_reason_check CHECK ((reason = ANY (ARRAY['spam'::text, 'abuse'::text, 'illegal_content'::text, 'other'::text]))),
    CONSTRAINT reports_status_check CHECK ((status = ANY (ARRAY['open'::text, 'reviewing'::text, 'actioned'::text, 'dismissed'::text]))),
    CONSTRAINT reports_target_type_check CHECK ((target_type = ANY (ARRAY['post'::text, 'comment'::text, 'profile'::text])))
);


--
-- Name: return_signal_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_signal_preferences (
    user_id uuid NOT NULL,
    creator_live_enabled boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: return_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    session_id uuid NOT NULL,
    signal_type text DEFAULT 'creator_live'::text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT return_signals_not_self CHECK ((recipient_id <> creator_id)),
    CONSTRAINT return_signals_type_check CHECK ((signal_type = 'creator_live'::text))
);


--
-- Name: TABLE return_signals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.return_signals IS 'In-app Creator Live signals for measurable follow-to-return journeys; no gameplay, funds, KYC/AML, wagering or settlement data.';


--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_blocks (
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_blocks_no_self_block CHECK ((blocker_id <> blocked_id))
);


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    user_id uuid NOT NULL,
    interface_language text DEFAULT 'en'::text NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL,
    marketing_emails_enabled boolean DEFAULT false NOT NULL,
    profile_visibility text DEFAULT 'public'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    public boolean DEFAULT false NOT NULL,
    file_size_limit bigint,
    allowed_mime_types text[]
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id bigint NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL,
    owner_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: objects_id_seq; Type: SEQUENCE; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME storage.objects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: account_data_export_requests account_data_export_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_data_export_requests
    ADD CONSTRAINT account_data_export_requests_pkey PRIMARY KEY (id);


--
-- Name: account_deletion_requests account_deletion_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_deletion_requests
    ADD CONSTRAINT account_deletion_requests_pkey PRIMARY KEY (id);


--
-- Name: account_personas account_personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_personas
    ADD CONSTRAINT account_personas_pkey PRIMARY KEY (id);


--
-- Name: activity_events activity_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: creator_profiles creator_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_profiles
    ADD CONSTRAINT creator_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: creator_return_preferences creator_return_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_return_preferences
    ADD CONSTRAINT creator_return_preferences_pkey PRIMARY KEY (user_id, creator_id);


--
-- Name: creator_sessions creator_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_sessions
    ADD CONSTRAINT creator_sessions_pkey PRIMARY KEY (id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- Name: industry_creator_mappings industry_creator_mappings_organization_id_creator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_mappings
    ADD CONSTRAINT industry_creator_mappings_organization_id_creator_id_key UNIQUE (organization_id, creator_id);


--
-- Name: industry_creator_mappings industry_creator_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_mappings
    ADD CONSTRAINT industry_creator_mappings_pkey PRIMARY KEY (id);


--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_session_handoffs
    ADD CONSTRAINT industry_creator_session_handoffs_pkey PRIMARY KEY (session_id);


--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mapping_audit
    ADD CONSTRAINT industry_creator_table_mapping_audit_pkey PRIMARY KEY (id);


--
-- Name: industry_creator_table_mappings industry_creator_table_mapping_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mapping_unique UNIQUE (organization_id, creator_id, external_table_ref);


--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mappings_pkey PRIMARY KEY (id);


--
-- Name: industry_handoff_destinations industry_handoff_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_handoff_destinations
    ADD CONSTRAINT industry_handoff_destinations_pkey PRIMARY KEY (id);


--
-- Name: industry_integration_health industry_integration_health_organization_id_component_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_integration_health
    ADD CONSTRAINT industry_integration_health_organization_id_component_key UNIQUE (organization_id, component);


--
-- Name: industry_integration_health industry_integration_health_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_integration_health
    ADD CONSTRAINT industry_integration_health_pkey PRIMARY KEY (id);


--
-- Name: industry_organization_invitations industry_organization_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_invitations
    ADD CONSTRAINT industry_organization_invitations_pkey PRIMARY KEY (id);


--
-- Name: industry_organization_invitations industry_organization_invitations_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_invitations
    ADD CONSTRAINT industry_organization_invitations_token_hash_key UNIQUE (token_hash);


--
-- Name: industry_organization_members industry_organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_members
    ADD CONSTRAINT industry_organization_members_pkey PRIMARY KEY (organization_id, user_id);


--
-- Name: industry_organizations industry_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organizations
    ADD CONSTRAINT industry_organizations_pkey PRIMARY KEY (id);


--
-- Name: industry_profiles industry_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_profiles
    ADD CONSTRAINT industry_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: industry_support_cases industry_support_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_support_cases
    ADD CONSTRAINT industry_support_cases_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partnership_access_requests partnership_access_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_access_requests
    ADD CONSTRAINT partnership_access_requests_pkey PRIMARY KEY (id);


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_owner_subtype_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pilot_measurement_briefs
    ADD CONSTRAINT pilot_measurement_briefs_owner_subtype_unique UNIQUE (user_id, industry_subtype);


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pilot_measurement_briefs
    ADD CONSTRAINT pilot_measurement_briefs_pkey PRIMARY KEY (id);


--
-- Name: player_preferences player_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_preferences
    ADD CONSTRAINT player_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: player_session_reminders player_session_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_session_reminders
    ADD CONSTRAINT player_session_reminders_pkey PRIMARY KEY (user_id, session_id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (post_id, user_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: product_events product_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_events
    ADD CONSTRAINT product_events_pkey PRIMARY KEY (id);


--
-- Name: product_events product_events_user_event_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_events
    ADD CONSTRAINT product_events_user_event_key_unique UNIQUE (user_id, event_key);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reports reports_unique_per_target; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_unique_per_target UNIQUE (reporter_id, target_type, target_id);


--
-- Name: return_signal_preferences return_signal_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signal_preferences
    ADD CONSTRAINT return_signal_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: return_signals return_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signals
    ADD CONSTRAINT return_signals_pkey PRIMARY KEY (id);


--
-- Name: return_signals return_signals_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signals
    ADD CONSTRAINT return_signals_unique UNIQUE (recipient_id, session_id, signal_type);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (blocker_id, blocked_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);


--
-- Name: buckets buckets_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_name_key UNIQUE (name);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: account_data_export_requests_one_open; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_data_export_requests_one_open ON public.account_data_export_requests USING btree (user_id) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: account_data_export_requests_requested_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX account_data_export_requests_requested_idx ON public.account_data_export_requests USING btree (requested_at DESC);


--
-- Name: account_deletion_requests_one_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_deletion_requests_one_pending ON public.account_deletion_requests USING btree (user_id) WHERE (status = 'pending'::text);


--
-- Name: account_deletion_requests_requested_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX account_deletion_requests_requested_idx ON public.account_deletion_requests USING btree (requested_at DESC);


--
-- Name: account_personas_one_current_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_personas_one_current_idx ON public.account_personas USING btree (user_id) WHERE is_current;


--
-- Name: account_personas_unique_industry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_personas_unique_industry_idx ON public.account_personas USING btree (user_id, industry_subtype) WHERE (persona = 'industry'::text);


--
-- Name: account_personas_unique_non_industry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX account_personas_unique_non_industry_idx ON public.account_personas USING btree (user_id, persona) WHERE (persona <> 'industry'::text);


--
-- Name: account_personas_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX account_personas_user_idx ON public.account_personas USING btree (user_id, created_at DESC);


--
-- Name: activity_events_actor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_events_actor_id_idx ON public.activity_events USING btree (actor_id, created_at DESC);


--
-- Name: activity_events_recipient_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_events_recipient_id_idx ON public.activity_events USING btree (recipient_id, created_at DESC);


--
-- Name: comments_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_author_id_idx ON public.comments USING btree (author_id);


--
-- Name: comments_parent_comment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_parent_comment_id_idx ON public.comments USING btree (parent_comment_id);


--
-- Name: comments_post_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_post_id_created_at_idx ON public.comments USING btree (post_id, created_at);


--
-- Name: creator_profiles_profile_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX creator_profiles_profile_status_idx ON public.creator_profiles USING btree (profile_status, updated_at DESC);


--
-- Name: creator_return_preferences_creator_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX creator_return_preferences_creator_idx ON public.creator_return_preferences USING btree (creator_id) WHERE ((live_alerts IS TRUE) OR (schedule_alerts IS TRUE));


--
-- Name: creator_sessions_creator_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX creator_sessions_creator_idx ON public.creator_sessions USING btree (creator_id, starts_at DESC);


--
-- Name: creator_sessions_public_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX creator_sessions_public_idx ON public.creator_sessions USING btree (visibility, status, starts_at);


--
-- Name: follows_following_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX follows_following_id_idx ON public.follows USING btree (following_id);


--
-- Name: industry_creator_mappings_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_mappings_org_idx ON public.industry_creator_mappings USING btree (organization_id, status);


--
-- Name: industry_creator_session_handoffs_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_session_handoffs_org_idx ON public.industry_creator_session_handoffs USING btree (organization_id, updated_at DESC);


--
-- Name: industry_creator_table_mapping_audit_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_table_mapping_audit_org_idx ON public.industry_creator_table_mapping_audit USING btree (organization_id, created_at DESC);


--
-- Name: industry_creator_table_mappings_creator_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_table_mappings_creator_idx ON public.industry_creator_table_mappings USING btree (creator_id, status);


--
-- Name: industry_creator_table_mappings_handoff_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_table_mappings_handoff_idx ON public.industry_creator_table_mappings USING btree (handoff_destination_id) WHERE ((status = 'active'::text) AND (handoff_destination_id IS NOT NULL));


--
-- Name: industry_creator_table_mappings_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_creator_table_mappings_org_idx ON public.industry_creator_table_mappings USING btree (organization_id, status, updated_at DESC);


--
-- Name: industry_handoff_destinations_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_handoff_destinations_org_idx ON public.industry_handoff_destinations USING btree (organization_id, status);


--
-- Name: industry_integration_health_org_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_integration_health_org_idx ON public.industry_integration_health USING btree (organization_id, status, checked_at DESC);


--
-- Name: industry_org_invites_org_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_org_invites_org_status_idx ON public.industry_organization_invitations USING btree (organization_id, status, created_at DESC);


--
-- Name: industry_org_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_org_members_user_idx ON public.industry_organization_members USING btree (user_id, status);


--
-- Name: industry_support_cases_org_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX industry_support_cases_org_status_idx ON public.industry_support_cases USING btree (organization_id, status, updated_at DESC);


--
-- Name: notifications_recipient_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_recipient_created_idx ON public.notifications USING btree (recipient_id, created_at DESC);


--
-- Name: notifications_recipient_unread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_recipient_unread_idx ON public.notifications USING btree (recipient_id, read_at) WHERE (read_at IS NULL);


--
-- Name: partnership_access_requests_one_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX partnership_access_requests_one_open_idx ON public.partnership_access_requests USING btree (user_id, industry_subtype) WHERE (status = ANY (ARRAY['submitted'::text, 'under_review'::text, 'approved'::text]));


--
-- Name: player_session_reminders_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_session_reminders_session_idx ON public.player_session_reminders USING btree (session_id);


--
-- Name: post_likes_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX post_likes_user_id_idx ON public.post_likes USING btree (user_id);


--
-- Name: posts_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX posts_author_id_idx ON public.posts USING btree (author_id);


--
-- Name: posts_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX posts_feed_idx ON public.posts USING btree (created_at DESC, id DESC);


--
-- Name: product_events_creator_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_events_creator_created_idx ON public.product_events USING btree (creator_id, created_at DESC) WHERE (creator_id IS NOT NULL);


--
-- Name: product_events_handoff_return_once_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_events_handoff_return_once_idx ON public.product_events USING btree (user_id, journey_id, creator_id, creator_session_id) WHERE (event_name = 'handoff_return'::text);


--
-- Name: INDEX product_events_handoff_return_once_idx; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.product_events_handoff_return_once_idx IS 'Idempotency guard for attributable return evidence; duplicate client retries cannot create multiple returns for the same user journey, Creator and session.';


--
-- Name: product_events_journey_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_events_journey_created_idx ON public.product_events USING btree (journey_id, created_at);


--
-- Name: product_events_session_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_events_session_created_idx ON public.product_events USING btree (creator_session_id, created_at DESC) WHERE (creator_session_id IS NOT NULL);


--
-- Name: product_events_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_events_user_created_idx ON public.product_events USING btree (user_id, created_at DESC);


--
-- Name: profiles_account_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_account_status_idx ON public.profiles USING btree (account_status);


--
-- Name: profiles_last_seen_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_last_seen_idx ON public.profiles USING btree (last_seen_at DESC);


--
-- Name: profiles_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);


--
-- Name: reports_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_created_at_idx ON public.reports USING btree (created_at DESC);


--
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- Name: reports_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_target_idx ON public.reports USING btree (target_type, target_id);


--
-- Name: return_signals_recipient_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX return_signals_recipient_created_idx ON public.return_signals USING btree (recipient_id, created_at DESC);


--
-- Name: user_blocks_blocked_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_blocks_blocked_id_idx ON public.user_blocks USING btree (blocked_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: account_data_export_requests account_data_export_requests_protect_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER account_data_export_requests_protect_insert BEFORE INSERT ON public.account_data_export_requests FOR EACH ROW EXECUTE FUNCTION public.protect_account_data_export_request_insert();


--
-- Name: account_deletion_requests account_deletion_requests_protect_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER account_deletion_requests_protect_insert BEFORE INSERT ON public.account_deletion_requests FOR EACH ROW EXECUTE FUNCTION public.protect_account_deletion_request_insert();


--
-- Name: account_deletion_requests account_deletion_requests_protect_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER account_deletion_requests_protect_update BEFORE UPDATE ON public.account_deletion_requests FOR EACH ROW EXECUTE FUNCTION public.protect_account_deletion_request_update();


--
-- Name: account_personas account_personas_protect_identity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER account_personas_protect_identity BEFORE UPDATE ON public.account_personas FOR EACH ROW EXECUTE FUNCTION public.protect_account_persona_identity();


--
-- Name: account_personas account_personas_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER account_personas_set_updated_at BEFORE UPDATE ON public.account_personas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: comments comments_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_notify AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_comment();


--
-- Name: comments comments_protect_moderation_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_protect_moderation_fields BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.protect_comment_moderation_fields();


--
-- Name: comments comments_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: comments comments_validate_reply_depth; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_validate_reply_depth BEFORE INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.validate_comment_reply_depth();


--
-- Name: creator_profiles creator_profiles_privatize_sessions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_profiles_privatize_sessions AFTER UPDATE OF profile_status ON public.creator_profiles FOR EACH ROW WHEN ((old.profile_status IS DISTINCT FROM new.profile_status)) EXECUTE FUNCTION public.privatize_creator_sessions_on_unpublish();


--
-- Name: creator_profiles creator_profiles_protect_status_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_profiles_protect_status_fields BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.protect_creator_profile_status_fields();


--
-- Name: creator_profiles creator_profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_profiles_set_updated_at BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: creator_return_preferences creator_return_preferences_protect_write; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_return_preferences_protect_write BEFORE INSERT OR UPDATE ON public.creator_return_preferences FOR EACH ROW EXECUTE FUNCTION public.protect_creator_return_preference_write();


--
-- Name: creator_return_preferences creator_return_preferences_require_follow; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_return_preferences_require_follow BEFORE INSERT OR UPDATE ON public.creator_return_preferences FOR EACH ROW EXECUTE FUNCTION public.require_follow_for_creator_return_preference();


--
-- Name: creator_return_preferences creator_return_preferences_sync_live_signal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_return_preferences_sync_live_signal AFTER INSERT OR DELETE OR UPDATE OF live_alerts ON public.creator_return_preferences FOR EACH ROW EXECUTE FUNCTION public.sync_creator_return_live_alert_preference();


--
-- Name: creator_sessions creator_sessions_cleanup_ineligible_reminders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_cleanup_ineligible_reminders AFTER UPDATE OF status, visibility ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.cleanup_ineligible_session_reminders();


--
-- Name: creator_sessions creator_sessions_create_live_return_signals; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_create_live_return_signals AFTER INSERT OR UPDATE OF status, visibility ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.create_creator_live_return_signals();


--
-- Name: creator_sessions creator_sessions_enforce_state_machine; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_enforce_state_machine BEFORE INSERT OR UPDATE OF status, visibility, starts_at, creator_id, provenance ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.enforce_creator_session_state_machine();


--
-- Name: creator_sessions creator_sessions_protect_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_protect_fields BEFORE UPDATE ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.protect_creator_session_fields();


--
-- Name: creator_sessions creator_sessions_remove_ineligible_reminders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_remove_ineligible_reminders AFTER UPDATE OF status, visibility, starts_at ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.remove_ineligible_creator_session_reminders();


--
-- Name: creator_sessions creator_sessions_remove_ineligible_return_signals; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_remove_ineligible_return_signals AFTER UPDATE OF status, visibility ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.remove_ineligible_creator_live_return_signals();


--
-- Name: creator_sessions creator_sessions_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER creator_sessions_set_updated_at BEFORE UPDATE ON public.creator_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: follows follows_create_live_signal_catchup; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER follows_create_live_signal_catchup AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.create_live_signal_on_follow();


--
-- Name: follows follows_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER follows_notify AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();


--
-- Name: follows follows_remove_creator_return_preference; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER follows_remove_creator_return_preference AFTER DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION public.remove_creator_return_preference_on_unfollow();


--
-- Name: industry_creator_mappings industry_creator_mappings_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_creator_mappings_set_updated_at BEFORE UPDATE ON public.industry_creator_mappings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: industry_creator_table_mappings industry_creator_table_mapping_audit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_creator_table_mapping_audit_trigger AFTER INSERT OR UPDATE ON public.industry_creator_table_mappings FOR EACH ROW EXECUTE FUNCTION public.audit_industry_creator_table_mapping();


--
-- Name: industry_handoff_destinations industry_handoff_destinations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_handoff_destinations_set_updated_at BEFORE UPDATE ON public.industry_handoff_destinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: industry_integration_health industry_integration_health_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_integration_health_set_updated_at BEFORE UPDATE ON public.industry_integration_health FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: industry_profiles industry_profiles_protect_access_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_profiles_protect_access_status BEFORE UPDATE ON public.industry_profiles FOR EACH ROW EXECUTE FUNCTION public.protect_industry_profile_access_status();


--
-- Name: industry_profiles industry_profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_profiles_set_updated_at BEFORE UPDATE ON public.industry_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: industry_support_cases industry_support_cases_guard_identity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_support_cases_guard_identity BEFORE UPDATE ON public.industry_support_cases FOR EACH ROW EXECUTE FUNCTION public.guard_industry_support_case_identity();


--
-- Name: industry_support_cases industry_support_cases_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER industry_support_cases_set_updated_at BEFORE UPDATE ON public.industry_support_cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: notifications notifications_protect_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notifications_protect_fields BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();


--
-- Name: partnership_access_requests partnership_access_requests_protect_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER partnership_access_requests_protect_fields BEFORE UPDATE ON public.partnership_access_requests FOR EACH ROW EXECUTE FUNCTION public.protect_partnership_access_request_fields();


--
-- Name: partnership_access_requests partnership_access_requests_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER partnership_access_requests_set_updated_at BEFORE UPDATE ON public.partnership_access_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_protect; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pilot_measurement_briefs_protect BEFORE UPDATE ON public.pilot_measurement_briefs FOR EACH ROW EXECUTE FUNCTION public.protect_pilot_measurement_brief();


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pilot_measurement_briefs_set_updated_at BEFORE UPDATE ON public.pilot_measurement_briefs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: player_preferences player_preferences_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER player_preferences_set_updated_at BEFORE UPDATE ON public.player_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: player_session_reminders player_session_reminders_protect_write; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER player_session_reminders_protect_write BEFORE INSERT OR UPDATE ON public.player_session_reminders FOR EACH ROW EXECUTE FUNCTION public.protect_player_session_reminder_write();


--
-- Name: player_session_reminders player_session_reminders_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER player_session_reminders_set_updated_at BEFORE UPDATE ON public.player_session_reminders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: post_likes post_likes_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_likes_notify AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_post_like();


--
-- Name: posts posts_protect_moderation_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER posts_protect_moderation_fields BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.protect_post_moderation_fields();


--
-- Name: posts posts_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: product_events product_events_attribution_trust; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_attribution_trust BEFORE INSERT OR UPDATE OF attribution_confidence ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_attribution_trust();


--
-- Name: product_events product_events_context_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_context_guard BEFORE INSERT OR UPDATE OF creator_id, creator_session_id, event_name, metadata ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_context();


--
-- Name: product_events product_events_handoff_boundary; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_handoff_boundary BEFORE INSERT OR UPDATE OF event_name ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_handoff_boundary();


--
-- Name: product_events product_events_metadata_allowlist; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_metadata_allowlist BEFORE INSERT OR UPDATE OF event_name, metadata ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_metadata_allowlist();


--
-- Name: product_events product_events_rate_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_rate_limit BEFORE INSERT ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_rate_limit();


--
-- Name: product_events product_events_state_integrity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_events_state_integrity BEFORE INSERT OR UPDATE OF event_name, creator_id, creator_session_id ON public.product_events FOR EACH ROW EXECUTE FUNCTION public.enforce_product_event_state_integrity();


--
-- Name: profiles profiles_protect_system_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_protect_system_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_system_fields();


--
-- Name: TRIGGER profiles_protect_system_fields ON profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER profiles_protect_system_fields ON public.profiles IS 'DB-level guard for public.profiles privileged fields; normal own-profile editing remains controlled by RLS and constraints.';


--
-- Name: reports reports_protect_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER reports_protect_fields BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.protect_report_fields();


--
-- Name: return_signal_preferences return_signal_preferences_live_catchup; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER return_signal_preferences_live_catchup AFTER INSERT OR UPDATE OF creator_live_enabled ON public.return_signal_preferences FOR EACH ROW EXECUTE FUNCTION public.create_live_signals_on_preference_enable();


--
-- Name: return_signals return_signals_protect_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER return_signals_protect_update BEFORE UPDATE ON public.return_signals FOR EACH ROW EXECUTE FUNCTION public.protect_return_signal_update();


--
-- Name: user_blocks user_blocks_cleanup_follows; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_blocks_cleanup_follows AFTER INSERT ON public.user_blocks FOR EACH ROW EXECUTE FUNCTION public.handle_new_block();


--
-- Name: user_blocks user_blocks_cleanup_session_reminders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_blocks_cleanup_session_reminders AFTER INSERT ON public.user_blocks FOR EACH ROW EXECUTE FUNCTION public.cleanup_blocked_pair_session_reminders();


--
-- Name: user_blocks user_blocks_remove_follows; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_blocks_remove_follows AFTER INSERT ON public.user_blocks FOR EACH ROW EXECUTE FUNCTION public.remove_follows_on_user_block();


--
-- Name: account_data_export_requests account_data_export_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_data_export_requests
    ADD CONSTRAINT account_data_export_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: account_deletion_requests account_deletion_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_deletion_requests
    ADD CONSTRAINT account_deletion_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: account_personas account_personas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_personas
    ADD CONSTRAINT account_personas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: activity_events activity_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: activity_events activity_events_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: creator_profiles creator_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_profiles
    ADD CONSTRAINT creator_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: creator_return_preferences creator_return_preferences_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_return_preferences
    ADD CONSTRAINT creator_return_preferences_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: creator_return_preferences creator_return_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_return_preferences
    ADD CONSTRAINT creator_return_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: creator_sessions creator_sessions_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_sessions
    ADD CONSTRAINT creator_sessions_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: industry_creator_mappings industry_creator_mappings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_mappings
    ADD CONSTRAINT industry_creator_mappings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_creator_mappings industry_creator_mappings_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_mappings
    ADD CONSTRAINT industry_creator_mappings_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator_profiles(user_id) ON DELETE RESTRICT;


--
-- Name: industry_creator_mappings industry_creator_mappings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_mappings
    ADD CONSTRAINT industry_creator_mappings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_configured_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_session_handoffs
    ADD CONSTRAINT industry_creator_session_handoffs_configured_by_fkey FOREIGN KEY (configured_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_mapping_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_session_handoffs
    ADD CONSTRAINT industry_creator_session_handoffs_mapping_id_fkey FOREIGN KEY (mapping_id) REFERENCES public.industry_creator_table_mappings(id) ON DELETE CASCADE;


--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_session_handoffs
    ADD CONSTRAINT industry_creator_session_handoffs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_session_handoffs
    ADD CONSTRAINT industry_creator_session_handoffs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.creator_sessions(id) ON DELETE CASCADE;


--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mapping_audit
    ADD CONSTRAINT industry_creator_table_mapping_audit_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mapping_audit
    ADD CONSTRAINT industry_creator_table_mapping_audit_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_mapping_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mapping_audit
    ADD CONSTRAINT industry_creator_table_mapping_audit_mapping_id_fkey FOREIGN KEY (mapping_id) REFERENCES public.industry_creator_table_mappings(id) ON DELETE CASCADE;


--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mapping_audit
    ADD CONSTRAINT industry_creator_table_mapping_audit_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mappings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mappings_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_handoff_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mappings_handoff_destination_id_fkey FOREIGN KEY (handoff_destination_id) REFERENCES public.industry_handoff_destinations(id) ON DELETE SET NULL;


--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_creator_table_mappings
    ADD CONSTRAINT industry_creator_table_mappings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_handoff_destinations industry_handoff_destinations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_handoff_destinations
    ADD CONSTRAINT industry_handoff_destinations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_handoff_destinations industry_handoff_destinations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_handoff_destinations
    ADD CONSTRAINT industry_handoff_destinations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_integration_health industry_integration_health_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_integration_health
    ADD CONSTRAINT industry_integration_health_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_organization_invitations industry_organization_invitations_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_invitations
    ADD CONSTRAINT industry_organization_invitations_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: industry_organization_invitations industry_organization_invitations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_invitations
    ADD CONSTRAINT industry_organization_invitations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_organization_invitations industry_organization_invitations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_invitations
    ADD CONSTRAINT industry_organization_invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_organization_members industry_organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_members
    ADD CONSTRAINT industry_organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: industry_organization_members industry_organization_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organization_members
    ADD CONSTRAINT industry_organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: industry_organizations industry_organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_organizations
    ADD CONSTRAINT industry_organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_profiles industry_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_profiles
    ADD CONSTRAINT industry_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: industry_support_cases industry_support_cases_opened_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_support_cases
    ADD CONSTRAINT industry_support_cases_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: industry_support_cases industry_support_cases_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_support_cases
    ADD CONSTRAINT industry_support_cases_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.industry_organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.activity_events(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: partnership_access_requests partnership_access_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_access_requests
    ADD CONSTRAINT partnership_access_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pilot_measurement_briefs
    ADD CONSTRAINT pilot_measurement_briefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: player_preferences player_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_preferences
    ADD CONSTRAINT player_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: player_session_reminders player_session_reminders_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_session_reminders
    ADD CONSTRAINT player_session_reminders_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.creator_sessions(id) ON DELETE CASCADE;


--
-- Name: player_session_reminders player_session_reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_session_reminders
    ADD CONSTRAINT player_session_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: product_events product_events_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_events
    ADD CONSTRAINT product_events_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: product_events product_events_creator_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_events
    ADD CONSTRAINT product_events_creator_session_id_fkey FOREIGN KEY (creator_session_id) REFERENCES public.creator_sessions(id) ON DELETE SET NULL;


--
-- Name: product_events product_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_events
    ADD CONSTRAINT product_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: reports reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: return_signal_preferences return_signal_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signal_preferences
    ADD CONSTRAINT return_signal_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: return_signals return_signals_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signals
    ADD CONSTRAINT return_signals_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: return_signals return_signals_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signals
    ADD CONSTRAINT return_signals_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: return_signals return_signals_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_signals
    ADD CONSTRAINT return_signals_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.creator_sessions(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE CASCADE;


--
-- Name: account_data_export_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_data_export_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: account_data_export_requests account_data_export_requests_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_data_export_requests_insert_own ON public.account_data_export_requests FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (status = 'pending'::text) AND (completed_at IS NULL) AND (expires_at IS NULL)));


--
-- Name: account_data_export_requests account_data_export_requests_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_data_export_requests_select_own ON public.account_data_export_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: account_deletion_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: account_deletion_requests account_deletion_requests_cancel_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_deletion_requests_cancel_own ON public.account_deletion_requests FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND (status = 'pending'::text))) WITH CHECK (((auth.uid() = user_id) AND (status = 'cancelled'::text) AND (cancelled_at IS NOT NULL)));


--
-- Name: account_deletion_requests account_deletion_requests_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_deletion_requests_insert_own ON public.account_deletion_requests FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (status = 'pending'::text) AND (cancelled_at IS NULL) AND (completed_at IS NULL)));


--
-- Name: account_deletion_requests account_deletion_requests_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_deletion_requests_select_own ON public.account_deletion_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: account_personas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_personas ENABLE ROW LEVEL SECURITY;

--
-- Name: account_personas account_personas_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_personas_insert_own ON public.account_personas FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: account_personas account_personas_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_personas_select_own ON public.account_personas FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: account_personas account_personas_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY account_personas_update_own ON public.account_personas FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: activity_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: comments comments_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_insert_own ON public.comments FOR INSERT TO authenticated WITH CHECK (((auth.uid() = author_id) AND public.is_active_profile(author_id) AND (status = 'active'::text) AND (deleted_at IS NULL) AND (EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = comments.post_id) AND (p.status = 'active'::text) AND (p.deleted_at IS NULL) AND (NOT public.is_blocked_pair(auth.uid(), p.author_id)))))));


--
-- Name: comments comments_select_moderator; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_select_moderator ON public.comments FOR SELECT TO authenticated USING (public.is_moderator());


--
-- Name: comments comments_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_select_own ON public.comments FOR SELECT TO authenticated USING ((auth.uid() = author_id));


--
-- Name: comments comments_select_visible; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_select_visible ON public.comments FOR SELECT TO authenticated USING (((status = 'active'::text) AND (deleted_at IS NULL) AND (NOT public.is_blocked_pair(auth.uid(), author_id)) AND (EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = comments.post_id) AND (p.status = 'active'::text) AND (p.deleted_at IS NULL) AND public.is_active_profile(p.author_id) AND (NOT public.is_blocked_pair(auth.uid(), p.author_id)))))));


--
-- Name: comments comments_update_moderation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_update_moderation ON public.comments FOR UPDATE TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());


--
-- Name: comments comments_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY comments_update_own ON public.comments FOR UPDATE TO authenticated USING (((auth.uid() = author_id) AND public.is_active_profile(author_id))) WITH CHECK (((auth.uid() = author_id) AND public.is_active_profile(author_id)));


--
-- Name: creator_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: creator_profiles creator_profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_profiles_insert_own ON public.creator_profiles FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (profile_status <> 'published'::text) AND (verification_status = ANY (ARRAY['not_requested'::text, 'submitted'::text])) AND (affiliation_verification_status = ANY (ARRAY['unverified'::text, 'submitted'::text]))));


--
-- Name: creator_profiles creator_profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_profiles_select_own ON public.creator_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: creator_profiles creator_profiles_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_profiles_select_public ON public.creator_profiles FOR SELECT TO anon, authenticated USING (((profile_status = 'published'::text) AND public.is_approved_creator(user_id)));


--
-- Name: creator_profiles creator_profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_profiles_update_own ON public.creator_profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK (((auth.uid() = user_id) AND ((profile_status <> 'published'::text) OR public.can_publish_creator_profile(user_id))));


--
-- Name: creator_return_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creator_return_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: creator_return_preferences creator_return_preferences_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_return_preferences_delete_own ON public.creator_return_preferences FOR DELETE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(auth.uid())));


--
-- Name: creator_return_preferences creator_return_preferences_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_return_preferences_insert_own ON public.creator_return_preferences FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(auth.uid()) AND public.is_approved_creator(creator_id)));


--
-- Name: creator_return_preferences creator_return_preferences_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_return_preferences_select_own ON public.creator_return_preferences FOR SELECT TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(auth.uid())));


--
-- Name: creator_return_preferences creator_return_preferences_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_return_preferences_update_own ON public.creator_return_preferences FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(auth.uid()))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(auth.uid()) AND public.is_approved_creator(creator_id)));


--
-- Name: creator_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creator_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: creator_sessions creator_sessions_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_sessions_delete_own ON public.creator_sessions FOR DELETE TO authenticated USING (((auth.uid() = creator_id) AND public.is_active_profile(creator_id) AND (provenance = 'user_generated'::text)));


--
-- Name: creator_sessions creator_sessions_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_sessions_insert_own ON public.creator_sessions FOR INSERT TO authenticated WITH CHECK (((provenance = 'user_generated'::text) AND public.can_manage_user_generated_creator_session(creator_id, visibility)));


--
-- Name: creator_sessions creator_sessions_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_sessions_select_own ON public.creator_sessions FOR SELECT TO authenticated USING ((auth.uid() = creator_id));


--
-- Name: creator_sessions creator_sessions_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_sessions_select_public ON public.creator_sessions FOR SELECT TO anon, authenticated USING (((visibility = 'public'::text) AND (status = ANY (ARRAY['scheduled'::text, 'live'::text])) AND public.is_approved_creator(creator_id)));


--
-- Name: creator_sessions creator_sessions_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_sessions_update_own ON public.creator_sessions FOR UPDATE TO authenticated USING (((auth.uid() = creator_id) AND (provenance = 'user_generated'::text))) WITH CHECK (((provenance = 'user_generated'::text) AND public.can_manage_user_generated_creator_session(creator_id, visibility)));


--
-- Name: follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

--
-- Name: follows follows_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY follows_delete_own ON public.follows FOR DELETE TO authenticated USING (((auth.uid() = follower_id) AND public.is_active_profile(follower_id)));


--
-- Name: follows follows_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY follows_insert_own ON public.follows FOR INSERT TO authenticated WITH CHECK (((auth.uid() = follower_id) AND (follower_id <> following_id) AND live_alerts_enabled AND public.is_active_profile(follower_id) AND public.is_active_profile(following_id) AND public.is_approved_creator(following_id) AND (NOT public.is_blocked_pair(follower_id, following_id))));


--
-- Name: follows follows_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY follows_select_all ON public.follows FOR SELECT TO authenticated USING (true);


--
-- Name: industry_creator_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_creator_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_creator_mappings industry_creator_mappings_manager_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_mappings_manager_insert ON public.industry_creator_mappings FOR INSERT TO authenticated WITH CHECK ((public.is_industry_org_manager(organization_id) AND (created_by = auth.uid()) AND (status = 'pending'::text)));


--
-- Name: industry_creator_mappings industry_creator_mappings_manager_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_mappings_manager_update ON public.industry_creator_mappings FOR UPDATE TO authenticated USING (public.is_industry_org_manager(organization_id)) WITH CHECK ((public.is_industry_org_manager(organization_id) AND (status = ANY (ARRAY['pending'::text, 'removed'::text]))));


--
-- Name: industry_creator_mappings industry_creator_mappings_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_mappings_member_select ON public.industry_creator_mappings FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_creator_session_handoffs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_creator_session_handoffs ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_creator_session_handoffs industry_creator_session_handoffs_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_session_handoffs_member_select ON public.industry_creator_session_handoffs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM ((public.industry_organization_members member
     JOIN public.industry_organizations org ON ((org.id = member.organization_id)))
     JOIN public.profiles profile ON ((profile.id = member.user_id)))
  WHERE ((member.organization_id = industry_creator_session_handoffs.organization_id) AND (member.user_id = auth.uid()) AND (member.status = 'active'::text) AND (org.status = 'active'::text) AND (profile.account_status = 'active'::text)))));


--
-- Name: industry_creator_table_mapping_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_creator_table_mapping_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_creator_table_mapping_audit industry_creator_table_mapping_audit_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_table_mapping_audit_member_select ON public.industry_creator_table_mapping_audit FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_creator_table_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_creator_table_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_creator_table_mappings industry_creator_table_mappings_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_creator_table_mappings_member_select ON public.industry_creator_table_mappings FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_handoff_destinations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_handoff_destinations ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_handoff_destinations industry_handoff_destinations_manager_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_handoff_destinations_manager_insert ON public.industry_handoff_destinations FOR INSERT TO authenticated WITH CHECK ((public.is_industry_org_manager(organization_id) AND (created_by = auth.uid()) AND (status = 'draft'::text) AND (approved_at IS NULL)));


--
-- Name: industry_handoff_destinations industry_handoff_destinations_manager_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_handoff_destinations_manager_update ON public.industry_handoff_destinations FOR UPDATE TO authenticated USING (public.is_industry_org_manager(organization_id)) WITH CHECK ((public.is_industry_org_manager(organization_id) AND (status = ANY (ARRAY['draft'::text, 'retired'::text])) AND (approved_at IS NULL)));


--
-- Name: industry_handoff_destinations industry_handoff_destinations_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_handoff_destinations_member_select ON public.industry_handoff_destinations FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_integration_health; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_integration_health ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_integration_health industry_integration_health_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_integration_health_member_select ON public.industry_integration_health FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_organization_invitations industry_org_invitations_manager_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_org_invitations_manager_select ON public.industry_organization_invitations FOR SELECT TO authenticated USING (public.is_industry_org_manager(organization_id));


--
-- Name: industry_organization_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_organization_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_organization_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_organization_members ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_organization_members industry_organization_members_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_organization_members_member_select ON public.industry_organization_members FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: industry_organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_organizations industry_organizations_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_organizations_member_select ON public.industry_organizations FOR SELECT TO authenticated USING (public.is_industry_org_member(id));


--
-- Name: industry_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_profiles industry_profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_profiles_insert_own ON public.industry_profiles FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id) AND (access_status = 'not_requested'::text)));


--
-- Name: industry_profiles industry_profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_profiles_select_own ON public.industry_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: industry_profiles industry_profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_profiles_update_own ON public.industry_profiles FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: industry_support_cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.industry_support_cases ENABLE ROW LEVEL SECURITY;

--
-- Name: industry_support_cases industry_support_cases_manager_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_support_cases_manager_update ON public.industry_support_cases FOR UPDATE TO authenticated USING (public.is_industry_org_manager(organization_id)) WITH CHECK (public.is_industry_org_manager(organization_id));


--
-- Name: industry_support_cases industry_support_cases_member_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_support_cases_member_insert ON public.industry_support_cases FOR INSERT TO authenticated WITH CHECK ((public.is_industry_org_member(organization_id) AND (opened_by = auth.uid()) AND (status = 'open'::text) AND (closed_at IS NULL)));


--
-- Name: industry_support_cases industry_support_cases_member_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY industry_support_cases_member_select ON public.industry_support_cases FOR SELECT TO authenticated USING (public.is_industry_org_member(organization_id));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = recipient_id));


--
-- Name: notifications notifications_update_own_read_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update_own_read_state ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = recipient_id)) WITH CHECK ((auth.uid() = recipient_id));


--
-- Name: partnership_access_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partnership_access_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: partnership_access_requests partnership_access_requests_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_access_requests_insert_own ON public.partnership_access_requests FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id) AND (status = 'submitted'::text)));


--
-- Name: partnership_access_requests partnership_access_requests_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_access_requests_select_own ON public.partnership_access_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: partnership_access_requests partnership_access_requests_update_own_note; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_access_requests_update_own_note ON public.partnership_access_requests FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: pilot_measurement_briefs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pilot_measurement_briefs ENABLE ROW LEVEL SECURITY;

--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_insert_own_draft; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pilot_measurement_briefs_insert_own_draft ON public.pilot_measurement_briefs FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (status = 'draft'::text)));


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pilot_measurement_briefs_select_own ON public.pilot_measurement_briefs FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: pilot_measurement_briefs pilot_measurement_briefs_update_own_draft; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pilot_measurement_briefs_update_own_draft ON public.pilot_measurement_briefs FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND (status = 'draft'::text))) WITH CHECK (((auth.uid() = user_id) AND (status = ANY (ARRAY['draft'::text, 'submitted'::text]))));


--
-- Name: player_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.player_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: player_preferences player_preferences_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_preferences_insert_own ON public.player_preferences FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: player_preferences player_preferences_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_preferences_select_own ON public.player_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: player_preferences player_preferences_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_preferences_update_own ON public.player_preferences FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: player_session_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.player_session_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: player_session_reminders player_session_reminders_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_session_reminders_delete_own ON public.player_session_reminders FOR DELETE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: player_session_reminders player_session_reminders_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_session_reminders_insert_own ON public.player_session_reminders FOR INSERT TO authenticated WITH CHECK (((status = 'active'::text) AND public.can_set_creator_session_reminder(user_id, session_id)));


--
-- Name: player_session_reminders player_session_reminders_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_session_reminders_select_own ON public.player_session_reminders FOR SELECT TO authenticated USING (public.can_set_creator_session_reminder(user_id, session_id));


--
-- Name: player_session_reminders player_session_reminders_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY player_session_reminders_update_own ON public.player_session_reminders FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((status = 'active'::text) AND public.can_set_creator_session_reminder(user_id, session_id)));


--
-- Name: post_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: post_likes post_likes_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY post_likes_delete_own ON public.post_likes FOR DELETE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: post_likes post_likes_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY post_likes_insert_own ON public.post_likes FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id) AND (EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = post_likes.post_id) AND (p.status = 'active'::text) AND (p.deleted_at IS NULL) AND (NOT public.is_blocked_pair(auth.uid(), p.author_id)))))));


--
-- Name: post_likes post_likes_select_visible; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY post_likes_select_visible ON public.post_likes FOR SELECT TO authenticated USING (((NOT public.is_blocked_pair(auth.uid(), user_id)) AND (EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = post_likes.post_id) AND (p.status = 'active'::text) AND (p.deleted_at IS NULL) AND public.is_active_profile(p.author_id) AND (NOT public.is_blocked_pair(auth.uid(), p.author_id)))))));


--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: posts posts_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_insert_own ON public.posts FOR INSERT TO authenticated WITH CHECK (((auth.uid() = author_id) AND public.is_active_profile(author_id) AND (status = 'active'::text) AND (deleted_at IS NULL) AND ((NOT (EXISTS ( SELECT 1
   FROM public.creator_profiles cp
  WHERE (cp.user_id = posts.author_id)))) OR public.is_approved_creator(author_id))));


--
-- Name: posts posts_select_moderator; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_select_moderator ON public.posts FOR SELECT TO authenticated USING (public.is_moderator());


--
-- Name: posts posts_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_select_own ON public.posts FOR SELECT TO authenticated USING ((auth.uid() = author_id));


--
-- Name: posts posts_select_visible; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_select_visible ON public.posts FOR SELECT TO authenticated USING (((status = 'active'::text) AND (deleted_at IS NULL) AND (NOT public.is_blocked_pair(auth.uid(), author_id)) AND public.is_active_profile(author_id)));


--
-- Name: posts posts_update_moderation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_update_moderation ON public.posts FOR UPDATE TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());


--
-- Name: posts posts_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY posts_update_own ON public.posts FOR UPDATE TO authenticated USING (((auth.uid() = author_id) AND public.is_active_profile(author_id))) WITH CHECK (((auth.uid() = author_id) AND public.is_active_profile(author_id)));


--
-- Name: product_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

--
-- Name: product_events product_events_insert_own_active; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_events_insert_own_active ON public.product_events FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id) AND ((created_at >= (now() - '00:01:00'::interval)) AND (created_at <= (now() + '00:01:00'::interval)))));


--
-- Name: product_events product_events_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_events_select_own ON public.product_events FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_select_active; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_active ON public.profiles FOR SELECT TO authenticated USING ((account_status = 'active'::text));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (((auth.uid() = id) AND (account_status = 'active'::text))) WITH CHECK (((auth.uid() = id) AND (account_status = 'active'::text)));


--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: reports reports_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_insert_own ON public.reports FOR INSERT TO authenticated WITH CHECK (((auth.uid() = reporter_id) AND public.is_active_profile(reporter_id)));


--
-- Name: reports reports_select_moderation_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_select_moderation_queue ON public.reports FOR SELECT TO authenticated USING (public.is_moderator());


--
-- Name: reports reports_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_select_own ON public.reports FOR SELECT TO authenticated USING ((auth.uid() = reporter_id));


--
-- Name: reports reports_update_moderation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_update_moderation ON public.reports FOR UPDATE TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());


--
-- Name: return_signal_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.return_signal_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: return_signal_preferences return_signal_preferences_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY return_signal_preferences_insert_own ON public.return_signal_preferences FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: return_signal_preferences return_signal_preferences_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY return_signal_preferences_select_own ON public.return_signal_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: return_signal_preferences return_signal_preferences_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY return_signal_preferences_update_own ON public.return_signal_preferences FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: return_signals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.return_signals ENABLE ROW LEVEL SECURITY;

--
-- Name: return_signals return_signals_mark_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY return_signals_mark_read_own ON public.return_signals FOR UPDATE TO authenticated USING (((auth.uid() = recipient_id) AND public.is_active_profile(recipient_id))) WITH CHECK (((auth.uid() = recipient_id) AND public.is_active_profile(recipient_id)));


--
-- Name: return_signals return_signals_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY return_signals_select_own ON public.return_signals FOR SELECT TO authenticated USING ((auth.uid() = recipient_id));


--
-- Name: user_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_blocks user_blocks_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_blocks_delete_own ON public.user_blocks FOR DELETE TO authenticated USING (((auth.uid() = blocker_id) AND public.is_active_profile(blocker_id)));


--
-- Name: user_blocks user_blocks_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_blocks_insert_own ON public.user_blocks FOR INSERT TO authenticated WITH CHECK (((auth.uid() = blocker_id) AND public.is_active_profile(blocker_id)));


--
-- Name: user_blocks user_blocks_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_blocks_select_own ON public.user_blocks FOR SELECT TO authenticated USING ((auth.uid() = blocker_id));


--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings user_settings_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_settings_insert_own ON public.user_settings FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: user_settings user_settings_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_settings_select_own ON public.user_settings FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_settings user_settings_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_settings_update_own ON public.user_settings FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.is_active_profile(user_id))) WITH CHECK (((auth.uid() = user_id) AND public.is_active_profile(user_id)));


--
-- Name: objects avatar_owner_delete; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatar_owner_delete ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text) AND public.is_active_profile(auth.uid())));


--
-- Name: objects avatar_owner_insert; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatar_owner_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text) AND public.is_active_profile(auth.uid())));


--
-- Name: objects avatar_owner_update; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatar_owner_update ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text) AND public.is_active_profile(auth.uid()))) WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text) AND public.is_active_profile(auth.uid())));


--
-- Name: objects avatar_public_read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatar_public_read ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;


--
-- Name: FUNCTION citextin(cstring); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextin(cstring) TO anon;
GRANT ALL ON FUNCTION public.citextin(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.citextin(cstring) TO service_role;


--
-- Name: FUNCTION citextout(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextout(public.citext) TO anon;
GRANT ALL ON FUNCTION public.citextout(public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citextout(public.citext) TO service_role;


--
-- Name: FUNCTION citextrecv(internal); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextrecv(internal) TO anon;
GRANT ALL ON FUNCTION public.citextrecv(internal) TO authenticated;
GRANT ALL ON FUNCTION public.citextrecv(internal) TO service_role;


--
-- Name: FUNCTION citextsend(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextsend(public.citext) TO anon;
GRANT ALL ON FUNCTION public.citextsend(public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citextsend(public.citext) TO service_role;


--
-- Name: FUNCTION citext(boolean); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(boolean) TO anon;
GRANT ALL ON FUNCTION public.citext(boolean) TO authenticated;
GRANT ALL ON FUNCTION public.citext(boolean) TO service_role;


--
-- Name: FUNCTION citext(character); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(character) TO anon;
GRANT ALL ON FUNCTION public.citext(character) TO authenticated;
GRANT ALL ON FUNCTION public.citext(character) TO service_role;


--
-- Name: FUNCTION citext(inet); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(inet) TO anon;
GRANT ALL ON FUNCTION public.citext(inet) TO authenticated;
GRANT ALL ON FUNCTION public.citext(inet) TO service_role;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.role() TO anon;
GRANT ALL ON FUNCTION auth.role() TO authenticated;
GRANT ALL ON FUNCTION auth.role() TO service_role;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.uid() TO anon;
GRANT ALL ON FUNCTION auth.uid() TO authenticated;
GRANT ALL ON FUNCTION auth.uid() TO service_role;


--
-- Name: FUNCTION accept_industry_org_invitation(raw_token text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.accept_industry_org_invitation(raw_token text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.accept_industry_org_invitation(raw_token text) TO authenticated;
GRANT ALL ON FUNCTION public.accept_industry_org_invitation(raw_token text) TO service_role;


--
-- Name: TABLE creator_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_profiles TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_profiles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_profiles TO service_role;


--
-- Name: FUNCTION admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_set_creator_verification(p_user_id uuid, p_verification_status text, p_affiliation_verification_status text) TO service_role;


--
-- Name: FUNCTION texticregexeq(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.texticregexeq(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.texticregexeq(public.citext, public.citext) TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.profiles TO service_role;


--
-- Name: COLUMN profiles.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.username; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(username),UPDATE(username) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.display_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(display_name),UPDATE(display_name) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.avatar_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(avatar_url),UPDATE(avatar_url) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.bio; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(bio),UPDATE(bio) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.country; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(country),UPDATE(country) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.languages; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(languages),UPDATE(languages) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.onboarding_completed; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(onboarding_completed) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.terms_accepted_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(terms_accepted_at) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.privacy_accepted_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(privacy_accepted_at) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.age_confirmed; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(age_confirmed) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.role; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(role) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.last_seen_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(last_seen_at),UPDATE(last_seen_at) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.profiles TO authenticated;


--
-- Name: COLUMN profiles.updated_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(updated_at) ON TABLE public.profiles TO authenticated;


--
-- Name: FUNCTION admin_set_profile_account_status(p_user_id uuid, p_account_status text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_set_profile_account_status(p_user_id uuid, p_account_status text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_set_profile_account_status(p_user_id uuid, p_account_status text) TO service_role;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.armor(bytea) TO anon;
GRANT ALL ON FUNCTION public.armor(bytea) TO authenticated;
GRANT ALL ON FUNCTION public.armor(bytea) TO service_role;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO anon;
GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO authenticated;
GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO service_role;


--
-- Name: FUNCTION assign_industry_creator_table_handoff(mapping_id uuid, destination_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assign_industry_creator_table_handoff(mapping_id uuid, destination_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.assign_industry_creator_table_handoff(mapping_id uuid, destination_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.assign_industry_creator_table_handoff(mapping_id uuid, destination_id uuid) TO service_role;


--
-- Name: FUNCTION audit_industry_creator_table_mapping(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.audit_industry_creator_table_mapping() FROM PUBLIC;
GRANT ALL ON FUNCTION public.audit_industry_creator_table_mapping() TO service_role;


--
-- Name: FUNCTION can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) TO anon;
GRANT ALL ON FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) TO authenticated;
GRANT ALL ON FUNCTION public.can_manage_user_generated_creator_session(target_creator_id uuid, target_visibility text) TO service_role;


--
-- Name: FUNCTION can_publish_creator_profile(target_user_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.can_publish_creator_profile(target_user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.can_publish_creator_profile(target_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_publish_creator_profile(target_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_publish_creator_profile(target_user_id uuid) TO service_role;


--
-- Name: FUNCTION can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.can_set_creator_session_reminder(target_user_id uuid, target_session_id uuid) TO authenticated;


--
-- Name: FUNCTION citext_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_cmp(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_cmp(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_cmp(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_eq(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_eq(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_eq(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_eq(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_ge(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_ge(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_ge(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_gt(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_gt(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_gt(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_hash(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_hash(public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_hash(public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_hash(public.citext) TO service_role;


--
-- Name: FUNCTION citext_hash_extended(public.citext, bigint); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_hash_extended(public.citext, bigint) TO anon;
GRANT ALL ON FUNCTION public.citext_hash_extended(public.citext, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.citext_hash_extended(public.citext, bigint) TO service_role;


--
-- Name: FUNCTION citext_larger(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_larger(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_larger(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_larger(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_le(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_le(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_le(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_lt(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_lt(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_lt(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_ne(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_ne(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_ne(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_ne(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_pattern_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_cmp(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_pattern_cmp(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_pattern_cmp(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_pattern_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_ge(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_pattern_ge(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_pattern_ge(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_pattern_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_gt(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_pattern_gt(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_pattern_gt(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_pattern_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_le(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_pattern_le(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_pattern_le(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_pattern_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_lt(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_pattern_lt(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_pattern_lt(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION citext_smaller(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_smaller(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.citext_smaller(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.citext_smaller(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION cleanup_blocked_pair_session_reminders(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.cleanup_blocked_pair_session_reminders() FROM PUBLIC;
GRANT ALL ON FUNCTION public.cleanup_blocked_pair_session_reminders() TO service_role;


--
-- Name: FUNCTION cleanup_ineligible_session_reminders(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.cleanup_ineligible_session_reminders() FROM PUBLIC;
GRANT ALL ON FUNCTION public.cleanup_ineligible_session_reminders() TO service_role;


--
-- Name: FUNCTION configure_creator_session_handoff(target_session_id uuid, target_mapping_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.configure_creator_session_handoff(target_session_id uuid, target_mapping_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.configure_creator_session_handoff(target_session_id uuid, target_mapping_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.configure_creator_session_handoff(target_session_id uuid, target_mapping_id uuid) TO service_role;


--
-- Name: FUNCTION configure_industry_creator_table_mapping(org_id uuid, mapped_creator_id uuid, table_ref text, mapped_game_label text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.configure_industry_creator_table_mapping(org_id uuid, mapped_creator_id uuid, table_ref text, mapped_game_label text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.configure_industry_creator_table_mapping(org_id uuid, mapped_creator_id uuid, table_ref text, mapped_game_label text) TO authenticated;
GRANT ALL ON FUNCTION public.configure_industry_creator_table_mapping(org_id uuid, mapped_creator_id uuid, table_ref text, mapped_game_label text) TO service_role;


--
-- Name: FUNCTION create_creator_live_return_signals(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_creator_live_return_signals() FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_creator_live_return_signals() TO service_role;


--
-- Name: FUNCTION create_industry_org_invitation(org_id uuid, invited_role text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_industry_org_invitation(org_id uuid, invited_role text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_industry_org_invitation(org_id uuid, invited_role text) TO authenticated;
GRANT ALL ON FUNCTION public.create_industry_org_invitation(org_id uuid, invited_role text) TO service_role;


--
-- Name: FUNCTION create_industry_organization(org_name text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_industry_organization(org_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_industry_organization(org_name text) TO anon;
GRANT ALL ON FUNCTION public.create_industry_organization(org_name text) TO authenticated;
GRANT ALL ON FUNCTION public.create_industry_organization(org_name text) TO service_role;


--
-- Name: FUNCTION create_live_signal_on_follow(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_live_signal_on_follow() FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_live_signal_on_follow() TO service_role;


--
-- Name: FUNCTION create_live_signals_on_preference_enable(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_live_signals_on_preference_enable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_live_signals_on_preference_enable() TO service_role;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO anon;
GRANT ALL ON FUNCTION public.crypt(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.crypt(text, text) TO service_role;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.dearmor(text) TO anon;
GRANT ALL ON FUNCTION public.dearmor(text) TO authenticated;
GRANT ALL ON FUNCTION public.dearmor(text) TO service_role;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO anon;
GRANT ALL ON FUNCTION public.digest(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.digest(bytea, text) TO service_role;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.digest(text, text) TO anon;
GRANT ALL ON FUNCTION public.digest(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.digest(text, text) TO service_role;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION enforce_creator_session_state_machine(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_creator_session_state_machine() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_creator_session_state_machine() TO service_role;


--
-- Name: FUNCTION enforce_product_event_attribution_trust(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_attribution_trust() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_attribution_trust() TO service_role;


--
-- Name: FUNCTION enforce_product_event_context(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_context() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_context() TO service_role;


--
-- Name: FUNCTION enforce_product_event_handoff_boundary(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_handoff_boundary() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_handoff_boundary() TO service_role;


--
-- Name: FUNCTION enforce_product_event_metadata_allowlist(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_metadata_allowlist() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_metadata_allowlist() TO service_role;


--
-- Name: FUNCTION enforce_product_event_rate_limit(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_rate_limit() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_rate_limit() TO service_role;


--
-- Name: FUNCTION enforce_product_event_state_integrity(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_product_event_state_integrity() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_product_event_state_integrity() TO service_role;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO anon;
GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO authenticated;
GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO service_role;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO anon;
GRANT ALL ON FUNCTION public.gen_random_uuid() TO authenticated;
GRANT ALL ON FUNCTION public.gen_random_uuid() TO service_role;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO anon;
GRANT ALL ON FUNCTION public.gen_salt(text) TO authenticated;
GRANT ALL ON FUNCTION public.gen_salt(text) TO service_role;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO anon;
GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO authenticated;
GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO service_role;


--
-- Name: FUNCTION get_own_profile(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.get_own_profile() FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_own_profile() TO authenticated;
GRANT ALL ON FUNCTION public.get_own_profile() TO service_role;


--
-- Name: FUNCTION guard_industry_support_case_identity(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.guard_industry_support_case_identity() FROM PUBLIC;
GRANT ALL ON FUNCTION public.guard_industry_support_case_identity() TO anon;
GRANT ALL ON FUNCTION public.guard_industry_support_case_identity() TO authenticated;
GRANT ALL ON FUNCTION public.guard_industry_support_case_identity() TO service_role;


--
-- Name: FUNCTION handle_new_block(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.handle_new_block() TO anon;
GRANT ALL ON FUNCTION public.handle_new_block() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_block() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO anon;
GRANT ALL ON FUNCTION public.hmac(text, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.hmac(text, text, text) TO service_role;


--
-- Name: FUNCTION is_active_profile(profile_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_active_profile(profile_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_active_profile(profile_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_active_profile(profile_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_active_profile(profile_id uuid) TO service_role;


--
-- Name: FUNCTION is_approved_creator(target_user_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_approved_creator(target_user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_approved_creator(target_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_approved_creator(target_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_approved_creator(target_user_id uuid) TO service_role;


--
-- Name: FUNCTION is_blocked_pair(user_a uuid, user_b uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_blocked_pair(user_a uuid, user_b uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_blocked_pair(user_a uuid, user_b uuid) TO anon;
GRANT ALL ON FUNCTION public.is_blocked_pair(user_a uuid, user_b uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_blocked_pair(user_a uuid, user_b uuid) TO service_role;


--
-- Name: FUNCTION is_industry_org_manager(org_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_industry_org_manager(org_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_industry_org_manager(org_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_industry_org_manager(org_id uuid) TO service_role;


--
-- Name: FUNCTION is_industry_org_member(org_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_industry_org_member(org_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_industry_org_member(org_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_industry_org_member(org_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_industry_org_member(org_id uuid) TO service_role;


--
-- Name: FUNCTION is_moderator(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_moderator() FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_moderator() TO authenticated;
GRANT ALL ON FUNCTION public.is_moderator() TO service_role;


--
-- Name: FUNCTION manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text) TO authenticated;
GRANT ALL ON FUNCTION public.manage_industry_org_member(org_id uuid, target_user uuid, next_role text, next_status text) TO service_role;


--
-- Name: FUNCTION notify_comment(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_comment() TO anon;
GRANT ALL ON FUNCTION public.notify_comment() TO authenticated;
GRANT ALL ON FUNCTION public.notify_comment() TO service_role;


--
-- Name: FUNCTION notify_new_follower(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_new_follower() TO anon;
GRANT ALL ON FUNCTION public.notify_new_follower() TO authenticated;
GRANT ALL ON FUNCTION public.notify_new_follower() TO service_role;


--
-- Name: FUNCTION notify_post_like(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.notify_post_like() TO anon;
GRANT ALL ON FUNCTION public.notify_post_like() TO authenticated;
GRANT ALL ON FUNCTION public.notify_post_like() TO service_role;


--
-- Name: FUNCTION pause_industry_creator_table_mapping(mapping_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.pause_industry_creator_table_mapping(mapping_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pause_industry_creator_table_mapping(mapping_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.pause_industry_creator_table_mapping(mapping_id uuid) TO service_role;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO anon;
GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO service_role;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO anon;
GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION privatize_creator_sessions_on_unpublish(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.privatize_creator_sessions_on_unpublish() FROM PUBLIC;
GRANT ALL ON FUNCTION public.privatize_creator_sessions_on_unpublish() TO anon;
GRANT ALL ON FUNCTION public.privatize_creator_sessions_on_unpublish() TO authenticated;
GRANT ALL ON FUNCTION public.privatize_creator_sessions_on_unpublish() TO service_role;


--
-- Name: FUNCTION protect_account_data_export_request_insert(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_account_data_export_request_insert() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_account_data_export_request_insert() TO service_role;


--
-- Name: FUNCTION protect_account_deletion_request_insert(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_account_deletion_request_insert() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_account_deletion_request_insert() TO service_role;


--
-- Name: FUNCTION protect_account_deletion_request_update(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_account_deletion_request_update() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_account_deletion_request_update() TO service_role;


--
-- Name: FUNCTION protect_account_persona_identity(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_account_persona_identity() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_account_persona_identity() TO anon;
GRANT ALL ON FUNCTION public.protect_account_persona_identity() TO authenticated;
GRANT ALL ON FUNCTION public.protect_account_persona_identity() TO service_role;


--
-- Name: FUNCTION protect_comment_moderation_fields(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.protect_comment_moderation_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_comment_moderation_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_comment_moderation_fields() TO service_role;


--
-- Name: FUNCTION protect_creator_profile_status_fields(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_creator_profile_status_fields() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_creator_profile_status_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_creator_profile_status_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_creator_profile_status_fields() TO service_role;


--
-- Name: FUNCTION protect_creator_return_preference_write(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_creator_return_preference_write() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_creator_return_preference_write() TO service_role;


--
-- Name: FUNCTION protect_creator_session_fields(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_creator_session_fields() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_creator_session_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_creator_session_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_creator_session_fields() TO service_role;


--
-- Name: FUNCTION protect_industry_profile_access_status(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_industry_profile_access_status() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_industry_profile_access_status() TO anon;
GRANT ALL ON FUNCTION public.protect_industry_profile_access_status() TO authenticated;
GRANT ALL ON FUNCTION public.protect_industry_profile_access_status() TO service_role;


--
-- Name: FUNCTION protect_notification_fields(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.protect_notification_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_notification_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_notification_fields() TO service_role;


--
-- Name: FUNCTION protect_partnership_access_request_fields(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_partnership_access_request_fields() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_partnership_access_request_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_partnership_access_request_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_partnership_access_request_fields() TO service_role;


--
-- Name: FUNCTION protect_pilot_measurement_brief(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_pilot_measurement_brief() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_pilot_measurement_brief() TO service_role;


--
-- Name: FUNCTION protect_player_session_reminder_write(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_player_session_reminder_write() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_player_session_reminder_write() TO service_role;


--
-- Name: FUNCTION protect_post_moderation_fields(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.protect_post_moderation_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_post_moderation_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_post_moderation_fields() TO service_role;


--
-- Name: FUNCTION protect_profile_system_fields(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_profile_system_fields() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_profile_system_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_profile_system_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_profile_system_fields() TO service_role;


--
-- Name: FUNCTION protect_report_fields(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.protect_report_fields() TO anon;
GRANT ALL ON FUNCTION public.protect_report_fields() TO authenticated;
GRANT ALL ON FUNCTION public.protect_report_fields() TO service_role;


--
-- Name: FUNCTION protect_return_signal_update(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.protect_return_signal_update() FROM PUBLIC;
GRANT ALL ON FUNCTION public.protect_return_signal_update() TO service_role;


--
-- Name: FUNCTION regexp_match(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION regexp_match(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_match(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION regexp_matches(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION regexp_matches(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_matches(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION regexp_replace(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION regexp_replace(public.citext, public.citext, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_replace(public.citext, public.citext, text, text) TO service_role;


--
-- Name: FUNCTION regexp_split_to_array(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION regexp_split_to_array(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_split_to_array(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION regexp_split_to_table(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION regexp_split_to_table(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.regexp_split_to_table(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION remove_creator_return_preference_on_unfollow(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.remove_creator_return_preference_on_unfollow() FROM PUBLIC;
GRANT ALL ON FUNCTION public.remove_creator_return_preference_on_unfollow() TO service_role;


--
-- Name: FUNCTION remove_follows_on_user_block(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.remove_follows_on_user_block() FROM PUBLIC;
GRANT ALL ON FUNCTION public.remove_follows_on_user_block() TO service_role;


--
-- Name: FUNCTION remove_ineligible_creator_live_return_signals(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.remove_ineligible_creator_live_return_signals() FROM PUBLIC;
GRANT ALL ON FUNCTION public.remove_ineligible_creator_live_return_signals() TO service_role;


--
-- Name: FUNCTION remove_ineligible_creator_session_reminders(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.remove_ineligible_creator_session_reminders() FROM PUBLIC;
GRANT ALL ON FUNCTION public.remove_ineligible_creator_session_reminders() TO service_role;


--
-- Name: FUNCTION replace(public.citext, public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.replace(public.citext, public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.replace(public.citext, public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.replace(public.citext, public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION require_follow_for_creator_return_preference(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.require_follow_for_creator_return_preference() FROM PUBLIC;
GRANT ALL ON FUNCTION public.require_follow_for_creator_return_preference() TO service_role;


--
-- Name: FUNCTION resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) TO anon;
GRANT ALL ON FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) TO authenticated;
GRANT ALL ON FUNCTION public.resolve_licensed_operator_handoff(mapped_creator_id uuid, table_ref text) TO service_role;


--
-- Name: FUNCTION resolve_live_session_operator_handoff(target_session_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) TO anon;
GRANT ALL ON FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.resolve_live_session_operator_handoff(target_session_id uuid) TO service_role;


--
-- Name: FUNCTION revoke_industry_org_invitation(invitation_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.revoke_industry_org_invitation(invitation_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.revoke_industry_org_invitation(invitation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.revoke_industry_org_invitation(invitation_id uuid) TO service_role;


--
-- Name: FUNCTION set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean) TO service_role;
GRANT ALL ON FUNCTION public.set_creator_live_alert_preference(p_creator_id uuid, p_enabled boolean) TO authenticated;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION split_part(public.citext, public.citext, integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.split_part(public.citext, public.citext, integer) TO anon;
GRANT ALL ON FUNCTION public.split_part(public.citext, public.citext, integer) TO authenticated;
GRANT ALL ON FUNCTION public.split_part(public.citext, public.citext, integer) TO service_role;


--
-- Name: FUNCTION strpos(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.strpos(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.strpos(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.strpos(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION sync_creator_return_live_alert_preference(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.sync_creator_return_live_alert_preference() FROM PUBLIC;
GRANT ALL ON FUNCTION public.sync_creator_return_live_alert_preference() TO service_role;


--
-- Name: FUNCTION texticlike(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.texticlike(public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.texticlike(public.citext, text) TO service_role;


--
-- Name: FUNCTION texticlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.texticlike(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.texticlike(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION texticnlike(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.texticnlike(public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.texticnlike(public.citext, text) TO service_role;


--
-- Name: FUNCTION texticnlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.texticnlike(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.texticnlike(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION texticregexeq(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.texticregexeq(public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.texticregexeq(public.citext, text) TO service_role;


--
-- Name: FUNCTION texticregexne(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.texticregexne(public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.texticregexne(public.citext, text) TO service_role;


--
-- Name: FUNCTION texticregexne(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, public.citext) TO anon;
GRANT ALL ON FUNCTION public.texticregexne(public.citext, public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.texticregexne(public.citext, public.citext) TO service_role;


--
-- Name: FUNCTION translate(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.translate(public.citext, public.citext, text) TO anon;
GRANT ALL ON FUNCTION public.translate(public.citext, public.citext, text) TO authenticated;
GRANT ALL ON FUNCTION public.translate(public.citext, public.citext, text) TO service_role;


--
-- Name: FUNCTION validate_comment_reply_depth(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.validate_comment_reply_depth() TO anon;
GRANT ALL ON FUNCTION public.validate_comment_reply_depth() TO authenticated;
GRANT ALL ON FUNCTION public.validate_comment_reply_depth() TO service_role;


--
-- Name: FUNCTION foldername(path text); Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON FUNCTION storage.foldername(path text) TO anon;
GRANT ALL ON FUNCTION storage.foldername(path text) TO authenticated;
GRANT ALL ON FUNCTION storage.foldername(path text) TO service_role;


--
-- Name: FUNCTION max(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.max(public.citext) TO anon;
GRANT ALL ON FUNCTION public.max(public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.max(public.citext) TO service_role;


--
-- Name: FUNCTION min(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.min(public.citext) TO anon;
GRANT ALL ON FUNCTION public.min(public.citext) TO authenticated;
GRANT ALL ON FUNCTION public.min(public.citext) TO service_role;


--
-- Name: TABLE account_data_export_requests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_data_export_requests TO service_role;
GRANT SELECT,INSERT ON TABLE public.account_data_export_requests TO authenticated;


--
-- Name: TABLE account_deletion_requests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_deletion_requests TO service_role;
GRANT SELECT,INSERT,UPDATE ON TABLE public.account_deletion_requests TO authenticated;


--
-- Name: TABLE account_personas; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_personas TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_personas TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_personas TO service_role;


--
-- Name: TABLE activity_events; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_events TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_events TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_events TO service_role;


--
-- Name: SEQUENCE activity_events_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE public.activity_events_id_seq TO anon;
GRANT SELECT,USAGE ON SEQUENCE public.activity_events_id_seq TO authenticated;
GRANT SELECT,USAGE ON SEQUENCE public.activity_events_id_seq TO service_role;


--
-- Name: TABLE comments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.comments TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.comments TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.comments TO service_role;


--
-- Name: TABLE creator_return_preferences; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_return_preferences TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_return_preferences TO authenticated;


--
-- Name: TABLE creator_sessions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_sessions TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_sessions TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.creator_sessions TO service_role;


--
-- Name: TABLE follows; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.follows TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.follows TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.follows TO service_role;


--
-- Name: TABLE industry_creator_mappings; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_mappings TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_mappings TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_mappings TO service_role;


--
-- Name: TABLE industry_creator_session_handoffs; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_session_handoffs TO service_role;
GRANT SELECT ON TABLE public.industry_creator_session_handoffs TO authenticated;


--
-- Name: TABLE industry_creator_table_mapping_audit; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_table_mapping_audit TO service_role;
GRANT SELECT ON TABLE public.industry_creator_table_mapping_audit TO authenticated;


--
-- Name: TABLE industry_creator_table_mappings; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_creator_table_mappings TO service_role;
GRANT SELECT ON TABLE public.industry_creator_table_mappings TO authenticated;


--
-- Name: TABLE industry_handoff_destinations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_handoff_destinations TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_handoff_destinations TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_handoff_destinations TO service_role;


--
-- Name: TABLE industry_integration_health; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_integration_health TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_integration_health TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_integration_health TO service_role;


--
-- Name: TABLE industry_organization_invitations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organization_invitations TO service_role;
GRANT SELECT ON TABLE public.industry_organization_invitations TO authenticated;


--
-- Name: TABLE industry_organization_members; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organization_members TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organization_members TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organization_members TO service_role;


--
-- Name: TABLE industry_organizations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organizations TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organizations TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_organizations TO service_role;


--
-- Name: TABLE industry_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_profiles TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_profiles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_profiles TO service_role;


--
-- Name: TABLE industry_support_cases; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_support_cases TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_support_cases TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.industry_support_cases TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notifications TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notifications TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notifications TO service_role;


--
-- Name: TABLE partnership_access_requests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.partnership_access_requests TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.partnership_access_requests TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.partnership_access_requests TO service_role;


--
-- Name: TABLE pilot_measurement_briefs; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pilot_measurement_briefs TO service_role;
GRANT SELECT,INSERT,UPDATE ON TABLE public.pilot_measurement_briefs TO authenticated;


--
-- Name: TABLE player_preferences; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_preferences TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_preferences TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_preferences TO service_role;


--
-- Name: TABLE player_session_reminders; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_session_reminders TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_session_reminders TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.player_session_reminders TO service_role;


--
-- Name: TABLE post_likes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.post_likes TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.post_likes TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.post_likes TO service_role;


--
-- Name: TABLE posts; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.posts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.posts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.posts TO service_role;


--
-- Name: TABLE product_events; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product_events TO service_role;
GRANT SELECT,INSERT ON TABLE public.product_events TO authenticated;


--
-- Name: TABLE reports; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reports TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reports TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reports TO service_role;


--
-- Name: TABLE return_signal_preferences; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.return_signal_preferences TO service_role;
GRANT SELECT,INSERT,UPDATE ON TABLE public.return_signal_preferences TO authenticated;


--
-- Name: TABLE return_signals; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.return_signals TO service_role;
GRANT SELECT,UPDATE ON TABLE public.return_signals TO authenticated;


--
-- Name: TABLE user_blocks; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_blocks TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_blocks TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_blocks TO service_role;


--
-- Name: TABLE user_settings; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_settings TO service_role;
GRANT SELECT,INSERT,UPDATE ON TABLE public.user_settings TO authenticated;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: -
--

GRANT SELECT ON TABLE storage.buckets TO anon;
GRANT SELECT ON TABLE storage.buckets TO authenticated;
GRANT SELECT ON TABLE storage.buckets TO service_role;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO service_role;


--
-- Name: SEQUENCE objects_id_seq; Type: ACL; Schema: storage; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE storage.objects_id_seq TO anon;
GRANT SELECT,USAGE ON SEQUENCE storage.objects_id_seq TO authenticated;
GRANT SELECT,USAGE ON SEQUENCE storage.objects_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE macbook IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


