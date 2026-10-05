# Package Management admin pages (Daily Profit and AI Trading)

I built both pages in the same beui.dev style as your user pages: `rounded-4xl` cards, the same tokens (`border-border`, `bg-card`, `text-success`), the motion `Table`, and spring modals. I haven't run them against your project. Your `@/components/motion/table` and `AnimatedSidebar` components are only known from your existing usage, so check the `Table` column props (`key`, `header`, `width`, `align`, `cell`) first if something looks off.

## Guide

**File structure** (this matches the routes already in your `ROUTES` map):

```
app/(admin)/_components/admin-ui.tsx                       ← shared primitives (new)
app/(admin)/admin/investment/daily-profit/page.tsx         ← Daily Profit management
app/(admin)/admin/ai-trading/daily-profit/page.tsx         ← AI Trading management
```

**Steps**
1. Create `admin-ui.tsx`. Both pages import `Card`, `Badge`, `Stat`, `Modal`, `Field` and the button classes from it.
2. Create the two pages.
3. Wire the `TODO: API` comments to your backend. All data is mock state, so each page works visually right away.
4. In `admin-shell.tsx`, the Package Management items already map to these routes. The `active` labels used are `"Daily Profit"` and `"AI Trading"`, which match your `destinations` children.

**Behaviour notes**
- **Daily Profit:** the admin can add or edit every plan field: name, badge, daily %, minimum, cancel hold hours, payout text, return type, and an active toggle. Use the toggle instead of deleting a plan, so running investors aren't orphaned. Below the plans is an investor list with plan filter and search, showing name, email, wallet balance, invested amount, earned amount, running time and status.
- **AI Trading:** the admin can create or edit a strategy: name, exchange, minimum stake, lock days, days running, total ROI and daily ROI. Selecting a strategy shows its investors with working time and lock progress. Each investor has **Unlock now** and **Extend lock**.
- **Lock rules:** editing a strategy's `lockDays` only affects future investors. Each investment stores its own `lockDays`, so extending one user doesn't change anyone else.
- **Daily ROI payouts:** the page only stores the number. Actually crediting users should be done by a server cron job that reads `dailyRoi`.

---

## 1. `app/(admin)/_components/admin-ui.tsx`

```tsx
"use client";

import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

// ── Class helpers ────────────────────────────────────────────────────────
export const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-2xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-destructive";

export const btnSmall =
  "inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Primitives ───────────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>{children}</div>
  );
}

export function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "destructive" | "muted";
}) {
  const colors: Record<string, string> = {
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

export function Stat({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {delta && (
        <p
          className={`flex items-center gap-1 text-xs font-medium ${
            delta.positive ? "text-success" : "text-destructive"
          }`}
        >
          {delta.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta.value}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-success" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ── Modal (portal + spring, same feel as your invest dialog) ─────────────
export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-4xl border border-border bg-card shadow-xl sm:rounded-4xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-3 p-6 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
                {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-2">{children}</div>
            {footer && <div className="flex gap-2 p-6 pt-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Time helper ──────────────────────────────────────────────────────────
export function workingTime(startedAtISO: string) {
  const ms = Math.max(0, Date.now() - new Date(startedAtISO).getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}
```

---

## 2. `app/(admin)/admin/investment/daily-profit/page.tsx`

```tsx
// Daily Profit management (admin)
"use client";

import { AdminShell } from "@/app/(admin)/_components/admin-shell";
import {
  Badge, Card, Field, Modal, SectionHeader, Stat, Toggle,
  btnGhost, btnPrimary, fmt, inputCls, workingTime,
} from "@/app/(admin)/_components/admin-ui";
import { Table } from "@/components/motion/table";
import { Clock, Pencil, Plus, Search, TrendingUp, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────
type Plan = {
  id: string;
  name: string;
  badge: string;
  rate: number;            // daily %
  minimum: number;         // minimum join fee
  cancelAfterHours: number; // cancel policy
  payout: string;
  returnType: string;
  active: boolean;
};

type Investor = {
  id: string;
  planId: string;
  name: string;
  email: string;
  walletBalance: number;
  invested: number;
  earned: number;
  startedAt: string; // ISO
  status: "active" | "cancelled";
};

// ── Mock data (replace with API) ─────────────────────────────────────────
const INITIAL_PLANS: Plan[] = [
  { id: "starter", name: "Starter Plan", badge: "Starter", rate: 1.7, minimum: 10, cancelAfterHours: 24, payout: "Principal + profits", returnType: "Simple interest", active: true },
  { id: "growth",  name: "Growth Plan",  badge: "Growth",  rate: 2.1, minimum: 30, cancelAfterHours: 24, payout: "Principal + profits", returnType: "Simple interest", active: true },
  { id: "elite",   name: "Elite Plan",   badge: "Elite",   rate: 2.5, minimum: 50, cancelAfterHours: 24, payout: "Principal + profits", returnType: "Simple interest", active: true },
];

const INITIAL_INVESTORS: Investor[] = [
  { id: "i1", planId: "growth",  name: "Rahim Uddin",   email: "rahim@mail.com",  walletBalance: 1240.0, invested: 100, earned: 4.2,  startedAt: "2026-09-28T09:00:00Z", status: "active" },
  { id: "i2", planId: "starter", name: "Nusrat Jahan",  email: "nusrat@mail.com", walletBalance: 86.5,   invested: 50,  earned: 0.85, startedAt: "2026-10-04T14:30:00Z", status: "active" },
  { id: "i3", planId: "elite",   name: "Karim Hossain", email: "karim@mail.com",  walletBalance: 5320.9, invested: 200, earned: 35,   startedAt: "2026-09-20T11:10:00Z", status: "active" },
  { id: "i4", planId: "elite",   name: "Sadia Akter",   email: "sadia@mail.com",  walletBalance: 410.0,  invested: 60,  earned: 7.5,  startedAt: "2026-09-25T16:45:00Z", status: "cancelled" },
];

// ── Form state (strings so number inputs can be edited freely) ───────────
type PlanForm = {
  id: string | null; // null = creating
  name: string;
  badge: string;
  rate: string;
  minimum: string;
  cancelAfterHours: string;
  payout: string;
  returnType: string;
  active: boolean;
};

const EMPTY_FORM: PlanForm = {
  id: null, name: "", badge: "", rate: "", minimum: "",
  cancelAfterHours: "24", payout: "Principal + profits", returnType: "Simple interest", active: true,
};

const planToForm = (p: Plan): PlanForm => ({
  id: p.id, name: p.name, badge: p.badge, rate: String(p.rate), minimum: String(p.minimum),
  cancelAfterHours: String(p.cancelAfterHours), payout: p.payout, returnType: p.returnType, active: p.active,
});

// ── Investor table columns ───────────────────────────────────────────────
type Row = Investor & { planName: string };

const COLUMNS = [
  { key: "name", header: "Name", width: "150px" },
  { key: "email", header: "Email", width: "190px" },
  { key: "planName", header: "Plan", width: "120px" },
  {
    key: "walletBalance", header: "Balance", width: "110px", align: "right" as const,
    cell: (r: Row) => <span className="text-xs font-medium text-foreground">${fmt(r.walletBalance)}</span>,
  },
  {
    key: "invested", header: "Invested", width: "100px", align: "right" as const,
    cell: (r: Row) => <span className="text-xs font-medium text-foreground">${fmt(r.invested)}</span>,
  },
  {
    key: "earned", header: "Earned", width: "100px", align: "right" as const,
    cell: (r: Row) => <span className="text-xs font-semibold text-success">+${fmt(r.earned)}</span>,
  },
  {
    key: "startedAt", header: "Running", width: "90px",
    cell: (r: Row) => <span className="text-xs text-muted-foreground">{workingTime(r.startedAt)}</span>,
  },
  {
    key: "status", header: "Status", width: "100px",
    cell: (r: Row) => (
      <Badge label={r.status} tone={r.status === "active" ? "success" : "muted"} />
    ),
  },
];

// ── Plan card (admin version) ────────────────────────────────────────────
function AdminPlanCard({
  plan, investors, onEdit, onToggle, onViewUsers,
}: {
  plan: Plan;
  investors: Investor[];
  onEdit: () => void;
  onToggle: (v: boolean) => void;
  onViewUsers: () => void;
}) {
  const running = investors.filter((i) => i.status === "active");
  const totalInvested = running.reduce((s, i) => s + i.invested, 0);

  return (
    <div className={`flex flex-col rounded-4xl border border-border bg-card p-6 ${plan.active ? "" : "opacity-70"}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <TrendingUp className="size-4" />
            {plan.badge}
          </span>
          <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{plan.rate}%</p>
          <p className="text-[10px] font-medium text-muted-foreground">per day</p>
        </div>
      </div>

      <ul className="mb-4 space-y-2.5">
        {[
          { label: "Minimum", value: `$${fmt(plan.minimum)}` },
          { label: "Cancel policy", value: `After ${plan.cancelAfterHours} hours` },
          { label: "Payout", value: plan.payout },
          { label: "Return type", value: plan.returnType },
          { label: "Running users", value: String(running.length) },
          { label: "Total invested", value: `$${fmt(totalInvested)}` },
        ].map((item) => (
          <li key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {plan.active ? "Visible to users" : "Hidden from users"}
        </span>
        <Toggle checked={plan.active} onChange={onToggle} label={`Toggle ${plan.name}`} />
      </div>

      <div className="mt-auto flex gap-2">
        <button type="button" onClick={onViewUsers} className={`${btnGhost} flex-1`}>
          <Users className="size-4" /> Users
        </button>
        <button type="button" onClick={onEdit} className={`${btnPrimary} flex-1`}>
          <Pencil className="size-4" /> Edit
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function AdminDailyProfitPage() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [investors] = useState<Investor[]>(INITIAL_INVESTORS);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [planFilter, setPlanFilter] = useState<"all" | string>("all");
  const [query, setQuery] = useState("");

  // Stats
  const activeInvestors = investors.filter((i) => i.status === "active");
  const totalInvested = activeInvestors.reduce((s, i) => s + i.invested, 0);
  const dailyPayout = activeInvestors.reduce((s, i) => {
    const p = plans.find((p) => p.id === i.planId);
    return s + (p ? (i.invested * p.rate) / 100 : 0);
  }, 0);

  // Table rows
  const rows: Row[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return investors
      .filter((i) => planFilter === "all" || i.planId === planFilter)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
      .map((i) => ({ ...i, planName: plans.find((p) => p.id === i.planId)?.name ?? "—" }));
  }, [investors, plans, planFilter, query]);

  // Save plan (create or edit)
  function handleSave() {
    if (!form) return;
    const rate = parseFloat(form.rate);
    const minimum = parseFloat(form.minimum);
    const hours = parseInt(form.cancelAfterHours, 10);

    if (!form.name.trim()) return setError("Plan name is required");
    if (!form.badge.trim()) return setError("Badge label is required");
    if (!(rate > 0)) return setError("Daily profit % must be greater than 0");
    if (!(minimum > 0)) return setError("Minimum join fee must be greater than 0");
    if (!(hours >= 0)) return setError("Cancel hold time must be 0 or more hours");

    const next: Plan = {
      id: form.id ?? form.name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: form.name.trim(), badge: form.badge.trim(), rate, minimum,
      cancelAfterHours: hours, payout: form.payout.trim(), returnType: form.returnType.trim(),
      active: form.active,
    };

    // TODO: API → form.id ? PATCH /api/admin/daily-profit/plans/:id : POST /api/admin/daily-profit/plans
    setPlans((prev) =>
      form.id ? prev.map((p) => (p.id === form.id ? next : p)) : [...prev, next],
    );
    setError(null);
    setForm(null);
  }

  const set = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <AdminShell active="Daily Profit">
      <div className="space-y-8 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Package Management</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Daily Profit Plans
            </h1>
          </div>
          <button
            type="button"
            onClick={() => { setError(null); setForm({ ...EMPTY_FORM }); }}
            className={btnPrimary}
          >
            <Plus className="size-4" /> New plan
          </button>
        </div>

        {/* Stats */}
        <section aria-label="Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><Stat label="Total Plans" value={String(plans.length)} icon={<TrendingUp className="size-3.5" />} /></Card>
            <Card><Stat label="Running Users" value={String(activeInvestors.length)} icon={<Users className="size-3.5" />} /></Card>
            <Card><Stat label="Total Invested" value={`$${fmt(totalInvested)}`} icon={<Wallet className="size-3.5" />} /></Card>
            <Card>
              <Stat
                label="Daily Payout"
                value={`$${fmt(dailyPayout)}`}
                icon={<Clock className="size-3.5" />}
                delta={{ value: "Owed per 24h cycle", positive: false }}
              />
            </Card>
          </div>
        </section>

        {/* Plans */}
        <section aria-label="Plans">
          <SectionHeader
            title="Plans"
            description="Edit rate, minimum, cancel policy and visibility. Changes apply to new investments only."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <AdminPlanCard
                key={plan.id}
                plan={plan}
                investors={investors.filter((i) => i.planId === plan.id)}
                onEdit={() => { setError(null); setForm(planToForm(plan)); }}
                onToggle={(v) =>
                  // TODO: API → PATCH /api/admin/daily-profit/plans/:id { active }
                  setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, active: v } : p)))
                }
                onViewUsers={() => {
                  setPlanFilter(plan.id);
                  document.getElementById("plan-investors")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            ))}
          </div>
        </section>

        {/* Investors */}
        <section aria-label="Plan investors" id="plan-investors">
          <SectionHeader
            title="Running Investments"
            description="Every user who has invested in a plan."
          />

          <div className="mb-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted p-1">
              {[{ id: "all", label: "All plans" }, ...plans.map((p) => ({ id: p.id, label: p.badge }))].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPlanFilter(f.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    planFilter === f.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative min-w-52 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                className={`${inputCls} h-9 pl-9 text-xs`}
              />
            </div>
          </div>

          {rows.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Search className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No investors match.</p>
              </div>
            </Card>
          ) : (
            <Table
              data={rows}
              columns={COLUMNS}
              getRowId={(r: Row) => r.id}
              height={Math.min(420, 56 + rows.length * 48)}
              rowHeight={48}
            />
          )}
        </section>

        <div className="h-20" />
      </div>

      {/* Create / edit modal */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit plan" : "New plan"}
        subtitle="Changes apply to new investments. Running investments keep their original rate."
        footer={
          <>
            <button type="button" onClick={() => setForm(null)} className={`${btnGhost} flex-1`}>Cancel</button>
            <button type="button" onClick={handleSave} className={`${btnPrimary} flex-1`}>
              {form?.id ? "Save changes" : "Create plan"}
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Plan name">
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Growth Plan" />
              </Field>
              <Field label="Badge label">
                <input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Growth" />
              </Field>
              <Field label="Daily profit (%)">
                <input className={inputCls} type="number" step="0.01" min="0" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
              </Field>
              <Field label="Minimum join fee ($)">
                <input className={inputCls} type="number" min="0" value={form.minimum} onChange={(e) => set("minimum", e.target.value)} />
              </Field>
            </div>
            <Field label="Cancel policy (hours)" hint="User can cancel only after this many hours. Use 0 for instant cancel.">
              <input className={inputCls} type="number" min="0" value={form.cancelAfterHours} onChange={(e) => set("cancelAfterHours", e.target.value)} />
            </Field>
            <Field label="Payout text">
              <input className={inputCls} value={form.payout} onChange={(e) => set("payout", e.target.value)} />
            </Field>
            <Field label="Return type">
              <input className={inputCls} value={form.returnType} onChange={(e) => set("returnType", e.target.value)} />
            </Field>
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <span className="text-xs text-muted-foreground">Active (visible to users)</span>
              <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Active" />
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
```

---

## 3. `app/(admin)/admin/ai-trading/daily-profit/page.tsx`

```tsx
// AI Trading management (admin)
"use client";

import { AdminShell } from "@/app/(admin)/_components/admin-shell";
import {
  Badge, Card, Field, Modal, SectionHeader, Stat,
  btnDanger, btnGhost, btnPrimary, btnSmall, fmt, inputCls, workingTime,
} from "@/app/(admin)/_components/admin-ui";
import { Table } from "@/components/motion/table";
import { Bot, Calendar, Lock, LockOpen, Pencil, Percent, Plus, Search, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────
type Strategy = {
  id: string;
  name: string;
  exchange: string;
  minStake: number;
  lockDays: number;     // default lock for NEW investors
  daysRunning: number;
  totalRoi: number;     // % since inception
  dailyRoi: number;     // % set by admin
};

type Investment = {
  id: string;
  strategyId: string;
  name: string;
  email: string;
  invested: number;
  profit: number;
  startedAt: string;       // ISO
  lockDays: number;        // THIS user's lock (can be extended)
  forceUnlocked: boolean;  // admin override
};

// ── Mock data (replace with API) ─────────────────────────────────────────
const INITIAL_STRATEGIES: Strategy[] = [
  { id: "s1", name: "9 EMA Strategy",    exchange: "Binance", minStake: 20,  lockDays: 15, daysRunning: 62, totalRoi: 18.4, dailyRoi: 0.3 },
  { id: "s2", name: "Momentum Breakout", exchange: "Binance", minStake: 40,  lockDays: 15, daysRunning: 48, totalRoi: 24.1, dailyRoi: 0.5 },
  { id: "s3", name: "Grid Scalper Pro",  exchange: "Binance", minStake: 70,  lockDays: 15, daysRunning: 35, totalRoi: 31.7, dailyRoi: 0.9 },
  { id: "s4", name: "Trend Reversal AI", exchange: "Binance", minStake: 100, lockDays: 15, daysRunning: 21, totalRoi: 42.9, dailyRoi: 2.0 },
];

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const INITIAL_INVESTMENTS: Investment[] = [
  { id: "v1", strategyId: "s1", name: "Rahim Uddin",   email: "rahim@mail.com",  invested: 20,  profit: 3.68, startedAt: daysAgo(16), lockDays: 15, forceUnlocked: false },
  { id: "v2", strategyId: "s2", name: "Nusrat Jahan",  email: "nusrat@mail.com", invested: 40,  profit: 9.64, startedAt: daysAgo(9),  lockDays: 15, forceUnlocked: false },
  { id: "v3", strategyId: "s2", name: "Karim Hossain", email: "karim@mail.com",  invested: 120, profit: 21.5, startedAt: daysAgo(3),  lockDays: 15, forceUnlocked: false },
  { id: "v4", strategyId: "s4", name: "Sadia Akter",   email: "sadia@mail.com",  invested: 300, profit: 12.0, startedAt: daysAgo(6),  lockDays: 15, forceUnlocked: false },
];

// ── Lock helpers ─────────────────────────────────────────────────────────
function lockInfo(inv: Investment) {
  const elapsed = (Date.now() - new Date(inv.startedAt).getTime()) / 86400000;
  const daysLeft = Math.max(0, Math.ceil(inv.lockDays - elapsed));
  const unlocked = inv.forceUnlocked || daysLeft === 0;
  const pct = unlocked ? 100 : Math.min(100, (elapsed / inv.lockDays) * 100);
  return { unlocked, daysLeft, pct };
}

// ── Strategy form ────────────────────────────────────────────────────────
type StrategyForm = {
  id: string | null;
  name: string;
  exchange: string;
  minStake: string;
  lockDays: string;
  daysRunning: string;
  totalRoi: string;
  dailyRoi: string;
};

const EMPTY_FORM: StrategyForm = {
  id: null, name: "", exchange: "Binance", minStake: "", lockDays: "15",
  daysRunning: "0", totalRoi: "0", dailyRoi: "",
};

const toForm = (s: Strategy): StrategyForm => ({
  id: s.id, name: s.name, exchange: s.exchange, minStake: String(s.minStake),
  lockDays: String(s.lockDays), daysRunning: String(s.daysRunning),
  totalRoi: String(s.totalRoi), dailyRoi: String(s.dailyRoi),
});

// ── Strategy card ────────────────────────────────────────────────────────
function AdminStrategyCard({
  strategy, investorCount, totalStaked, onEdit, onViewUsers,
}: {
  strategy: Strategy;
  investorCount: number;
  totalStaked: number;
  onEdit: () => void;
  onViewUsers: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/5 text-foreground">
            <Bot className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">{strategy.name}</p>
            <p className="text-[11px] text-muted-foreground">{strategy.exchange}</p>
          </div>
        </div>
        <Badge label={`${strategy.dailyRoi}% / day`} tone="success" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Min. Stake</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">${fmt(strategy.minStake)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Percent className="size-3" /> Total ROI
          </p>
          <p className="mt-0.5 text-sm font-semibold text-success">+{strategy.totalRoi.toFixed(1)}%</p>
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

      <div className="mt-4 space-y-2 rounded-2xl bg-background p-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Investors</span>
          <span className="font-medium text-foreground">{investorCount}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total staked</span>
          <span className="font-medium text-foreground">${fmt(totalStaked)}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onViewUsers} className={`${btnGhost} h-10 flex-1 text-xs`}>
          <Users className="size-3.5" /> Users
        </button>
        <button type="button" onClick={onEdit} className={`${btnPrimary} h-10 flex-1 text-xs`}>
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
type Row = Investment & { status: "locked" | "unlocked"; daysLeft: number; pct: number };

export default function AdminAiTradingPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);

  const [form, setForm] = useState<StrategyForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>(INITIAL_STRATEGIES[0].id);
  const [query, setQuery] = useState("");

  const [action, setAction] = useState<{ type: "unlock" | "extend"; inv: Investment } | null>(null);
  const [extendDays, setExtendDays] = useState("7");

  const selected = strategies.find((s) => s.id === selectedId);

  // Stats
  const totalStaked = investments.reduce((s, i) => s + i.invested, 0);
  const avgDaily = strategies.length
    ? strategies.reduce((s, x) => s + x.dailyRoi, 0) / strategies.length
    : 0;

  // Rows for investors table
  const rows: Row[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return investments
      .filter((i) => i.strategyId === selectedId)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
      .map((i) => {
        const { unlocked, daysLeft, pct } = lockInfo(i);
        return { ...i, status: unlocked ? "unlocked" : "locked", daysLeft, pct };
      });
  }, [investments, selectedId, query]);

  // ── Strategy save ──
  const set = <K extends keyof StrategyForm>(k: K, v: StrategyForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  function handleSaveStrategy() {
    if (!form) return;
    const minStake = parseFloat(form.minStake);
    const lockDays = parseInt(form.lockDays, 10);
    const daysRunning = parseInt(form.daysRunning, 10);
    const totalRoi = parseFloat(form.totalRoi);
    const dailyRoi = parseFloat(form.dailyRoi);

    if (!form.name.trim()) return setFormError("Package name is required");
    if (!(minStake > 0)) return setFormError("Minimum stake must be greater than 0");
    if (!(lockDays >= 0)) return setFormError("Lock period must be 0 or more days");
    if (!(daysRunning >= 0)) return setFormError("Total running days must be 0 or more");
    if (Number.isNaN(totalRoi)) return setFormError("Total ROI is required");
    if (!(dailyRoi >= 0)) return setFormError("Daily ROI must be 0 or more");

    const next: Strategy = {
      id: form.id ?? "s" + Date.now(),
      name: form.name.trim(), exchange: form.exchange.trim() || "Binance",
      minStake, lockDays, daysRunning, totalRoi, dailyRoi,
    };

    // TODO: API → form.id ? PATCH /api/admin/ai-trading/strategies/:id : POST /api/admin/ai-trading/strategies
    setStrategies((prev) =>
      form.id ? prev.map((s) => (s.id === form.id ? next : s)) : [...prev, next],
    );
    if (!form.id) setSelectedId(next.id);
    setFormError(null);
    setForm(null);
  }

  // ── Per-user actions ──
  function confirmUnlock() {
    if (!action) return;
    // TODO: API → POST /api/admin/ai-trading/investments/:id/unlock
    setInvestments((prev) =>
      prev.map((i) => (i.id === action.inv.id ? { ...i, forceUnlocked: true } : i)),
    );
    setAction(null);
  }

  function confirmExtend() {
    if (!action) return;
    const days = parseInt(extendDays, 10);
    if (!(days > 0)) return;
    // TODO: API → POST /api/admin/ai-trading/investments/:id/extend { days }
    setInvestments((prev) =>
      prev.map((i) =>
        i.id === action.inv.id
          ? { ...i, lockDays: i.lockDays + days, forceUnlocked: false }
          : i,
      ),
    );
    setAction(null);
  }

  // ── Table columns ──
  const columns = [
    { key: "name", header: "Name", width: "150px" },
    { key: "email", header: "Email", width: "190px" },
    {
      key: "invested", header: "Invested", width: "100px", align: "right" as const,
      cell: (r: Row) => <span className="text-xs font-medium text-foreground">${fmt(r.invested)}</span>,
    },
    {
      key: "profit", header: "Profit", width: "90px", align: "right" as const,
      cell: (r: Row) => <span className="text-xs font-semibold text-success">+${fmt(r.profit)}</span>,
    },
    {
      key: "startedAt", header: "Working time", width: "110px",
      cell: (r: Row) => <span className="text-xs text-muted-foreground">{workingTime(r.startedAt)}</span>,
    },
    {
      key: "lock", header: "Lock", width: "170px",
      cell: (r: Row) => (
        <div className="w-full">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className={`flex items-center gap-1 font-medium ${r.status === "unlocked" ? "text-success" : "text-destructive"}`}>
              {r.status === "unlocked" ? <LockOpen className="size-3" /> : <Lock className="size-3" />}
              {r.status === "unlocked" ? "Unlocked" : `${r.daysLeft}d left`}
            </span>
            <span className="text-muted-foreground">{r.lockDays}d total</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${r.status === "unlocked" ? "bg-success" : "bg-foreground"}`}
              style={{ width: `${r.pct}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "actions", header: "Actions", width: "190px", align: "right" as const,
      cell: (r: Row) => (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            disabled={r.status === "unlocked"}
            onClick={() => setAction({ type: "unlock", inv: r })}
            className={btnSmall}
          >
            <LockOpen className="size-3" /> Unlock
          </button>
          <button
            type="button"
            onClick={() => { setExtendDays("7"); setAction({ type: "extend", inv: r }); }}
            className={btnSmall}
          >
            <Lock className="size-3" /> Extend
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell active="AI Trading">
      <div className="space-y-8 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Package Management</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              AI Trading Packages
            </h1>
          </div>
          <button
            type="button"
            onClick={() => { setFormError(null); setForm({ ...EMPTY_FORM }); }}
            className={btnPrimary}
          >
            <Plus className="size-4" /> New strategy
          </button>
        </div>

        {/* Stats */}
        <section aria-label="Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><Stat label="Strategies" value={String(strategies.length)} icon={<Bot className="size-3.5" />} /></Card>
            <Card><Stat label="Total Investors" value={String(investments.length)} icon={<Users className="size-3.5" />} /></Card>
            <Card><Stat label="Total Staked" value={`$${fmt(totalStaked)}`} icon={<Wallet className="size-3.5" />} /></Card>
            <Card><Stat label="Avg. Daily ROI" value={`${avgDaily.toFixed(2)}%`} icon={<Percent className="size-3.5" />} /></Card>
          </div>
        </section>

        {/* Strategies */}
        <section aria-label="Strategies">
          <SectionHeader
            title="Strategies"
            description="Create packages and set the daily ROI. Lock-period changes only affect new investors."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {strategies.map((s) => {
              const inv = investments.filter((i) => i.strategyId === s.id);
              return (
                <AdminStrategyCard
                  key={s.id}
                  strategy={s}
                  investorCount={inv.length}
                  totalStaked={inv.reduce((a, i) => a + i.invested, 0)}
                  onEdit={() => { setFormError(null); setForm(toForm(s)); }}
                  onViewUsers={() => {
                    setSelectedId(s.id);
                    document.getElementById("strategy-investors")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* Investors */}
        <section aria-label="Strategy investors" id="strategy-investors">
          <SectionHeader
            title={`Investors${selected ? ` · ${selected.name}` : ""}`}
            description="Unlock a user early or extend their personal lock period."
          />

          <div className="mb-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted p-1">
              {strategies.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedId === s.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="relative min-w-52 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                className={`${inputCls} h-9 pl-9 text-xs`}
              />
            </div>
          </div>

          {rows.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Users className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No investors in this strategy yet.</p>
              </div>
            </Card>
          ) : (
            <Table
              data={rows}
              columns={columns}
              getRowId={(r: Row) => r.id}
              height={Math.min(420, 56 + rows.length * 56)}
              rowHeight={56}
            />
          )}
        </section>

        <div className="h-20" />
      </div>

      {/* Create / edit strategy */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit strategy" : "New strategy"}
        subtitle="Lock period applies to new investors only."
        footer={
          <>
            <button type="button" onClick={() => setForm(null)} className={`${btnGhost} flex-1`}>Cancel</button>
            <button type="button" onClick={handleSaveStrategy} className={`${btnPrimary} flex-1`}>
              {form?.id ? "Save changes" : "Create strategy"}
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Package name">
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="9 EMA Strategy" />
              </Field>
              <Field label="Exchange">
                <input className={inputCls} value={form.exchange} onChange={(e) => set("exchange", e.target.value)} />
              </Field>
              <Field label="Minimum stake ($)">
                <input className={inputCls} type="number" min="0" value={form.minStake} onChange={(e) => set("minStake", e.target.value)} />
              </Field>
              <Field label="Lock period (days)">
                <input className={inputCls} type="number" min="0" value={form.lockDays} onChange={(e) => set("lockDays", e.target.value)} />
              </Field>
              <Field label="Total running days">
                <input className={inputCls} type="number" min="0" value={form.daysRunning} onChange={(e) => set("daysRunning", e.target.value)} />
              </Field>
              <Field label="Total ROI (%)">
                <input className={inputCls} type="number" step="0.1" value={form.totalRoi} onChange={(e) => set("totalRoi", e.target.value)} />
              </Field>
            </div>
            <Field label="Daily ROI (%)" hint="Credited to every investor of this package each day.">
              <input className={inputCls} type="number" step="0.01" min="0" value={form.dailyRoi} onChange={(e) => set("dailyRoi", e.target.value)} />
            </Field>
            {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          </div>
        )}
      </Modal>

      {/* Unlock confirm */}
      <Modal
        open={action?.type === "unlock"}
        onClose={() => setAction(null)}
        title="Unlock this user early?"
        subtitle={action ? `${action.inv.name} · ${action.inv.email}` : undefined}
        footer={
          <>
            <button type="button" onClick={() => setAction(null)} className={`${btnGhost} flex-1`}>Keep locked</button>
            <button type="button" onClick={confirmUnlock} className={`${btnDanger} flex-1`}>Unlock now</button>
          </>
        }
      >
        {action && (
          <div className="space-y-2 rounded-2xl bg-background p-3 pb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Invested</span>
              <span className="font-medium text-foreground">${fmt(action.inv.invested)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-medium text-success">+${fmt(action.inv.profit)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Remaining lock</span>
              <span className="font-medium text-foreground">{lockInfo(action.inv).daysLeft} days</span>
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">
              The user will be able to withdraw immediately.
            </p>
          </div>
        )}
      </Modal>

      {/* Extend lock */}
      <Modal
        open={action?.type === "extend"}
        onClose={() => setAction(null)}
        title="Extend lock period"
        subtitle={action ? `${action.inv.name} · currently ${action.inv.lockDays} days` : undefined}
        footer={
          <>
            <button type="button" onClick={() => setAction(null)} className={`${btnGhost} flex-1`}>Cancel</button>
            <button type="button" onClick={confirmExtend} disabled={!(parseInt(extendDays, 10) > 0)} className={`${btnPrimary} flex-1`}>
              Extend lock
            </button>
          </>
        }
      >
        {action && (
          <div className="space-y-3 pb-2">
            <Field label="Add days">
              <input
                className={inputCls}
                type="number"
                min="1"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[3, 7, 15, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setExtendDays(String(d))}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  +{d}d
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              New total lock: {action.inv.lockDays + (parseInt(extendDays, 10) || 0)} days.
              If this user was force-unlocked, they will be locked again.
            </p>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
```

---

## Backend contract (what each `TODO: API` should do)

| Action | Suggested endpoint |
|---|---|
| Create / edit daily-profit plan | `POST` / `PATCH /api/admin/daily-profit/plans/:id` |
| Toggle plan visibility | `PATCH /api/admin/daily-profit/plans/:id { active }` |
| Create / edit AI strategy | `POST` / `PATCH /api/admin/ai-trading/strategies/:id` |
| Unlock user early | `POST /api/admin/ai-trading/investments/:id/unlock` |
| Extend user lock | `POST /api/admin/ai-trading/investments/:id/extend { days }` |

**Security:** check the admin role on every one of these endpoints on the server, and write an audit log for unlock and extend actions, since they affect user funds.

**Before you ship:**
- Wrap the page-level state updates in `try/catch` and only update local state after the API call succeeds, as your own AI Trading page's TODO suggests.
- The `Date.now()` values (`daysAgo`, `workingTime`) are calculated in the browser. If you see hydration warnings once real data is loaded, fetch the investor list client-side after mount, or pass server-calculated values.

If you'd like, I can add the Cloud Mining admin page next in the same format.