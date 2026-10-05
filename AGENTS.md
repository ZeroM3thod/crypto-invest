Below are the two admin pages, written in the same style as your user referral and leaderboard pages (same Tailwind tokens, `rounded-4xl` cards, black-and-white pills). I didn't have access to the beui.dev source, so I used plain Tailwind primitives to match your existing pages. Everything runs on local state with placeholder data, and the places to connect your API are marked `TODO`.

## Setup guide

1. Create two files: `app/(admin)/admin/referral/page.tsx` and `app/(admin)/admin/referral/leaderboard/page.tsx`. These paths match the routes already in your `ROUTES` map (`/admin/referral` and `/admin/referral/leaderboard`).
2. Each page is wrapped in `AdminShell`, with `active` set to the sidebar label (`"Basic Management"` and `"Leaderboard Management"`).
3. Everything is local state with placeholder data. Replace the `TODO` comments with your real API calls.
4. **Bulk script format:** paste one user per line, as `name, referrals`. Commas, tabs, `:`, `|` and `;` all work as separators. A plain space before the number also works.

---

## 1) Basic Management: `app/(admin)/admin/referral/page.tsx`

```tsx
"use client";

import { AdminShell } from "@/app/(admin)/_components/admin-shell";
import { useState } from "react";
import {
  Trophy,
  DollarSign,
  Users,
  Plus,
  Trash2,
  Check,
  Save,
  Bot,
  Cloud,
  TrendingUp,
  Wallet,
} from "lucide-react";

/* ───────── Types ───────── */

type TabId = "milestones" | "commission" | "top";
type ProfitSource = "daily" | "aiTrading" | "cloudMining" | "manualTrading";

interface MilestoneDraft {
  id: number;
  requiredActive: string;
  reward: string;
}

/* ───────── Placeholder data (wire to API) ───────── */

const INITIAL_MILESTONES = [
  { requiredActive: 5, reward: 5 },
  { requiredActive: 10, reward: 12 },
  { requiredActive: 15, reward: 35 },
  { requiredActive: 20, reward: 30 },
  { requiredActive: 30, reward: 40 },
  { requiredActive: 50, reward: 75 },
  { requiredActive: 100, reward: 170 },
  { requiredActive: 150, reward: 250 },
];

const SOURCE_META: Record<
  ProfitSource,
  { label: string; icon: typeof TrendingUp; basis: string }
> = {
  daily: { label: "Daily Profit", icon: TrendingUp, basis: "% of profit · lifetime" },
  aiTrading: { label: "AI Trading", icon: Bot, basis: "% of profit · lifetime" },
  cloudMining: { label: "Cloud Mining", icon: Cloud, basis: "% of profit · lifetime" },
  manualTrading: { label: "Manual Trading", icon: Wallet, basis: "% of total turnover · lifetime" },
};

const INITIAL_RATES: Record<ProfitSource, string> = {
  daily: "5",
  aiTrading: "5",
  cloudMining: "5",
  manualTrading: "5",
};

const TOP_REFERRERS = [
  { userId: "USR90011", name: "Rahim Uddin", email: "rahim@mail.com", totalReferred: 260, active: 214, commission: 4820.5 },
  { userId: "USR90022", name: "Fatima Islam", email: "fatima@mail.com", totalReferred: 221, active: 187, commission: 3914.2 },
  { userId: "USR90033", name: "Arjun Patel", email: "arjun@mail.com", totalReferred: 190, active: 165, commission: 3120.75 },
  { userId: "USR90044", name: "Ling Wei", email: "ling@mail.com", totalReferred: 170, active: 142, commission: 2650.0 },
  { userId: "USR90055", name: "Carlos Mendez", email: "carlos@mail.com", totalReferred: 150, active: 129, commission: 2210.4 },
  { userId: "USR90066", name: "Aisha Rahman", email: "aisha@mail.com", totalReferred: 140, active: 118, commission: 1985.9 },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "milestones", label: "Milestones" },
  { id: "commission", label: "Commission" },
  { id: "top", label: "Top Referrers" },
];

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

/* ───────── UI primitives ───────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>{children}</div>;
}

/* ───────── Page ───────── */

export default function AdminReferralPage() {
  const [tab, setTab] = useState<TabId>("milestones");
  const [toast, setToast] = useState({ msg: "", show: false });

  // Milestones
  const [nextId, setNextId] = useState(INITIAL_MILESTONES.length + 1);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(
    INITIAL_MILESTONES.map((m, i) => ({
      id: i + 1,
      requiredActive: String(m.requiredActive),
      reward: String(m.reward),
    }))
  );
  const [milestoneError, setMilestoneError] = useState("");

  // Commission
  const [rates, setRates] = useState<Record<ProfitSource, string>>(INITIAL_RATES);
  const [rateError, setRateError] = useState("");

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  /* ---- Milestone actions ---- */
  const updateMilestone = (id: number, field: "requiredActive" | "reward", value: string) =>
    setMilestones((list) => list.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  const addMilestone = () => {
    setMilestones((list) => [...list, { id: nextId, requiredActive: "", reward: "" }]);
    setNextId((n) => n + 1);
  };

  const removeMilestone = (id: number) => setMilestones((list) => list.filter((m) => m.id !== id));

  const saveMilestones = () => {
    const parsed = milestones.map((m) => ({
      requiredActive: Number(m.requiredActive),
      reward: Number(m.reward),
    }));

    if (parsed.some((m) => !Number.isInteger(m.requiredActive) || m.requiredActive <= 0)) {
      return setMilestoneError("Every milestone needs a whole number of active users greater than 0.");
    }
    if (parsed.some((m) => Number.isNaN(m.reward) || m.reward < 0)) {
      return setMilestoneError("Every milestone needs a valid reward amount.");
    }
    if (new Set(parsed.map((m) => m.requiredActive)).size !== parsed.length) {
      return setMilestoneError("Two milestones can't have the same user number.");
    }

    const sorted = [...parsed].sort((a, b) => a.requiredActive - b.requiredActive);
    setMilestoneError("");
    setMilestones(
      sorted.map((m, i) => ({ id: i + 1, requiredActive: String(m.requiredActive), reward: String(m.reward) }))
    );
    setNextId(sorted.length + 1);

    // TODO: await fetch("/api/admin/referral/milestones", { method: "PUT", body: JSON.stringify(sorted) })
    showToast("Milestones saved");
  };

  /* ---- Commission actions ---- */
  const saveRates = () => {
    const invalid = (Object.keys(rates) as ProfitSource[]).some((k) => {
      const n = Number(rates[k]);
      return rates[k].trim() === "" || Number.isNaN(n) || n < 0 || n > 100;
    });
    if (invalid) return setRateError("Each rate must be a number between 0 and 100.");

    setRateError("");
    // TODO: await fetch("/api/admin/referral/commission", { method: "PUT", body: JSON.stringify(rates) })
    showToast("Commission rates saved");
  };

  return (
    <AdminShell active="Basic Management">
      <div className="relative overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Toast */}
        {toast.show && (
          <div className="fixed right-6 top-6 z-[999] flex items-center gap-2 rounded-2xl border border-border bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg">
            <Check className="size-4" />
            {toast.msg}
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Referral</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Basic Management
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ── MILESTONES ── */}
          {tab === "milestones" && (
            <Card>
              <div className="mb-1 flex items-center gap-2">
                <Trophy className="size-4 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Referral Milestones</h2>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Edit the required active users and reward for each tier, or add a new milestone.
              </p>

              <div className="mb-2 grid grid-cols-[1fr_1fr_40px] gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Active Users</span>
                <span>Reward ($)</span>
                <span />
              </div>

              <div className="flex flex-col gap-2">
                {milestones.map((m) => (
                  <div key={m.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={m.requiredActive}
                      onChange={(e) => updateMilestone(m.id, "requiredActive", e.target.value)}
                      placeholder="e.g. 200"
                      className={inputCls}
                    />
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={m.reward}
                      onChange={(e) => updateMilestone(m.id, "reward", e.target.value)}
                      placeholder="e.g. 300"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(m.id)}
                      aria-label="Remove milestone"
                      className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                {milestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No milestones yet — add one below.
                  </div>
                )}
              </div>

              {milestoneError && <p className="mt-3 text-xs font-medium text-destructive">{milestoneError}</p>}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  <Plus className="size-4" /> Add Milestone
                </button>
                <button
                  type="button"
                  onClick={saveMilestones}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  <Save className="size-4" /> Save Changes
                </button>
              </div>
            </Card>
          )}

          {/* ── COMMISSION ── */}
          {tab === "commission" && (
            <Card>
              <div className="mb-1 flex items-center gap-2">
                <DollarSign className="size-4 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Lifetime Commission</h2>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Set the lifetime commission percentage for each source. Manual Trading is calculated on total turnover.
              </p>

              <div className="flex flex-col gap-2.5">
                {(Object.keys(SOURCE_META) as ProfitSource[]).map((key) => {
                  const meta = SOURCE_META[key];
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Icon className="size-4 text-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{meta.label}</div>
                        <div className="text-xs text-muted-foreground">{meta.basis}</div>
                      </div>
                      <div className="relative w-24 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={rates[key]}
                          onChange={(e) => setRates((r) => ({ ...r, [key]: e.target.value }))}
                          className={`${inputCls} pr-7 text-right`}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rateError && <p className="mt-3 text-xs font-medium text-destructive">{rateError}</p>}

              <button
                type="button"
                onClick={saveRates}
                className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Save className="size-4" /> Save Commission Rates
              </button>
            </Card>
          )}

          {/* ── TOP REFERRERS ── */}
          {tab === "top" && (
            <Card>
              <div className="mb-1 flex items-center gap-2">
                <Users className="size-4 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Top Referrers</h2>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">Users ranked by active referrals.</p>

              <div className="flex flex-col gap-2">
                {[...TOP_REFERRERS]
                  .sort((a, b) => b.active - a.active)
                  .map((u, i) => (
                    <div
                      key={u.userId}
                      className="flex items-center justify-between rounded-2xl border border-border p-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={[
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                            i === 0
                              ? "bg-foreground text-background"
                              : "border border-border text-muted-foreground",
                          ].join(" ")}
                        >
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">{u.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {u.email} · {u.totalReferred} referred
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-foreground">{u.active} active</div>
                        <div className="text-[11px] text-muted-foreground">
                          ${u.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })} earned
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
```

---

## 2) Leaderboard Management: `app/(admin)/admin/referral/leaderboard/page.tsx`

```tsx
"use client";

import { AdminShell } from "@/app/(admin)/_components/admin-shell";
import { useMemo, useState } from "react";
import { Trophy, Medal, Crown, Check, Save, Trash2, Search, Upload } from "lucide-react";

/* ───────── Types ───────── */

type BoardType = "monthly" | "weekly";

interface Entry {
  userId: string;
  name: string;
  referrals: number;
}

interface ParsedLine {
  name: string;
  referrals: number;
}

/* ───────── Placeholder data (wire to API) ───────── */

const INITIAL_ENTRIES: Record<BoardType, Entry[]> = {
  monthly: [
    { userId: "USR90011", name: "Rahim Uddin", referrals: 214 },
    { userId: "USR90022", name: "Fatima Islam", referrals: 187 },
    { userId: "USR90033", name: "Arjun Patel", referrals: 165 },
    { userId: "USR90044", name: "Ling Wei", referrals: 142 },
    { userId: "USR90055", name: "Carlos Mendez", referrals: 129 },
    { userId: "USR90066", name: "Aisha Rahman", referrals: 118 },
  ],
  weekly: [
    { userId: "USR90055", name: "Carlos Mendez", referrals: 18 },
    { userId: "USR90011", name: "Rahim Uddin", referrals: 16 },
    { userId: "USR90077", name: "Kwame Boateng", referrals: 11 },
    { userId: "USR90022", name: "Fatima Islam", referrals: 9 },
  ],
};

const INITIAL_PRIZES: Record<BoardType, string[]> = {
  monthly: ["1000", "600", "300"],
  weekly: ["300", "200", "100"],
};

const PLACE_LABELS = ["1st Place", "2nd Place", "3rd Place"];

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

/* ───────── Helpers ───────── */

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/**
 * Parses pasted lines like:
 *   Rahim Uddin, 214
 *   Fatima Islam<TAB>187
 *   Arjun Patel: 165
 *   Ling Wei 142
 */
function parseScript(text: string): { rows: ParsedLine[]; bad: string[] } {
  const rows: ParsedLine[] = [];
  const bad: string[] = [];

  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const m = line.match(/^(.+?)\s*[,\t:|;]\s*(\d+)$/) || line.match(/^(.+?)\s+(\d+)$/);
      if (!m) return bad.push(line);
      rows.push({ name: m[1].trim(), referrals: parseInt(m[2], 10) });
    });

  return { rows, bad };
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Crown className="size-4" />
      </div>
    );
  if (rank === 2 || rank === 3)
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-foreground">
        <Medal className="size-4" />
      </div>
    );
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-muted-foreground">
      {rank}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>{children}</div>;
}

/* ───────── Page ───────── */

export default function AdminLeaderboardPage() {
  const [board, setBoard] = useState<BoardType>("monthly");
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [prizes, setPrizes] = useState(INITIAL_PRIZES);
  const [prizeError, setPrizeError] = useState("");

  const [script, setScript] = useState("");
  const [replaceAll, setReplaceAll] = useState(false);
  const [scriptMsg, setScriptMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const ranked = useMemo(
    () =>
      [...entries[board]]
        .sort((a, b) => b.referrals - a.referrals)
        .map((e, i) => ({ ...e, rank: i + 1 })),
    [entries, board]
  );

  const filtered = ranked.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.userId.toLowerCase().includes(query.toLowerCase())
  );

  /* ---- Prize actions ---- */
  const savePrizes = () => {
    const invalid = prizes[board].some((p) => p.trim() === "" || Number.isNaN(Number(p)) || Number(p) < 0);
    if (invalid) return setPrizeError("Enter a valid reward amount for all 3 places.");

    setPrizeError("");
    // TODO: await fetch(`/api/admin/leaderboard/${board}/prizes`, { method: "PUT", body: JSON.stringify(prizes[board].map(Number)) })
    showToast(`${board === "monthly" ? "Monthly" : "Weekly"} rewards saved`);
  };

  /* ---- Script import ---- */
  const runScript = () => {
    const { rows, bad } = parseScript(script);

    if (rows.length === 0) {
      return setScriptMsg({ ok: false, text: "No valid lines found. Use the format: name, referrals" });
    }

    setEntries((prev) => {
      const base: Entry[] = replaceAll ? [] : [...prev[board]];

      rows.forEach((row, i) => {
        const idx = base.findIndex((e) => e.name.toLowerCase() === row.name.toLowerCase());
        if (idx >= 0) {
          base[idx] = { ...base[idx], referrals: row.referrals };
        } else {
          base.push({ userId: `IMP-${Date.now()}-${i}`, name: row.name, referrals: row.referrals });
        }
      });

      return { ...prev, [board]: base };
    });

    // TODO: send `rows` to your API so the backend matches names → real user IDs
    setScriptMsg({
      ok: true,
      text: `${rows.length} user${rows.length > 1 ? "s" : ""} imported${
        bad.length ? ` · ${bad.length} line${bad.length > 1 ? "s" : ""} skipped` : ""
      }.`,
    });
    setScript("");
    showToast("Leaderboard updated");
  };

  /* ---- List actions ---- */
  const updateReferrals = (userId: string, value: string) => {
    const n = Math.max(0, parseInt(value || "0", 10) || 0);
    setEntries((prev) => ({
      ...prev,
      [board]: prev[board].map((e) => (e.userId === userId ? { ...e, referrals: n } : e)),
    }));
  };

  const removeEntry = (userId: string) =>
    setEntries((prev) => ({ ...prev, [board]: prev[board].filter((e) => e.userId !== userId) }));

  return (
    <AdminShell active="Leaderboard Management">
      <div className="relative overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {toast.show && (
          <div className="fixed right-6 top-6 z-[999] flex items-center gap-2 rounded-2xl border border-border bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg">
            <Check className="size-4" />
            {toast.msg}
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Referral</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Leaderboard Management
            </h1>
          </div>

          {/* Board tabs (50/50) */}
          <div className="flex w-full items-center gap-2">
            {(
              [
                { id: "monthly", label: "Monthly", icon: Trophy },
                { id: "weekly", label: "Weekly", icon: Medal },
              ] as { id: BoardType; label: string; icon: typeof Trophy }[]
            ).map((t) => {
              const isActive = board === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setBoard(t.id);
                    setScriptMsg(null);
                    setPrizeError("");
                    setQuery("");
                  }}
                  className={[
                    "flex basis-1/2 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ── REWARDS ── */}
          <Card>
            <div className="mb-1 flex items-center gap-2">
              <Trophy className="size-4 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                {board === "monthly" ? "Monthly" : "Weekly"} Rewards
              </h2>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">Set the prize for the top 3 places.</p>

            <div className="grid grid-cols-3 gap-3">
              {PLACE_LABELS.map((label, i) => (
                <div key={label}>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={prizes[board][i]}
                      onChange={(e) =>
                        setPrizes((p) => ({
                          ...p,
                          [board]: p[board].map((v, idx) => (idx === i ? e.target.value : v)),
                        }))
                      }
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {prizeError && <p className="mt-3 text-xs font-medium text-destructive">{prizeError}</p>}

            <button
              type="button"
              onClick={savePrizes}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              <Save className="size-4" /> Save Rewards
            </button>
          </Card>

          {/* ── SCRIPT IMPORT ── */}
          <Card>
            <div className="mb-1 flex items-center gap-2">
              <Upload className="size-4 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Bulk Import Script</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste one user per line as <span className="font-mono text-foreground">name, total referrals</span>.
              Existing names are updated, new names are added to the {board} list automatically.
            </p>

            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              placeholder={"Rahim Uddin, 214\nFatima Islam, 187\nArjun Patel, 165"}
              className="w-full resize-y rounded-2xl border border-border bg-muted/30 p-3 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={replaceAll}
                onChange={(e) => setReplaceAll(e.target.checked)}
                className="size-4 accent-foreground"
              />
              Replace the whole {board} list instead of merging
            </label>

            {scriptMsg && (
              <p className={`mt-3 text-xs font-medium ${scriptMsg.ok ? "text-success" : "text-destructive"}`}>
                {scriptMsg.text}
              </p>
            )}

            <button
              type="button"
              onClick={runScript}
              disabled={!script.trim()}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload className="size-4" /> Import to Leaderboard
            </button>
          </Card>

          {/* ── USER LIST ── */}
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">All Users</h2>
              <span className="text-xs text-muted-foreground">{ranked.length} total</span>
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or user ID"
                className={`${inputCls} pl-9`}
              />
            </div>

            <div className="flex flex-col gap-2">
              {filtered.map((e) => (
                <div
                  key={e.userId}
                  className={[
                    "flex items-center justify-between gap-3 rounded-2xl border p-3.5",
                    e.rank <= 3 ? "border-foreground/30 bg-muted/20" : "border-border",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <RankBadge rank={e.rank} />
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                      {initials(e.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{e.name}</div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">{e.userId}</div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={e.referrals}
                      onChange={(ev) => updateReferrals(e.userId, ev.target.value)}
                      aria-label={`Referrals for ${e.name}`}
                      className={`${inputCls} w-20 text-right`}
                    />
                    <button
                      type="button"
                      onClick={() => removeEntry(e.userId)}
                      aria-label={`Remove ${e.name}`}
                      className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                // TODO: await fetch(`/api/admin/leaderboard/${board}`, { method: "PUT", body: JSON.stringify(entries[board]) })
                showToast("List saved");
              }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <Save className="size-4" /> Save List Changes
            </button>
          </Card>

          <div className="h-20" />
        </div>
      </div>
    </AdminShell>
  );
}
```

---

## Notes

- **Ranking is automatic.** The list re-sorts by referral count after every import or edit, so ranks 1–3 always match the reward boxes.
- **Script import** matches names case-insensitively. Matches are updated, new names get a temporary `IMP-…` ID, and lines that don't parse are skipped and counted in the result message. In your backend, match imported names to real user IDs.
- **Sidebar fix:** `AdminShell`'s `ROUTES` already maps `Basic Management` and `Leaderboard Management`, so navigation works. One bug in your shell: the `Support` item has no `children` and it navigates correctly, but `Referral` appears in `destinations` with `Users` as its icon (same as the Users section). Swap it for a different Lucide icon like `Trophy` or `Gift` so the two are distinguishable.
- **Tokens:** I used `text-destructive` and `text-success` for error and success messages. `text-success` already appears in your user page, but check that `destructive` exists in your Tailwind theme. If it doesn't, replace it with `text-red-500`.

