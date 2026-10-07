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

-- Login history with full details
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.auth_users(id) on delete cascade,
  email text not null,
  status text not null check (status in ('success', 'failed', 'blocked')),
  ip_address text not null,
  ip_hash text not null,
  device_hash text not null,
  user_agent text,
  browser text,
  device_type text,
  device_name text,
  location text,
  country text,
  failure_reason text,
  is_suspicious boolean not null default false,
  created_at timestamptz not null default now()
);

-- Send transactions history
create table if not exists public.send_transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.auth_users(id) on delete cascade,
  recipient_id uuid not null references public.auth_users(id) on delete cascade,
  amount numeric(18, 2) not null,
  fee numeric(18, 2) not null default 0.10,
  total numeric(18, 2) not null,
  note text,
  tx_hash text not null unique,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed')),
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
create index if not exists login_history_user_idx on public.login_history (user_id, created_at desc);
create index if not exists login_history_suspicious_idx on public.login_history (user_id, is_suspicious, created_at desc);
create index if not exists send_transactions_sender_idx on public.send_transactions (sender_id, created_at desc);
create index if not exists send_transactions_recipient_idx on public.send_transactions (recipient_id, created_at desc);

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
alter table public.login_history enable row level security;
alter table public.send_transactions enable row level security;

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

-- ════════════════════════════════════════════════════════════
-- REFERRAL SYSTEM
-- ════════════════════════════════════════════════════════════

-- Referral relationships (who referred whom)
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.auth_users(id) on delete cascade,
  referred_id uuid not null references public.auth_users(id) on delete cascade,
  is_eligible boolean not null default false,
  first_deposit_at timestamptz,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);

-- Milestone configuration (admin-editable rewards)
create table if not exists public.referral_milestones (
  id uuid primary key default gen_random_uuid(),
  required_active int not null unique,
  reward numeric(18, 2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Milestone claims tracking (with reset counter after claim)
create table if not exists public.referral_milestone_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  milestone_id uuid not null references public.referral_milestones(id) on delete cascade,
  eligible_count_at_claim int not null,
  reward_amount numeric(18, 2) not null,
  claimed_at timestamptz not null default now()
);

-- Commission tracking by source (daily profit, AI trading)
create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.auth_users(id) on delete cascade,
  referred_id uuid not null references public.auth_users(id) on delete cascade,
  source text not null check (source in ('daily_profit', 'ai_trading')),
  basis_amount numeric(18, 2) not null,
  commission_rate numeric(5, 4) not null default 0.05,
  commission_amount numeric(18, 2) not null,
  created_at timestamptz not null default now()
);

-- Leaderboard prize configuration (admin-editable)
create table if not exists public.referral_leaderboard_prizes (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('weekly', 'monthly')),
  rank int not null,
  prize_amount numeric(18, 2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(period_type, rank)
);

-- Leaderboard winners history
create table if not exists public.referral_leaderboard_winners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  rank int not null,
  eligible_referral_count int not null,
  prize_amount numeric(18, 2) not null,
  awarded_at timestamptz not null default now()
);

-- Profit events for commission calculation
create table if not exists public.profit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  source text not null check (source in ('daily_profit', 'ai_trading')),
  profit_amount numeric(18, 2) not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists referrals_referrer_idx on public.referrals (referrer_id, is_eligible);
create index if not exists referrals_referred_idx on public.referrals (referred_id);
create index if not exists referral_milestone_claims_user_idx on public.referral_milestone_claims (user_id, claimed_at desc);
create index if not exists referral_commissions_referrer_idx on public.referral_commissions (referrer_id, source, created_at desc);
create index if not exists referral_commissions_referred_idx on public.referral_commissions (referred_id);
create index if not exists referral_leaderboard_winners_period_idx on public.referral_leaderboard_winners (period_type, period_start, rank);
create index if not exists profit_events_user_idx on public.profit_events (user_id, source, created_at desc);

-- Enable RLS
alter table public.referrals enable row level security;
alter table public.referral_milestones enable row level security;
alter table public.referral_milestone_claims enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.referral_leaderboard_prizes enable row level security;
alter table public.referral_leaderboard_winners enable row level security;
alter table public.profit_events enable row level security;

-- Insert default milestone tiers
insert into public.referral_milestones (required_active, reward) values
  (5, 5.00),
  (10, 12.00),
  (15, 35.00),
  (20, 30.00),
  (30, 40.00),
  (50, 75.00),
  (100, 170.00),
  (150, 250.00)
on conflict (required_active) do nothing;

-- Insert default leaderboard prizes (weekly)
insert into public.referral_leaderboard_prizes (period_type, rank, prize_amount) values
  ('weekly', 1, 100.00),
  ('weekly', 2, 75.00),
  ('weekly', 3, 50.00),
  ('weekly', 4, 40.00),
  ('weekly', 5, 30.00),
  ('weekly', 6, 25.00),
  ('weekly', 7, 20.00),
  ('weekly', 8, 15.00),
  ('weekly', 9, 12.00),
  ('weekly', 10, 10.00)
on conflict (period_type, rank) do nothing;

-- Insert default leaderboard prizes (monthly)
insert into public.referral_leaderboard_prizes (period_type, rank, prize_amount) values
  ('monthly', 1, 500.00),
  ('monthly', 2, 350.00),
  ('monthly', 3, 250.00),
  ('monthly', 4, 200.00),
  ('monthly', 5, 150.00),
  ('monthly', 6, 125.00),
  ('monthly', 7, 100.00),
  ('monthly', 8, 75.00),
  ('monthly', 9, 60.00),
  ('monthly', 10, 50.00)
on conflict (period_type, rank) do nothing;

-- Function: mark referral as eligible after first deposit
create or replace function public.mark_referral_eligible(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.referrals
  set is_eligible = true, first_deposit_at = now()
  where referred_id = p_user_id and is_eligible = false;
end;
$$;

-- Function: record profit and create commission
create or replace function public.record_profit_with_commission(
  p_user_id uuid,
  p_source text,
  p_profit_amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_commission_amount numeric;
begin
  -- Record profit event
  insert into public.profit_events (user_id, source, profit_amount)
  values (p_user_id, p_source, p_profit_amount);

  -- Find referrer (if any eligible referral exists)
  select r.referrer_id into v_referrer_id
  from public.referrals r
  where r.referred_id = p_user_id and r.is_eligible = true
  limit 1;

  -- Create commission if referrer exists
  if v_referrer_id is not null then
    v_commission_amount := p_profit_amount * 0.05;
    
    insert into public.referral_commissions (referrer_id, referred_id, source, basis_amount, commission_rate, commission_amount)
    values (v_referrer_id, p_user_id, p_source, p_profit_amount, 0.05, v_commission_amount);

    -- Add commission to referrer's main wallet
    update public.wallet_accounts
    set balance = balance + v_commission_amount, updated_at = now()
    where user_id = v_referrer_id and wallet = 'main';

    -- Record transaction
    insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
    values (v_referrer_id, 'main', 'referral_commission', v_commission_amount, 'completed', gen_random_uuid()::text);
  end if;
end;
$$;

-- Function: get referral stats for user
create or replace function public.get_referral_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_referred int;
  v_active_referred int;
  v_total_commission numeric;
  v_commission_by_source jsonb;
begin
  -- Total referred
  select count(*) into v_total_referred
  from public.referrals
  where referrer_id = p_user_id;

  -- Active (eligible) referred
  select count(*) into v_active_referred
  from public.referrals
  where referrer_id = p_user_id and is_eligible = true;

  -- Total commission
  select coalesce(sum(commission_amount), 0) into v_total_commission
  from public.referral_commissions
  where referrer_id = p_user_id;

  -- Commission by source
  select jsonb_object_agg(source, total) into v_commission_by_source
  from (
    select source, coalesce(sum(commission_amount), 0) as total
    from public.referral_commissions
    where referrer_id = p_user_id
    group by source
  ) sub;

  return jsonb_build_object(
    'total_referred', v_total_referred,
    'active_referred', v_active_referred,
    'total_commission', v_total_commission,
    'commission_by_source', coalesce(v_commission_by_source, '{}'::jsonb)
  );
end;
$$;
