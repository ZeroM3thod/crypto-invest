// app/(user)/investment/overview/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Eye,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Table } from "@/components/motion/table";

// ── Shared primitives (same as dashboard) ───────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "destructive" | "muted" | "warning";
}) {
  const colors: Record<string, string> = {
    default:     "bg-primary/10 text-primary",
    success:     "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted:       "bg-muted text-muted-foreground",
    warning:     "bg-yellow-500/10 text-yellow-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}
    >
      {label}
    </span>
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

function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  message: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

type PlanStatus = "Active" | "Paused" | "Completed" | "Expired";

type ActivePlan = {
  id: string;
  name: string;
  tier: string;
  invested: string;
  dailyRate: string;
  startDate: string;
  endDate: string;
  earned: string;
  status: PlanStatus;
  progress: number;
};

const ACTIVE_PLANS: ActivePlan[] = [
  {
    id: "p1",
    name: "Growth Pro",
    tier: "Pro",
    invested: "$2,000.00",
    dailyRate: "1.2%",
    startDate: "2025-06-01",
    endDate: "2025-08-01",
    earned: "+$548.80",
    status: "Active",
    progress: 72,
  },
  {
    id: "p2",
    name: "Starter Pack",
    tier: "Starter",
    invested: "$1,500.00",
    dailyRate: "0.8%",
    startDate: "2025-07-01",
    endDate: "2025-09-01",
    earned: "+$288.00",
    status: "Active",
    progress: 45,
  },
  {
    id: "p3",
    name: "Elite Bundle",
    tier: "Elite",
    invested: "$1,500.00",
    dailyRate: "1.8%",
    startDate: "2025-07-10",
    endDate: "2025-10-10",
    earned: "+$403.20",
    status: "Paused",
    progress: 28,
  },
];

type HistoryRow = {
  id: string;
  name: string;
  amount: string;
  startDate: string;
  endDate: string;
  totalReturn: string;
  status: PlanStatus;
};

const INVESTMENT_HISTORY: HistoryRow[] = [
  { id: "h1", name: "Growth Starter", amount: "$1,000.00", startDate: "2025-02-01", endDate: "2025-04-01", totalReturn: "+$320.00", status: "Completed" },
  { id: "h2", name: "Basic Plan",     amount: "$500.00",   startDate: "2025-01-15", endDate: "2025-03-15", totalReturn: "+$96.00",  status: "Completed" },
  { id: "h3", name: "Pro Monthly",    amount: "$2,000.00", startDate: "2024-12-01", endDate: "2025-02-01", totalReturn: "+$432.00", status: "Completed" },
  { id: "h4", name: "Quick Start",    amount: "$300.00",   startDate: "2025-04-10", endDate: "2025-05-10", totalReturn: "$0.00",    status: "Expired"   },
  { id: "h5", name: "Test Plan",      amount: "$200.00",   startDate: "2025-05-01", endDate: "2025-05-15", totalReturn: "$0.00",    status: "Expired"   },
];

type HistoryFilter = "All" | PlanStatus;
const FILTERS: HistoryFilter[] = ["All", "Active", "Completed", "Expired", "Paused"];

const statusTone = (s: PlanStatus): "success" | "warning" | "destructive" | "muted" => {
  if (s === "Active")    return "success";
  if (s === "Paused")    return "warning";
  if (s === "Completed") return "muted";
  return "destructive";
};

const HISTORY_COLUMNS = [
  { key: "name",        header: "Plan Name",     width: "160px" },
  { key: "amount",      header: "Amount",        width: "120px", align: "right" as const },
  { key: "startDate",   header: "Start Date",    width: "120px" },
  { key: "endDate",     header: "End Date",      width: "120px" },
  {
    key: "totalReturn",
    header: "Total Return",
    width: "120px",
    align: "right" as const,
    cell: (r: HistoryRow) => (
      <span className={`text-xs font-semibold ${r.totalReturn.startsWith("+") ? "text-success" : "text-muted-foreground"}`}>
        {r.totalReturn}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "110px",
    cell: (r: HistoryRow) => <Badge label={r.status} tone={statusTone(r.status)} />,
  },
];

// ── Active Plan Card ─────────────────────────────────────────────────────────

function ActivePlanCard({ plan }: { plan: ActivePlan }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{plan.name}</p>
            <Badge label={plan.tier} tone="default" />
          </div>
          <Badge label={plan.status} tone={statusTone(plan.status)} />
        </div>
        <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <TrendingUp className="size-4" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Invested</span>
          <span className="font-medium text-foreground">{plan.invested}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Daily Rate</span>
          <span className="font-medium text-foreground">{plan.dailyRate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Start Date</span>
          <span className="font-medium text-foreground">{plan.startDate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">End Date</span>
          <span className="font-medium text-foreground">{plan.endDate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Returns So Far</span>
          <span className="font-semibold text-success">{plan.earned}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Duration elapsed</span>
          <span>{plan.progress}%</span>
        </div>
        <ProgressBar value={plan.progress} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eye className="size-3" />
          View Details
        </button>
        {plan.status === "Active" || plan.status === "Paused" ? (
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" />
            Cancel
          </button>
        ) : null}
      </div>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InvestmentOverviewPage() {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("All");
  const loading = false;

  const filteredHistory =
    historyFilter === "All"
      ? INVESTMENT_HISTORY
      : INVESTMENT_HISTORY.filter((r) => r.status === historyFilter);

  return (
    <UserShell active="Overview">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ───────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Investment Overview
          </h1>
        </div>

        {/* ── Summary Stats ──────────────────────── */}
        <section aria-label="Investment Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Invested",       value: "$5,000.00", delta: { value: "Across 3 plans",  positive: true  } },
              { label: "Total Returns Earned", value: "+$1,240.00", delta: { value: "All time",        positive: true  } },
              { label: "Active Plans",         value: "3",          delta: { value: "Running now",     positive: true  } },
              { label: "ROI %",                value: "+24.8%",     delta: { value: "Lifetime return", positive: true  } },
            ].map((item) => (
              <Card key={item.label}>
                <Stat
                  label={item.label}
                  value={item.value}
                  delta={item.delta}
                  loading={loading}
                />
              </Card>
            ))}
          </div>
        </section>

        {/* ── New Investment CTA ──────────────────── */}
        <div className="flex justify-end">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="size-3.5" />
            New Investment
          </button>
        </div>

        {/* ── Active Plans ────────────────────────── */}
        <section aria-label="Active Investment Plans">
          <SectionHeader title="Active Plans" actionLabel="View all plans" action={() => {}} />
          {ACTIVE_PLANS.length === 0 ? (
            <Card>
              <EmptyState
                icon={TrendingUp}
                message="You have no active investment plans yet."
                actionLabel="Start your first investment"
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVE_PLANS.map((plan) => (
                <ActivePlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </section>

        {/* ── Investment History ──────────────────── */}
        <section aria-label="Investment History">
          <SectionHeader title="Investment History" />

          {/* Filter bar */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilter(f)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  historyFilter === f
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">No results for selected filter.</p>
              </div>
            </Card>
          ) : (
            <Table
              data={filteredHistory}
              columns={HISTORY_COLUMNS}
              getRowId={(r) => r.id}
              height={280}
              rowHeight={44}
            />
          )}
        </section>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}
