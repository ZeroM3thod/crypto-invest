// app/(user)/investment/cloud-mining/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowUpRight,
  ArrowDownRight,
  CloudLightning,
  Zap,
  Eye,
  ShoppingCart,
  X,
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
    default:     "bg-foreground/10 text-foreground",
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
          className="text-xs font-medium text-foreground transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-foreground transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

type ContractStatus = "Active" | "Expired";

type MiningContract = {
  id: string;
  contractId: string;
  name: string;
  hashRate: string;
  dailyEarnings: string;
  startDate: string;
  expiryDate: string;
  status: ContractStatus;
  progress: number;
};

const ACTIVE_CONTRACTS: MiningContract[] = [
  {
    id: "mc1",
    contractId: "MC-881",
    name: "Pro Miner",
    hashRate: "30 TH/s",
    dailyEarnings: "+$5.40",
    startDate: "2025-06-15",
    expiryDate: "2025-09-15",
    status: "Active",
    progress: 55,
  },
  {
    id: "mc2",
    contractId: "MC-882",
    name: "Elite Rig",
    hashRate: "15 TH/s",
    dailyEarnings: "+$2.80",
    startDate: "2025-07-01",
    expiryDate: "2025-10-01",
    status: "Active",
    progress: 35,
  },
];

type MiningPlan = {
  id: string;
  name: string;
  tier: "Starter" | "Pro" | "Elite";
  hashRate: string;
  duration: string;
  price: string;
  estDaily: string;
  estTotal: string;
  soldOut: boolean;
};

const MINING_PLANS: MiningPlan[] = [
  {
    id: "mp1",
    name: "Starter Rig",
    tier: "Starter",
    hashRate: "5 TH/s",
    duration: "30 days",
    price: "$99.00",
    estDaily: "+$0.90",
    estTotal: "+$27.00",
    soldOut: false,
  },
  {
    id: "mp2",
    name: "Pro Miner",
    tier: "Pro",
    hashRate: "30 TH/s",
    duration: "90 days",
    price: "$499.00",
    estDaily: "+$5.40",
    estTotal: "+$486.00",
    soldOut: false,
  },
  {
    id: "mp3",
    name: "Elite Rig",
    tier: "Elite",
    hashRate: "15 TH/s",
    duration: "90 days",
    price: "$249.00",
    estDaily: "+$2.80",
    estTotal: "+$252.00",
    soldOut: true,
  },
  {
    id: "mp4",
    name: "Ultra Beast",
    tier: "Elite",
    hashRate: "80 TH/s",
    duration: "180 days",
    price: "$1,299.00",
    estDaily: "+$14.40",
    estTotal: "+$2,592.00",
    soldOut: false,
  },
];

type EarningsRow = {
  id: string;
  date: string;
  contractId: string;
  hashRate: string;
  earned: string;
  wallet: string;
};

const EARNINGS_HISTORY: EarningsRow[] = [
  { id: "e1", date: "2025-07-18", contractId: "MC-881", hashRate: "30 TH/s", earned: "+$5.40", wallet: "Mining Wallet" },
  { id: "e2", date: "2025-07-18", contractId: "MC-882", hashRate: "15 TH/s", earned: "+$2.80", wallet: "Mining Wallet" },
  { id: "e3", date: "2025-07-17", contractId: "MC-881", hashRate: "30 TH/s", earned: "+$5.40", wallet: "Mining Wallet" },
  { id: "e4", date: "2025-07-17", contractId: "MC-882", hashRate: "15 TH/s", earned: "+$2.80", wallet: "Mining Wallet" },
  { id: "e5", date: "2025-07-16", contractId: "MC-881", hashRate: "30 TH/s", earned: "+$5.40", wallet: "Mining Wallet" },
  { id: "e6", date: "2025-07-16", contractId: "MC-882", hashRate: "15 TH/s", earned: "+$2.80", wallet: "Mining Wallet" },
];

const EARNINGS_COLUMNS = [
  { key: "date",       header: "Date",         width: "120px" },
  { key: "contractId", header: "Contract ID",  width: "120px" },
  { key: "hashRate",   header: "Hash Rate",    width: "110px" },
  {
    key: "earned",
    header: "Amount Earned",
    width: "130px",
    align: "right" as const,
    cell: (r: EarningsRow) => (
      <span className="text-xs font-semibold text-success">{r.earned}</span>
    ),
  },
  { key: "wallet", header: "Wallet Credited" },
];

// ── Confirm modal (simple inline) ────────────────────────────────────────────

function BuyModal({
  plan,
  onClose,
}: {
  plan: MiningPlan;
  onClose: () => void;
}) {
  const [wallet, setWallet] = useState("main");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-foreground">Confirm Purchase</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium text-foreground">{plan.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Hash Rate</span>
            <span className="font-medium text-foreground">{plan.hashRate}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium text-foreground">{plan.duration}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold text-foreground">{plan.price}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. Total Return</span>
            <span className="font-semibold text-success">{plan.estTotal}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
            Pay From Wallet
          </p>
          <select
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="main">Main Wallet</option>
            <option value="investment">Investment Wallet</option>
            <option value="mining">Mining Wallet</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-foreground py-2 text-xs font-semibold text-background transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Confirm Purchase
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Mining Contract Card ──────────────────────────────────────────────────────

function ContractCard({ contract }: { contract: MiningContract }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{contract.name}</p>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">{contract.contractId}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge label={contract.status} tone={contract.status === "Active" ? "success" : "muted"} />
          <div className="grid size-8 place-items-center rounded-xl bg-muted text-muted-foreground">
            <CloudLightning className="size-4" />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Hash Rate</span>
          <span className="font-medium text-foreground">{contract.hashRate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Daily Earnings</span>
          <span className="font-semibold text-success">{contract.dailyEarnings}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Start Date</span>
          <span className="font-medium text-foreground">{contract.startDate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Expiry Date</span>
          <span className="font-medium text-foreground">{contract.expiryDate}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Contract duration</span>
          <span>{contract.progress}%</span>
        </div>
        <ProgressBar value={contract.progress} />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Eye className="size-3" />
        View Earnings
      </button>
    </Card>
  );
}

// ── Mining Plan Purchase Card ─────────────────────────────────────────────────

const tierTone = (t: MiningPlan["tier"]): "default" | "success" | "warning" => {
  if (t === "Starter") return "default";
  if (t === "Pro")     return "success";
  return "warning";
};

function PlanPurchaseCard({
  plan,
  onBuy,
}: {
  plan: MiningPlan;
  onBuy: (plan: MiningPlan) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{plan.name}</p>
            <Badge label={plan.tier} tone={tierTone(plan.tier)} />
          </div>
          <p className="text-lg font-semibold text-foreground">{plan.price}</p>
        </div>
        <div className="grid size-8 place-items-center rounded-xl bg-muted text-muted-foreground shrink-0">
          <Zap className="size-4" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Hash Rate</span>
          <span className="font-medium text-foreground">{plan.hashRate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium text-foreground">{plan.duration}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Est. Daily Earnings</span>
          <span className="font-semibold text-success">{plan.estDaily}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Est. Total Return</span>
          <span className="font-semibold text-success">{plan.estTotal}</span>
        </div>
      </div>

      {plan.soldOut ? (
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-semibold text-muted-foreground cursor-not-allowed">
          <Badge label="Sold Out" tone="muted" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onBuy(plan)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-2 text-xs font-semibold text-background transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShoppingCart className="size-3" />
          Buy Now
        </button>
      )}
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CloudMiningPage() {
  const [buyingPlan, setBuyingPlan] = useState<MiningPlan | null>(null);
  const loading = false;

  return (
    <UserShell active="Cloud Mining">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ───────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Cloud Mining
          </h1>
        </div>

        {/* ── Mining Summary Stats ───────────────── */}
        <section aria-label="Mining Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Hash Rate",      value: "45 TH/s",    delta: { value: "2 active contracts", positive: true  } },
              { label: "Today's Earnings",     value: "+$8.20",     delta: { value: "Credited today",     positive: true  } },
              { label: "Total Mining Earnings",value: "+$320.00",   delta: { value: "All time",           positive: true  } },
              { label: "Active Contracts",     value: "2",          delta: { value: "Running now",        positive: true  } },
            ].map((item) => (
              <Card key={item.label}>
                <Stat label={item.label} value={item.value} delta={item.delta} loading={loading} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Active Contracts ────────────────────── */}
        <section aria-label="Active Mining Contracts">
          <SectionHeader title="Active Contracts" />
          {ACTIVE_CONTRACTS.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <CloudLightning className="size-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No active mining contracts. Purchase a plan to start mining.
                </p>
                <button
                  type="button"
                  className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Browse Plans
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVE_CONTRACTS.map((contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          )}
        </section>

        {/* ── Available Mining Plans ─────────────── */}
        <section aria-label="Available Mining Plans">
          <SectionHeader title="Available Plans" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MINING_PLANS.map((plan) => (
              <PlanPurchaseCard key={plan.id} plan={plan} onBuy={setBuyingPlan} />
            ))}
          </div>
        </section>

        {/* ── Mining Earnings History ─────────────── */}
        <section aria-label="Mining Earnings History">
          <SectionHeader title="Earnings History" actionLabel="View all" action={() => {}} />
          <Table
            data={EARNINGS_HISTORY}
            columns={EARNINGS_COLUMNS}
            getRowId={(r) => r.id}
            height={280}
            rowHeight={44}
          />
        </section>

        <div className="h-20" />
      </div>

      {/* ── Buy Confirmation Modal ──────────────── */}
      {buyingPlan && (
        <BuyModal plan={buyingPlan} onClose={() => setBuyingPlan(null)} />
      )}
    </UserShell>
  );
}