// app/(user)/overview/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  LayoutGrid,
  Wallet,
  Activity,
  ShieldCheck,
  PackageCheck,
  RadioTower,
} from "lucide-react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { Table } from "@/components/motion/table";

// ── Shared primitives (same pattern as dashboard/page.tsx) ─────────────────

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

// ── Recent activity table (combined AI + manual) ────────────────────────────

type ActivityRow = {
  id: string;
  date: string;
  source: "AI" | "Manual";
  pair: string;
  pnl: string;
  positive: boolean;
};

const RECENT_ACTIVITY: ActivityRow[] = [
  { id: "a1", date: "2025-07-18", source: "AI",     pair: "BTC/USDT", pnl: "+$14.20", positive: true  },
  { id: "a2", date: "2025-07-18", source: "Manual",  pair: "ETH/USDT", pnl: "+$22.00", positive: true  },
  { id: "a3", date: "2025-07-17", source: "AI",     pair: "SOL/USDT", pnl: "-$6.40",  positive: false },
  { id: "a4", date: "2025-07-17", source: "Manual",  pair: "BNB/USDT", pnl: "-$8.10",  positive: false },
  { id: "a5", date: "2025-07-16", source: "AI",     pair: "BTC/USDT", pnl: "+$31.80", positive: true  },
  { id: "a6", date: "2025-07-16", source: "AI",     pair: "ETH/USDT", pnl: "+$9.60",  positive: true  },
];

const ACTIVITY_COLUMNS = [
  { key: "date",   header: "Date",   width: "110px" },
  { key: "source", header: "Source", width: "90px",
    cell: (r: ActivityRow) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
        {r.source === "AI" ? <Bot className="size-3.5" /> : <LayoutGrid className="size-3.5" />}
        {r.source}
      </span>
    ),
  },
  { key: "pair",   header: "Pair",   width: "110px" },
  { key: "pnl",    header: "P&L",    align: "right" as const,
    cell: (r: ActivityRow) => (
      <span className={`text-xs font-semibold ${r.positive ? "text-success" : "text-destructive"}`}>
        {r.pnl}
      </span>
    ),
  },
];

export default function OverviewPage() {
  const loading = false;

  return (
    <UserShell active="Overview">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Overview
          </h1>
        </div>

        {/* ── Balances ──────────────────────────────────── */}
        <section aria-label="Balances">
          <SectionHeader title="Balances" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card>
              <Stat
                label="Trading Balance"
                value="$3,640.60"
                icon={<Wallet className="size-3.5" />}
                loading={loading}
              />
            </Card>
            <Card>
              <Stat
                label="AI Trading Balance"
                value="$1,820.30"
                icon={<Bot className="size-3.5" />}
                loading={loading}
              />
            </Card>
            <Card>
              <Stat
                label="Manual Trading Balance"
                value="$1,820.30"
                icon={<LayoutGrid className="size-3.5" />}
                loading={loading}
              />
            </Card>
          </div>
        </section>

        {/* ── Profit breakdown ──────────────────────────── */}
        <section aria-label="Profit Breakdown">
          <SectionHeader title="Profit Breakdown" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total AI Profit",     value: "+$820.50",   positive: true,  icon: <Bot className="size-3.5" /> },
              { label: "Total Manual Profit", value: "+$362.00",   positive: true,  icon: <LayoutGrid className="size-3.5" /> },
              { label: "Today's PnL",         value: "+$84.57",    positive: true,  icon: <Activity className="size-3.5" /> },
              { label: "Overall PnL",         value: "+$1,182.50", positive: true,  icon: <TrendingUpIcon /> },
            ].map((item) => (
              <Card key={item.label}>
                <Stat
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  delta={{ value: item.positive ? "Profit" : "Loss", positive: item.positive }}
                  loading={loading}
                />
              </Card>
            ))}
          </div>
        </section>

        {/* ── P&L windows ──────────────────────────────── */}
        <section aria-label="Profit and Loss windows">
          <SectionHeader title="Profit & Loss" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Today's P/L", value: "+$84.57",    positive: true },
              { label: "7-Day P/L",   value: "+$312.80",   positive: true },
              { label: "30-Day P/L",  value: "+$1,024.40", positive: true },
              { label: "Total P/L",   value: "+$3,480.55", positive: true },
            ].map((item) => (
              <Card key={item.label}>
                <Stat
                  label={item.label}
                  value={item.value}
                  delta={{ value: item.positive ? "Realized" : "Unrealized", positive: item.positive }}
                  loading={loading}
                />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Status cards ─────────────────────────────── */}
        <section aria-label="Status">
          <SectionHeader title="Status" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-foreground/5 text-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">AI Trading</p>
                    <p className="text-xs text-muted-foreground">2 active strategies</p>
                  </div>
                </div>
                <Badge label="Running" tone="success" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-foreground/5 text-foreground">
                    <LayoutGrid className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Manual Trading</p>
                    <p className="text-xs text-muted-foreground">1 open position</p>
                  </div>
                </div>
                <Badge label="Active" tone="success" />
              </div>
            </Card>
          </div>
        </section>

        {/* ── Recent Activity ───────────────────────────── */}
        <section aria-label="Recent Activity">
          <SectionHeader title="Recent Activity" actionLabel="View all" action={() => {}} />
          <Table
            data={RECENT_ACTIVITY}
            columns={ACTIVITY_COLUMNS}
            getRowId={(r) => r.id}
            height={260}
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
                title: "AI Strategy Profit Credited",
                description: "9 EMA strategy credited +$14.20 to your balance.",
                icon: <RadioTower className="h-4 w-4" />,
              },
              {
                id: "2",
                title: "Manual Trade Closed",
                description: "ETH/USDT position closed with +$22.00 profit.",
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

function TrendingUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
