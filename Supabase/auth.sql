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
  role text not null default 'user' check (role in ('user', 'admin', 'owner')),
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

-- ════════════════════════════════════════════════════════════
-- DAILY PROFIT INVESTMENT SYSTEM
-- ════════════════════════════════════════════════════════════

-- Daily profit plan configuration (admin-editable)
create table if not exists public.daily_profit_plans (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null unique check (plan_id in ('starter', 'growth', 'elite')),
  name text not null,
  daily_rate numeric(5, 2) not null check (daily_rate > 0),
  minimum_amount numeric(18, 2) not null check (minimum_amount > 0),
  badge_label text not null,
  cancel_policy_hours int not null default 24,
  profit_interval_seconds int not null default 86400,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User investments in daily profit plans
create table if not exists public.daily_profit_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  plan_id text not null,
  plan_name text not null,
  amount numeric(18, 2) not null check (amount > 0),
  daily_rate numeric(5, 2) not null,
  profit_per_cycle numeric(18, 2) not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  credits_earned int not null default 0,
  total_profit numeric(18, 2) not null default 0,
  started_at timestamptz not null default now(),
  next_credit_at timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily profit history (each credit event)
create table if not exists public.daily_profit_history (
  id uuid primary key default gen_random_uuid(),
  investment_id uuid not null references public.daily_profit_investments(id) on delete cascade,
  user_id uuid not null references public.auth_users(id) on delete cascade,
  plan_id text not null,
  plan_name text not null,
  invested_amount numeric(18, 2) not null,
  daily_rate numeric(5, 2) not null,
  profit_amount numeric(18, 2) not null,
  cumulative_profit numeric(18, 2) not null,
  status text not null check (status in ('active', 'cancelled')),
  credited_at timestamptz not null default now()
);

-- Indexes
create index if not exists daily_profit_investments_user_idx on public.daily_profit_investments (user_id, status, created_at desc);
create index if not exists daily_profit_investments_next_credit_idx on public.daily_profit_investments (next_credit_at) where status = 'active';
create index if not exists daily_profit_history_user_idx on public.daily_profit_history (user_id, credited_at desc);
create index if not exists daily_profit_history_investment_idx on public.daily_profit_history (investment_id, credited_at desc);

-- Enable RLS
alter table public.daily_profit_plans enable row level security;
alter table public.daily_profit_investments enable row level security;
alter table public.daily_profit_history enable row level security;

-- Insert default plans
insert into public.daily_profit_plans (plan_id, name, daily_rate, minimum_amount, badge_label, cancel_policy_hours, profit_interval_seconds) values
  ('starter', 'Starter Plan', 1.70, 10.00, 'Starter', 24, 86400),
  ('growth', 'Growth Plan', 2.10, 30.00, 'Growth', 24, 86400),
  ('elite', 'Elite Plan', 2.50, 50.00, 'Elite', 24, 86400)
on conflict (plan_id) do nothing;

-- Function: create daily profit investment
create or replace function public.create_daily_profit_investment(
  p_user_id uuid,
  p_plan_id text,
  p_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan record;
  v_investment_id uuid;
  v_profit_per_cycle numeric;
  v_next_credit_at timestamptz;
  v_tx_hash text;
begin
  -- Get plan details
  select * into v_plan from public.daily_profit_plans where plan_id = p_plan_id and active = true;
  if not found then
    raise exception 'Invalid or inactive plan';
  end if;

  -- Validate amount
  if p_amount < v_plan.minimum_amount then
    raise exception 'Amount below minimum: $%', v_plan.minimum_amount;
  end if;

  -- Check investment wallet balance
  if not exists (
    select 1 from public.wallet_accounts
    where user_id = p_user_id and wallet = 'investment' and balance >= p_amount
  ) then
    raise exception 'Insufficient balance in investment wallet';
  end if;

  -- Calculate profit
  v_profit_per_cycle := (p_amount * v_plan.daily_rate) / 100;
  v_next_credit_at := now() + (v_plan.profit_interval_seconds || ' seconds')::interval;

  -- Deduct from investment wallet
  update public.wallet_accounts
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id and wallet = 'investment';

  -- Create transaction record
  v_tx_hash := gen_random_uuid()::text;
  insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
  values (p_user_id, 'investment', 'daily_profit_invest', -p_amount, 'completed', v_tx_hash);

  -- Create investment
  insert into public.daily_profit_investments (
    user_id, plan_id, plan_name, amount, daily_rate, profit_per_cycle, next_credit_at
  ) values (
    p_user_id, v_plan.plan_id, v_plan.name, p_amount, v_plan.daily_rate, v_profit_per_cycle, v_next_credit_at
  ) returning id into v_investment_id;

  return v_investment_id;
end;
$$;

-- Function: cancel daily profit investment
create or replace function public.cancel_daily_profit_investment(
  p_user_id uuid,
  p_investment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_investment record;
  v_total_return numeric;
  v_tx_hash text;
begin
  -- Get investment
  select * into v_investment from public.daily_profit_investments
  where id = p_investment_id and user_id = p_user_id and status = 'active';

  if not found then
    raise exception 'Investment not found or already cancelled';
  end if;

  -- Check 24h lock period
  if now() < v_investment.started_at + interval '24 hours' then
    raise exception 'Cannot cancel before 24 hours';
  end if;

  -- Calculate total return
  v_total_return := v_investment.amount + v_investment.total_profit;

  -- Mark as cancelled
  update public.daily_profit_investments
  set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where id = p_investment_id;

  -- Return funds to investment wallet
  update public.wallet_accounts
  set balance = balance + v_total_return, updated_at = now()
  where user_id = p_user_id and wallet = 'investment';

  -- Create transaction record
  v_tx_hash := gen_random_uuid()::text;
  insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
  values (p_user_id, 'investment', 'daily_profit_cancel', v_total_return, 'completed', v_tx_hash);
end;
$$;

-- Function: process daily profit credits (called by cron)
create or replace function public.process_daily_profit_credits()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_investment record;
  v_tx_hash text;
begin
  for v_investment in
    select * from public.daily_profit_investments
    where status = 'active' and next_credit_at <= now()
    order by next_credit_at asc
  loop
    -- Credit profit to investment wallet
    update public.wallet_accounts
    set balance = balance + v_investment.profit_per_cycle, updated_at = now()
    where user_id = v_investment.user_id and wallet = 'investment';

    -- Update investment
    update public.daily_profit_investments
    set
      credits_earned = credits_earned + 1,
      total_profit = total_profit + v_investment.profit_per_cycle,
      next_credit_at = next_credit_at + interval '86400 seconds',
      updated_at = now()
    where id = v_investment.id;

    -- Create history record
    insert into public.daily_profit_history (
      investment_id, user_id, plan_id, plan_name, invested_amount, daily_rate,
      profit_amount, cumulative_profit, status
    ) values (
      v_investment.id, v_investment.user_id, v_investment.plan_id, v_investment.plan_name,
      v_investment.amount, v_investment.daily_rate, v_investment.profit_per_cycle,
      v_investment.total_profit + v_investment.profit_per_cycle, v_investment.status
    );

    -- Create transaction record
    v_tx_hash := gen_random_uuid()::text;
    insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
    values (v_investment.user_id, 'investment', 'daily_profit_credit', v_investment.profit_per_cycle, 'completed', v_tx_hash);

    -- Record profit event for referral commission
    perform public.record_profit_with_commission(v_investment.user_id, 'daily_profit', v_investment.profit_per_cycle);
  end loop;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- AI TRADING INVESTMENT SYSTEM
-- ════════════════════════════════════════════════════════════

-- AI trading strategy configuration (admin-editable)
create table if not exists public.ai_trading_strategies (
  id uuid primary key default gen_random_uuid(),
  strategy_id text not null unique,
  name text not null,
  exchange text not null default 'Binance',
  min_stake numeric(18, 2) not null check (min_stake > 0),
  lock_days int not null default 15,
  total_roi_pct numeric(8, 4) not null default 0,
  days_running int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User investments in AI strategies
create table if not exists public.ai_trading_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  strategy_id text not null,
  strategy_name text not null,
  amount numeric(18, 2) not null check (amount > 0),
  current_value numeric(18, 2) not null,
  total_profit numeric(18, 2) not null default 0,
  lock_days int not null,
  status text not null default 'running' check (status in ('running', 'unlocked', 'withdrawn')),
  invested_at timestamptz not null default now(),
  unlock_at timestamptz not null,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI trade execution log
create table if not exists public.ai_trades (
  id uuid primary key default gen_random_uuid(),
  investment_id uuid not null references public.ai_trading_investments(id) on delete cascade,
  user_id uuid not null references public.auth_users(id) on delete cascade,
  strategy_id text not null,
  strategy_name text not null,
  trade_size numeric(18, 2) not null,
  duration_minutes int not null,
  pnl numeric(18, 2) not null,
  result text not null check (result in ('win', 'loss')),
  executed_at timestamptz not null default now()
);

-- Indexes
create index if not exists ai_trading_investments_user_idx on public.ai_trading_investments (user_id, status, created_at desc);
create index if not exists ai_trading_investments_unlock_idx on public.ai_trading_investments (unlock_at) where status = 'running';
create index if not exists ai_trades_user_idx on public.ai_trades (user_id, executed_at desc);
create index if not exists ai_trades_investment_idx on public.ai_trades (investment_id, executed_at desc);

-- Enable RLS
alter table public.ai_trading_strategies enable row level security;
alter table public.ai_trading_investments enable row level security;
alter table public.ai_trades enable row level security;

-- Insert default strategies
insert into public.ai_trading_strategies (strategy_id, name, exchange, min_stake, lock_days, total_roi_pct, days_running) values
  ('ema_9', '9 EMA Strategy', 'Binance', 20.00, 15, 18.40, 62),
  ('momentum', 'Momentum Breakout', 'Binance', 40.00, 15, 24.10, 48),
  ('grid_scalper', 'Grid Scalper Pro', 'Binance', 70.00, 15, 31.70, 35),
  ('trend_reversal', 'Trend Reversal AI', 'Binance', 100.00, 15, 42.90, 21)
on conflict (strategy_id) do nothing;

-- Function: create AI trading investment
create or replace function public.create_ai_trading_investment(
  p_user_id uuid,
  p_strategy_id text,
  p_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_strategy record;
  v_investment_id uuid;
  v_unlock_at timestamptz;
  v_tx_hash text;
begin
  -- Get strategy details
  select * into v_strategy from public.ai_trading_strategies where strategy_id = p_strategy_id and active = true;
  if not found then
    raise exception 'Invalid or inactive strategy';
  end if;

  -- Validate amount
  if p_amount < v_strategy.min_stake then
    raise exception 'Amount below minimum: $%', v_strategy.min_stake;
  end if;

  -- Check trading wallet balance
  if not exists (
    select 1 from public.wallet_accounts
    where user_id = p_user_id and wallet = 'trading' and balance >= p_amount
  ) then
    raise exception 'Insufficient balance in trading wallet';
  end if;

  -- Calculate unlock date
  v_unlock_at := now() + (v_strategy.lock_days || ' days')::interval;

  -- Deduct from trading wallet
  update public.wallet_accounts
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id and wallet = 'trading';

  -- Create transaction record
  v_tx_hash := gen_random_uuid()::text;
  insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
  values (p_user_id, 'trading', 'ai_trading_invest', -p_amount, 'completed', v_tx_hash);

  -- Create investment
  insert into public.ai_trading_investments (
    user_id, strategy_id, strategy_name, amount, current_value, lock_days, unlock_at
  ) values (
    p_user_id, v_strategy.strategy_id, v_strategy.name, p_amount, p_amount, v_strategy.lock_days, v_unlock_at
  ) returning id into v_investment_id;

  return v_investment_id;
end;
$$;

-- Function: record AI trade and update investment (compounding)
create or replace function public.record_ai_trade(
  p_investment_id uuid,
  p_trade_size numeric,
  p_duration_minutes int,
  p_pnl numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_investment record;
  v_new_value numeric;
  v_profit_delta numeric;
  v_result text;
begin
  -- Get investment
  select * into v_investment from public.ai_trading_investments
  where id = p_investment_id and status in ('running', 'unlocked');

  if not found then
    raise exception 'Investment not found or withdrawn';
  end if;

  -- Calculate new value (compounding)
  v_new_value := v_investment.current_value + p_pnl;
  if v_new_value < 0 then
    v_new_value := 0;
  end if;

  v_profit_delta := v_new_value - v_investment.amount;
  v_result := case when p_pnl >= 0 then 'win' else 'loss' end;

  -- Update investment
  update public.ai_trading_investments
  set
    current_value = v_new_value,
    total_profit = v_profit_delta,
    updated_at = now()
  where id = p_investment_id;

  -- Record trade
  insert into public.ai_trades (
    investment_id, user_id, strategy_id, strategy_name, trade_size, duration_minutes, pnl, result
  ) values (
    p_investment_id, v_investment.user_id, v_investment.strategy_id, v_investment.strategy_name,
    p_trade_size, p_duration_minutes, p_pnl, v_result
  );

  -- Record profit event for referral commission (only on gains)
  if p_pnl > 0 then
    perform public.record_profit_with_commission(v_investment.user_id, 'ai_trading', p_pnl);
  end if;
end;
$$;

-- Function: withdraw AI trading investment
create or replace function public.withdraw_ai_trading_investment(
  p_user_id uuid,
  p_investment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_investment record;
  v_tx_hash text;
begin
  -- Get investment
  select * into v_investment from public.ai_trading_investments
  where id = p_investment_id and user_id = p_user_id and status = 'unlocked';

  if not found then
    raise exception 'Investment not found or not unlocked';
  end if;

  -- Mark as withdrawn
  update public.ai_trading_investments
  set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  where id = p_investment_id;

  -- Return funds to trading wallet
  update public.wallet_accounts
  set balance = balance + v_investment.current_value, updated_at = now()
  where user_id = p_user_id and wallet = 'trading';

  -- Create transaction record
  v_tx_hash := gen_random_uuid()::text;
  insert into public.wallet_transactions (user_id, wallet, type, amount, status, tx_hash)
  values (p_user_id, 'trading', 'ai_trading_withdraw', v_investment.current_value, 'completed', v_tx_hash);
end;
$$;

-- Function: unlock AI trading investments (called by cron)
create or replace function public.unlock_ai_trading_investments()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_trading_investments
  set status = 'unlocked', updated_at = now()
  where status = 'running' and unlock_at <= now();
end;
$$;

-- ════════════════════════════════════════════════════════════
-- CRON JOBS
-- ════════════════════════════════════════════════════════════

-- Daily profit credits (every minute)
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'process-daily-profit-credits') then
    perform cron.schedule(
      'process-daily-profit-credits',
      '* * * * *',
      'select public.process_daily_profit_credits();'
    );
  end if;
end $$;

-- AI trading unlock (every hour)
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'unlock-ai-trading-investments') then
    perform cron.schedule(
      'unlock-ai-trading-investments',
      '0 * * * *',
      'select public.unlock_ai_trading_investments();'
    );
  end if;
end $$;
