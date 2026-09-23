// app/(user)/wallet/referral/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowUpRight,
  ArrowLeftRight,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Table } from "@/components/motion/table";
import { AccountTransfer } from "@/components/motion/account-transfer";

// ── Shared primitives ──────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" }) {
  const colors: Record<string, string> = {
    default:     "bg-foreground/10 text-foreground",
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
          className="text-xs font-medium text-foreground transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Filter Bar ─────────────────────────────────────────────────────────────

function FilterBar({ type, setType }: { type: string; setType: (v: string) => void }) {
  const types = ["All", "Commission", "Transfer"];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-card px-3 py-1.5 w-fit">
      <span className="text-[11px] font-medium text-muted-foreground mr-1">Type:</span>
      {types.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setType(t)}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            type === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

const REFERRAL_LINK = "https://app.example.com/ref/AVA-7821";

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
  { id: "r1", date: "2025-07-18", type: "Commission", asset: "USDT", amount: "+$48.00", status: "Completed", txHash: "0x4f3a…c91e" },
  { id: "r2", date: "2025-07-16", type: "Commission", asset: "USDT", amount: "+$32.00", status: "Completed", txHash: "0x8b2d…f04c" },
  { id: "r3", date: "2025-07-14", type: "Commission", asset: "USDT", amount: "+$18.00", status: "Completed", txHash: "0x1c7e…a83b" },
  { id: "r4", date: "2025-07-12", type: "Transfer",   asset: "USDT", amount: "-$50.00", status: "Completed", txHash: "0x9d5f…7721" },
  { id: "r5", date: "2025-07-10", type: "Commission", asset: "USDT", amount: "+$24.00", status: "Completed", txHash: "0x3e2a…bb49" },
  { id: "r6", date: "2025-07-08", type: "Commission", asset: "USDT", amount: "+$12.00", status: "Pending",   txHash: "0x6f1c…2d30" },
];

const TX_COLUMNS = [
  { key: "date",   header: "Date",   width: "110px" },
  { key: "type",   header: "Type",   width: "110px" },
  { key: "asset",  header: "Asset",  width: "80px" },
  { key: "amount", header: "Amount", width: "120px", align: "right" as const },
  {
    key: "status", header: "Status", width: "100px",
    cell: (r: Transaction) => {
      const tone: Record<Transaction["status"], string> = {
        Completed: "text-success",
        Pending:   "text-foreground",
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

function Modal({ open, onClose, title, children, maxWidth = "max-w-sm" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-4xl border border-border bg-card p-6 shadow-xl`}>
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
  return (
    <Modal open={open} onClose={onClose} title="Transfer" maxWidth="max-w-[460px]">
      <div className="flex w-full items-center justify-center">
        <AccountTransfer
          defaultFromId="main"
          defaultToId="investment"
          onConfirm={({ fromId, toId, amount }) => {
            // TODO: call your actual transfer API / update balances here
            console.log("Transfer confirmed:", { fromId, toId, amount });
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ReferralWalletPage() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [linkCopied,   setLinkCopied]   = useState(false);
  const [typeFilter,   setTypeFilter]   = useState("All");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const filtered = TRANSACTIONS.filter((t) => typeFilter === "All" || t.type === typeFilter);

  return (
    <UserShell active="Wallet">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Heading ───────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Referral Wallet
          </h1>
        </div>

        {/* ── Balance Card ──────────────────────────────── */}
        <section aria-label="Wallet Balance">
          <div className="flex w-full flex-col items-start gap-4 p-2">
            <Card className="w-full">
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Referral Balance</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">$970.00</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                      <ArrowUpRight className="size-3" />
                      +$48.00 this week
                    </p>
                  </div>
                  <Badge label="Earning" tone="success" />
                </div>

                {/* Referral link */}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Your Referral Link</p>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2">
                    <span className="text-xs text-muted-foreground flex-1 truncate">{REFERRAL_LINK}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="grid size-7 place-items-center rounded-xl bg-card text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                      title="Copy referral link"
                    >
                      {linkCopied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted py-3 text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Users className="size-4" />
                    <span className="text-[11px] font-semibold">Referrals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferOpen(true)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted py-3 text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ArrowLeftRight className="size-4" />
                    <span className="text-[11px] font-semibold">Transfer to Main</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Stats Row ─────────────────────────────────── */}
        <section aria-label="Referral Stats">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Referrals",  value: "14",      delta: { value: "All time",   positive: true } },
              { label: "Active Referrals", value: "9",       delta: { value: "This month", positive: true } },
              { label: "Total Earnings",   value: "+$970.00",delta: { value: "Credited",   positive: true } },
              { label: "Pending",          value: "$120.00", delta: { value: "Clearing",   positive: true } },
            ].map((item) => (
              <Card key={item.label}>
                <Stat label={item.label} value={item.value} delta={item.delta} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Transaction History ───────────────────────── */}
        <section aria-label="Transaction History">
          <SectionHeader title="Commission History" actionLabel="Export CSV" action={() => {}} />
          <FilterBar type={typeFilter} setType={setTypeFilter} />
          <Table
            data={filtered}
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