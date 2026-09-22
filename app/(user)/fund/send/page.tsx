// app/(user)/fund/send/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// ── Shared primitives ──────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, actionLabel, action }: { title: string; actionLabel?: string; action?: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action && actionLabel && (
        <button type="button" onClick={action} className="text-xs font-medium text-primary hover:opacity-75 outline-none">
          {actionLabel}
        </button>
      )}
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

// ── Mock recipient lookup ──────────────────────────────────────────────────

type Recipient = { id: string; name: string; email: string; walletAddress: string };

const MOCK_USERS: Recipient[] = [
  { id: "USR-0012", name: "Alice Johnson", email: "alice@example.com", walletAddress: "0xA0b8…6EB4" },
  { id: "USR-0034", name: "Bob Martinez",  email: "bob@example.com",   walletAddress: "0xB2C3…9F1D" },
];

function findRecipient(query: string): Recipient | null {
  const q = query.toLowerCase().trim();
  return MOCK_USERS.find(
    (u) =>
      u.email.toLowerCase() === q ||
      u.id.toLowerCase() === q ||
      u.walletAddress.toLowerCase().includes(q),
  ) ?? null;
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────

function SendConfirmDialog({
  open, onClose, onConfirm, data,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: { recipient: Recipient; amount: number; fee: number; total: number };
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Confirm Send</p>
          <button type="button" onClick={onClose} className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/70 outline-none transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Recipient */}
        <div className="rounded-2xl bg-muted/40 p-4 space-y-1">
          <p className="text-[11px] text-muted-foreground">Sending To</p>
          <p className="text-sm font-semibold text-foreground">{data.recipient.name}</p>
          <p className="text-xs text-muted-foreground">{data.recipient.email}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{data.recipient.walletAddress}</p>
        </div>

        <div className="space-y-2">
          {[
            { label: "Send Amount",      value: `$${data.amount.toFixed(2)}` },
            { label: "Transaction Fee",  value: `$${data.fee.toFixed(2)}` },
            { label: "Total Deducted",   value: `$${data.total.toFixed(2)}`, strong: true },
            { label: "Recipient Gets",   value: `$${data.amount.toFixed(2)}`, positive: true },
            { label: "From",             value: "Main Wallet" },
            { label: "Transaction Type", value: "Send" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-medium ${row.positive ? "text-success" : row.strong ? "text-foreground font-semibold" : "text-foreground"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-muted py-3 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors outline-none">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors outline-none">
            Confirm Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success Dialog ─────────────────────────────────────────────────────────

function SendSuccessDialog({
  open, onClose, data,
}: {
  open: boolean;
  onClose: () => void;
  data: { recipient: Recipient; amount: number; fee: number; total: number; txId: string; time: string };
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  function copyTx() {
    navigator.clipboard.writeText(data.txId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">Transaction Successful</p>
          <Badge label="Completed" tone="success" />
        </div>

        {/* Tx ID */}
        <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-3">
          <p className="flex-1 font-mono text-xs text-foreground break-all">{data.txId}</p>
          <button type="button" onClick={copyTx} className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/70 outline-none transition-colors">
            {copied ? <CheckCircle2 className="size-4 text-success" /> : <Copy className="size-4" />}
          </button>
        </div>

        <div className="space-y-2">
          {[
            { label: "Amount Sent",     value: `$${data.amount.toFixed(2)}` },
            { label: "Fee",             value: `$${data.fee.toFixed(2)}` },
            { label: "Total Deducted",  value: `$${data.total.toFixed(2)}` },
            { label: "Recipient",       value: data.recipient.name },
            { label: "Recipient ID",    value: data.recipient.id, mono: true },
            { label: "Date & Time",     value: data.time },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-medium text-foreground ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose} className="w-full rounded-2xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors outline-none">
          Done
        </button>
      </div>
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────

const SEND_FEE     = 0.10;
const AVAILABLE    = 1250.00;

// ── Mock send history ──────────────────────────────────────────────────────

type SendRecord = { id: string; to: string; amount: string; fee: string; date: string; status: "Completed" | "Failed" };

const SEND_HISTORY: SendRecord[] = [
  { id: "TXN-20260901-00112", to: "Alice Johnson", amount: "$50.00",  fee: "$0.10", date: "2026-09-01", status: "Completed" },
  { id: "TXN-20260828-00098", to: "Bob Martinez",  amount: "$120.00", fee: "$0.10", date: "2026-08-28", status: "Completed" },
  { id: "TXN-20260810-00075", to: "Alice Johnson", amount: "$30.00",  fee: "$0.10", date: "2026-08-10", status: "Failed" },
];

// ── Main Page ──────────────────────────────────────────────────────────────

type SearchType = "email" | "userId" | "address";

export default function SendPage() {
  const [searchType, setSearchType] = useState<SearchType>("email");
  const [query, setQuery]           = useState("");
  const [recipient, setRecipient]   = useState<Recipient | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [amount, setAmount]         = useState("");
  const [amountError, setAmountError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txId] = useState(`TXN-${Date.now()}`);

  const amountNum = parseFloat(amount) || 0;
  const fee       = SEND_FEE;
  const total     = amountNum + fee;

  function handleLookup() {
    setLookupError("");
    const found = findRecipient(query);
    if (!found) { setLookupError("No account found with that email, user ID, or wallet address."); return; }
    setRecipient(found);
  }

  function handleSend() {
    setAmountError("");
    if (!amountNum || isNaN(amountNum)) { setAmountError("Please enter a valid amount."); return; }
    if (total > AVAILABLE) { setAmountError(`Insufficient balance. You need $${total.toFixed(2)} but have $${AVAILABLE.toFixed(2)}.`); return; }
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    setShowSuccess(true);
  }

  const now = new Date().toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const searchPlaceholder: Record<SearchType, string> = {
    email:   "user@example.com",
    userId:  "USR-0012",
    address: "0xA0b8…6EB4",
  };

  return (
    <UserShell active="Fund">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* Heading */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Fund</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Send</h1>
        </div>

        {/* Balance */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Available Balance</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              ${AVAILABLE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Main Wallet</p>
          </div>
          <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Send className="size-5" />
          </div>
        </Card>

        {/* Recipient */}
        <section aria-label="Recipient">
          <SectionHeader title="Find Recipient" />
          <Card className="space-y-4">

            {/* Search type toggle */}
            <div className="flex rounded-2xl bg-muted p-1 gap-1">
              {(["email", "userId", "address"] as SearchType[]).map((t) => {
                const label: Record<SearchType, string> = { email: "Email", userId: "User ID", address: "Wallet" };
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSearchType(t); setQuery(""); setRecipient(null); setLookupError(""); }}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors outline-none ${
                      searchType === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label[t]}
                  </button>
                );
              })}
            </div>

            {/* Search input */}
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 focus-within:border-primary transition-colors">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setRecipient(null); setLookupError(""); }}
                  placeholder={searchPlaceholder[searchType]}
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                />
              </div>
              <button
                type="button"
                onClick={handleLookup}
                disabled={!query.trim()}
                className="rounded-2xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90 transition-colors outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>

            {lookupError && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <XCircle className="size-4 shrink-0" />
                {lookupError}
              </div>
            )}

            {/* Found recipient */}
            {recipient && (
              <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
                <div className="grid size-9 place-items-center rounded-xl bg-success/10 text-success font-bold text-sm shrink-0">
                  {recipient.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{recipient.name}</p>
                  <p className="text-xs text-muted-foreground">{recipient.email}</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate">{recipient.id}</p>
                </div>
                <CheckCircle2 className="size-5 text-success shrink-0" />
              </div>
            )}
          </Card>
        </section>

        {/* Amount */}
        {recipient && (
          <section aria-label="Send Amount">
            <SectionHeader title="Send Amount" />
            <Card className="space-y-5">
              <div>
                <Label>Amount (USD)</Label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 focus-within:border-primary transition-colors">
                  <span className="text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                {amountError && <p className="mt-1.5 text-xs text-destructive">{amountError}</p>}
              </div>

              {amountNum > 0 && (
                <div className="rounded-2xl bg-muted/40 p-4 space-y-2">
                  {[
                    { label: "Send Amount",     value: `$${amountNum.toFixed(2)}` },
                    { label: "Transaction Fee", value: `$${fee.toFixed(2)}` },
                    { label: "Total Deducted",  value: `$${total.toFixed(2)}`, strong: true },
                    { label: "Recipient Gets",  value: `$${amountNum.toFixed(2)}`, positive: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-medium ${row.positive ? "text-success" : row.strong ? "text-foreground font-semibold" : "text-foreground"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSend}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors outline-none"
              >
                Review & Send
              </button>
            </Card>
          </section>
        )}

        {/* Send History */}
        <section aria-label="Previous Sends">
          <SectionHeader title="Send History" actionLabel="View all" action={() => {}} />
          <div className="space-y-2">
            {SEND_HISTORY.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card px-5 py-4"
              >
                <div className={`grid size-9 place-items-center rounded-xl shrink-0 ${
                  record.status === "Completed" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  <Send className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{record.to}</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate">{record.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{record.amount}</p>
                  <p className={`text-[11px] font-medium ${record.status === "Completed" ? "text-success" : "text-destructive"}`}>
                    {record.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-20" />
      </div>

      {/* Dialogs */}
      {recipient && (
        <>
          <SendConfirmDialog
            open={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleConfirm}
            data={{ recipient, amount: amountNum, fee, total }}
          />
          <SendSuccessDialog
            open={showSuccess}
            onClose={() => { setShowSuccess(false); setRecipient(null); setAmount(""); setQuery(""); }}
            data={{ recipient, amount: amountNum, fee, total, txId, time: now }}
          />
        </>
      )}
    </UserShell>
  );
}