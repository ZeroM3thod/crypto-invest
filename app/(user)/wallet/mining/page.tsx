// app/(user)/wallet/mining/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowUpRight,
  ArrowLeftRight,
  CloudLightning,
} from "lucide-react";
import { useState } from "react";
import { Table } from "@/components/motion/table";

// ── Shared primitives (identical to dashboard) ──────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" }) {
  const colors: Record<string, string> = {
    default:     "bg-primary/10 text-primary",
    success:     "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted:       "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}>
      {label}
    </span>
  );
}

function Stat({ label, value, delta, loading = false }: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-lg font-semibold text-foreground">{value}</p>
      )}
      {delta && !loading && (
        <p className={`flex items-center gap-1 text-xs font-medium ${delta.positive ? "text-success" : "text-destructive"}`}>
          {delta.positive ? <ArrowUpRight className="size-3" /> : null}
          {delta.value}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }: {
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

// ── Data ────────────────────────────────────────────────────────────────────

type Transaction = {
  id: string;
  date: string;
  type: string;
  asset: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  txHash: string;
};

const TRANSACTIONS: Transaction[] = [
  { id: "m1", date: "2025-07-18", type: "Mining Earnings", asset: "BTC",  amount: "+$12.40", status: "Completed", txHash: "0x4f3a…c91e" },
  { id: "m2", date: "2025-07-17", type: "Mining Earnings", asset: "BTC",  amount: "+$11.80", status: "Completed", txHash: "0x8b2d…f04c" },
  { id: "m3", date: "2025-07-16", type: "Mining Earnings", asset: "BTC",  amount: "+$12.10", status: "Completed", txHash: "0x1c7e…a83b" },
  { id: "m4", date: "2025-07-15", type: "Transfer",        asset: "USDT", amount: "-$50.00", status: "Completed", txHash: "0x9d5f…7721" },
  { id: "m5", date: "2025-07-14", type: "Mining Earnings", asset: "BTC",  amount: "+$11.50", status: "Completed", txHash: "0x3e2a…bb49" },
  { id: "m6", date: "2025-07-13", type: "Mining Earnings", asset: "BTC",  amount: "+$12.00", status: "Pending",   txHash: "0x6f1c…2d30" },
];

const TX_COLUMNS = [
  { key: "date",   header: "Date",   width: "110px" },
  { key: "type",   header: "Type",   width: "150px" },
  { key: "asset",  header: "Asset",  width: "80px" },
  { key: "amount", header: "Amount", width: "120px", align: "right" as const },
  {
    key: "status", header: "Status", width: "100px",
    cell: (r: Transaction) => {
      const tone: Record<Transaction["status"], string> = {
        Completed: "text-success",
        Pending:   "text-primary",
        Failed:    "text-destructive",
      };
      return <span className={`text-xs font-semibold ${tone[r.status]}`}>{r.status}</span>;
    },
  },
  {
    key: "txHash", header: "Tx Hash",
    cell: (r: Transaction) => (
      <span className="font-mono text-xs text-muted-foreground">{r.txHash}</span>
    ),
  },
];

// ── Modal ───────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-4xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="text-xs font-medium text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Transfer to Main">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Move your accumulated mining earnings to your Main Wallet for withdrawal or reinvestment.
        </p>
        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Amount (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Mining balance: $540.20 · Instant · No fees</p>
        <button type="button" className="w-full rounded-2xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Transfer to Main
        </button>
      </div>
    </Modal>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function MiningWalletPage() {
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <UserShell active="Wallet">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Heading ───────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Mining Wallet
          </h1>
        </div>

        {/* ── Balance Card ──────────────────────────────── */}
        <section aria-label="Wallet Balance">
          <div className="flex w-full flex-col items-start gap-4 p-2">
            <Card className="w-full">
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Mining Balance</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">$540.20</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                      <ArrowUpRight className="size-3" />
                      +$12.40 today
                    </p>
                  </div>
                  <Badge label="Active" tone="success" />
                </div>

                {/* Hashrate indicator */}
                <div className="rounded-2xl bg-muted px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Current Hashrate</p>
                    <p className="text-sm font-semibold text-foreground">120 TH/s</p>
                  </div>
                  <CloudLightning className="size-5 text-muted-foreground" />
                </div>

                <button
                  type="button"
                  onClick={() => setTransferOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeftRight className="size-4" />
                  <span className="text-[11px] font-semibold">Transfer to Main</span>
                </button>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Stats Row ─────────────────────────────────── */}
        <section aria-label="Mining Stats">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Active Contracts", value: "2",       delta: { value: "Running",  positive: true } },
              { label: "Total Invested",   value: "$980.25", delta: { value: "All time", positive: true } },
              { label: "Hashrate",         value: "120 TH/s",delta: { value: "Combined",positive: true } },
              { label: "Today's Earnings", value: "+$12.40", delta: { value: "Credited", positive: true } },
            ].map((item) => (
              <Card key={item.label}>
                <Stat label={item.label} value={item.value} delta={item.delta} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Transaction History ───────────────────────── */}
        <section aria-label="Transaction History">
          <SectionHeader title="Transaction History" actionLabel="Export CSV" action={() => {}} />
          <Table
            data={TRANSACTIONS}
            columns={TX_COLUMNS}
            getRowId={(r) => r.id}
            height={320}
            rowHeight={44}
          />
        </section>

        <div className="h-20" />
      </div>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
    </UserShell>
  );
}
