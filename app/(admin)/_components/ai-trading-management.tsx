// AI Trading management (admin)
"use client";

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

export function AiTradingManagement() {
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
    <>
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
    </>
  );
}
