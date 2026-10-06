I'll start by reading the uploaded file to see the admin and superadmin code.I'm reading the admin and superadmin code side by side so I can match the superadmin pages to the admin ones exactly. The admin shell is done, so I'm on the superadmin shell next.I'm still reading the admin and superadmin code in detail. So far I've covered the shells, dashboard, users, user detail and the shared UI helpers; the finance, KYC and support views are next.I'm nearly done reading. The last part of the admin user-detail is next, then I'll write up the code.I couldn't run or type-check any of this, because the `lib/*` files and API routes weren't in the upload. The superadmin pages now render the admin components directly, so the dashboard, KYC, deposits, withdrawals, fund history and support pages are the same code as admin. Users list and user detail have their own copies, because admin hardcodes `/admin/...` routes and API calls in them. The sidebar already points at `/owner/users/kyc`, `/owner/finance/history` and `/owner/support/tickets`, so `super-admin-shell.tsx` needs no change.

## 1. Dashboard
`app/(superadmin)/owner/page.tsx`
```tsx
// app/(superadmin)/owner/page.tsx
// Owner dashboard: same view + same data source as the admin dashboard.
import { SuperAdminShell } from "../_components/super-admin-shell";
import { DashboardView } from "@/app/(admin)/_components/dashboard-view";
import { getDashboardData } from "@/lib/admin-dashboard-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerDashboardPage() {
  await requireOwner();
  const data = getDashboardData(); // swap for your DB / API call

  return (
    <SuperAdminShell active="Dashboard">
      <DashboardView data={data} />
    </SuperAdminShell>
  );
}
```

## 2. Users list
`app/(superadmin)/owner/users/page.tsx`
```tsx
// app/(superadmin)/owner/users/page.tsx
import { SuperAdminShell } from "../../_components/super-admin-shell";
import { UsersManagement } from "../../_components/users-management";
import { getUsers, toRow } from "@/lib/users-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerUsersPage() {
  await requireOwner();
  const rows = getUsers().map(toRow);

  return (
    <SuperAdminShell active="All Users">
      <UsersManagement rows={rows} />
    </SuperAdminShell>
  );
}
```

`app/(superadmin)/_components/users-management.tsx`
```tsx
// app/(superadmin)/_components/users-management.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/motion/table";
import type { UserRow } from "@/lib/users-data";
import { Badge, SelectField, StatCard } from "./ui";

const kycTone = { verified: "green", pending: "amber", rejected: "red", not_submitted: "gray" } as const;
const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function UsersManagement({ rows }: { rows: UserRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [kyc, setKyc] = useState("all");

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
      byOwner: rows.filter((r) => r.referredBy === "OWNER").length,
      kycVerified: rows.filter((r) => r.kyc === "verified").length,
      kycPending: rows.filter((r) => r.kyc === "pending").length,
      twoFA: rows.filter((r) => r.twoFA).length,
      balance: rows.reduce((s, r) => s + r.totalBalance, 0),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (kyc === "all" || r.kyc === kyc) &&
        (!term ||
          r.name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term)),
    );
  }, [rows, q, status, kyc]);

  const columns = useMemo<TableColumn<UserRow>[]>(
    () => [
      { key: "id", header: "User ID", sortable: true, width: "120px" },
      {
        key: "name",
        header: "Name",
        sortable: true,
        width: "1.2fr",
        cell: (r) => <span className="font-medium">{r.name}</span>,
      },
      { key: "email", header: "Email", sortable: true, width: "1.6fr" },
      { key: "country", header: "Country", sortable: true, width: "140px" },
      { key: "joinedAt", header: "Joined", sortable: true, width: "120px" },
      {
        key: "kyc",
        header: "KYC",
        sortable: true,
        width: "130px",
        cell: (r) => <Badge tone={kycTone[r.kyc]}>{r.kyc.replace("_", " ")}</Badge>,
      },
      {
        key: "twoFA",
        header: "2FA",
        width: "90px",
        sortValue: (r) => Number(r.twoFA),
        sortable: true,
        cell: (r) => <Badge tone={r.twoFA ? "green" : "gray"}>{r.twoFA ? "On" : "Off"}</Badge>,
      },
      {
        key: "referredBy",
        header: "Referred By",
        sortable: true,
        width: "130px",
        cell: (r) => (r.referredBy === "OWNER" ? <Badge tone="amber">Owner</Badge> : r.referredBy),
      },
      {
        key: "totalBalance",
        header: "Balance",
        sortable: true,
        align: "right",
        width: "120px",
        cell: (r) => <span className="tabular-nums">{usd(r.totalBalance)}</span>,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        width: "120px",
        cell: (r) => <Badge tone={r.status === "active" ? "green" : "red"}>{r.status}</Badge>,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Click any row to open and edit the user.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.total.toLocaleString()} />
        <StatCard label="Referred By Owner" value={stats.byOwner.toLocaleString()} hint="Direct owner referrals" />
        <StatCard label="Active / Suspended" value={`${stats.active} / ${stats.suspended}`} />
        <StatCard label="Total User Balance" value={usd(stats.balance)} />
        <StatCard label="KYC Verified" value={stats.kycVerified} />
        <StatCard label="KYC Pending" value={stats.kycPending} />
        <StatCard label="2FA Enabled" value={stats.twoFA} />
        <StatCard label="2FA Disabled" value={stats.total - stats.twoFA} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email or user ID"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
          <SelectField
            label="KYC"
            value={kyc}
            onChange={setKyc}
            options={[
              { value: "all", label: "All" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
              { value: "not_submitted", label: "Not submitted" },
            ]}
          />
        </div>

        <p className="px-1 text-xs text-muted-foreground">{filtered.length.toLocaleString()} users</p>

        <Table
          data={filtered}
          columns={columns}
          getRowId={(r) => r.id}
          resizable
          reorderable
          defaultSort={{ key: "joinedAt", direction: "desc" }}
          onRowClick={(r) => router.push(`/owner/users/${r.id}`)}
          height={560}
          rowHeight={52}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
```

## 3. User details
`app/(superadmin)/owner/users/[userId]/page.tsx`
```tsx
// app/(superadmin)/owner/users/[userId]/page.tsx
import { notFound } from "next/navigation";
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { UserDetail } from "../../../_components/user-detail";
import { getUser } from "@/lib/users-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireOwner();
  const { userId } = await params;
  const user = getUser(userId);
  if (!user) notFound();

  return (
    <SuperAdminShell active="All Users">
      <UserDetail initialUser={user} />
    </SuperAdminShell>
  );
}
```

`app/(superadmin)/_components/user-detail.tsx`
```tsx
// app/(superadmin)/_components/user-detail.tsx
// Admin user detail: admins can edit profile/KYC data AND wallet balances
// (Main + Investment only), view full investment / AI trading history,
// and send rewards to the user.
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/motion/table";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import type {
  AiStrategy,
  AiTrade,
  DailyProfit,
  Investment,
  LoginRecord,
  ManualTrade,
  ReferralMember,
  Reward,
  RewardType,
  RewardWallet,
  Tx,
  User,
} from "@/lib/users-data";
import { Badge, Btn, Card, Field, SelectField, StatCard } from "./ui";

const TABS = [
  "Profile",
  "Wallets",
  "Referrals",
  "Investments",
  "Trading",
  "Rewards",
  "Security & Logins",
] as const;
type Tab = (typeof TABS)[number];

// Only these two wallets exist now (mining / trading / referral removed)
type WalletKey = "main" | "investment";
const WALLET_LABELS: Record<WalletKey, string> = {
  main: "Main Wallet",
  investment: "Investment Wallet",
};

const usd = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

/** Keep numbers as numbers when a text cell is edited. */
const coerce = (sample: unknown, value: string) =>
  typeof sample === "number" ? Number(value) || 0 : value;

/** Column helper: every cell is editable + sortable by default. */
function col<T>(
  key: keyof T & string,
  header: string,
  extra: Partial<TableColumn<T>> = {},
): TableColumn<T> {
  return { key, header, editable: true, sortable: true, width: "140px", ...extra };
}

/** Read-only column helper (history / log tables). */
function ro<T>(
  key: keyof T & string,
  header: string,
  extra: Partial<TableColumn<T>> = {},
): TableColumn<T> {
  return col<T>(key, header, { editable: false, ...extra });
}

/** Editable data table used by every section. */
function Grid<T extends { id: string }>({
  data,
  columns,
  onCellEdit,
  onDeleteRow,
  height = 340,
}: {
  data: T[];
  columns: TableColumn<T>[];
  onCellEdit?: (rowId: string, key: string, value: string) => void;
  onDeleteRow?: (rowId: string) => void;
  height?: number;
}) {
  return (
    <Table
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      resizable
      onCellEdit={onCellEdit}
      onDeleteRow={onDeleteRow ? (id) => onDeleteRow(id) : undefined}
      height={height}
      rowHeight={48}
      className="rounded-xl"
      emptyState="No records"
    />
  );
}

const rewardInitial = {
  title: "",
  description: "",
  wallet: "main" as RewardWallet,
  type: "non_withdrawable" as RewardType,
  amount: "",
};

export function UserDetail({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [saved, setSaved] = useState<User>(initialUser);
  const [tab, setTab] = useState<Tab>("Profile");
  const [walletKey, setWalletKey] = useState<WalletKey>("main");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [invFilter, setInvFilter] = useState("all");
  const [rf, setRf] = useState(rewardInitial);
  const [rewardBusy, setRewardBusy] = useState(false);

  const dirty = JSON.stringify(user) !== JSON.stringify(saved);
  const set = <K extends keyof User>(key: K, value: User[K]) =>
    setUser((u) => ({ ...u, [key]: value }));

  const flash = (message: string) => {
    setNote(message);
    setTimeout(() => setNote(null), 3000);
  };

  /** Admin can edit wallet balances. */
  const setBalance = (k: WalletKey, value: number) =>
    setUser((u) => ({
      ...u,
      wallets: { ...u.wallets, [k]: { ...u.wallets[k], balance: value } },
    }));

  /** Generic cell-edit handler for the editable top-level arrays. */
  const editList =
    (list: "referrals" | "investments" | "aiStrategies" | "manualTrades" | "logins") =>
    (rowId: string, key: string, value: string) =>
      setUser((u) => ({
        ...u,
        [list]: (u[list] as unknown as Record<string, unknown>[]).map((r) =>
          r.id === rowId ? { ...r, [key]: coerce(r[key], value) } : r,
        ),
      }));

  /** Persist to your backend (PATCH). Rewards are NOT sent here — they are
   *  created only through the rewards endpoint so they can't be double-credited. */
  async function persist(next: User, message: string) {
    setBusy(true);
    try {
      const { rewards: _rewards, ...payload } = next;
      void _rewards;
      const res = await fetch(`/api/owner/users/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setUser(next);
      setSaved(next);
      flash(message);
    } catch {
      flash("Save failed. Check your API route.");
    } finally {
      setBusy(false);
    }
  }

  const toggleSuspend = () => {
    const suspending = user.status === "active";
    if (!confirm(`${suspending ? "Suspend" : "Activate"} ${user.firstName} ${user.lastName}?`)) return;
    void persist(
      { ...user, status: suspending ? "suspended" : "active" },
      suspending ? "User suspended" : "User activated",
    );
  };

  /** Send a reward: credits the chosen wallet on the server, then mirrors it locally. */
  async function sendReward() {
    const amount = Number(rf.amount);
    if (!rf.title.trim() || !rf.description.trim() || !(amount > 0)) {
      flash("Add a title, short description and a valid amount");
      return;
    }
    const lockText = rf.type === "withdrawable" ? "withdrawable" : "non-withdrawable (invest only)";
    if (
      !confirm(
        `Send ${usd(amount)} reward "${rf.title.trim()}" to ${user.firstName} ${user.lastName}'s ${WALLET_LABELS[rf.wallet]} as ${lockText}?`,
      )
    )
      return;

    setRewardBusy(true);
    try {
      const res = await fetch(`/api/owner/users/${user.id}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rf.title.trim(),
          description: rf.description.trim(),
          wallet: rf.wallet,
          type: rf.type,
          amount,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { reward } = (await res.json()) as { reward: Reward };

      // apply the same change to both current + saved copies (keeps "dirty" correct)
      const apply = (u: User): User => ({
        ...u,
        rewards: [reward, ...u.rewards],
        wallets: {
          ...u.wallets,
          [reward.wallet]: {
            ...u.wallets[reward.wallet],
            balance: u.wallets[reward.wallet].balance + reward.amount,
            lockedBalance:
              u.wallets[reward.wallet].lockedBalance +
              (reward.type === "non_withdrawable" ? reward.amount : 0),
          },
        },
      });
      setUser(apply);
      setSaved(apply);
      setRf(rewardInitial);
      flash("Reward sent");
    } catch {
      flash("Reward failed. Check your API route.");
    } finally {
      setRewardBusy(false);
    }
  }

  // ---------- derived numbers ----------
  const wallet = user.wallets[walletKey];
  const totalWallets = user.wallets.main.balance + user.wallets.investment.balance;

  const refTotals = useMemo(
    () => ({
      count: user.referrals.length,
      deposit: user.referrals.reduce((s, r) => s + r.totalDeposit, 0),
      balance: user.referrals.reduce((s, r) => s + r.balance, 0),
    }),
    [user.referrals],
  );

  const invTotals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      running: user.investments.filter((i) => i.status === "running").length,
      invested: user.investments.reduce((s, i) => s + i.amount, 0),
      earned: user.investments.reduce((s, i) => s + i.earned, 0),
      profitDays: user.dailyProfits.length,
      today: user.dailyProfits
        .filter((p) => p.date.startsWith(today))
        .reduce((s, p) => s + p.profit, 0),
    };
  }, [user.investments, user.dailyProfits]);

  const filteredProfits = useMemo(
    () => (invFilter === "all" ? user.dailyProfits : user.dailyProfits.filter((p) => p.investmentId === invFilter)),
    [user.dailyProfits, invFilter],
  );
  const filteredProfitTotal = useMemo(
    () => filteredProfits.reduce((s, p) => s + p.profit, 0),
    [filteredProfits],
  );

  const ai = useMemo(() => {
    const s = user.aiStrategies;
    const allocated = s.reduce((a, x) => a + x.allocated, 0);
    const net = s.reduce((a, x) => a + x.pnl, 0);
    return {
      count: s.length,
      active: s.filter((x) => x.status === "active" || x.status === "running").length,
      allocated,
      net,
      roi: allocated ? (net / allocated) * 100 : 0,
      avgWin: s.length ? s.reduce((a, x) => a + x.winRate, 0) / s.length : 0,
      trades: user.aiTrades.length,
    };
  }, [user.aiStrategies, user.aiTrades]);

  const trade = useMemo(() => {
    const t = user.manualTrades;
    return {
      total: t.length,
      long: t.filter((x) => x.direction === "long").length,
      short: t.filter((x) => x.direction === "short").length,
      wins: t.filter((x) => x.pnl > 0).length,
      losses: t.filter((x) => x.pnl < 0).length,
      net: t.reduce((s, x) => s + x.pnl, 0),
    };
  }, [user.manualTrades]);

  const rewardTotals = useMemo(
    () => ({
      count: user.rewards.length,
      total: user.rewards.reduce((s, r) => s + r.amount, 0),
      locked: user.rewards.filter((r) => r.type === "non_withdrawable").reduce((s, r) => s + r.amount, 0),
      free: user.rewards.filter((r) => r.type === "withdrawable").reduce((s, r) => s + r.amount, 0),
    }),
    [user.rewards],
  );

  // ---------- columns ----------
  const txCols = useMemo<TableColumn<Tx>[]>(
    () => [
      ro<Tx>("date", "Date", { width: "170px" }),
      ro<Tx>("type", "Type", { width: "120px" }),
      ro<Tx>("amount", "Amount", { width: "120px", align: "right" }),
      ro<Tx>("status", "Status", { width: "120px" }),
      ro<Tx>("hash", "Tx Hash / Ref", { width: "1fr" }),
    ],
    [],
  );
  const refCols = useMemo<TableColumn<ReferralMember>[]>(
    () => [
      col<ReferralMember>("id", "User ID", { width: "120px" }),
      col<ReferralMember>("name", "Name", { width: "1fr" }),
      col<ReferralMember>("email", "Email", { width: "1.4fr" }),
      col<ReferralMember>("joinedAt", "Joined", { width: "120px" }),
      col<ReferralMember>("level", "Level", { width: "90px", align: "right" }),
      col<ReferralMember>("totalDeposit", "Total Deposit", { width: "140px", align: "right" }),
      col<ReferralMember>("balance", "Balance", { width: "120px", align: "right" }),
    ],
    [],
  );
  const invCols = useMemo<TableColumn<Investment>[]>(
    () => [
      col<Investment>("id", "ID", { width: "120px" }),
      col<Investment>("plan", "Plan", { width: "120px" }),
      col<Investment>("amount", "Amount", { width: "120px", align: "right" }),
      col<Investment>("dailyRoi", "Daily ROI %", { width: "120px", align: "right" }),
      col<Investment>("startDate", "Start", { width: "120px" }),
      col<Investment>("endDate", "End", { width: "120px" }),
      col<Investment>("earned", "Earned", { width: "110px", align: "right" }),
      col<Investment>("status", "Status", { width: "120px" }),
    ],
    [],
  );
  const profitCols = useMemo<TableColumn<DailyProfit>[]>(
    () => [
      ro<DailyProfit>("date", "Date", { width: "130px" }),
      ro<DailyProfit>("investmentId", "Investment ID", { width: "130px" }),
      ro<DailyProfit>("plan", "Plan", { width: "120px" }),
      ro<DailyProfit>("invested", "Invested", {
        width: "120px",
        align: "right",
        cell: (r) => <span className="tabular-nums">{usd(r.invested)}</span>,
      }),
      ro<DailyProfit>("roi", "Daily ROI %", { width: "120px", align: "right" }),
      ro<DailyProfit>("profit", "Profit", {
        width: "120px",
        align: "right",
        cell: (r) => <span className="tabular-nums text-emerald-500">{usd(r.profit)}</span>,
      }),
      ro<DailyProfit>("wallet", "Credited To", { width: "140px" }),
      ro<DailyProfit>("status", "Status", {
        width: "120px",
        cell: (r) => <Badge tone={r.status === "credited" ? "green" : "amber"}>{r.status}</Badge>,
      }),
    ],
    [],
  );
  const aiCols = useMemo<TableColumn<AiStrategy>[]>(
    () => [
      col<AiStrategy>("id", "ID", { width: "110px" }),
      col<AiStrategy>("name", "Strategy", { width: "1fr" }),
      col<AiStrategy>("pair", "Pair", { width: "120px" }),
      col<AiStrategy>("allocated", "Allocated", { width: "120px", align: "right" }),
      col<AiStrategy>("pnl", "PnL", { width: "100px", align: "right" }),
      col<AiStrategy>("winRate", "Win Rate %", { width: "110px", align: "right" }),
      col<AiStrategy>("status", "Status", { width: "110px" }),
    ],
    [],
  );
  const aiTradeCols = useMemo<TableColumn<AiTrade>[]>(
    () => [
      ro<AiTrade>("id", "ID", { width: "110px" }),
      ro<AiTrade>("date", "Date", { width: "160px" }),
      ro<AiTrade>("strategy", "Strategy", { width: "1fr" }),
      ro<AiTrade>("pair", "Pair", { width: "110px" }),
      ro<AiTrade>("direction", "Direction", { width: "110px" }),
      ro<AiTrade>("size", "Size", { width: "100px", align: "right" }),
      ro<AiTrade>("entry", "Entry", { width: "100px", align: "right" }),
      ro<AiTrade>("exit", "Exit", { width: "100px", align: "right" }),
      ro<AiTrade>("pnl", "PnL", {
        width: "100px",
        align: "right",
        cell: (r) => (
          <span className={cn("tabular-nums", r.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {usd(r.pnl)}
          </span>
        ),
      }),
      ro<AiTrade>("status", "Status", { width: "100px" }),
    ],
    [],
  );
  const tradeCols = useMemo<TableColumn<ManualTrade>[]>(
    () => [
      col<ManualTrade>("id", "ID", { width: "110px" }),
      col<ManualTrade>("date", "Date", { width: "160px" }),
      col<ManualTrade>("pair", "Pair", { width: "110px" }),
      col<ManualTrade>("direction", "Direction", { width: "110px" }),
      col<ManualTrade>("size", "Size", { width: "100px", align: "right" }),
      col<ManualTrade>("entry", "Entry", { width: "100px", align: "right" }),
      col<ManualTrade>("exit", "Exit", { width: "100px", align: "right" }),
      col<ManualTrade>("pnl", "PnL", { width: "100px", align: "right" }),
      col<ManualTrade>("status", "Status", { width: "100px" }),
    ],
    [],
  );
  const rewardCols = useMemo<TableColumn<Reward>[]>(
    () => [
      ro<Reward>("sentAt", "Sent On", { width: "160px" }),
      ro<Reward>("title", "Title", { width: "1fr" }),
      ro<Reward>("description", "Description", { width: "1.6fr" }),
      ro<Reward>("amount", "Amount", {
        width: "120px",
        align: "right",
        cell: (r) => <span className="tabular-nums">{usd(r.amount)}</span>,
      }),
      ro<Reward>("wallet", "Wallet", { width: "140px", cell: (r) => WALLET_LABELS[r.wallet] }),
      ro<Reward>("type", "Type", {
        width: "170px",
        cell: (r) => (
          <Badge tone={r.type === "withdrawable" ? "green" : "amber"}>
            {r.type === "withdrawable" ? "Withdrawable" : "Invest only"}
          </Badge>
        ),
      }),
      ro<Reward>("sentBy", "Sent By", { width: "130px" }),
    ],
    [],
  );
  const loginCols = useMemo<TableColumn<LoginRecord>[]>(
    () => [
      col<LoginRecord>("at", "Date & Time", { width: "160px" }),
      col<LoginRecord>("ip", "IP Address", { width: "140px" }),
      col<LoginRecord>("device", "Device", { width: "140px" }),
      col<LoginRecord>("browser", "Browser", { width: "130px" }),
      col<LoginRecord>("app", "Application", { width: "160px" }),
      col<LoginRecord>("location", "Location", { width: "130px" }),
      col<LoginRecord>("status", "Result", { width: "100px" }),
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* ---------- header + account actions ---------- */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <Badge tone={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.id} · {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
          <Btn onClick={() => router.push("/owner/users")}>Back</Btn>
          <Btn tone={user.status === "active" ? "danger" : "default"} onClick={toggleSuspend} disabled={busy}>
            {user.status === "active" ? "Suspend user" : "Activate user"}
          </Btn>
          <Btn tone="primary" onClick={() => persist(user, "Saved")} disabled={!dirty || busy}>
            {busy ? "Saving..." : dirty ? "Save changes" : "Saved"}
          </Btn>
        </div>
      </div>

      {/* ---------- tabs ---------- */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------- PROFILE ---------- */}
      {tab === "Profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" value={user.firstName} onChange={(v) => set("firstName", v)} />
              <Field label="Last Name" value={user.lastName} onChange={(v) => set("lastName", v)} />
              <Field label="User ID" value={user.id} onChange={(v) => set("id", v)} />
              <Field label="First Join Date" type="date" value={user.joinedAt} onChange={(v) => set("joinedAt", v)} />
              <Field label="Email ID" type="email" value={user.email} onChange={(v) => set("email", v)} />
              <Field label="Date of Birth" type="date" value={user.dob} onChange={(v) => set("dob", v)} />
              <Field label="Country" value={user.country} onChange={(v) => set("country", v)} />
              <Field
                label="Referred By (User ID or OWNER)"
                value={user.referredBy}
                onChange={(v) => set("referredBy", v)}
              />
            </div>
            <div className="mt-4">
              <Field label="Main Wallet Address" value={user.walletAddress} readOnly />
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card title="KYC Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="KYC Status"
                  value={user.kyc.status}
                  onChange={(v) => set("kyc", { ...user.kyc, status: v as User["kyc"]["status"] })}
                  options={[
                    { value: "verified", label: "Verified" },
                    { value: "pending", label: "Pending" },
                    { value: "rejected", label: "Rejected" },
                    { value: "not_submitted", label: "Not submitted" },
                  ]}
                />
                <Field
                  label="Document Type"
                  value={user.kyc.documentType}
                  onChange={(v) => set("kyc", { ...user.kyc, documentType: v })}
                />
                <Field
                  label="Document Number"
                  value={user.kyc.documentNumber}
                  onChange={(v) => set("kyc", { ...user.kyc, documentNumber: v })}
                />
                <Field
                  label="Submitted On"
                  type="date"
                  value={user.kyc.submittedAt}
                  onChange={(v) => set("kyc", { ...user.kyc, submittedAt: v })}
                />
              </div>
            </Card>

            <Card title="Two-Factor Authentication">
              <Checkbox
                checked={user.twoFA}
                onCheckedChange={(v) => set("twoFA", v)}
                label={user.twoFA ? "2FA is enabled" : "2FA is disabled"}
              />
            </Card>
          </div>
        </div>
      )}

      {/* ---------- WALLETS (Main + Investment only, balances editable) ---------- */}
      {tab === "Wallets" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(Object.keys(WALLET_LABELS) as WalletKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setWalletKey(k)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  walletKey === k ? "border-foreground bg-muted" : "border-border hover:bg-muted/50",
                )}
              >
                <p className="text-xs text-muted-foreground">{WALLET_LABELS[k]}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{usd(user.wallets[k].balance)}</p>
              </button>
            ))}
            <StatCard label="Total Balance" value={usd(totalWallets)} />
          </div>

          <Card title={WALLET_LABELS[walletKey]}>
            <div
              className={cn(
                "grid gap-4",
                walletKey === "main" ? "md:grid-cols-[1fr_200px]" : "md:grid-cols-[200px]",
              )}
            >
              {/* Investment wallet has no address, so only Main shows one */}
              {walletKey === "main" ? (
                <Field label="Wallet Address" value={wallet.address} readOnly />
              ) : null}
              <Field
                label="Balance (USD)"
                type="number"
                value={wallet.balance}
                onChange={(v) => setBalance(walletKey, Number(v) || 0)}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Edit the balance, then press “Save changes” at the top to apply it.
            </p>
          </Card>

          <Card title={`Transactions (${wallet.transactions.length})`}>
            <Grid data={wallet.transactions} columns={txCols} />
          </Card>
        </div>
      )}

      {/* ---------- REFERRALS ---------- */}
      {tab === "Referrals" && (
        <div className="flex flex-col gap-4">
          <Card title="Referred By">
            <div className="max-w-sm">
              <Field
                label="Referrer (User ID or OWNER)"
                value={user.referredBy}
                onChange={(v) => set("referredBy", v)}
              />
            </div>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Members Referred" value={refTotals.count} />
            <StatCard label="Total Deposit (Team)" value={usd(refTotals.deposit)} />
            <StatCard label="Total Balance (Team)" value={usd(refTotals.balance)} />
          </div>
          <Card title="Referred Members">
            <Grid data={user.referrals} columns={refCols} onCellEdit={editList("referrals")} />
          </Card>
        </div>
      )}

      {/* ---------- INVESTMENTS (daily profit details) ---------- */}
      {tab === "Investments" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Running Plans" value={invTotals.running} />
            <StatCard label="Total Invested" value={usd(invTotals.invested)} />
            <StatCard label="Total Earned" value={usd(invTotals.earned)} />
            <StatCard label="Today's Profit" value={usd(invTotals.today)} />
            <StatCard label="Profit Credits" value={invTotals.profitDays} hint="Daily payouts so far" />
          </div>

          <Card title="Investment Plans">
            <Grid data={user.investments} columns={invCols} onCellEdit={editList("investments")} />
          </Card>

          <Card title={`Daily Profit History (${filteredProfits.length})`}>
            <div className="mb-3 grid gap-3 sm:grid-cols-[240px_1fr] sm:items-end">
              <SelectField
                label="Investment"
                value={invFilter}
                onChange={setInvFilter}
                options={[
                  { value: "all", label: "All investments" },
                  ...user.investments.map((i) => ({ value: i.id, label: `${i.id} · ${i.plan}` })),
                ]}
              />
              <p className="text-sm text-muted-foreground sm:text-right">
                Total profit shown:{" "}
                <span className="font-semibold tabular-nums text-emerald-500">{usd(filteredProfitTotal)}</span>
              </p>
            </div>
            <Grid data={filteredProfits} columns={profitCols} height={380} />
          </Card>
        </div>
      )}

      {/* ---------- TRADING (AI strategy details + manual) ---------- */}
      {tab === "Trading" && (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">AI Trading</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              <StatCard label="Strategies" value={ai.count} hint={`${ai.active} active`} />
              <StatCard label="Total Invested" value={usd(ai.allocated)} />
              <StatCard
                label="Net PnL"
                value={<span className={ai.net >= 0 ? "text-emerald-500" : "text-rose-500"}>{usd(ai.net)}</span>}
              />
              <StatCard label="ROI" value={`${ai.roi.toFixed(2)}%`} />
              <StatCard label="Avg Win Rate" value={`${ai.avgWin.toFixed(1)}%`} />
              <StatCard label="AI Trades" value={ai.trades} />
            </div>
            <Card title="Invested Strategies">
              <Grid data={user.aiStrategies} columns={aiCols} onCellEdit={editList("aiStrategies")} height={240} />
            </Card>
            <Card title={`AI Trade History (${user.aiTrades.length})`}>
              <Grid data={user.aiTrades} columns={aiTradeCols} height={360} />
            </Card>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">Manual Trading</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="Total Trades" value={trade.total} />
              <StatCard label="Long / Short" value={`${trade.long} / ${trade.short}`} />
              <StatCard label="Wins / Losses" value={`${trade.wins} / ${trade.losses}`} />
              <StatCard
                label="Overall Result"
                value={<span className={trade.net >= 0 ? "text-emerald-500" : "text-rose-500"}>{usd(trade.net)}</span>}
                hint={trade.net >= 0 ? "In profit" : "In loss"}
              />
              <StatCard
                label="Win Rate"
                value={`${trade.total ? Math.round((trade.wins / trade.total) * 100) : 0}%`}
              />
            </div>
            <Card title="All Trades">
              <Grid data={user.manualTrades} columns={tradeCols} onCellEdit={editList("manualTrades")} />
            </Card>
          </section>
        </div>
      )}

      {/* ---------- REWARDS ---------- */}
      {tab === "Rewards" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Rewards Sent" value={rewardTotals.count} />
            <StatCard label="Total Rewarded" value={usd(rewardTotals.total)} />
            <StatCard label="Withdrawable" value={usd(rewardTotals.free)} />
            <StatCard label="Invest Only" value={usd(rewardTotals.locked)} />
          </div>

          <Card title="Send Reward">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Reward Title"
                value={rf.title}
                onChange={(v) => setRf((s) => ({ ...s, title: v }))}
              />
              <Field
                label="Amount (USD)"
                type="number"
                value={rf.amount}
                onChange={(v) => setRf((s) => ({ ...s, amount: v }))}
              />
              <SelectField
                label="Wallet"
                value={rf.wallet}
                onChange={(v) => setRf((s) => ({ ...s, wallet: v as RewardWallet }))}
                options={[
                  { value: "main", label: "Main Wallet" },
                  { value: "investment", label: "Investment Wallet" },
                ]}
              />
              <SelectField
                label="Reward Use"
                value={rf.type}
                onChange={(v) => setRf((s) => ({ ...s, type: v as RewardType }))}
                options={[
                  { value: "non_withdrawable", label: "Non-withdrawable (invest only, profit withdrawable)" },
                  { value: "withdrawable", label: "Withdrawable (user can withdraw)" },
                ]}
              />
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Short Description</span>
              <textarea
                value={rf.description}
                onChange={(e) => setRf((s) => ({ ...s, description: e.target.value }))}
                rows={3}
                maxLength={200}
                placeholder="Shown to the user with the reward"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <p className="mt-3 text-xs text-muted-foreground">
              {rf.type === "withdrawable"
                ? "The user can withdraw this reward like normal balance."
                : "The user can only invest this reward. Profit earned from it can be withdrawn."}
            </p>

            <div className="mt-4 flex justify-end">
              <Btn tone="primary" onClick={sendReward} disabled={rewardBusy}>
                {rewardBusy ? "Sending..." : "Send reward"}
              </Btn>
            </div>
          </Card>

          <Card title={`Reward History (${user.rewards.length})`}>
            <Grid data={user.rewards} columns={rewardCols} />
          </Card>
        </div>
      )}

      {/* ---------- SECURITY & LOGINS ---------- */}
      {tab === "Security & Logins" && (
        <div className="flex flex-col gap-4">
          <Card title="Two-Factor Authentication">
            <Checkbox
              checked={user.twoFA}
              onCheckedChange={(v) => set("twoFA", v)}
              label={user.twoFA ? "2FA is enabled" : "2FA is disabled"}
            />
          </Card>
          <Card title="Login History (IP, device, app, time)">
            <Grid data={user.logins} columns={loginCols} onCellEdit={editList("logins")} />
          </Card>
        </div>
      )}
    </div>
  );
}
```

## 4. KYC (new page)
`app/(superadmin)/owner/users/kyc/page.tsx`
```tsx
// app/(superadmin)/owner/users/kyc/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { KycView } from "@/app/(admin)/_components/kyc-view";
import { getKycData } from "@/lib/admin-kyc-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerKycPage() {
  await requireOwner();
  const applications = getKycData(); // swap for your own data source

  return (
    <SuperAdminShell active="KYC Requests">
      <KycView initial={applications} />
    </SuperAdminShell>
  );
}
```

## 5. Finance: deposits, withdrawals, history
`app/(superadmin)/owner/finance/deposits/page.tsx`
```tsx
// app/(superadmin)/owner/finance/deposits/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { DepositsView } from "@/app/(admin)/_components/deposits-view";
import { getDeposits } from "@/lib/admin-review-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerDepositsPage() {
  await requireOwner();
  const deposits = getDeposits(); // swap for your own data source

  return (
    <SuperAdminShell active="Deposits">
      <DepositsView initial={deposits} />
    </SuperAdminShell>
  );
}
```

`app/(superadmin)/owner/finance/withdrawals/page.tsx`
```tsx
// app/(superadmin)/owner/finance/withdrawals/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { WithdrawsView } from "@/app/(admin)/_components/withdraws-view";
import { getWithdraws } from "@/lib/admin-review-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerWithdrawalsPage() {
  await requireOwner();
  const withdraws = getWithdraws(); // swap for your own data source

  return (
    <SuperAdminShell active="Withdrawals">
      <WithdrawsView initial={withdraws} />
    </SuperAdminShell>
  );
}
```

`app/(superadmin)/owner/finance/history/page.tsx` (new)
```tsx
// app/(superadmin)/owner/finance/history/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { HistoryView } from "@/app/(admin)/_components/history-view";
import { getHistory } from "@/lib/admin-finance-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerHistoryPage() {
  await requireOwner();
  const items = getHistory(); // swap for your DB / API call

  return (
    <SuperAdminShell active="Fund History">
      <HistoryView items={items} />
    </SuperAdminShell>
  );
}
```

## 6. Support (new page)
`app/(superadmin)/owner/support/tickets/page.tsx`
```tsx
// app/(superadmin)/owner/support/tickets/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { SupportView } from "@/app/(admin)/_components/support-view";
import { getTickets } from "@/lib/admin-support-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerSupportPage() {
  await requireOwner();
  const tickets = getTickets(); // swap for your own data source

  return (
    <SuperAdminShell active="Support">
      <SupportView initial={tickets} />
    </SuperAdminShell>
  );
}
```

## Things to know

- **Owner-only features are gone.** To match admin exactly, these are no longer on the owner side:
  - the "Login as this user" button;
  - editable wallet address, the extra wallets, and add/delete transactions on user detail;
  - the edit/delete drawer on deposits and withdrawals.
- **Admin wording still shows on some owner pages.** The dashboard heading says "Admin Panel", deposits and withdrawals say "Admin · Finance · Live", and support replies are posted as "Admin User". The users list says "Referred By Owner" instead of "Referred By Me".
- **Two API routes need to exist.** User detail now calls `/api/owner/users/[id]` (PATCH) and `/api/owner/users/[id]/rewards` (POST). The rewards route is new on the owner side, so copy the admin one. If you'd rather reuse the admin routes, change the two `fetch` URLs back to `/api/admin/...`.
- **`requireOwner()` is on every page.** I added it to all of them, including the ones that only had a TODO comment before. It already works on the admin-management page.
- **Unused files.** `owner-dashboard.tsx`, `deposit-management.tsx` and `withdraw-management.tsx` are no longer imported. `finance-ui.tsx` and `ui.tsx` are still used by `admin-management.tsx` and the new users files, so keep those.