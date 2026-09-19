// app/(user)/investment/daily-profit/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Search,
  CalendarDays,
  TableProperties,
} from "lucide-react";
import { useState } from "react";
import { Table } from "@/components/motion/table";
import {
  ReturnsCalendar,
  ReturnsCalendarGrid,
  ReturnsCalendarTooltip,
} from "@/components/charts/returns-calendar";

// ── Shared primitives (same as dashboard) ───────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  loading = false,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-lg font-semibold text-foreground">{value}</p>
      )}
      {delta && !loading && (
        <p
          className={`flex items-center gap-1 text-xs font-medium ${
            delta.positive ? "text-success" : "text-destructive"
          }`}
        >
          {delta.positive ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {delta.value}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  action,
  actionLabel,
}: {
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

// ── Data ─────────────────────────────────────────────────────────────────────

type DailyProfitRow = {
  id: string;
  date: string;
  plan: string;
  rate: string;
  invested: string;
  profit: string;
  cumulative: string;
};

const DAILY_PROFIT_DATA: DailyProfitRow[] = [
  { id: "dp1",  date: "2025-07-18", plan: "Growth Pro",    rate: "1.2%", invested: "$2,000.00", profit: "+$24.00",  cumulative: "+$1,240.00" },
  { id: "dp2",  date: "2025-07-18", plan: "Starter Pack",  rate: "0.8%", invested: "$1,500.00", profit: "+$12.00",  cumulative: "+$1,216.00" },
  { id: "dp3",  date: "2025-07-17", plan: "Growth Pro",    rate: "1.2%", invested: "$2,000.00", profit: "+$24.00",  cumulative: "+$1,204.00" },
  { id: "dp4",  date: "2025-07-17", plan: "Starter Pack",  rate: "0.8%", invested: "$1,500.00", profit: "+$12.00",  cumulative: "+$1,180.00" },
  { id: "dp5",  date: "2025-07-16", plan: "Growth Pro",    rate: "1.2%", invested: "$2,000.00", profit: "+$24.00",  cumulative: "+$1,168.00" },
  { id: "dp6",  date: "2025-07-16", plan: "Starter Pack",  rate: "0.8%", invested: "$1,500.00", profit: "+$12.00",  cumulative: "+$1,144.00" },
  { id: "dp7",  date: "2025-07-15", plan: "Growth Pro",    rate: "1.2%", invested: "$2,000.00", profit: "+$24.00",  cumulative: "+$1,132.00" },
  { id: "dp8",  date: "2025-07-15", plan: "Starter Pack",  rate: "0.8%", invested: "$1,500.00", profit: "+$12.00",  cumulative: "+$1,108.00" },
  { id: "dp9",  date: "2025-07-14", plan: "Growth Pro",    rate: "1.2%", invested: "$2,000.00", profit: "+$24.00",  cumulative: "+$1,096.00" },
  { id: "dp10", date: "2025-07-14", plan: "Elite Bundle",  rate: "1.8%", invested: "$1,500.00", profit: "+$27.00",  cumulative: "+$1,072.00" },
];

const PROFIT_COLUMNS = [
  { key: "date",       header: "Date",              width: "120px" },
  { key: "plan",       header: "Plan Name",         width: "150px" },
  { key: "rate",       header: "Rate Applied",      width: "110px" },
  { key: "invested",   header: "Invested Amount",   width: "140px", align: "right" as const },
  {
    key: "profit",
    header: "Profit Credited",
    width: "130px",
    align: "right" as const,
    cell: (r: DailyProfitRow) => (
      <span className="text-xs font-semibold text-success">{r.profit}</span>
    ),
  },
  {
    key: "cumulative",
    header: "Cumulative Total",
    align: "right" as const,
    cell: (r: DailyProfitRow) => (
      <span className="text-xs font-semibold text-success">{r.cumulative}</span>
    ),
  },
];

// ── Calendar heatmap data (reuse ReturnsCalendar pattern) ───────────────────

const CALENDAR_RETURNS: number[][] = [
  [0, 0, 0, 0, 0, 0, 8.4, 9.2, 10.1, 11.0, 12.4, 11.8],
];

// ── Toggle button ────────────────────────────────────────────────────────────

type ViewMode = "table" | "calendar";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DailyProfitPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [planFilter, setPlanFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const loading = false;

  const filtered = DAILY_PROFIT_DATA.filter((r) => {
    const matchesPlan = planFilter
      ? r.plan.toLowerCase().includes(planFilter.toLowerCase())
      : true;
    const matchesFrom = dateFrom ? r.date >= dateFrom : true;
    const matchesTo   = dateTo   ? r.date <= dateTo   : true;
    return matchesPlan && matchesFrom && matchesTo;
  });

  return (
    <UserShell active="Daily Profit">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ───────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Daily Profit
          </h1>
        </div>

        {/* ── Summary Stats ──────────────────────── */}
        <section aria-label="Profit Summary">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Today's Profit",             value: "+$36.00",   delta: { value: "Credited today",  positive: true } },
              { label: "This Month's Profit",        value: "+$248.00",  delta: { value: "July 2025",       positive: true } },
              { label: "All-Time Profit",            value: "+$1,240.00",delta: { value: "Since inception", positive: true } },
            ].map((item) => (
              <Card key={item.label}>
                <Stat label={item.label} value={item.value} delta={item.delta} loading={loading} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Daily Profit Table ──────────────────── */}
        <section aria-label="Daily Profit Records">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">Profit Records</h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-xl bg-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TableProperties className="size-3" />
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    viewMode === "calendar"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="size-3" />
                  Calendar
                </button>
              </div>

              {/* Export */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download className="size-3" />
                Export CSV
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              {/* Filter bar */}
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter by plan…"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-4xl border border-border bg-card p-6">
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No results for selected filters.
                    </p>
                  </div>
                </div>
              ) : (
                <Table
                  data={filtered}
                  columns={PROFIT_COLUMNS}
                  getRowId={(r) => r.id}
                  height={340}
                  rowHeight={44}
                />
              )}
            </>
          ) : (
            /* ── Calendar heatmap view ── */
            <section aria-label="Monthly Profit Calendar">
              <SectionHeader title="Monthly Profit Heatmap" />
              <ReturnsCalendar
                className="w-full"
                years={[2025]}
                returns={CALENDAR_RETURNS}
              >
                <ReturnsCalendarGrid>
                  <ReturnsCalendarTooltip />
                </ReturnsCalendarGrid>
              </ReturnsCalendar>
            </section>
          )}
        </section>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}
