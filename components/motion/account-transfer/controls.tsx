"use client";

import { motion } from "motion/react";
import { ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlideActionButton } from "@/components/motion/slide-action-button";
import type { Account } from "./types";

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
        ? "Insufficient balance"
        : `Slide to transfer to ${to.name}`;
  const disabled = noAmount || overBalance || sameAccount;

  return (
    <SlideActionButton
      completeLabel="Sent"
      onComplete={() => {
        if (disabled) return;
        onClick?.();
      }}
      className={cn(
        "mt-3 w-full bg-white/10",
        disabled && "pointer-events-none opacity-50",
      )}
      thumbClassName="bg-white text-black"
      fillClassName="bg-white"
    >
      {label}
    </SlideActionButton>
  );
}
