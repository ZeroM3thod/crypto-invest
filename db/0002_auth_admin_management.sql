-- Run in Supabase before using owner admin management.

alter table public.auth_users
  add column if not exists hidden_from_admins boolean not null default false;

create index if not exists auth_users_hidden_from_admins_idx
  on public.auth_users (hidden_from_admins);

create table if not exists public.auth_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.auth_settings (key, value)
values ('restricted_mode', 'false'::jsonb)
on conflict (key) do nothing;

create table if not exists public.restricted_people (
  public_id text primary key,
  name text not null,
  kind text not null check (kind in ('Admin', 'User')),
  created_at timestamptz not null default now()
);

create table if not exists public.impersonation_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.auth_users(id) on delete cascade,
  admin_id uuid not null references public.auth_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists impersonation_log_owner_idx on public.impersonation_log (owner_id, created_at desc);
create index if not exists impersonation_log_admin_idx on public.impersonation_log (admin_id, created_at desc);
