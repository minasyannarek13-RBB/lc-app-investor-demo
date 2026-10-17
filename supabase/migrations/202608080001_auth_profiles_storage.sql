-- LC App P0 auth/profile compatibility notes for the verified live Supabase foundation.
-- The live project already contains public.profiles, public.user_settings,
-- auth triggers, avatars bucket and RLS. Do not run this file to replace the
-- live foundation unless a schema drift check proves it is needed.

create extension if not exists citext with schema public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  country text,
  languages text[] not null default '{}',
  onboarding_completed boolean not null default false,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  age_confirmed boolean not null default false,
  account_status text not null default 'active',
  role text not null default 'user',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]{3,32}$'),
  constraint profiles_account_status_check check (account_status in ('active', 'suspended', 'disabled')),
  constraint profiles_role_check check (role in ('user', 'moderator', 'admin'))
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interface_language text not null default 'en',
  notifications_enabled boolean not null default true,
  marketing_emails_enabled boolean not null default false,
  profile_visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);
create index if not exists profiles_account_status_idx on public.profiles (account_status);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
