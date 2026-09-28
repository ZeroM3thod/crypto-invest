// app/(user)/overview/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  LayoutGrid,
  Wallet,
  ShieldCheck,
  PackageCheck,
  RadioTower,
  Layers,
  Activity,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { Table } from "@/components/motion/table";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

type Tone = "default" | "success" | "destructive" | "muted";
type Scope = "all" | "ai" | "manual";

type ActivityRow = {
  id: string;
  date: string;
  source: "AI" | "Manual";
  pair: string;
  pnl: number;
};

type ScopeData = {
  balance: number;
  totalProfit: number;
  today: number;
  d7: number;
  d30: number;
  winRate: number;
  trades: number;
  status: { label: string; on: boolean; onLabel: string; offLabel: string };
  /** 7 points, oldest -> newest, used for the hero sparkline */
  spark: number[];
};

type OverviewData = {
  scopes: Record<Scope, ScopeData>;
  activity: ActivityRow[];
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const money = (n: number) => usd.format(n);
const signed = (n: number) => `${n >= 0 ? "+" : "-"}${usd.format(Math.abs(n))}`;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Data (swap this hook for Supabase later)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const MOCK: OverviewData = {
  scopes: {
    ai: {
      balance: 1820.3,
      totalProfit: 820.5,
      today: 48.6,
      d7: 201.4,
      d30: 640.2,
      winRate: 68,
      trades: 142,
      status: { label: "2 active strategies", on: true, onLabel: "Running", offLabel: "Paused" },
      spark: [12, 28, 22, 40, 36, 52, 61],
    },
    manual: {
      balance: 1820.3,
      totalProfit: 362.0,
      today: 35.97,
      d7: 111.4,
      d30: 384.2,
      winRate: 57,
      trades: 38,
      status: { label: "1 open position", on: true, onLabel: "Active", offLabel: "Idle" },
      spark: [8, 6, 18, 14, 25, 22, 30],
    },
    all: {
      balance: 3640.6,
      totalProfit: 1182.5,
      today: 84.57,
      d7: 312.8,
      d30: 1024.4,
      winRate: 65,
      trades: 180,
      status: { label: "3 running now", on: true, onLabel: "Live", offLabel: "Idle" },
      spark: [20, 34, 40, 54, 61, 74, 91],
    },
  },
  activity: [
    { id: "a1", date: "2025-07-18", source: "AI",     pair: "BTC/USDT", pnl: 14.2 },
    { id: "a2", date: "2025-07-18", source: "Manual", pair: "ETH/USDT", pnl: 22.0 },
    { id: "a3", date: "2025-07-17", source: "AI",     pair: "SOL/USDT", pnl: -6.4 },
    { id: "a4", date: "2025-07-17", source: "Manual", pair: "BNB/USDT", pnl: -8.1 },
    { id: "a5", date: "2025-07-16", source: "AI",     pair: "BTC/USDT", pnl: 31.8 },
    { id: "a6", date: "2025-07-16", source: "AI",     pair: "ETH/USDT", pnl: 9.6 },
  ],
};

function useOverviewData() {
  const [data, setData] = useState<OverviewData | null>(null);
  useEffect(() => {
    // TODO: replace with a Supabase query.
    const id = setTimeout(() => setData(MOCK), 400);
    return () => clearTimeout(id);
  }, []);
  return { data, loading: data === null };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Primitives (same tokens as before)                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>{children}</div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: Tone }) {
  const colors: Record<Tone, string> = {
    default: "bg-foreground/10 text-foreground",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}
    >
      {label}
    </span>
  );
}

function SectionHeader({
  id,
  title,
  action,
  actionLabel,
}: {
  id: string;
  title: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 id={id} className="text-sm font-semibold text-foreground">
        {title}
      </h2>
      {action && actionLabel && (
        <button
          type="button"
          onClick={action}
          className="rounded text-xs font-medium text-foreground/80 outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positive ? "text-success" : "text-destructive"
      }`}
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {signed(value)}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Scope tabs                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const TABS: { id: Scope; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Layers className="size-3.5" /> },
  { id: "ai", label: "AI", icon: <Bot className="size-3.5" /> },
  { id: "manual", label: "Manual", icon: <LayoutGrid className="size-3.5" /> },
];

function ScopeTabs({ value, onChange }: { value: Scope; onChange: (s: Scope) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Trading scope"
      className="inline-flex rounded-full border border-border bg-muted p-1"
    >
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sparkline (pure SVG, uses currentColor so it follows theme tokens)         */
/* ────────────────────────────────────────────────────────────────────────── */

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 240;
  const h = 72;
  const pad = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0]},${h} L${coords[0][0]},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-full w-full ${positive ? "text-success" : "text-destructive"}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" opacity="0.1" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hero balance card                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function HeroCard({
  scope,
  data,
  loading,
}: {
  scope: Scope;
  data?: ScopeData;
  loading: boolean;
}) {
  const title =
    scope === "all" ? "Total Balance" : scope === "ai" ? "AI Trading Balance" : "Manual Trading Balance";
  const icon =
    scope === "all" ? <Wallet className="size-3.5" /> : scope === "ai" ? <Bot className="size-3.5" /> : <LayoutGrid className="size-3.5" />;

  return (
    <Card className="p-7 sm:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] md:items-end">
        {/* Left: balance */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{icon}</span>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
          </div>

          {loading || !data ? (
            <div className="h-11 w-56 animate-pulse rounded-xl bg-muted" />
          ) : (
            <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {money(data.balance)}
            </p>
          )}

          {loading || !data ? (
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Delta value={data.today} />
              <span className="text-xs text-muted-foreground">today</span>
              <span className="text-xs text-muted-foreground">·</span>
              <Badge
                label={data.status.on ? data.status.onLabel : data.status.offLabel}
                tone={data.status.on ? "success" : "muted"}
              />
              <span className="text-xs text-muted-foreground">{data.status.label}</span>
            </div>
          )}
        </div>

        {/* Right: sparkline */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Last 7 days
          </p>
          <div className="h-16 w-full">
            {loading || !data ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
            ) : (
              <Sparkline points={data.spark} positive={data.d7 >= 0} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Metric tile (compact, used in the strip under the hero)                    */
/* ────────────────────────────────────────────────────────────────────────── */

function Tile({
  label,
  value,
  icon,
  positive,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
  loading: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </div>
      {loading ? (
        <div className="mt-2 h-6 w-20 animate-pulse rounded-md bg-muted" />
      ) : (
        <p
          className={`mt-2 text-lg font-semibold ${
            positive === undefined
              ? "text-foreground"
              : positive
              ? "text-success"
              : "text-destructive"
          }`}
        >
          {value}
        </p>
      )}
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Activity table                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

const ACTIVITY_COLUMNS = [
  { key: "date", header: "Date", width: "110px" },
  {
    key: "source",
    header: "Source",
    width: "90px",
    cell: (r: ActivityRow) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
        {r.source === "AI" ? <Bot className="size-3.5" /> : <LayoutGrid className="size-3.5" />}
        {r.source}
      </span>
    ),
  },
  { key: "pair", header: "Pair", width: "110px" },
  {
    key: "pnl",
    header: "P&L",
    align: "right" as const,
    cell: (r: ActivityRow) => (
      <span className={`text-xs font-semibold ${r.pnl >= 0 ? "text-success" : "text-destructive"}`}>
        {signed(r.pnl)}
      </span>
    ),
  },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Notifications                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

const NOTIFICATIONS = [
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
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export default function OverviewPage() {
  const { data, loading } = useOverviewData();
  const [scope, setScope] = useState<Scope>("all");

  // Client-only date to avoid hydration mismatch.
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    );
  }, []);

  const s = data?.scopes[scope];

  // Activity follows the selected tab.
  const rows = useMemo(() => {
    if (!data) return [];
    if (scope === "all") return data.activity;
    return data.activity.filter((r) => r.source === (scope === "ai" ? "AI" : "Manual"));
  }, [data, scope]);

  return (
    <UserShell active="Overview">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Header row: greeting + tabs */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="h-4 text-xs font-medium text-muted-foreground">{today}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Overview
            </h1>
          </div>
          <ScopeTabs value={scope} onChange={setScope} />
        </div>

        <div className="space-y-6">
          {/* Hero */}
          <section aria-label="Balance">
            <HeroCard scope={scope} data={s} loading={loading} />
          </section>

          {/* Metric strip */}
          <section aria-labelledby="perf-heading">
            <SectionHeader id="perf-heading" title="Performance" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Tile
                label="7-Day"
                value={s ? signed(s.d7) : ""}
                positive={s ? s.d7 >= 0 : undefined}
                icon={<CalendarDays className="size-3.5" />}
                loading={loading}
              />
              <Tile
                label="30-Day"
                value={s ? signed(s.d30) : ""}
                positive={s ? s.d30 >= 0 : undefined}
                icon={<CalendarDays className="size-3.5" />}
                loading={loading}
              />
              <Tile
                label="Total Profit"
                value={s ? signed(s.totalProfit) : ""}
                positive={s ? s.totalProfit >= 0 : undefined}
                icon={<TrendingUp className="size-3.5" />}
                loading={loading}
              />
              <Tile
                label="Win Rate"
                value={s ? `${s.winRate}% · ${s.trades} trades` : ""}
                icon={<Activity className="size-3.5" />}
                loading={loading}
              />
            </div>
          </section>

          {/* Activity + notifications side by side */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-labelledby="activity-heading" className="min-w-0">
              <SectionHeader
                id="activity-heading"
                title="Recent Activity"
                actionLabel="View all"
                action={() => {}}
              />
              <Table
                data={rows}
                columns={ACTIVITY_COLUMNS}
                getRowId={(r) => r.id}
                height={260}
                rowHeight={44}
              />
            </section>

            <section aria-labelledby="notifications-heading" className="min-w-0">
              <SectionHeader id="notifications-heading" title="Notifications" />
              <BouncyAccordion defaultValue="1" items={NOTIFICATIONS} />
            </section>
          </div>
        </div>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}