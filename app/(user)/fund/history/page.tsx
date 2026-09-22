// app/(user)/fund/history/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Search,
  Send,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

// ── Shared primitives ──────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: {
  label: string;
  tone?: "default" | "success" | "destructive" | "muted" | "warning";
}) {
  const colors: Record<string, string> = {
    default:     "bg-primary/10 text-primary",
    success:     "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted:       "bg-muted text-muted-foreground",
    warning:     "bg-yellow-500/10 text-yellow-500",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}>
      {label}
    </span>
  );
}

// ── Types & data ───────────────────────────────────────────────────────────

type TxType   = "Deposit" | "Withdrawal" | "Send" | "Receive" | "Fee";
type TxStatus = "Completed" | "Pending" | "Failed" | "Rejected" | "Cancelled" | "Confirming" | "Processing";

type Transaction = {
  id: string;
  txId: string;
  type: TxType;
  status: TxStatus;
  amount: string;
  fee: string;
  net: string;
  coin: string;
  blockchain?: string;
  counterparty?: string;
  txHash?: string;
  date: string;
  description: string;
};

const ALL_TRANSACTIONS: Transaction[] = [
  {
    id: "1", txId: "TXN-20260922-00142", type: "Deposit",    status: "Completed",  amount: "+$500.00",   fee: "$0.00",  net: "+$500.00",
    coin: "USDT", blockchain: "ERC-20", txHash: "0x4f3a…c91e", date: "2026-09-22", description: "Crypto deposit via ERC-20",
  },
  {
    id: "2", txId: "TXN-20260920-00138", type: "Withdrawal", status: "Pending",     amount: "-$200.00",   fee: "$20.00", net: "-$180.00",
    coin: "USDT", blockchain: "TRC-20", date: "2026-09-20", description: "Withdrawal to external wallet",
  },
  {
    id: "3", txId: "TXN-20260918-00131", type: "Send",       status: "Completed",  amount: "-$100.10",   fee: "$0.10",  net: "-$100.00",
    coin: "USD",  counterparty: "Alice Johnson", date: "2026-09-18", description: "Sent to Alice Johnson",
  },
  {
    id: "4", txId: "TXN-20260916-00120", type: "Receive",    status: "Completed",  amount: "+$80.00",    fee: "$0.00",  net: "+$80.00",
    coin: "USD",  counterparty: "Bob Martinez", date: "2026-09-16", description: "Received from Bob Martinez",
  },
  {
    id: "5", txId: "TXN-20260914-00115", type: "Deposit",    status: "Confirming", amount: "+$1,000.00", fee: "$0.00",  net: "+$1,000.00",
    coin: "USDC", blockchain: "BEP-20", txHash: "0x8b2d…f04c", date: "2026-09-14", description: "Crypto deposit via BEP-20",
  },
  {
    id: "6", txId: "TXN-20260910-00101", type: "Withdrawal", status: "Rejected",   amount: "-$50.00",    fee: "$5.00",  net: "-$45.00",
    coin: "USDT", blockchain: "ERC-20", date: "2026-09-10", description: "Withdrawal rejected — invalid address",
  },
  {
    id: "7", txId: "TXN-20260908-00099", type: "Send",       status: "Failed",     amount: "-$30.10",    fee: "$0.10",  net: "-$30.00",
    coin: "USD",  counterparty: "Unknown", date: "2026-09-08", description: "Send failed — recipient not found",
  },
  {
    id: "8", txId: "TXN-20260901-00088", type: "Receive",    status: "Completed",  amount: "+$250.00",   fee: "$0.00",  net: "+$250.00",
    coin: "USD",  counterparty: "Charlie Kim", date: "2026-09-01", description: "Received from Charlie Kim",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function statusTone(s: TxStatus): "success" | "warning" | "destructive" | "muted" | "default" {
  const map: Record<TxStatus, "success" | "warning" | "destructive" | "muted" | "default"> = {
    Completed:   "success",
    Pending:     "warning",
    Confirming:  "warning",
    Processing:  "warning",
    Failed:      "destructive",
    Rejected:    "destructive",
    Cancelled:   "muted",
  };
  return map[s];
}

function typeIcon(t: TxType) {
  const cls = "size-4";
  if (t === "Deposit")    return <ArrowDownLeft className={cls} />;
  if (t === "Withdrawal") return <ArrowUpRight  className={cls} />;
  if (t === "Send")       return <Send          className={cls} />;
  if (t === "Receive")    return <ArrowDownLeft className={cls} />;
  return <ChevronDown className={cls} />;
}

function typeBg(t: TxType) {
  if (t === "Deposit" || t === "Receive") return "bg-success/10 text-success";
  if (t === "Withdrawal" || t === "Send") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

// ── Detail Drawer ──────────────────────────────────────────────────────────

function TransactionDetailDrawer({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  if (!tx) return null;
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Transaction ID", value: tx.txId, mono: true },
    { label: "Type",           value: tx.type },
    { label: "Status",         value: tx.status },
    { label: "Amount",         value: tx.amount },
    { label: "Fee",            value: tx.fee },
    { label: "Net Amount",     value: tx.net },
    { label: "Coin",           value: tx.coin },
    ...(tx.blockchain   ? [{ label: "Blockchain",   value: tx.blockchain }]              : []),
    ...(tx.txHash       ? [{ label: "Tx Hash",      value: tx.txHash,  mono: true }]     : []),
    ...(tx.counterparty ? [{ label: "Counterparty", value: tx.counterparty }]             : []),
    { label: "Date",           value: tx.date },
    { label: "Description",    value: tx.description },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`grid size-8 place-items-center rounded-xl ${typeBg(tx.type)}`}>
              {typeIcon(tx.type)}
            </div>
            <p className="text-sm font-semibold text-foreground">{tx.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={tx.status} tone={statusTone(tx.status)} />
            <button
              type="button"
              onClick={onClose}
              className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/70 outline-none transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Amount hero */}
        <div className="text-center py-2">
          <p className={`text-2xl font-bold ${tx.amount.startsWith("+") ? "text-success" : "text-destructive"}`}>
            {tx.amount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{tx.description}</p>
        </div>

        {/* Rows */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{row.label}</span>
              <span className={`text-right font-medium text-foreground break-all ${row.mono ? "font-mono" : ""}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-muted py-3 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Filter Bar ─────────────────────────────────────────────────────────────

const TYPE_FILTERS: { label: string; value: TxType | "All" }[] = [
  { label: "All",        value: "All" },
  { label: "Deposits",   value: "Deposit" },
  { label: "Withdrawals",value: "Withdrawal" },
  { label: "Sends",      value: "Send" },
  { label: "Receives",   value: "Receive" },
];

const STATUS_OPTIONS: { label: string; value: TxStatus | "All" }[] = [
  { label: "All Statuses",  value: "All" },
  { label: "Completed",     value: "Completed" },
  { label: "Pending",       value: "Pending" },
  { label: "Failed",        value: "Failed" },
  { label: "Rejected",      value: "Rejected" },
  { label: "Confirming",    value: "Confirming" },
];

// ── Main Page ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export default function FundHistoryPage() {
  const [typeFilter, setTypeFilter]     = useState<TxType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TxStatus | "All">("All");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_TRANSACTIONS;
    if (typeFilter !== "All")   list = list.filter((t) => t.type === typeFilter);
    if (statusFilter !== "All") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.txId.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.txHash ?? "").toLowerCase().includes(q) ||
        (t.counterparty ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [typeFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  return (
    <UserShell active="Fund">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* Heading */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Fund</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Fund History
          </h1>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Deposits",     value: "$1,500.00", tone: "text-success"     },
            { label: "Total Withdrawals",  value: "$250.00",   tone: "text-destructive" },
            { label: "Total Sent",         value: "$130.10",   tone: "text-destructive" },
            { label: "Total Received",     value: "$330.00",   tone: "text-success"     },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-lg font-semibold ${s.tone}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <section aria-label="Filters">
          {/* Type tabs */}
          <div className="mb-3 flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setTypeFilter(f.value); resetPage(); }}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  typeFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search + status */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 focus-within:border-primary transition-colors">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Search by ID, hash, counterparty…"
                className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(""); resetPage(); }} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Status select */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as TxStatus | "All"); resetPage(); }}
                className="appearance-none rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary transition-colors cursor-pointer pr-9"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Transaction list */}
        <section aria-label="Transactions">
          {paginated.length === 0 ? (
            <Card className="text-center py-8 text-muted-foreground text-sm">
              No transactions match your filters.
            </Card>
          ) : (
            <div className="space-y-2">
              {paginated.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelected(tx)}
                  className="w-full flex items-center gap-4 rounded-3xl border border-border bg-card px-5 py-4 text-left hover:bg-muted/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* Icon */}
                  <div className={`grid size-9 place-items-center rounded-xl shrink-0 ${typeBg(tx.type)}`}>
                    {typeIcon(tx.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{tx.type}</p>
                      <Badge label={tx.status} tone={statusTone(tx.status)} />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{tx.description}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{tx.txId}</p>
                  </div>

                  {/* Amount + date */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-success" : "text-destructive"}`}>
                      {tx.amount}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{tx.date}</p>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} &mdash; {filtered.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-2xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed outline-none transition-colors"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-2xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed outline-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="h-20" />
      </div>

      {/* Detail drawer */}
      <TransactionDetailDrawer tx={selected} onClose={() => setSelected(null)} />
    </UserShell>
  );
}