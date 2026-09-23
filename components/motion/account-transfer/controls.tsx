"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowDownUp } from "lucide-react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import type { Account } from "./types";
import { EASE } from "./constants";

export function FlipButton({
  rotation,
  reduce,
  onClick,
}: {
  rotation: number;
  reduce: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative -my-4 flex justify-center" style={{ zIndex: 1 }}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Swap accounts"
        whileTap={reduce ? undefined : { scale: 0.9 }}
        animate={reduce ? undefined : { rotate: rotation }}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-card bg-muted text-foreground backdrop-blur"
      >
        <ArrowDownUp className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}

export function ActionButton({
  from,
  to,
  amount,
  onClick,
}: {
  from: Account;
  to: Account;
  amount: number;
  onClick?: () => void;
}) {
  const noAmount = amount <= 0;
  const overBalance = amount > from.balance;
  const sameAccount = from.id === to.id;
  const label = noAmount
    ? "Enter an amount"
    : sameAccount
      ? "Choose a different account"
      : overBalance
        ? `Insufficient balance`
        : `Transfer to ${to.name}`;
  const disabled = noAmount || overBalance || sameAccount;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      disabled={disabled}
      className={cn(
        "mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: EASE }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
