// app/(user)/fund/withdraw/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { ArrowUpRight, ChevronDown, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

// ── Shared primitives ──────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" | "warning" }) {
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

function FieldInput({
  value, onChange, placeholder, type = "text", suffix,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 focus-within:border-primary transition-colors">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
      />
      {suffix}
    </div>
  );
}

function FieldSelect({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary transition-colors cursor-pointer pr-10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    </div>
  );
}

// ── Confirmation Dialog ────────────────────────────────────────────────────

function WithdrawConfirmDialog({
  open, onClose, onConfirm, data,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    amount: number;
    fee: number;
    net: number;
    coin: string;
    blockchain: string;
    address: string;
  };
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Confirm Withdrawal</p>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/70 outline-none transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          {[
            { label: "Withdrawal Amount", value: `$${data.amount.toFixed(2)}` },
            { label: "Withdrawal Fee (10%)", value: `-$${data.fee.toFixed(2)}`, negative: true },
            { label: "Net Withdrawal", value: `$${data.net.toFixed(2)}`, strong: true },
            { label: "Coin", value: data.coin },
            { label: "Blockchain", value: data.blockchain },
            { label: "Withdrawal Address", value: data.address, mono: true },
            { label: "Review Time", value: "Up to 72 hours" },
            { label: "Status", value: "Pending Review" },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{row.label}</span>
              <span className={`text-right break-all font-medium ${row.negative ? "text-destructive" : row.strong ? "text-foreground font-semibold" : "text-foreground"} ${row.mono ? "font-mono" : ""}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 p-3">
          <AlertTriangle className="size-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-yellow-600 dark:text-yellow-400 leading-relaxed">
            Withdrawals are reviewed within 72 hours. Funds will be reserved until processing is complete.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-muted py-3 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors outline-none"
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success Dialog ─────────────────────────────────────────────────────────

function WithdrawSuccessDialog({ open, onClose, refId }: { open: boolean; onClose: () => void; refId: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-border bg-card p-6 space-y-5 shadow-2xl text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
          <ArrowUpRight className="size-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Withdrawal Submitted</p>
          <p className="mt-1 text-xs text-muted-foreground">Your withdrawal request is pending review.</p>
        </div>
        <div className="rounded-2xl bg-muted/40 px-4 py-3 space-y-1">
          <p className="text-[11px] text-muted-foreground">Reference ID</p>
          <p className="font-mono text-xs font-semibold text-foreground">{refId}</p>
        </div>
        <Badge label="Pending Review" tone="warning" />
        <p className="text-[11px] text-muted-foreground">
          Your withdrawal may take up to 72 hours to review and process.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors outline-none"
        >
          View Fund History
        </button>
      </div>
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────

const COIN_OPTIONS = [
  { label: "USDT — Tether",   value: "USDT" },
  { label: "USDC — USD Coin", value: "USDC" },
];

const BLOCKCHAIN_OPTIONS: Record<string, { label: string; value: string }[]> = {
  USDT: [
    { label: "Ethereum (ERC-20)", value: "ERC20" },
    { label: "Tron (TRC-20)",     value: "TRC20" },
    { label: "BNB Smart Chain",   value: "BEP20" },
  ],
  USDC: [
    { label: "Ethereum (ERC-20)", value: "ERC20" },
    { label: "BNB Smart Chain",   value: "BEP20" },
  ],
};

const FEE_RATE = 0.10;
const AVAILABLE_BALANCE = 1250.00; // Replace with real balance from API

// ── Main Page ──────────────────────────────────────────────────────────────

export default function WithdrawPage() {
  const [amount, setAmount]         = useState("");
  const [coin, setCoin]             = useState("USDT");
  const [blockchain, setBlockchain] = useState("ERC20");
  const [address, setAddress]       = useState("");
  const [error, setError]           = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refId] = useState(`WD-${Date.now()}`);

  const amountNum = parseFloat(amount) || 0;
  const fee       = amountNum * FEE_RATE;
  const net       = amountNum - fee;

  function handleCoinChange(c: string) {
    setCoin(c);
    setBlockchain(BLOCKCHAIN_OPTIONS[c]?.[0]?.value ?? "ERC20");
  }

  function validate() {
    if (!amount || isNaN(amountNum)) return "Please enter a valid amount.";
    if (amountNum < 10)              return "Minimum withdrawal is $10.";
    if (amountNum > AVAILABLE_BALANCE) return "Amount exceeds available balance.";
    if (!address.trim())             return "Please enter a withdrawal address.";
    return "";
  }

  function handleProceed() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    setShowSuccess(true);
  }

  const blockchainLabel = BLOCKCHAIN_OPTIONS[coin]?.find((b) => b.value === blockchain)?.label ?? blockchain;

  return (
    <UserShell active="Fund">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* Heading */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Fund</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Withdraw
          </h1>
        </div>

        {/* Available Balance */}
        <section aria-label="Available Balance">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Available Balance
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                ${AVAILABLE_BALANCE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Main Wallet</p>
            </div>
            <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ArrowUpRight className="size-5" />
            </div>
          </Card>
        </section>

        {/* Withdraw Form */}
        <section aria-label="Withdrawal Details">
          <SectionHeader title="Withdrawal Details" />
          <Card className="space-y-5">

            {/* Amount */}
            <div>
              <Label>Withdrawal Amount</Label>
              <FieldInput
                type="number"
                value={amount}
                onChange={(v) => { setAmount(v); setError(""); }}
                placeholder="Minimum $10.00"
                suffix={<span className="text-xs font-semibold text-foreground">{coin}</span>}
              />
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              <p className="mt-1.5 text-[11px] text-muted-foreground">Minimum withdrawal: $10.00</p>
            </div>

            {/* Coin */}
            <div>
              <Label>Select Coin</Label>
              <FieldSelect value={coin} onChange={handleCoinChange} options={COIN_OPTIONS} />
            </div>

            {/* Blockchain */}
            <div>
              <Label>Select Blockchain</Label>
              <FieldSelect
                value={blockchain}
                onChange={setBlockchain}
                options={BLOCKCHAIN_OPTIONS[coin] ?? []}
              />
            </div>

            {/* Address */}
            <div>
              <Label>Withdrawal Address</Label>
              <FieldInput
                value={address}
                onChange={(v) => { setAddress(v); setError(""); }}
                placeholder="Enter external wallet address"
              />
            </div>

            {/* Fee Summary */}
            {amountNum > 0 && (
              <div className="rounded-2xl bg-muted/40 p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fee Summary</p>
                {[
                  { label: "Withdrawal Amount", value: `$${amountNum.toFixed(2)}` },
                  { label: "Fee (10%)",          value: `-$${fee.toFixed(2)}`,       cls: "text-destructive" },
                  { label: "Net Amount",         value: `$${net.toFixed(2)}`,        cls: "text-foreground font-semibold" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={row.cls ?? "text-foreground font-medium"}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Review Withdrawal
            </button>
          </Card>
        </section>

        <div className="h-20" />
      </div>

      {/* Dialogs */}
      <WithdrawConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        data={{ amount: amountNum, fee, net, coin, blockchain: blockchainLabel, address }}
      />
      <WithdrawSuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        refId={refId}
      />
    </UserShell>
  );
}