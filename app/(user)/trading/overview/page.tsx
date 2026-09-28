// app/(user)/overview/page.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Clock,
  Layers,
  LayoutGrid,
  PackageCheck,
  RadioTower,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { Table } from "@/components/motion/table";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

type Scope = "all" | "ai" | "manual";
type Range = "7D" | "30D";

type ActivityRow = {
  id: string;
  date: string; // YYYY-MM-DD
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
  /** Cumulative profit per range, oldest -> newest. Starts at 0, ends at d7 / d30. */
  series: Record<Range, number[]>;
};

type OverviewData = {
  scopes: Record<Scope, ScopeData>;
  activity: ActivityRow[];
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const money = (n: number) => usd.format(n);
const signed = (n: number) => `${n >= 0 ? "+" : "-"}${usd.format(Math.abs(n))}`;
const pct = (n: number) => `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(2)}%`;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** "2025-07-18" -> "Jul 18" (timezone safe, no Date string parsing). */
function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Data (swap this hook for Supabase later)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Mock only. Deterministic bridge walk: starts at 0, ends exactly at `delta`,
 * wobbles in between. Replace with real daily cumulative P&L from your DB.
 */
function buildSeries(delta: number, n: number, seed: number): number[] {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const walk = [0];
  for (let i = 1; i < n; i++) walk.push(walk[i - 1] + (rnd() - 0.42));
  const end = walk[n - 1];
  const bridge = walk.map((w, i) => w - (i / (n - 1)) * end);
  const maxAbs = Math.max(...bridge.map(Math.abs), 1e-6);
  return bridge.map((b, i) => (i / (n - 1)) * delta + (b / maxAbs) * Math.abs(delta) * 0.16);
}

function withSeries(base: Omit<ScopeData, "series">, seed: number): ScopeData {
  return {
    ...base,
    series: {
      "7D": buildSeries(base.d7, 7, seed),
      "30D": buildSeries(base.d30, 30, seed + 7),
    },
  };
}

const MOCK: OverviewData = {
  scopes: {
    ai: withSeries(
      {
        balance: 1820.3,
        totalProfit: 820.5,
        today: 48.6,
        d7: 201.4,
        d30: 640.2,
        winRate: 68,
        trades: 142,
        status: { label: "2 active strategies", on: true, onLabel: "Running", offLabel: "Paused" },
      },
      11,
    ),
    manual: withSeries(
      {
        balance: 1820.3,
        totalProfit: 362.0,
        today: 35.97,
        d7: 111.4,
        d30: 384.2,
        winRate: 57,
        trades: 38,
        status: { label: "1 open position", on: true, onLabel: "Active", offLabel: "Idle" },
      },
      23,
    ),
    all: withSeries(
      {
        balance: 3640.6,
        totalProfit: 1182.5,
        today: 84.57,
        d7: 312.8,
        d30: 1024.4,
        winRate: 65,
        trades: 180,
        status: { label: "3 running now", on: true, onLabel: "Live", offLabel: "Idle" },
      },
      37,
    ),
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
/*  Primitives                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
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
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 id={id} className="text-sm font-semibold text-foreground">
        {title}
      </h2>
      {action && actionLabel && (
        <button
          type="button"
          onClick={action}
          className="rounded text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Delta({ value, suffix }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {signed(value)}
      {suffix ? <span className="font-medium opacity-80">{suffix}</span> : null}
    </span>
  );
}

/** Generic segmented control with a sliding pill (used for scope + range). */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  compact = false,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon?: ReactNode }[];
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const pillId = useId();
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-flex rounded-full border border-border bg-muted p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`relative z-0 inline-flex flex-1 items-center justify-center gap-1.5 rounded-full font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:flex-none ${
              compact ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs"
            } ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 -z-10 rounded-full bg-card shadow-sm"
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }
                }
              />
            )}
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const SCOPE_OPTIONS: { id: Scope; label: string; icon: ReactNode }[] = [
  { id: "all", label: "All", icon: <Layers className="size-3.5" /> },
  { id: "ai", label: "AI", icon: <Bot className="size-3.5" /> },
  { id: "manual", label: "Manual", icon: <LayoutGrid className="size-3.5" /> },
];

const RANGE_OPTIONS: { id: Range; label: string }[] = [
  { id: "7D", label: "7D" },
  { id: "30D", label: "30D" },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Interactive profit chart (pure SVG + pointer tracking)                     */
/* ────────────────────────────────────────────────────────────────────────── */

function ProfitChart({ points }: { points: number[] }) {
  const reduce = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = points.length;
  const W = 600;
  const H = 200;
  const PAD = 18;

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 0);
  const span = max - min || 1;
  const xFor = (i: number) => (i / (n - 1)) * W;
  const yFor = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2);

  const coords = points.map((p, i) => [xFor(i), yFor(p)] as const);
  const line = coords.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const [px, py] = coords[i - 1];
    const mx = ((px + x) / 2).toFixed(1);
    return `${d} C${mx},${py.toFixed(1)} ${mx},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, "");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const zeroY = yFor(0);

  const positive = points[n - 1] >= 0;
  const tone = positive ? "text-success" : "text-destructive";

  const active = hover ?? n - 1;
  const xPct = (active / (n - 1)) * 100;
  const yPct = (coords[active][1] / H) * 100;

  // Date labels are computed client-side only (chart renders after data loads).
  const base = useMemo(() => new Date(), []);
  const labelFor = (i: number) => {
    if (i === n - 1) return "Today";
    const d = new Date(base);
    d.setDate(base.getDate() - (n - 1 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const onMove = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setHover(Math.round(ratio * (n - 1)));
  };

  return (
    <div>
      <div
        ref={boxRef}
        role="img"
        aria-label={`Profit growth over ${n} days, from ${signed(points[0])} to ${signed(points[n - 1])}`}
        className="relative h-52 w-full cursor-crosshair select-none sm:h-60"
        style={{ touchAction: "pan-y" }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onPointerCancel={() => setHover(null)}
      >
        {/* Tooltip lane (reserved so it never covers the curve) */}
        <div
          className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-border bg-card px-2.5 py-1 text-center shadow-md transition-opacity duration-150 ${
            hover === null ? "opacity-0" : "opacity-100"
          }`}
          style={{ left: `${clamp(xPct, 14, 86)}%` }}
        >
          <p className="text-[10px] font-medium text-muted-foreground">{labelFor(active)}</p>
          <p
            className={`text-xs font-semibold tabular-nums ${
              points[active] >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {signed(points[active])}
          </p>
        </div>

        {/* Plot area */}
        <div className="absolute inset-x-0 bottom-0 top-12">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className={`absolute inset-0 h-full w-full overflow-visible ${tone}`}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid + zero baseline */}
            <g className="text-border">
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2={W}
                  y1={H * f}
                  y2={H * f}
                  stroke="currentColor"
                  strokeOpacity="0.5"
                  strokeDasharray="2 6"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <line
                x1="0"
                x2={W}
                y1={zeroY}
                y2={zeroY}
                stroke="currentColor"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <motion.path
              d={area}
              fill={`url(#${gradientId})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            />
            <motion.path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            />
          </svg>

          {/* Guide line */}
          <div
            className={`pointer-events-none absolute inset-y-0 w-px bg-border transition-opacity duration-150 ${
              hover === null ? "opacity-0" : "opacity-100"
            }`}
            style={{ left: `${xPct}%` }}
          />

          {/* Marker */}
          <div
            className={`pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-current bg-card transition-[left,top] duration-75 ${tone}`}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between px-0.5 text-[11px] text-muted-foreground">
        <span>{labelFor(0)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hero                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function HeroCard({
  scope,
  range,
  onRange,
  data,
  loading,
}: {
  scope: Scope;
  range: Range;
  onRange: (r: Range) => void;
  data?: ScopeData;
  loading: boolean;
}) {
  const title =
    scope === "all" ? "Total Balance" : scope === "ai" ? "AI Trading Balance" : "Manual Trading Balance";
  const icon =
    scope === "all" ? (
      <Wallet className="size-4" />
    ) : scope === "ai" ? (
      <Bot className="size-4" />
    ) : (
      <LayoutGrid className="size-4" />
    );

  const points = data?.series[range];
  const rangeDelta = data ? (range === "7D" ? data.d7 : data.d30) : 0;
  const todayPct = data ? (data.today / (data.balance - data.today)) * 100 : 0;

  return (
    <Card className="flex h-full flex-col gap-6 p-5 sm:p-7">
      {/* Balance */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-muted text-foreground">
            {icon}
          </span>
          <Eyebrow>{title}</Eyebrow>
        </div>

        {loading || !data ? (
          <>
            <Sk className="h-12 w-64 rounded-xl" />
            <Sk className="h-6 w-56 rounded-full" />
          </>
        ) : (
          <>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground sm:text-5xl">
              {money(data.balance)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Delta value={data.today} suffix={`(${pct(todayPct)})`} />
              <span className="text-xs text-muted-foreground">today</span>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div>
            <Eyebrow>Profit growth</Eyebrow>
            {loading || !data ? (
              <Sk className="mt-1.5 h-5 w-24" />
            ) : (
              <p
                className={`mt-0.5 text-sm font-semibold tabular-nums ${
                  rangeDelta >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {signed(rangeDelta)}
                <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                  last {range === "7D" ? "7 days" : "30 days"}
                </span>
              </p>
            )}
          </div>
          <Segmented value={range} onChange={onRange} options={RANGE_OPTIONS} label="Chart range" compact />
        </div>

        {loading || !points ? (
          <Sk className="mt-2 h-52 w-full rounded-2xl sm:h-60" />
        ) : (
          <ProfitChart key={`${scope}-${range}`} points={points} />
        )}
      </div>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Win rate ring + status                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function Ring({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const r = 52;
  const C = 2 * Math.PI * r;
  const target = C * (1 - clamp(value, 0, 100) / 100);

  return (
    <div className="relative size-36 sm:size-40">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-success"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduce ? target : C }}
          animate={{ strokeDashoffset: target }}
          transition={{ duration: reduce ? 0 : 1, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}%</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Win rate
          </p>
        </div>
      </div>
    </div>
  );
}

function LegendRow({
  dot,
  label,
  value,
}: {
  dot?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        {dot ? <span className={`size-2 rounded-full ${dot}`} /> : <Activity className="size-3" />}
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function WinRateCard({ data, loading }: { data?: ScopeData; loading: boolean }) {
  const wins = data ? Math.round((data.trades * data.winRate) / 100) : 0;
  const losses = data ? data.trades - wins : 0;

  return (
    <Card className="flex flex-1 flex-col items-center justify-center gap-5">
      {loading || !data ? (
        <>
          <Sk className="size-36 rounded-full sm:size-40" />
          <Sk className="h-14 w-full" />
        </>
      ) : (
        <>
          <Ring value={data.winRate} />
          <div className="w-full space-y-2 rounded-2xl bg-muted/60 px-4 py-3">
            <LegendRow dot="bg-success" label="Wins" value={String(wins)} />
            <LegendRow dot="bg-destructive" label="Losses" value={String(losses)} />
            <LegendRow label="Total trades" value={String(data.trades)} />
          </div>
        </>
      )}
    </Card>
  );
}

function StatusCard({ data, loading }: { data?: ScopeData; loading: boolean }) {
  return (
    <Card className="p-5">
      <Eyebrow>Live status</Eyebrow>
      {loading || !data ? (
        <div className="mt-3 space-y-2">
          <Sk className="h-6 w-28" />
          <Sk className="h-4 w-36" />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <span className="relative flex size-3">
            {data.status.on && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            )}
            <span
              className={`relative inline-flex size-3 rounded-full ${
                data.status.on ? "bg-success" : "bg-muted-foreground/50"
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight text-foreground">
              {data.status.on ? data.status.onLabel : data.status.offLabel}
            </p>
            <p className="truncate text-xs text-muted-foreground">{data.status.label}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Stat tiles                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function StatTile({
  label,
  caption,
  value,
  icon,
  positive,
  loading,
}: {
  label: string;
  caption: string;
  value: string;
  icon: ReactNode;
  positive?: boolean;
  loading: boolean;
}) {
  const chip =
    positive === undefined
      ? "bg-muted text-muted-foreground"
      : positive
        ? "bg-success/10 text-success"
        : "bg-destructive/10 text-destructive";
  const text =
    positive === undefined ? "text-foreground" : positive ? "text-success" : "text-destructive";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{label}</Eyebrow>
        <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${chip}`}>{icon}</span>
      </div>
      {loading ? (
        <>
          <Sk className="mt-3 h-7 w-24" />
          <Sk className="mt-2 h-3 w-16" />
        </>
      ) : (
        <>
          <p className={`mt-3 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl ${text}`}>
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{caption}</p>
        </>
      )}
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  AI vs Manual split (only on the "All" scope)                               */
/* ────────────────────────────────────────────────────────────────────────── */

function SplitCard({ ai, manual }: { ai: ScopeData; manual: ScopeData }) {
  const reduce = useReducedMotion();
  const total = ai.totalProfit + manual.totalProfit;
  const aiPct = total > 0 ? Math.round((ai.totalProfit / total) * 100) : 50;
  const manualPct = 100 - aiPct;

  const rows = [
    { label: "AI", icon: <Bot className="size-3.5" />, profit: ai.totalProfit, trades: ai.trades, share: aiPct, bar: "bg-foreground" },
    { label: "Manual", icon: <LayoutGrid className="size-3.5" />, profit: manual.totalProfit, trades: manual.trades, share: manualPct, bar: "bg-foreground/30" },
  ];

  return (
    <Card>
      <Eyebrow>Profit by source</Eyebrow>

      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted">
        {rows.map((r) => (
          <motion.div
            key={r.label}
            className={`h-full ${r.bar}`}
            initial={{ width: reduce ? `${r.share}%` : 0 }}
            animate={{ width: `${r.share}%` }}
            transition={{ duration: reduce ? 0 : 0.8, ease: EASE_OUT }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`size-2.5 shrink-0 rounded-full ${r.bar}`} />
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  {r.icon}
                  {r.label}
                  <span className="font-medium text-muted-foreground">· {r.share}%</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{r.trades} trades</p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-success">{signed(r.profit)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Activity                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const ACTIVITY_COLUMNS = [
  {
    key: "pair",
    header: "Trade",
    cell: (r: ActivityRow) => (
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
          {r.pair.slice(0, 1)}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-xs font-semibold text-foreground">{r.pair}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            {r.source === "AI" ? <Bot className="size-3" /> : <LayoutGrid className="size-3" />}
            {r.source}
          </span>
        </span>
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    width: "84px",
    cell: (r: ActivityRow) => <span className="text-xs text-muted-foreground">{shortDate(r.date)}</span>,
  },
  {
    key: "pnl",
    header: "P&L",
    width: "104px",
    align: "right" as const,
    cell: (r: ActivityRow) => (
      <span
        className={`text-xs font-semibold tabular-nums ${r.pnl >= 0 ? "text-success" : "text-destructive"}`}
      >
        {signed(r.pnl)}
      </span>
    ),
  },
];

function ActivitySkeleton() {
  return (
    <Card className="space-y-4 p-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Sk className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-14" />
          </div>
          <Sk className="h-4 w-16" />
        </div>
      ))}
    </Card>
  );
}

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
  const reduce = useReducedMotion();
  const { data, loading } = useOverviewData();
  const [scope, setScope] = useState<Scope>("all");
  const [range, setRange] = useState<Range>("7D");

  // Client-only strings to avoid hydration mismatch.
  const [today, setToday] = useState("");
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const now = new Date();
    setToday(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const s = data?.scopes[scope];

  const rows = useMemo(() => {
    if (!data) return [];
    if (scope === "all") return data.activity;
    return data.activity.filter((r) => r.source === (scope === "ai" ? "AI" : "Manual"));
  }, [data, scope]);

  return (
    <UserShell active="Overview">
      <div className="overflow-y-auto px-4 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="h-4 text-xs font-medium text-muted-foreground">{today}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Overview
              </h1>
              <p className="mt-1 h-5 text-sm text-muted-foreground">
                {greeting ? `${greeting}, here's how your trading is doing.` : ""}
              </p>
            </div>
            <Segmented
              value={scope}
              onChange={setScope}
              options={SCOPE_OPTIONS}
              label="Trading scope"
              className="w-full sm:w-auto"
            />
          </div>

          {/* Content re-enters softly whenever the scope changes */}
          <motion.div
            key={scope}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Row 1: hero + side column */}
            <section aria-label="Balance and win rate" className="grid gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <HeroCard scope={scope} range={range} onRange={setRange} data={s} loading={loading} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-4">
                <WinRateCard data={s} loading={loading} />
                <StatusCard data={s} loading={loading} />
              </div>
            </section>

            {/* Row 2: stat tiles */}
            <section aria-label="Performance" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatTile
                label="Today"
                caption="Since midnight"
                value={s ? signed(s.today) : ""}
                positive={s ? s.today >= 0 : undefined}
                icon={<Clock className="size-4" />}
                loading={loading}
              />
              <StatTile
                label="7-Day"
                caption="Rolling week"
                value={s ? signed(s.d7) : ""}
                positive={s ? s.d7 >= 0 : undefined}
                icon={<CalendarDays className="size-4" />}
                loading={loading}
              />
              <StatTile
                label="30-Day"
                caption="Rolling month"
                value={s ? signed(s.d30) : ""}
                positive={s ? s.d30 >= 0 : undefined}
                icon={<CalendarDays className="size-4" />}
                loading={loading}
              />
              <StatTile
                label="Total Profit"
                caption="All time"
                value={s ? signed(s.totalProfit) : ""}
                positive={s ? s.totalProfit >= 0 : undefined}
                icon={<TrendingUp className="size-4" />}
                loading={loading}
              />
            </section>

            {/* Row 3: activity + split/notifications */}
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
              <section aria-labelledby="activity-heading" className="min-w-0 lg:col-span-8">
                <SectionHeader
                  id="activity-heading"
                  title="Recent Activity"
                  actionLabel="View all"
                  action={() => {}}
                />
                {loading ? (
                  <ActivitySkeleton />
                ) : rows.length === 0 ? (
                  <Card className="py-12 text-center text-sm text-muted-foreground">
                    No trades yet for this view.
                  </Card>
                ) : (
                  <Table
                    data={rows}
                    columns={ACTIVITY_COLUMNS}
                    getRowId={(r) => r.id}
                    height={340}
                    rowHeight={56}
                  />
                )}
              </section>

              <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-4">
                {scope === "all" && data ? (
                  <SplitCard ai={data.scopes.ai} manual={data.scopes.manual} />
                ) : null}

                <section aria-labelledby="notifications-heading">
                  <SectionHeader id="notifications-heading" title="Notifications" />
                  <BouncyAccordion defaultValue="1" items={NOTIFICATIONS} />
                </section>
              </div>
            </div>
          </motion.div>

          <div className="h-20" />
        </div>
      </div>
    </UserShell>
  );
}