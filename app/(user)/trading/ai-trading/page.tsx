// app/(user)/ai-trading/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Lock,
  LockOpen,
  Calendar,
  Percent,
  Wallet,
  ShieldCheck,
  PackageCheck,
  RadioTower,
} from "lucide-react";
import { useState } from "react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { Table } from "@/components/motion/table";
import { StatefulButton, type ButtonState } from "@/components/motion/button";

// ── Shared primitives ────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" }) {
  const colors: Record<string, string> = {
    default:     "bg-foreground/10 text-foreground",
    success:     "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted:       "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}>
      {label}
    </span>
  );
}

function Stat({ label, value, delta, loading = false, icon }: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-lg font-semibold text-foreground">{value}</p>
      )}
      {delta && !loading && (
        <p className={`flex items-center gap-1 text-xs font-medium ${delta.positive ? "text-success" : "text-destructive"}`}>
          {delta.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta.value}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }: {
  title: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action && actionLabel && (
        <button
          type="button"
          onClick={action}
          className="text-xs font-medium text-foreground/80 transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Strategy tier data ───────────────────────────────────────────────────
// Each tier = a stake bracket on the "9 EMA" (or other) strategy. Lock period
// is fixed at 15 days from the moment a user invests in a plan; funds can't
// be withdrawn until that window elapses.

type StrategyStatus = "not-invested" | "running" | "unlocked";

type Strategy = {
  id: string;
  name: string;
  exchange: string;
  minStake: number;
  roiPct: number;          // total ROI % since inception, this tier
  daysRunning: number;
  lockDays: number;        // fixed at 15
  daysElapsed: number;     // how many of the lock days have passed (0 if not invested)
  status: StrategyStatus;
  invested?: number;
  currentProfit?: number;
};

const STRATEGIES: Strategy[] = [
  {
    id: "s1",
    name: "9 EMA Strategy",
    exchange: "Binance",
    minStake: 20,
    roiPct: 18.4,
    daysRunning: 62,
    lockDays: 15,
    daysElapsed: 15,
    status: "unlocked",
    invested: 20,
    currentProfit: 3.68,
  },
  {
    id: "s2",
    name: "Momentum Breakout",
    exchange: "Binance",
    minStake: 40,
    roiPct: 24.1,
    daysRunning: 48,
    lockDays: 15,
    daysElapsed: 9,
    status: "running",
    invested: 40,
    currentProfit: 9.64,
  },
  {
    id: "s3",
    name: "Grid Scalper Pro",
    exchange: "Binance",
    minStake: 70,
    roiPct: 31.7,
    daysRunning: 35,
    lockDays: 15,
    daysElapsed: 0,
    status: "not-invested",
  },
  {
    id: "s4",
    name: "Trend Reversal AI",
    exchange: "Binance",
    minStake: 100,
    roiPct: 42.9,
    daysRunning: 21,
    lockDays: 15,
    daysElapsed: 0,
    status: "not-invested",
  },
];

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const isLocked = strategy.status === "running";
  const isUnlocked = strategy.status === "unlocked";
  const isEmpty = strategy.status === "not-invested";
  const daysLeft = Math.max(0, strategy.lockDays - strategy.daysElapsed);
  const [state, setState] = useState<ButtonState>("idle");

  const runAction = async () => {
    if (state === "loading") return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 800));
    setState("success");
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/5 text-foreground">
            <Bot className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">{strategy.name}</p>
            <p className="text-[11px] text-muted-foreground">{strategy.exchange} · min ${strategy.minStake}</p>
          </div>
        </div>
        {isEmpty && <Badge label="Available" tone="muted" />}
        {isLocked && <Badge label="Locked" tone="destructive" />}
        {isUnlocked && <Badge label="Unlocked" tone="success" />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Min. Stake</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">${strategy.minStake.toFixed(2)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Percent className="size-3" /> Total ROI
          </p>
          <p className="mt-0.5 text-sm font-semibold text-success">+{strategy.roiPct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Calendar className="size-3" /> Days Running
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{strategy.daysRunning}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Lock Period</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{strategy.lockDays} days</p>
        </div>
      </div>

      {!isEmpty && (
        <div className="mt-4 space-y-2 rounded-2xl bg-background p-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Your Invested</span>
            <span className="font-medium text-foreground">${strategy.invested?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Profit</span>
            <span className="font-medium text-success">+${strategy.currentProfit?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Withdrawal</span>
            <span className={`flex items-center gap-1 font-medium ${isUnlocked ? "text-success" : "text-destructive"}`}>
              {isUnlocked ? <LockOpen className="size-3" /> : <Lock className="size-3" />}
              {isUnlocked ? "Available now" : `Unlocks in ${daysLeft}d`}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isEmpty && (
          <StatefulButton
            className="h-10 w-full text-xs"
            variant="success"
            state={state}
            onClick={runAction}
          >
            Invest from ${strategy.minStake}
          </StatefulButton>
        )}
        {isLocked && (
          <button
            type="button"
            disabled
            className="h-10 w-full cursor-not-allowed rounded-full bg-muted text-xs font-semibold text-muted-foreground"
          >
            Locked until {strategy.lockDays - strategy.daysElapsed}d remain
          </button>
        )}
        {isUnlocked && (
          <StatefulButton
            className="h-10 w-full text-xs"
            variant="destructive"
            state={state}
            onClick={runAction}
          >
            Withdraw
          </StatefulButton>
        )}
      </div>
    </Card>
  );
}

// ── AI trade history (feeds the "trade history" table for this page) ───────

type AiTrade = {
  id: string;
  date: string;
  strategy: string;
  pair: string;
  pnl: string;
  positive: boolean;
};

const AI_TRADES: AiTrade[] = [
  { id: "ai1", date: "2025-07-18", strategy: "9 EMA Strategy",      pair: "BTC/USDT", pnl: "+$14.20", positive: true  },
  { id: "ai2", date: "2025-07-18", strategy: "Momentum Breakout",   pair: "ETH/USDT", pnl: "+$9.60",  positive: true  },
  { id: "ai3", date: "2025-07-17", strategy: "9 EMA Strategy",      pair: "SOL/USDT", pnl: "-$6.40",  positive: false },
  { id: "ai4", date: "2025-07-16", strategy: "Momentum Breakout",   pair: "BTC/USDT", pnl: "+$31.80", positive: true  },
];

const AI_TRADE_COLUMNS = [
  { key: "date",     header: "Date",     width: "110px" },
  { key: "strategy", header: "Strategy", width: "160px" },
  { key: "pair",     header: "Pair",     width: "110px" },
  { key: "pnl",      header: "P&L",      align: "right" as const,
    cell: (r: AiTrade) => (
      <span className={`text-xs font-semibold ${r.positive ? "text-success" : "text-destructive"}`}>
        {r.pnl}
      </span>
    ),
  },
];

export default function AiTradingPage() {
  const loading = false;
  const totalInvested = STRATEGIES.reduce((sum, s) => sum + (s.invested ?? 0), 0);
  const totalProfit = STRATEGIES.reduce((sum, s) => sum + (s.currentProfit ?? 0), 0);
  const activeCount = STRATEGIES.filter((s) => s.status !== "not-invested").length;

  return (
    <UserShell active="AI Trading">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Header ────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">AI-managed strategies</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            AI Trading
          </h1>
        </div>

        {/* ── Summary stats ─────────────────────────────── */}
        <section aria-label="AI Trading Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <Stat label="AI Trading Balance" value="$1,820.30" icon={<Wallet className="size-3.5" />} loading={loading} />
            </Card>
            <Card>
              <Stat label="Total Invested" value={`$${totalInvested.toFixed(2)}`} icon={<Bot className="size-3.5" />} loading={loading} />
            </Card>
            <Card>
              <Stat
                label="Total AI Profit"
                value={`+$${totalProfit.toFixed(2)}`}
                delta={{ value: "All time", positive: true }}
                loading={loading}
              />
            </Card>
            <Card>
              <Stat label="Active Strategies" value={String(activeCount)} loading={loading} />
            </Card>
          </div>
        </section>

        {/* ── Strategy cards ────────────────────────────── */}
        <section aria-label="Strategies">
          <SectionHeader title="Strategies" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STRATEGIES.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Every plan locks your stake for 15 days from the day you invest — withdrawals open automatically once the lock period ends. Past performance does not guarantee future results.
          </p>
        </section>

        {/* ── AI activity / trade history ───────────────── */}
        <section aria-label="AI Trade History">
          <SectionHeader title="AI Trade History" actionLabel="View all" action={() => {}} />
          <Table
            data={AI_TRADES}
            columns={AI_TRADE_COLUMNS}
            getRowId={(r) => r.id}
            height={240}
            rowHeight={44}
          />
        </section>

        {/* ── Notifications ─────────────────────────────── */}
        <section aria-label="Notifications">
          <SectionHeader title="Notifications" />
          <BouncyAccordion
            defaultValue="1"
            items={[
              {
                id: "1",
                title: "9 EMA Strategy Unlocked",
                description: "Your 15-day lock has ended — withdrawal is now available.",
                icon: <RadioTower className="h-4 w-4" />,
              },
              {
                id: "2",
                title: "Momentum Breakout Profit Credited",
                description: "+$9.60 credited to your AI Trading balance.",
                icon: <PackageCheck className="h-4 w-4" />,
              },
              {
                id: "3",
                title: "New Login Detected",
                description: "New login detected from Dhaka, Bangladesh.",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
            ]}
          />
        </section>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}
