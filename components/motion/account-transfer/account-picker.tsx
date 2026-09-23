"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { EASE } from "./constants";
import { AccountDot } from "./account-badges";
import type { Account, AccountSide } from "./types";
import { formatAmount } from "./utils";

export function AccountPicker({
  open,
  side,
  accounts,
  selectedId,
  onPick,
  onClose,
  reduce,
}: {
  open: boolean;
  side: AccountSide | null;
  accounts: Account[];
  selectedId: string;
  onPick: (id: string) => void;
  onClose: () => void;
  reduce: boolean;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      setQ("");
      inputRef.current?.focus({ preventScroll: true });
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute inset-0 z-10 cursor-default bg-background/40 backdrop-blur-sm"
          />

          <motion.div
            key="sheet"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            transition={reduce ? { duration: 0.18, ease: EASE } : SPRING_PANEL}
            className="absolute inset-x-0 bottom-0 z-20 flex max-h-[92%] flex-col rounded-t-3xl border-t border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Select ${side === "from" ? "from" : "to"} account`}
          >
            <div className="flex justify-center pb-1 pt-2.5">
              <span className="h-1 w-9 rounded-full bg-muted" />
            </div>

            <div className="flex items-center gap-2 border-b border-border px-4 pb-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search account"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3">
              <ul className="flex flex-col gap-0.5">
                {filtered.length === 0 ? (
                  <li className="py-8 text-center text-xs text-muted-foreground">
                    No accounts found
                  </li>
                ) : null}
                {filtered.map((a) => {
                  const active = a.id === selectedId;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => onPick(a.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition-colors active:scale-[0.97]",
                          active ? "bg-muted/60" : "hover:bg-muted/60",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <AccountDot account={a} size={32} />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {a.name}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                              {a.currency}
                            </span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                          {formatAmount(a.balance)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
