-- 0001_admin_management.sql
-- Run against your Supabase project.
--
-- 1. profiles.hidden_from_admins  — super-admin-only visibility flag.
-- 2. Restrictive RLS policy      — admins can never read hidden users.
-- 3. impersonation_log            — audit trail for owner -> admin impersonation.

-- ---------------------------------------------------------------------------
-- 1. Visibility flag
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists hidden_from_admins boolean not null default false;

create index if not exists profiles_hidden_from_admins_idx
  on public.profiles (hidden_from_admins);

-- ---------------------------------------------------------------------------
-- 2. RLS: block admins from reading hidden users
--    Restrictive policies AND with other policies, so this only ever removes
--    rows — it can never grant access on its own.
-- ---------------------------------------------------------------------------
drop policy if exists "admins_cannot_read_hidden_users" on public.profiles;
create policy "admins_cannot_read_hidden_users"
  on public.profiles
  as restrictive
  for select
  to authenticated
  using (
    hidden_from_admins = false
    or exists (
      select 1 from public.profiles me
      where me.id = auth.uid()
        and me.role <> 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Impersonation audit log
-- ---------------------------------------------------------------------------
create table if not exists public.impersonation_log (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id),
  admin_id   uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists impersonation_log_admin_id_idx
  on public.impersonation_log (admin_id);

alter table public.impersonation_log enable row level security;

-- Only the owner can read/write the audit log.
drop policy if exists "owner_reads_impersonation_log" on public.impersonation_log;
create policy "owner_reads_impersonation_log"
  on public.impersonation_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid()
        and me.role = 'owner'
    )
  );
