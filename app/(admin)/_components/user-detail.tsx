// app/(admin)/_components/user-detail.tsx
// Admin copy of the owner's user detail: read-only for owner-only actions.
// Admins can view everything and edit profile/KYC data, but cannot impersonate
// users or adjust wallet balances/transactions (owner-only, enforced in
// lib/auth/require-admin.ts + app/api/admin/users/[id]/route.ts).
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/motion/table";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import type {
  AiStrategy,
  Investment,
  LoginRecord,
  ManualTrade,
  ReferralMember,
  Tx,
  User,
  WalletKey,
} from "@/lib/users-data";
import { Badge, Btn, Card, Field, SelectField, StatCard } from "./ui";

const TABS = ["Profile", "Wallets", "Referrals", "Investments", "Trading", "Security & Logins"] as const;
type Tab = (typeof TABS)[number];

const WALLET_LABELS: Record<WalletKey, string> = {
  main: "Main Wallet",
  mining: "Mining Wallet",
  investment: "Investment Wallet",
  trading: "Trading Wallet",
  referral: "Referral Wallet",
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

export function UserDetail({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [saved, setSaved] = useState<User>(initialUser);
  const [tab, setTab] = useState<Tab>("Profile");
  const [walletKey, setWalletKey] = useState<WalletKey>("main");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const dirty = JSON.stringify(user) !== JSON.stringify(saved);
  const set = <K extends keyof User>(key: K, value: User[K]) =>
    setUser((u) => ({ ...u, [key]: value }));

  /** Generic cell-edit handler for the top-level arrays. */
  const editList =
    (list: "referrals" | "investments" | "aiStrategies" | "manualTrades" | "logins") =>
    (rowId: string, key: string, value: string) =>
      setUser((u) => ({
        ...u,
        [list]: (u[list] as unknown as Record<string, unknown>[]).map((r) =>
          r.id === rowId ? { ...r, [key]: coerce(r[key], value) } : r,
        ),
      }));

  /** Persist to your backend. Admins may not touch wallet balances — see
   *  app/api/admin/users/[id]/route.ts, which rejects owner-only fields. */
  async function persist(next: User, message: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.status === 403) throw new Error("owner-only");
      if (!res.ok) throw new Error(String(res.status));
      setUser(next);
      setSaved(next);
      setNote(message);
    } catch (err) {
      setNote(
        err instanceof Error && err.message === "owner-only"
          ? "Owner-only change. Ask the account owner to apply it."
          : "Save failed. Check your API route.",
      );
    } finally {
      setBusy(false);
      setTimeout(() => setNote(null), 3000);
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

  // ---------- derived numbers ----------
  const wallet = user.wallets[walletKey];
  const refTotals = useMemo(
    () => ({
      count: user.referrals.length,
      deposit: user.referrals.reduce((s, r) => s + r.totalDeposit, 0),
      balance: user.referrals.reduce((s, r) => s + r.balance, 0),
    }),
    [user.referrals],
  );
  const invTotals = useMemo(
    () => ({
      running: user.investments.filter((i) => i.status === "running").length,
      invested: user.investments.reduce((s, i) => s + i.amount, 0),
      earned: user.investments.reduce((s, i) => s + i.earned, 0),
    }),
    [user.investments],
  );
  const trade = useMemo(() => {
    const t = user.manualTrades;
    return {
      total: t.length,
      long: t.filter((x) => x.direction === "long").length,
      short: t.filter((x) => x.direction === "short").length,
      wins: t.filter((x) => x.pnl > 0).length,
      losses: t.filter((x) => x.pnl < 0).length,
      net: t.reduce((s, x) => s + x.pnl, 0),
      aiNet: user.aiStrategies.reduce((s, x) => s + x.pnl, 0),
    };
  }, [user.manualTrades, user.aiStrategies]);

  // ---------- columns ----------
  const txCols = useMemo<TableColumn<Tx>[]>(
    () => [
      col<Tx>("date", "Date", { width: "170px", editable: false }),
      col<Tx>("type", "Type", { width: "120px", editable: false }),
      col<Tx>("amount", "Amount", { width: "120px", align: "right", editable: false }),
      col<Tx>("status", "Status", { width: "120px", editable: false }),
      col<Tx>("hash", "Tx Hash / Ref", { width: "1fr", editable: false }),
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
          <Btn onClick={() => router.push("/admin/users")}>Back</Btn>
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
              <Field label="Referred By (User ID or OWNER)" value={user.referredBy} onChange={(v) => set("referredBy", v)} />
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

      {/* ---------- WALLETS ---------- */}
      {tab === "Wallets" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
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
          </div>

          <Card title={`${WALLET_LABELS[walletKey]} (read-only)`}>
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <Field label="Wallet Address" value={wallet.address} readOnly />
              <Field label="Balance (USD)" type="number" value={wallet.balance} readOnly />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Balances and transactions are owner-only. Ask the account owner to adjust them.
            </p>
          </Card>

          <Card title={`Transactions (${wallet.transactions.length})`}>
            <p className="mb-2 text-xs text-muted-foreground">
              Read-only for admins. Balances and transactions are owner-only.
            </p>
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

      {/* ---------- INVESTMENTS ---------- */}
      {tab === "Investments" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Running Plans" value={invTotals.running} />
            <StatCard label="Total Invested" value={usd(invTotals.invested)} />
            <StatCard label="Total Earned" value={usd(invTotals.earned)} />
          </div>
          <Card title="Investment Plans">
            <Grid data={user.investments} columns={invCols} onCellEdit={editList("investments")} />
          </Card>
        </div>
      )}

      {/* ---------- TRADING ---------- */}
      {tab === "Trading" && (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">AI Trading</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Strategies" value={user.aiStrategies.length} />
              <StatCard
                label="Allocated"
                value={usd(user.aiStrategies.reduce((s, x) => s + x.allocated, 0))}
              />
              <StatCard label="Net PnL" value={usd(trade.aiNet)} />
            </div>
            <Card>
              <Grid data={user.aiStrategies} columns={aiCols} onCellEdit={editList("aiStrategies")} height={220} />
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
