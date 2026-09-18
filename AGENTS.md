

**Global Dock icons:**
- Home → `Home`
- Investment → `BriefcaseBusiness`
- Trading → `CandlestickChart`
- Wallet → `Wallet`
- Fund → `Landmark`

**User Shell current icons:**
- Dashboard → `LayoutGrid`
- Markets → `Target`
- Investment → `Sparkles`
- Trading → `Workflow`
- Wallet → `Building2`
- Fund → `Inbox`
- Referral → `CircleUserRound`
- Support → `NotebookTabs`

So swap the ones that overlap. Here's the updated `destinations` array:

```tsx
const destinations = [
  { label: "Dashboard", icon: Home },
  { label: "Markets", icon: Target },
  {
    label: "Investment",
    icon: BriefcaseBusiness,
    children: ["Overview", "Daily Profit", "AI Trading", "Cloud Mining"],
  },
  {
    label: "Trading",
    icon: CandlestickChart,
    children: ["Manual Trading", "Open Orders", "Trade History", "Trading Portfolio"],
  },
  {
    label: "Wallet",
    icon: Wallet,
    children: [
      "Main Wallet",
      "Investment Wallet",
      "Trading Wallet",
      "Mining Wallet",
      "Referral Wallet",
      "Wallet History",
    ],
  },
  {
    label: "Fund",
    icon: Landmark,
    children: ["Deposit", "Withdraw", "Transfer", "Fund History"],
  },
  {
    label: "Referral",
    icon: CircleUserRound,
    children: [
      "Referral Dashboard",
      "My Referrals",
      "Referral Earnings",
      "Referral History",
    ],
  },
  {
    label: "Support",
    icon: NotebookTabs,
    children: ["Help Center", "My Tickets", "Create Ticket"],
  },
] satisfies {
  label: string;
  icon: typeof CircleUserRound;
  children?: string[];
}[];
```

And update the imports — add the new ones, remove the unused:

```tsx
import {
  BriefcaseBusiness,   // ← add
  CandlestickChart,    // ← add
  Home,                // ← add
  Landmark,            // ← add
  Wallet,              // ← add
  // keep these:
  BadgeCheck,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CircleUserRound,
  Command,
  History,
  LogOut,
  NotebookTabs,
  PanelLeft,
  Settings,
  ShieldCheck,
  Target,
  User,
  X,
  // remove: Sparkles, Workflow, Building2, Inbox, LayoutGrid
} from "lucide-react";
```

5 icon swaps — `Dashboard` keeps `Target` since the dock doesn't have a direct equivalent for Markets, and Referral/Support stay as-is since they have no dock counterpart.