I can see the issue clearly. The panel has a **white/light background** (`bg-[#fafaf8]` from MorphingTabs) but your panel components are using theme variables like `text-foreground`, `text-muted-foreground` which are styled for a **dark background** — so the text looks washed out.

The fix is simple: in all 5 panel components, replace the theme color classes with hardcoded dark colors that work on a light background.

---

### In every panel component, make these 3 replacements:

**1. Title text** — `text-foreground` → `text-[#181818]`

**2. Label text** — `text-muted-foreground` → `text-[#6b7280]`

**3. Value text** — `font-medium text-foreground` → `font-medium text-[#111827]`

**4. Buttons** — `bg-muted ... text-foreground` → `bg-[#f3f4f6] ... text-[#111827]`

---

Here's each panel fully corrected:

### `InvestmentPanel`
```tsx
function InvestmentPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="size-4" />
          </div>
          <p className="text-sm font-semibold text-[#181818]">Investment</p>
        </div>
        <Badge label="Active" tone="success" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Invested</span>
          <span className="font-medium text-[#111827]">$5,500.00</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Active Plans</span>
          <span className="font-medium text-[#111827]">3</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Today&apos;s Profit</span>
          <span className="font-medium text-success">+$28.40</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Profit</span>
          <span className="font-medium text-success">+$1,240.00</span>
        </div>
      </div>
      <button type="button" className="mt-2 w-full rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">
        View Investments
      </button>
    </div>
  );
}
```

### `AITradingPanel`
```tsx
function AITradingPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Bot className="size-4" />
          </div>
          <p className="text-sm font-semibold text-[#181818]">AI Trading</p>
        </div>
        <Badge label="Active" tone="success" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Trading Balance</span>
          <span className="font-medium text-[#111827]">$1,820.30</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Active Strategies</span>
          <span className="font-medium text-[#111827]">2</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Current P/L</span>
          <span className="font-medium text-success">+$34.17</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total P/L</span>
          <span className="font-medium text-success">+$820.50</span>
        </div>
      </div>
      <p className="text-[10px] text-[#9ca3af]">Past performance does not guarantee future results.</p>
      <button type="button" className="w-full rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">
        View AI Trading
      </button>
    </div>
  );
}
```

### `CloudMiningPanel`
```tsx
function CloudMiningPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <CloudLightning className="size-4" />
          </div>
          <p className="text-sm font-semibold text-[#181818]">Cloud Mining</p>
        </div>
        <Badge label="Active" tone="success" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Active Contracts</span>
          <span className="font-medium text-[#111827]">2</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Invested</span>
          <span className="font-medium text-[#111827]">$980.25</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Hashrate</span>
          <span className="font-medium text-[#111827]">120 TH/s</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Today&apos;s Earnings</span>
          <span className="font-medium text-success">+$12.40</span>
        </div>
      </div>
      <button type="button" className="mt-2 w-full rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">
        View Mining
      </button>
    </div>
  );
}
```

### `ManualTradingPanel`
```tsx
function ManualTradingPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <LayoutGrid className="size-4" />
        </div>
        <p className="text-sm font-semibold text-[#181818]">Manual Trading</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Trading Balance</span>
          <span className="font-medium text-[#111827]">$1,820.30</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Open Positions</span>
          <span className="font-medium text-[#111827]">1</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Today&apos;s P/L</span>
          <span className="font-medium text-success">+$22.00</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Volume</span>
          <span className="font-medium text-[#111827]">$4,820.00</span>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="flex-1 rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">Trade</button>
        <button type="button" className="flex-1 rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">History</button>
      </div>
    </div>
  );
}
```

### `ReferralPanel`
```tsx
function ReferralPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-4" />
        </div>
        <p className="text-sm font-semibold text-[#181818]">Referral</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Referrals</span>
          <span className="font-medium text-[#111827]">14</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Active Referrals</span>
          <span className="font-medium text-[#111827]">9</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Total Earnings</span>
          <span className="font-medium text-success">+$970.00</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#6b7280]">Pending Earnings</span>
          <span className="font-medium text-[#111827]">$120.00</span>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="flex-1 rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">Referrals</button>
        <button type="button" className="flex-1 rounded-xl bg-[#f3f4f6] py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-ring">Earnings</button>
      </div>
    </div>
  );
}
```

---

**The 3 rules applied everywhere:**
- Labels → `text-[#6b7280]` (medium gray, clearly readable on white)
- Values → `text-[#111827]` (near black, high contrast)
- Buttons → `bg-[#f3f4f6]` with `text-[#111827]` and `hover:bg-[#e5e7eb]`