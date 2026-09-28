Here is every file in full, followed by the guide. Copy each file into your project.

## Folder structure

```
components/
  account-transfer.tsx            ← updated
  account-transfer/
    account-badges.tsx            ← updated
    account-picker.tsx            ← updated
    constants.ts                  ← unchanged
    controls.tsx                  ← updated
    data.ts                       ← unchanged
    field.tsx                     ← updated
    summary-row.tsx               ← updated
    types.ts                      ← unchanged
    utils.ts                      ← unchanged
```

`action-swap.tsx` and `slide-action-button.tsx` are unchanged.

---

## 1. `account-transfer.tsx`

```tsx
"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ACCOUNTS } from "./account-transfer/data";
import { ActionButton, FlipButton } from "./account-transfer/controls";
import { Field } from "./account-transfer/field";
import { SummaryRow } from "./account-transfer/summary-row";
import { AccountPicker } from "./account-transfer/account-picker";
import type { Account, AccountSide } from "./account-transfer/types";

export type { Account } from "./account-transfer/types";

export interface AccountTransferProps {
  accounts?: Account[];
  defaultFromId?: string;
  defaultToId?: string;
  className?: string;
  onConfirm?: (params: { fromId: string; toId: string; amount: number }) => void;
}

export function AccountTransfer({
  accounts = ACCOUNTS,
  defaultFromId = "main",
  defaultToId = "investment",
  className,
  onConfirm,
}: AccountTransferProps) {
  const reduce = useReducedMotion();
  const [fromId, setFromId] = useState(defaultFromId);
  const [toId, setToId] = useState(defaultToId);
  const [amount, setAmount] = useState("");
  const [flipRot, setFlipRot] = useState(0);
  const [picking, setPicking] = useState<AccountSide | null>(null);

  if (!accounts.length) return null;

  const from = findAccount(accounts, fromId);
  const to = findAccount(accounts, toId);
  const numericAmount = Number(amount) || 0;

  const flip = () => {
    setFlipRot((r) => r + 180);
    setFromId(toId);
    setToId(fromId);
  };

  const pickAccount = (id: string) => {
    if (!picking) return;
    if (picking === "from") {
      if (id === toId) setToId(fromId);
      setFromId(id);
    } else {
      if (id === fromId) setFromId(toId);
      setToId(id);
    }
    setPicking(null);
  };

  return (
    <div
      className={cn(
        // Fluid width: full on phones, grows gently on larger screens.
        "relative isolate mx-auto w-full overflow-hidden rounded-2xl sm:rounded-3xl",
        "max-w-full sm:max-w-[460px] md:max-w-[520px] lg:max-w-[560px]",
        "border border-border/20 bg-card",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 rounded-xl border border-border/40 p-3 sm:gap-2 sm:rounded-2xl sm:p-4 md:p-5">
        <Field
          side="from"
          account={from}
          amount={amount}
          onAmount={setAmount}
          editable
          onOpenPicker={() => setPicking("from")}
        />

        <FlipButton rotation={flipRot} reduce={!!reduce} onClick={flip} />

        <Field
          side="to"
          account={to}
          amount={amount}
          editable={false}
          onOpenPicker={() => setPicking("to")}
        />

        <SummaryRow fee={0} eta="Instant" />

        <ActionButton
          from={from}
          to={to}
          amount={numericAmount}
          onClick={() => onConfirm?.({ fromId, toId, amount: numericAmount })}
        />
      </div>

      <AccountPicker
        open={picking !== null}
        side={picking}
        accounts={accounts}
        selectedId={picking === "from" ? fromId : toId}
        onPick={pickAccount}
        onClose={() => setPicking(null)}
        reduce={!!reduce}
      />
    </div>
  );
}

function findAccount(accounts: Account[], id: string) {
  return accounts.find((a) => a.id === id) ?? accounts[0];
}
```

---

## 2. `account-transfer/field.tsx`

```tsx
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
    <div className="relative rounded-xl border border-border/50 bg-background/40 p-3 sm:rounded-2xl sm:p-3.5 md:p-4">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-[11px] md:text-xs"
      >
        {side === "from" ? "From" : "To"}
      </label>

      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          {editable ? (
            <input
              id={id}
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmount?.(sanitizeAmount(e.target.value))}
              placeholder="0"
              className="w-full min-w-0 bg-transparent text-xl font-semibold tracking-tight text-foreground tabular-nums outline-none placeholder:text-muted-foreground/60 sm:text-2xl md:text-3xl"
            />
          ) : (
            <div className="flex h-7 items-center gap-2 truncate text-xl font-semibold tracking-tight tabular-nums text-foreground sm:h-8 sm:text-2xl md:h-9 md:text-3xl">
              {amount || "0"}
            </div>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground tabular-nums sm:text-[11px] md:text-xs">
            {account.currency}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPicker}
          className="group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card pl-1 pr-2 text-xs font-semibold text-foreground transition-transform hover:border-border active:scale-[0.97] sm:h-10 sm:gap-2 sm:pr-2.5 sm:text-sm md:h-11 md:text-base"
        >
          <AccountDot account={account} />
          <span className="max-w-[72px] truncate min-[380px]:max-w-[92px] sm:max-w-[110px] md:max-w-[140px]">
            {account.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground sm:text-[11px] md:text-xs">
        <span className="inline-flex min-w-0 items-center gap-1">
          <Wallet className="h-3 w-3 shrink-0" />
          <span className="truncate tabular-nums">{formatAmount(account.balance)}</span>
          <span className="shrink-0">available</span>
        </span>
        {side === "from" ? (
          <button
            type="button"
            onClick={() => onAmount?.(String(account.balance))}
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/60 hover:text-foreground md:text-[11px]"
          >
            Max
          </button>
        ) : null}
      </div>
    </div>
  );
}
```

---

## 3. `account-transfer/account-picker.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { EASE } from "./constants";
import { AccountDot } from "./account-badges";
import type { Account, AccountSide } from "./types";
import { formatAmount } from "./utils";

/**
 * Mobile  (< sm): bottom sheet that slides up.
 * Desktop (>= sm): centered modal that scales/fades in.
 * Positioning is pure CSS so it adapts live on resize / rotation.
 */
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

          {/* Wrapper handles layout only; the motion child handles animation. */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              key="sheet"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 40, scale: 0.98 }
              }
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 40, scale: 0.98 }
              }
              transition={reduce ? { duration: 0.18, ease: EASE } : SPRING_PANEL}
              className={cn(
                "pointer-events-auto flex w-full flex-col bg-card shadow-2xl",
                // mobile: bottom sheet
                "max-h-[85%] rounded-t-3xl border-t border-border",
                // desktop: centered modal card
                "sm:max-h-[min(80%,520px)] sm:max-w-sm sm:rounded-2xl sm:border md:max-w-md",
              )}
              role="dialog"
              aria-modal="true"
              aria-label={`Select ${side === "from" ? "from" : "to"} account`}
            >
              {/* Drag handle: mobile only */}
              <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
                <span className="h-1 w-9 rounded-full bg-muted" />
              </div>

              <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-1 sm:pt-3.5">
                <h2 className="text-sm font-semibold text-foreground md:text-base">
                  Select {side === "from" ? "source" : "destination"} account
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground md:h-8 md:w-8"
                >
                  <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-3">
                <ul className="flex flex-col gap-0.5">
                  {accounts.length === 0 ? (
                    <li className="py-8 text-center text-xs text-muted-foreground">
                      No accounts found
                    </li>
                  ) : null}
                  {accounts.map((a) => {
                    const active = a.id === selectedId;
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => onPick(a.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors active:scale-[0.97] md:px-3 md:py-2.5",
                            active ? "bg-muted/60" : "hover:bg-muted/60",
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <AccountDot account={a} size={32} />
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-semibold text-foreground md:text-base">
                                {a.name}
                              </span>
                              <span className="truncate text-[11px] text-muted-foreground md:text-xs">
                                {a.currency}
                              </span>
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground md:text-xs">
                            {formatAmount(a.balance)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
```

---

## 4. `account-transfer/controls.tsx`

```tsx
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
    <div className="relative -my-3.5 flex justify-center sm:-my-4" style={{ zIndex: 1 }}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Swap accounts"
        whileTap={reduce ? undefined : { scale: 0.9 }}
        animate={reduce ? undefined : { rotate: rotation }}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-card bg-muted text-foreground backdrop-blur sm:h-9 sm:w-9 md:h-10 md:w-10"
      >
        <ArrowDownUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
        // Track shrinks a little on phones; label truncates instead of overflowing.
        "mt-2 h-14 w-full max-w-full bg-white/10 sm:mt-3 sm:h-16",
        "[&_span.grid]:truncate [&_span.grid]:px-2 [&_span.grid]:text-xs sm:[&_span.grid]:text-sm",
        disabled && "pointer-events-none opacity-50",
      )}
      thumbClassName="!size-12 sm:!size-14 bg-white text-black"
      fillClassName="bg-white"
    >
      {label}
    </SlideActionButton>
  );
}
```

---

## 5. `account-transfer/summary-row.tsx`

```tsx
export function SummaryRow({ fee = 0, eta = "Instant" }: { fee?: number; eta?: string }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-[11px] sm:mt-3 sm:px-3.5 md:px-4 md:py-3 md:text-xs">
      <span className="text-muted-foreground">Fee</span>
      <span className="text-right tabular-nums text-foreground">
        {fee === 0 ? "Free" : `$${fee.toFixed(2)}`}
      </span>
      <span className="text-muted-foreground">Speed</span>
      <span className="text-right text-foreground">{eta}</span>
    </div>
  );
}
```

---

## 6. `account-transfer/account-badges.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { Account } from "./types";

function diceBearGlassUrl(seed: string) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

export function AccountDot({
  account,
  size = 28,
  className,
}: {
  account: Account;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={diceBearGlassUrl(account.id)}
      alt={account.name}
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted object-cover",
        className,
      )}
    />
  );
}
```

---

## Guide

### 1. How responsive works here

Tailwind is mobile first. A class with no prefix applies to every screen. A prefixed class applies from that width upward and overrides the unprefixed one.

| Prefix | Applies from | Typical device |
|---|---|---|
| (none) | 0px | Phones |
| `min-[380px]:` | 380px | Larger phones |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets, small laptops |
| `lg:` | 1024px | Desktops |

Example: `text-xl sm:text-2xl md:text-3xl` means small text on phones, medium from 640px, large from 768px.

### 2. What changed in each file

**`account-transfer.tsx` (the card)**
- Width is `w-full` on phones, then capped at 460px (`sm`), 520px (`md`) and 560px (`lg`).
- `mx-auto` centers the card.
- Padding is `p-3` → `sm:p-4` → `md:p-5`.
- Corners are `rounded-2xl` → `sm:rounded-3xl`.

**`field.tsx` (From / To boxes)**

| Element | Phone | `sm` | `md` |
|---|---|---|---|
| Amount text | `text-xl` | `text-2xl` | `text-3xl` |
| Box padding | `p-3` | `p-3.5` | `p-4` |
| Label text | 10px | 11px | `text-xs` |
| Account button height | `h-9` | `h-10` | `h-11` |
| Account name max width | 72px (92px from 380px) | 110px | 140px |

- `min-w-0` on the input and the `truncate` classes stop long numbers and long names from breaking the layout.
- `shrink-0` keeps the account button and the Max button from squeezing.

**`account-picker.tsx` (account list)**
- Below 640px it is a bottom sheet: pinned to the bottom, rounded top corners, with a drag handle.
- From 640px it is a centered modal: `sm:items-center`, full rounded corners, `sm:max-w-sm`, then `md:max-w-md`.
- A wrapper `div` does the layout (CSS only). The `motion.div` inside does the animation. This split is why it adapts live on resize or rotation.
- I added a title: "Select source account" or "Select destination account".
- `overscroll-contain` stops the page behind from scrolling while you scroll the list.

**`controls.tsx` (swap and slide)**
- Swap button: `h-8 w-8` → `h-9 w-9` → `h-10 w-10`.
- Slide track: `h-14` on phones, `sm:h-16` above.
- Slide thumb: `!size-12` on phones, `sm:!size-14` above. The `!` forces the override because the base component sets its own size.
- Slide label: truncates and uses `text-xs` → `sm:text-sm` so "Choose a different account" fits.

**`summary-row.tsx`**
- Text is 11px, then `md:text-xs`. Padding grows at `md`.

**`account-badges.tsx`**
- Added an optional `className` prop. Nothing else changed.

### 3. Values you can tweak

| I want to... | Change this |
|---|---|
| Make the card wider on desktop | `lg:max-w-[560px]` in `account-transfer.tsx` (try `lg:max-w-[640px]`) |
| Make the card narrower | Lower the three `max-w-[...]` values |
| Make the amount text bigger | `md:text-3xl` in `field.tsx` (try `md:text-4xl`) |
| Widen the picker modal | `md:max-w-md` in `account-picker.tsx` (try `md:max-w-lg`) |
| Always use a bottom sheet | Delete `sm:items-center`, `sm:max-w-sm`, `sm:rounded-2xl`, `sm:border`, `md:max-w-md` |
| Allow longer account names | The `max-w-[...]` values on the name `span` in `field.tsx` |

### 4. Install steps

1. Replace `account-transfer.tsx` with the code above.
2. Replace `field.tsx`, `account-picker.tsx`, `controls.tsx`, `summary-row.tsx` and `account-badges.tsx` inside your `account-transfer/` folder.
3. Leave `types.ts`, `data.ts`, `utils.ts`, `constants.ts`, `action-swap.tsx` and `slide-action-button.tsx` as they are.
4. Restart your dev server if styles look stale.

### 5. How to test

1. Open the page and press **F12**.
2. Turn on the device toolbar (**Ctrl+Shift+M**).
3. Try widths **320**, **375**, **640**, **768** and **1280**.
4. At each width, check:
   - No sideways scrolling.
   - A long amount like `123456789.12` stays inside the field.
   - Tapping an account button opens a bottom sheet below 640px and a centered modal above.
   - The slide button label fits and the thumb is not clipped.
   - Rotating the device or resizing the window switches the picker style live.

### 6. Known limits

- **Slide button overrides:** I used `!size-12` and the `[&_span.grid]` selector so I didn't edit your shared `slide-action-button.tsx`. The cleaner fix is adding `size` props to that component. Ask me if you want that.
- **Picker scope:** the modal is positioned inside the card, not over the whole page. On desktop it appears inside the card's bounds. For a full-page overlay it needs a portal and `fixed` positioning.
- **Untested:** I haven't run this in a browser, so check the widths above.

If you'd like the full-page overlay or the cleaner slide button, tell me which one and I'll write the code.