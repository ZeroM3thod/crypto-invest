Your files don't include `lib/admin-review-data`, so I'm assuming `Deposit` and `Withdraw` get two new fields: `userId` and `coin`. If yours are named differently, just swap the names.

## 1. Update the types (`lib/admin-review-data.ts`)

```ts
export type Coin = "USDT" | "USDC";

// add to BOTH Deposit and Withdraw:
userId: string;
coin: Coin;
```

## 2. `deposits-view.tsx`: dialog `fields` and `summary`

```tsx
fields={
  current
    ? [
        { label: "User", value: current.name },
        { label: "User ID", value: current.userId },
        { label: `Amount (${current.coin})`, value: `+$${fmtAmt(current.amount)}`, strong: true },
        { label: "Coin", value: current.coin },
        { label: "Network", value: current.network },
        { label: "Date", value: current.date },
        { label: "Status", value: current.status },
        { label: "Transaction hash", value: current.hash, full: true, copy: true },
      ]
    : []
}
summary={
  current
    ? `You are confirming a deposit of $${fmtAmt(current.amount)} ${current.coin} via ${current.network} from ${current.name}. Verify the transaction hash before confirming.`
    : ""
}
```

## 3. `withdraws-view.tsx`: 10% fee

Add this above the component, so the fee is calculated in one place:

```tsx
const FEE_RATE = 0.1;
const feeOf = (w: Withdraw) => w.amount * FEE_RATE;
const netOf = (w: Withdraw) => w.amount - feeOf(w);
```

Dialog:

```tsx
fields={
  current
    ? [
        { label: "User", value: current.name },
        { label: "User ID", value: current.userId },
        { label: `Amount (${current.coin})`, value: `−$${fmtAmt(current.amount)}`, strong: true },
        { label: "Fee (10%)", value: `$${fmtAmt(feeOf(current))}` },
        { label: "Net payout", value: `$${fmtAmt(netOf(current))}`, strong: true },
        { label: "Coin", value: current.coin },
        { label: "Network", value: current.network },
        { label: "Date", value: current.date },
        { label: "Status", value: current.status },
        { label: "Wallet address", value: current.address, full: true, copy: true },
      ]
    : []
}
summary={
  current
    ? `You are approving a withdrawal of $${fmtAmt(current.amount)} ${current.coin} (net payout $${fmtAmt(netOf(current))} after the $${fmtAmt(feeOf(current))} fee) to ${current.name} on ${current.network}. Make sure the payout has been sent to the address below.`
    : ""
}
```

## 4. Keep the rest of the file consistent

Since the fee is now always 10%, replace every other use of `w.fee` and `w.amount - w.fee` with `feeOf(w)` and `netOf(w)`. Otherwise the table and stats could disagree with the dialog.

- **`doConfirm` toast:** `$${netOf(w).toLocaleString()} ${w.coin} payout`
- **`confirmAllPending`:** `reduce((s, w) => s + netOf(w), 0)`
- **`exportCSV`:** use `feeOf(w)` and `netOf(w)`, and add `w.coin` and `w.userId` columns
- **`stats`:** `paidOut: conf.reduce((s, w) => s + netOf(w), 0)` and `feeProfit: conf.reduce((s, w) => s + feeOf(w), 0)`
- **Table:** the `fee` and `net` cells use `fmtAmt(feeOf(w))` and `fmtAmt(netOf(w))`

Do the same for the deposits table. Rename the "Amount (USDT)" header to just "Amount" and show the coin in a small badge next to it, since rows can now be USDT or USDC.

One thing to watch: the fee is calculated on the client here, so make sure your API also enforces 10% server-side when you wire up the `TODO`s. Don't trust the client's number for payouts.