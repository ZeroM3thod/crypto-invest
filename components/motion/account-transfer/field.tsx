"use client";

import { useId } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import type { Account, AccountSide } from "./types";
import { AccountDot } from "./account-badges";
import { sanitizeAmount, formatAmount } from "./utils";

export function Field({
  side,
  account,
  amount,
  onAmount,
  editable,
  onOpenPicker,
}: {
  side: AccountSide;
  account: Account;
  amount: string;
  onAmount?: (v: string) => void;
  editable: boolean;
  onOpenPicker: () => void;
}) {
  const id = useId();

  return (
    <div className="relative rounded-2xl border border-border/50 bg-background/40 p-3.5">
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {side === "from" ? "From" : "To"}
      </label>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editable ? (
            <input
              id={id}
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmount?.(sanitizeAmount(e.target.value))}
              placeholder="0"
              className="w-full bg-transparent text-2xl font-semibold tracking-tight text-foreground tabular-nums outline-none placeholder:text-muted-foreground/60"
            />
          ) : (
            <div className="flex h-9 items-center gap-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {amount || "0"}
            </div>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
            {account.currency}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPicker}
          className="group inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-2.5 text-sm font-semibold text-foreground transition-transform hover:border-border active:scale-[0.97]"
        >
          <AccountDot account={account} />
          <span className="max-w-[92px] truncate">{account.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Wallet className="h-3 w-3" />
          <span className="tabular-nums">{formatAmount(account.balance)}</span>
          <span>available</span>
        </span>
        {side === "from" ? (
          <button
            type="button"
            onClick={() => onAmount?.(String(account.balance))}
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            Max
          </button>
        ) : null}
      </div>
    </div>
  );
}
