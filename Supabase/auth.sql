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
  wallet_address text,
  kyc_status text not null default 'not_verified',
  two_fa_enabled boolean not null default false,
  two_fa_secret text,
  backup_codes text[],
  password_changed_at timestamptz,
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

create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  wallet text not null check (wallet in ('main', 'investment', 'trading')),
  balance numeric(18, 2) not null default 0 check (balance >= 0),
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, wallet)
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  wallet text not null check (wallet in ('main', 'investment', 'trading')),
  type text not null,
  asset text not null default 'USDT',
  amount numeric(18, 2) not null,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed')),
  tx_hash text not null,
  related_wallet text check (related_wallet in ('main', 'investment', 'trading')),
  created_at timestamptz not null default now()
);

create index if not exists auth_users_email_idx on public.auth_users (email);
create index if not exists auth_users_user_id_idx on public.auth_users (user_id);
create index if not exists auth_otps_lookup_idx on public.auth_otps (user_id, purpose, code_hash, consumed_at, created_at desc);
create index if not exists auth_attempts_ip_idx on public.auth_attempts (action, ip_hash, created_at desc);
create index if not exists auth_attempts_device_idx on public.auth_attempts (action, device_hash, created_at desc);
create index if not exists auth_sessions_token_idx on public.auth_sessions (token_hash);
create index if not exists wallet_accounts_user_idx on public.wallet_accounts (user_id, wallet);
create index if not exists wallet_transactions_user_idx on public.wallet_transactions (user_id, created_at desc);

alter table public.auth_users add column if not exists wallet_address text;
alter table public.auth_users add column if not exists kyc_status text not null default 'not_verified';
alter table public.auth_users add column if not exists two_fa_enabled boolean not null default false;
alter table public.auth_users add column if not exists two_fa_secret text;
alter table public.auth_users add column if not exists backup_codes text[];
alter table public.auth_users add column if not exists password_changed_at timestamptz;

insert into public.wallet_accounts (user_id, wallet, balance, address)
select id, 'main', 0, wallet_address from public.auth_users
on conflict (user_id, wallet) do nothing;

insert into public.wallet_accounts (user_id, wallet, balance)
select id, 'investment', 0 from public.auth_users
on conflict (user_id, wallet) do nothing;

insert into public.wallet_accounts (user_id, wallet, balance)
select id, 'trading', 0 from public.auth_users
on conflict (user_id, wallet) do nothing;

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
alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;

create or replace function public.transfer_wallet_balance(
  p_user_id uuid,
  p_from text,
  p_to text,
  p_amount numeric,
  p_tx_hash text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_from = p_to or p_amount <= 0 then
    raise exception 'Invalid transfer';
  end if;

  update public.wallet_accounts
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id and wallet = p_from and balance >= p_amount;

  if not found then
    raise exception 'Insufficient balance';
  end if;

  update public.wallet_accounts
  set balance = balance + p_amount, updated_at = now()
  where user_id = p_user_id and wallet = p_to;

  insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash, related_wallet)
  values
    (p_user_id, p_from, 'transfer', -p_amount, 'completed', p_tx_hash, p_to),
    (p_user_id, p_to, 'transfer', p_amount, 'completed', p_tx_hash, p_from);
end;
$$;
