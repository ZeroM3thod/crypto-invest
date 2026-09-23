Let's look at `wallet-card/account-avatar.tsx` — that's almost certainly what renders the wallet photos on the dashboard's wallet card.Found it. The dashboard wallet card uses **DiceBear "glass" avatars** (auto-generated per account ID), not a static logo image. Let's check `diceBearGlassUrl` in `wallet-card/utils.ts`:Now I have exactly what I need. The dashboard/wallet-card avatars are generated via DiceBear's "glass" style, keyed by `account.id` (or `address`) — same URL scheme for every account. Currently `AccountDot` (in the transfer flow) instead renders a colored circle with a letter symbol:

```tsx
export function AccountDot({ account, size = 28 }: { account: Account; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold", account.tone)}
    >
      {account.symbol}
    </span>
  );
}
```

I'll swap it to use the same DiceBear glass avatar as the dashboard wallet card, keyed by `account.id`, so it visually matches exactly.Replace the full contents of `components/motion/account-transfer/account-badges.tsx` with:

```tsx
import { cn } from "@/lib/utils";
import type { Account } from "./types";

function diceBearGlassUrl(seed: string) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

export function AccountDot({
  account,
  size = 28,
}: {
  account: Account;
  size?: number;
}) {
  return (
    <img
      src={diceBearGlassUrl(account.id)}
      alt={account.name}
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted object-cover",
      )}
    />
  );
}
```

This is the same generator + same seed strategy (`account.id`) the dashboard wallet card uses, so each account (Main, Investment, Trading, Mining, Referral) will render the identical avatar in both places since the seed is the same string.

Two callers use `AccountDot` — `Field` (transfer form) and `AccountPicker` (the account-select sheet) — both just pass `account`, so no other changes are needed; they'll pick this up automatically.