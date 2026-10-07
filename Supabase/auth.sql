create table if not exists public.auth_users (
  id uuid primary key default gen_random_uuid(),
  user_id char(6) unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  country text not null,
  dob_month text,
  dob_day text,
  dob_year text,
  dob_raw jsonb not null default '{}'::jsonb,
  referral_code text,
  password_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  role text not null default 'user',
  created_ip_hash text not null,
  created_device_hash text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  purpose text not null check (purpose in ('signup', 'password_reset')),
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('signup', 'signin', 'forgot_password')),
  ip_hash text not null,
  device_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_users_email_idx on public.auth_users (email);
create index if not exists auth_users_user_id_idx on public.auth_users (user_id);
create index if not exists auth_otps_lookup_idx on public.auth_otps (user_id, purpose, code_hash, consumed_at, created_at desc);
create index if not exists auth_attempts_ip_idx on public.auth_attempts (action, ip_hash, created_at desc);
create index if not exists auth_attempts_device_idx on public.auth_attempts (action, device_hash, created_at desc);
create index if not exists auth_sessions_token_idx on public.auth_sessions (token_hash);

create or replace function public.delete_expired_pending_auth_users()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.auth_users
  where status = 'pending'
    and created_at < now() - interval '15 minutes';
$$;

create extension if not exists pg_cron with schema extensions;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'delete-expired-pending-auth-users') then
    perform cron.schedule(
      'delete-expired-pending-auth-users',
      '* * * * *',
      'select public.delete_expired_pending_auth_users();'
    );
  end if;
end $$;

alter table public.auth_users enable row level security;
alter table public.auth_otps enable row level security;
alter table public.auth_attempts enable row level security;
alter table public.auth_sessions enable row level security;
