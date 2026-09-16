// app/(user)/dashboard/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  CloudLightning,
  Cpu,
  Landmark,
  LayoutGrid,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─── Tiny reusable primitives (no new design — pure Tailwind tokens from globals.css) ───

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" }) {
  const colors: Record<string, string> = {
    default:     "bg-primary/10 text-primary",
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

function Stat({ label, value, delta, loading = false }: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
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
          className="text-xs font-medium text-primary transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message, actionLabel }: {
  icon: React.ElementType;
  message: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "inactive" | "pending" | "paused" }) {
  const colors: Record<string, string> = {
    active:   "bg-success",
    inactive: "bg-muted-foreground",
    pending:  "bg-primary",
    paused:   "bg-destructive",
  };
  return <span className={`inline-block size-1.5 rounded-full ${colors[status]}`} />;
}

// ─── Static mock data (replace with real API calls) ───────────────────────────

const QUICK_ACTIONS = [
  { label: "Deposit",      icon: ArrowDownRight,     href: "/fund/deposit" },
  { label: "Withdraw",     icon: ArrowUpRight,       href: "/fund/withdraw" },
  { label: "Transfer",     icon: RefreshCw,          href: "/fund/transfer" },
  { label: "Invest",       icon: TrendingUp,         href: "/investment" },
  { label: "Trade",        icon: LayoutGrid,         href: "/trading" },
  { label: "AI Trading",   icon: Bot,                href: "/investment/ai-trading" },
  { label: "Cloud Mining", icon: CloudLightning,     href: "/investment/cloud-mining" },
] as const;

const RECENT_TRANSACTIONS = [
  { id: "1", type: "Deposit",          amount: "+$500.00",  status: "Completed", date: "Today, 09:14" },
  { id: "2", type: "Investment",       amount: "-$200.00",  status: "Completed", date: "Today, 08:31" },
  { id: "3", type: "Mining Earnings",  amount: "+$12.40",   status: "Completed", date: "Yesterday" },
  { id: "4", type: "AI Trading Profit",amount: "+$34.17",   status: "Completed", date: "Yesterday" },
  { id: "5", type: "Withdrawal",       amount: "-$100.00",  status: "Pending",   date: "2 days ago" },
];

const RECENT_TRADES = [
  { id: "1", pair: "BTC/USDT", side: "BUY",  price: "$67,240",  amount: "0.003 BTC", total: "$201.72",  date: "Today, 10:02" },
  { id: "2", pair: "ETH/USDT", side: "SELL", price: "$3,512",   amount: "0.05 ETH",  total: "$175.60",  date: "Today, 09:45" },
  { id: "3", pair: "SOL/USDT", side: "BUY",  price: "$182",     amount: "1.2 SOL",   total: "$218.40",  date: "Yesterday" },
];

const NOTIFICATIONS = [
  { id: "1", message: "Your deposit of $500 has been confirmed.",       time: "9 min ago",  tone: "success" as const },
  { id: "2", message: "AI Trading strategy activated successfully.",     time: "1 hr ago",   tone: "default" as const },
  { id: "3", message: "New login detected from Dhaka, Bangladesh.",      time: "3 hrs ago",  tone: "destructive" as const },
  { id: "4", message: "Mining contract #MC-882 earnings credited.",      time: "Yesterday",  tone: "success" as const },
];

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState<"1D" | "7D" | "1M" | "3M" | "6M" | "1Y">("1M");
  const loading = false; // flip to true to preview skeleton states

  const chartRanges = ["1D", "7D", "1M", "3M", "6M", "1Y"] as const;

  return (
    <UserShell active="Dashboard">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Good morning, Ava.
          </h1>
        </div>

        {/* ── Account Summary ───────────────────────────── */}
        <section aria-label="Account Summary">
          <SectionHeader title="Account Summary" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total Assets",      value: "$12,480.55", delta: { value: "+2.4% today", positive: true } },
              { label: "Available Balance", value: "$3,210.00" },
              { label: "Invested",          value: "$5,500.00" },
              { label: "Trading Balance",   value: "$1,820.30" },
              { label: "Mining Balance",    value: "$980.25" },
              { label: "Referral Balance",  value: "$970.00" },
            ].map((s) => (
              <Card key={s.label}>
                <Stat label={s.label} value={s.value} delta={s.delta} loading={loading} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── P&L Overview ──────────────────────────────── */}
        <section aria-label="Profit and Loss">
          <SectionHeader title="Profit & Loss" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Today's P/L",  value: "+$84.57",    positive: true },
              { label: "7-Day P/L",    value: "+$312.80",   positive: true },
              { label: "30-Day P/L",   value: "+$1,024.40", positive: true },
              { label: "Total P/L",    value: "+$3,480.55", positive: true },
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

        {/* ── Portfolio Chart ───────────────────────────── */}
        <section aria-label="Portfolio Performance">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionHeader title="Portfolio Performance" />
              <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                {chartRanges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                      chartRange === r
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart placeholder — swap with your real chart component */}
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted">
              <svg viewBox="0 0 400 120" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,90 C40,85 70,70 100,60 C130,50 160,75 200,55 C240,35 270,40 310,25 C350,10 380,15 400,10 L400,120 L0,120 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,90 C40,85 70,70 100,60 C130,50 160,75 200,55 C240,35 270,40 310,25 C350,10 380,15 400,10"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
              </svg>
              <p className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
                Connect chart API for live data
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Portfolio Value",  value: "$12,480" },
                { label: "Investment Value", value: "$5,500" },
                { label: "Trading Value",    value: "$1,820" },
                { label: "Mining Value",     value: "$980" },
              ].map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} loading={loading} />
              ))}
            </div>
          </Card>
        </section>

        {/* ── Activity Overview Row ─────────────────────── */}
        <section aria-label="Activity Overview">
          <SectionHeader title="Activity Overview" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Investment */}
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Investment</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium text-foreground">$5,500.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Plans</span>
                  <span className="font-medium text-foreground">3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today's Profit</span>
                  <span className="font-medium text-success">+$28.40</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Profit</span>
                  <span className="font-medium text-success">+$1,240.00</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View Investments
              </button>
            </Card>

            {/* AI Trading */}
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">AI Trading</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trading Balance</span>
                  <span className="font-medium text-foreground">$1,820.30</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Strategies</span>
                  <span className="font-medium text-foreground">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current P/L</span>
                  <span className="font-medium text-success">+$34.17</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total P/L</span>
                  <span className="font-medium text-success">+$820.50</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">Past performance does not guarantee future results.</p>
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View AI Trading
              </button>
            </Card>

            {/* Cloud Mining */}
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CloudLightning className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Cloud Mining</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Contracts</span>
                  <span className="font-medium text-foreground">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium text-foreground">$980.25</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Hashrate</span>
                  <span className="font-medium text-foreground">120 TH/s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today's Earnings</span>
                  <span className="font-medium text-success">+$12.40</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View Mining
              </button>
            </Card>

          </div>
        </section>

        {/* ── Manual Trading + Referral Row ─────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Manual Trading */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Manual Trading</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Trading Balance</span>
                <span className="font-medium text-foreground">$1,820.30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Open Positions</span>
                <span className="font-medium text-foreground">1</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Today's P/L</span>
                <span className="font-medium text-success">+$22.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-medium text-foreground">$4,820.00</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Trade
              </button>
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                History
              </button>
            </div>
          </Card>

          {/* Referral */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Referral</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Referrals</span>
                <span className="font-medium text-foreground">14</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Referrals</span>
                <span className="font-medium text-foreground">9</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="font-medium text-success">+$970.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pending Earnings</span>
                <span className="font-medium text-foreground">$120.00</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Referrals
              </button>
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Earnings
              </button>
            </div>
          </Card>
        </div>

        {/* ── Quick Actions ─────────────────────────────── */}
        <section aria-label="Quick Actions">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Recent Transactions ───────────────────────── */}
        <section aria-label="Recent Transactions">
          <SectionHeader title="Recent Transactions" actionLabel="View All" action={() => {}} />
          <Card className="p-0 overflow-hidden">
            {RECENT_TRANSACTIONS.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Wallet} message="No transactions yet." actionLabel="Make a Deposit" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground sm:table-cell">Status</th>
                      <th className="hidden px-5 py-3 text-right font-medium text-muted-foreground md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_TRANSACTIONS.map((tx, i) => (
                      <tr
                        key={tx.id}
                        className={`transition-colors hover:bg-muted/40 ${i < RECENT_TRANSACTIONS.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">{tx.type}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${tx.amount.startsWith("+") ? "text-success" : "text-foreground"}`}>
                          {tx.amount}
                        </td>
                        <td className="hidden px-5 py-3 sm:table-cell">
                          <Badge
                            label={tx.status}
                            tone={tx.status === "Completed" ? "success" : tx.status === "Failed" ? "destructive" : "muted"}
                          />
                        </td>
                        <td className="hidden px-5 py-3 text-right text-muted-foreground md:table-cell">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        {/* ── Recent Trades ─────────────────────────────── */}
        <section aria-label="Recent Trades">
          <SectionHeader title="Recent Trades" actionLabel="View All Trades" action={() => {}} />
          <Card className="p-0 overflow-hidden">
            {RECENT_TRADES.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={LayoutGrid} message="No trades yet." actionLabel="Start Trading" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Pair</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Side</th>
                      <th className="hidden px-5 py-3 text-right font-medium text-muted-foreground sm:table-cell">Price</th>
                      <th className="hidden px-5 py-3 text-right font-medium text-muted-foreground sm:table-cell">Amount</th>
                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="hidden px-5 py-3 text-right font-medium text-muted-foreground md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_TRADES.map((trade, i) => (
                      <tr
                        key={trade.id}
                        className={`transition-colors hover:bg-muted/40 ${i < RECENT_TRADES.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <td className="px-5 py-3 font-semibold text-foreground">{trade.pair}</td>
                        <td className="px-5 py-3">
                          <Badge
                            label={trade.side}
                            tone={trade.side === "BUY" ? "success" : "destructive"}
                          />
                        </td>
                        <td className="hidden px-5 py-3 text-right text-muted-foreground sm:table-cell">{trade.price}</td>
                        <td className="hidden px-5 py-3 text-right text-muted-foreground sm:table-cell">{trade.amount}</td>
                        <td className="px-5 py-3 text-right font-medium text-foreground">{trade.total}</td>
                        <td className="hidden px-5 py-3 text-right text-muted-foreground md:table-cell">{trade.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        {/* ── Notifications + Announcements ────────────── */}
        <section aria-label="Notifications">
          <SectionHeader title="Notifications" actionLabel="View All" action={() => {}} />
          <div className="space-y-2">
            {NOTIFICATIONS.length === 0 ? (
              <Card>
                <EmptyState icon={Zap} message="You're all caught up." actionLabel="View Settings" />
              </Card>
            ) : (
              NOTIFICATIONS.map((n) => (
                <Card key={n.id} className="flex items-start gap-3 py-3.5">
                  <StatusDot
                    status={n.tone === "success" ? "active" : n.tone === "destructive" ? "paused" : "pending"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Bottom breathing room for GlobalDock */}
        <div className="h-20" />
      </div>
    </UserShell>
  );
}