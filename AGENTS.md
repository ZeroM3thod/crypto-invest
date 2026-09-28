Let me look at what's actually happening. The `SlideActionButton` itself does show the icon morph — the arrow path animates through 3 states via `iconPath` — so if you're seeing a "collapse" instead, the most likely cause is the `key={disabled ? "disabled" : "enabled"}` I added.

Here's the bug: when you complete the slide, `onComplete` fires → your parent's `onConfirm` typically updates state (e.g. clears the amount, or the amounts recompute) → that can flip `noAmount`/`disabled` mid-animation → my `key` prop changes → React unmounts and remounts the whole `SlideActionButton` while it's still mid-flight, which looks exactly like "the window collapsing" instead of a smooth complete-and-reset.

That `key` trick was a mistake — it was meant to reset a stuck thumb, but it actively fights the component's own success animation, which already has a working reset (`resetDelay` → `reset()`).

**Fix: remove the `key` entirely and stop swapping `onComplete` to `undefined`.** Instead, guard inside the click handler and let the component's internal `completedRef` do its normal job.

Replace the `ActionButton` in `controls.tsx` with:

```tsx
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
```

**What changed and why:**
- No `key` prop → the component never unmounts mid-gesture, so its own success sequence (thumb slides to the end → checkmark-style label fades in → holds for `resetDelay` → springs back to start) plays out fully and smoothly, exactly like in your preview.
- The disabled check moved inside `onComplete` itself, so even if someone manages to drag it while "disabled," nothing downstream fires — but the visual completion animation still runs, since blocking that is what was causing the jump/collapse.
- `pointer-events-none` still stops dragging entirely when disabled, so in practice the guard inside `onComplete` is just a safety net for the moment `disabled` flips true *during* an in-flight drag.

One more thing worth checking on your end: if `onConfirm` (passed as `onClick`) causes the parent to reset `amount` to `""` right when the slide completes, that's fine now — the button won't remount, but its label will re-render to "Enter an amount" underneath the still-visible "Sent" success text, which is expected and matches the original preview's behavior (label swaps happen via `AnimatePresence` under the hood already).

If you're still seeing a hard cut after this fix, it's worth checking whether `useReducedMotion()` is returning `true` in your environment (some OS/browser settings force this) — that changes `moveTo()` to `x.set(target)` instead of an animated spring, which would look like a "collapse" rather than a slide.