// Daily Profit management (admin)
"use client";

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
export function DailyProfitManagement() {
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
    <>
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
    </>
  );
}
