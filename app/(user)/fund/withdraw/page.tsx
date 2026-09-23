// app/(user)/fund/withdraw/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { useState } from "react";
import { AlertTriangle, Check, Wallet, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */

type Coin = "USDT" | "USDC";

interface WdHistory {
  id: string;
  date: string;
  amount: number;
  fee: number;
  receive: number;
  coin: Coin;
  network: string;
  wallet: string;
  status: "approved" | "pending" | "rejected";
  note?: string;
  reason?: string;
}

interface ConfirmDetails {
  amt: number;
  fee: number;
  recv: number;
  coin: Coin;
  addr: string;
  note: string;
  shortAddr: string;
}

/* Placeholder data — wire these to your real API/backend later */
const MAIN_WALLET_BALANCE = 1250.0;
const WITHDRAW_FEE_RATE = 0.1; // 10%

const COINS: { id: Coin; name: string; symbol: string }[] = [
  { id: "USDT", name: "Tether USD", symbol: "₮" },
  { id: "USDC", name: "USD Coin", symbol: "$" },
];

const ADDRESS_PLACEHOLDER: Record<Coin, string> = {
  USDT: "Enter your USDT BEP-20 wallet address (e.g. 0xA73e...c0e7)",
  USDC: "Enter your USDC BEP-20 wallet address (e.g. 0x91Cd...0a19)",
};

const INITIAL_HISTORY: WdHistory[] = [
  {
    id: "9F2A7C31",
    date: "Jul 16, 2025",
    amount: 200,
    fee: 20,
    receive: 180,
    coin: "USDT",
    network: "BEP-20",
    wallet: "0xa73e40...c7c0e7",
    status: "approved",
  },
  {
    id: "4B8E1D02",
    date: "Jul 11, 2025",
    amount: 75,
    fee: 7.5,
    receive: 67.5,
    coin: "USDC",
    network: "BEP-20",
    wallet: "0x91cd22...5f0a19",
    status: "pending",
    note: "Monthly cash-out",
  },
  {
    id: "1C5F9A44",
    date: "Jul 3, 2025",
    amount: 40,
    fee: 4,
    receive: 36,
    coin: "USDT",
    network: "BEP-20",
    wallet: "0x77ab90...2e4b31",
    status: "rejected",
    reason: "Wallet address did not match verified profile records.",
  },
];

/* ────────────────────────────────────────────────────────────
   Small UI primitives (b/w/gray)
──────────────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
      {hint && <span className="text-[11px] normal-case tracking-normal text-muted-foreground/70">{hint}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: WdHistory["status"] }) {
  const map: Record<WdHistory["status"], string> = {
    approved: "bg-success/10 text-success",
    pending: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[status]}`}>
      {status}
    </span>
  );
}

function calcFeeAndReceive(amount: number) {
  const fee = +(amount * WITHDRAW_FEE_RATE).toFixed(2);
  const receive = +(amount - fee).toFixed(2);
  return { fee, receive };
}

/* ────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */

export default function WithdrawPage() {
  const [coin, setCoin] = useState<Coin>("USDT");
  const [wdAmt, setWdAmt] = useState("");
  const [wdAddr, setWdAddr] = useState("");
  const [wdNote, setWdNote] = useState("");
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState<ConfirmDetails | null>(null);
  const [history, setHistory] = useState<WdHistory[]>(INITIAL_HISTORY);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState<WdHistory | null>(null);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: "", show: false });
  const [submitting, setSubmitting] = useState(false);

  const availableBalance = MAIN_WALLET_BALANCE; // Main wallet balance, shown as-is

  const parsedAmt = parseFloat(wdAmt) || 0;
  const { fee: previewFee, receive: previewReceive } = calcFeeAndReceive(parsedAmt);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const onAmtChange = (v: string) => {
    setWdAmt(v);
    setSelectedChip(null);
  };

  const selectAmt = (v: number) => {
    setSelectedChip(v);
    setWdAmt(String(v));
  };

  const openConfirm = () => {
    const amt = parseFloat(wdAmt);
    const addr = wdAddr.trim();
    const note = wdNote.trim();

    if (!amt || amt < 10) {
      showToast("Please enter a valid amount (min $10)");
      return;
    }
    if (amt > availableBalance) {
      showToast(`Amount exceeds available balance ($${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})`);
      return;
    }
    if (!addr) {
      showToast("Please enter your wallet address");
      return;
    }
    if (addr.length < 26) {
      showToast("Wallet address seems invalid");
      return;
    }

    const { fee, receive } = calcFeeAndReceive(amt);
    const shortAddr = addr.length > 20 ? addr.slice(0, 10) + "..." + addr.slice(-6) : addr;
    setConfirmDetails({ amt, fee, recv: receive, coin, addr, note, shortAddr });
    setConfirmOpen(true);
  };

  const submitWithdrawal = async () => {
    if (!confirmDetails) return;
    setSubmitting(true);
    try {
      // TODO: replace with your real API call, e.g.:
      // const res = await fetch("/api/withdrawals", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     amount: confirmDetails.amt,
      //     fee: confirmDetails.fee,
      //     receive: confirmDetails.recv,
      //     coin: confirmDetails.coin,
      //     address: confirmDetails.addr,
      //     network: "BEP-20",
      //     note: confirmDetails.note || null,
      //   }),
      // });
      // if (!res.ok) throw new Error("Submission failed");

      const newEntry: WdHistory = {
        id: crypto.randomUUID().slice(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        amount: confirmDetails.amt,
        fee: confirmDetails.fee,
        receive: confirmDetails.recv,
        coin: confirmDetails.coin,
        network: "BEP-20",
        wallet: confirmDetails.shortAddr,
        status: "pending",
        note: confirmDetails.note || undefined,
      };
      setHistory((prev) => [newEntry, ...prev]);

      showToast("Withdrawal submitted — pending admin approval");
      setConfirmOpen(false);
      setWdAmt("");
      setWdAddr("");
      setWdNote("");
      setSelectedChip(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Submission failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserShell active="Withdraw">
      <div className="relative overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Toast */}
        {toast.show && (
          <div className="fixed right-6 top-6 z-[999] flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg">
            <Check className="size-4 text-success" />
            {toast.msg}
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Transactions</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Request a Withdrawal
            </h1>
          </div>

          {/* BALANCE CARD — theme dark surface, no pure black */}
          <div className="rounded-4xl bg-foreground p-6 text-background">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-background/50">
                  Available for Withdrawal
                </div>
                <div className="mt-1.5 text-3xl font-semibold tracking-tight text-background">
                  ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-background/50">Main wallet balance</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium uppercase tracking-wide text-background/40">Network</div>
                <div className="mt-1.5 text-sm text-background/70">BEP-20</div>
                <div className="mt-0.5 text-xs text-background/40">USDT / USDC</div>
              </div>
            </div>
          </div>

          {/* WITHDRAWAL FORM */}
          <Card>
            <FieldLabel>New Request</FieldLabel>
            <h2 className="mb-5 text-lg font-semibold text-foreground">Withdrawal Details</h2>

            {/* Coin switch */}
            <div className="mb-5">
              <FieldLabel>Coin</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {COINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCoin(c.id);
                      setWdAddr("");
                    }}
                    className={[
                      "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                      coin === c.id
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/40",
                    ].join(" ")}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                      {c.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{c.id}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.name}</div>
                    </div>
                    {coin === c.id && <Check className="ml-auto size-4 shrink-0 text-foreground" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <FieldLabel>Withdrawal Amount ({coin})</FieldLabel>
              <div className="mb-2.5 flex flex-wrap gap-2">
                {[100, 250, 500, 1000].map((v) => {
                  const disabled = v > availableBalance;
                  return (
                    <button
                      key={v}
                      onClick={() => selectAmt(v)}
                      disabled={disabled}
                      className={[
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                        disabled
                          ? "cursor-not-allowed border-border text-muted-foreground opacity-40"
                          : selectedChip === v
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground/40",
                      ].join(" ")}
                    >
                      ${v.toLocaleString()}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                min={10}
                placeholder="Enter amount e.g. 300"
                value={wdAmt}
                onChange={(e) => onAmtChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Minimum: $10</span>
                <span>
                  Available:{" "}
                  <strong className="font-semibold text-foreground">
                    ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>Fee: <strong className="font-semibold text-foreground">10%</strong></span>
              </div>
            </div>

            {/* Wallet address */}
            <div className="mb-5">
              <FieldLabel>Receiving Wallet Address</FieldLabel>
              <input
                type="text"
                placeholder={ADDRESS_PLACEHOLDER[coin]}
                value={wdAddr}
                onChange={(e) => setWdAddr(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Only {coin} on BNB Smart Chain (BEP-20) is supported.
              </p>
            </div>

            {/* Network info */}
            <div className="mb-5">
              <FieldLabel>Network</FieldLabel>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Wallet className="size-4 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">BNB Smart Chain — BEP-20</div>
                  <div className="text-xs text-muted-foreground">Fee: 10% · Time: 24–72 hours</div>
                </div>
                <span className="shrink-0 rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  {coin}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="mb-5">
              <FieldLabel hint="(optional — visible to admin)">Note</FieldLabel>
              <textarea
                placeholder="Any note for this withdrawal (e.g. reason, reference)"
                value={wdNote}
                onChange={(e) => setWdNote(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
            </div>

            {/* Summary */}
            <div className="mb-5 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between border-b border-border py-2 first:pt-0">
                <span className="text-xs text-muted-foreground">You Request</span>
                <span className="text-sm font-medium text-foreground">
                  {wdAmt ? `${parsedAmt.toFixed(2)} ${coin}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2">
                <span className="text-xs text-muted-foreground">Withdrawal Fee (10%)</span>
                <span className="text-sm font-medium text-foreground">
                  {wdAmt ? `− ${previewFee.toFixed(2)} ${coin}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">You Receive</span>
                <span className="text-sm font-semibold text-success">
                  {wdAmt ? `${previewReceive.toFixed(2)} ${coin}` : "—"}
                </span>
              </div>
            </div>

            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>
                A 10% withdrawal fee applies to all requests. Processing typically takes{" "}
                <strong className="text-foreground">24–72 hours</strong> after approval. Please double-check
                your wallet address before submitting — requests cannot be cancelled once approved.
              </span>
            </div>

            <button
              onClick={openConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Request Withdrawal →
            </button>
          </Card>

          {/* WITHDRAWAL HISTORY */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Withdrawal History</h2>
            <div className="flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  No withdrawal records yet.
                </div>
              ) : (
                history.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-2xl border border-border p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Wallet className="size-4 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-foreground">{d.id}</span>
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {d.coin}
                          </span>
                          <StatusBadge status={d.status} />
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {d.date} · {d.wallet}
                          {d.note && <span className="ml-1.5 italic text-muted-foreground/80">· "{d.note}"</span>}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-foreground">
                        −${d.amount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        recv. ${d.receive.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        onClick={() => {
                          setModalEntry(d);
                          setModalOpen(true);
                        }}
                        className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CONFIRM MODAL */}
        {confirmOpen && (
          <div
            className="fixed inset-0 z-[900] flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-t-4xl border border-border bg-card p-6 sm:rounded-4xl">
              <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Review</p>
                <h3 className="text-lg font-semibold text-foreground">Confirm Withdrawal</h3>
              </div>

              {confirmDetails && (
                <div className="mb-4 rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between border-b border-border py-2 first:pt-0">
                    <span className="text-xs text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium text-foreground">
                      {confirmDetails.amt.toFixed(2)} {confirmDetails.coin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border py-2">
                    <span className="text-xs text-muted-foreground">Fee (10%)</span>
                    <span className="text-sm font-medium text-foreground">
                      − {confirmDetails.fee.toFixed(2)} {confirmDetails.coin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border py-2">
                    <span className="text-xs text-muted-foreground">You Receive</span>
                    <span className="text-sm font-semibold text-foreground">
                      {confirmDetails.recv.toFixed(2)} {confirmDetails.coin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border py-2">
                    <span className="text-xs text-muted-foreground">To Wallet</span>
                    <span className="text-sm font-medium text-foreground">{confirmDetails.shortAddr}</span>
                  </div>
                  <div className={`flex items-center justify-between py-2 ${confirmDetails.note ? "border-b border-border" : ""}`}>
                    <span className="text-xs text-muted-foreground">Network</span>
                    <span className="text-sm font-medium text-foreground">BNB Smart Chain</span>
                  </div>
                  {confirmDetails.note && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground">Note</span>
                      <span className="max-w-[200px] truncate text-right text-sm font-medium text-foreground">
                        {confirmDetails.note}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-5 flex items-start gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Once submitted, this request cannot be cancelled. Funds will be sent to your provided wallet
                  address within 24–72 hours after admin approval.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitWithdrawal}
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {modalOpen && modalEntry && (
          <div
            className="fixed inset-0 z-[900] flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-t-4xl border border-border bg-card p-6 sm:rounded-4xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Transaction</p>
                  <h3 className="text-lg font-semibold text-foreground">Withdrawal Details</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-border p-4">
                {[
                  ["Transaction ID", modalEntry.id],
                  ["Date", modalEntry.date],
                  ["Coin", modalEntry.coin],
                  ["Amount Requested", `${modalEntry.amount.toFixed(2)} ${modalEntry.coin}`],
                  ["Withdrawal Fee (10%)", `− ${modalEntry.fee.toFixed(2)} ${modalEntry.coin}`],
                  ["Amount to Receive", `${modalEntry.receive.toFixed(2)} ${modalEntry.coin}`],
                  ["Network", modalEntry.network],
                  ["Wallet", modalEntry.wallet],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-border py-2 last:border-none">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <span className="max-w-[200px] truncate text-right text-sm font-medium text-foreground">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={modalEntry.status} />
                </div>
                {modalEntry.note && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-muted-foreground">Note</span>
                    <span className="max-w-[200px] truncate text-right text-sm font-medium italic text-foreground">
                      {modalEntry.note}
                    </span>
                  </div>
                )}
              </div>

              {modalEntry.status === "rejected" && modalEntry.reason && (
                <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-foreground">{modalEntry.reason}</p>
                </div>
              )}

              <button
                onClick={() => setModalOpen(false)}
                className="w-full rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </UserShell>
  );
}