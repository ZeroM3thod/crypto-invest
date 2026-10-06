I'll start by looking at both files.Now I'll check the existing Next.js project: its Tailwind version, layouts, current home page and global CSS.The repo has no `package.json` or Tailwind config in the pack, so I need to see how the theme provider is used elsewhere so the landing page doesn't break it.Here is the full conversion: no new npm packages, and nothing is left out. I read both files. Your `globals.css` uses Tailwind v4 (`@import "tailwindcss"`), while the HTML was built on the Tailwind v3 CDN, so I rewrote the config as v4 theme tokens. I also scoped the design's colours to the landing page, so your signin, dashboard and admin pages (which use a blue `primary`) are not affected.

## File layout

```
app/
├─ globals.css                      ← APPEND a block (Step 1)
└─ (public)/
   ├─ layout.tsx                    ← REPLACE (Step 2)
   ├─ page.tsx                      ← REPLACE (Step 3)
   └─ _components/                  ← NEW folder (Step 4)
      ├─ data.ts
      ├─ icon.tsx
      ├─ section-heading.tsx
      ├─ icon-card.tsx
      ├─ theme-toggle.tsx
      ├─ dividend-countdown.tsx
      ├─ navbar.tsx
      ├─ hero.tsx
      ├─ metrics.tsx
      ├─ features.tsx
      ├─ referral.tsx
      ├─ ai-trading.tsx
      ├─ how-it-works.tsx
      ├─ wallets.tsx
      ├─ pricing.tsx
      ├─ security.tsx
      ├─ faq.tsx
      └─ footer.tsx
```

---

## Step 1: `app/globals.css` (paste at the very END, keep everything already there)

```css
/* =====================================================================
   QOUANTEX LANDING PAGE: design tokens
   Everything is scoped to the .qx wrapper so the rest of the app
   (signin, dashboard, admin...) keeps its current colours.
   ===================================================================== */

/* Light palette (copied 1:1 from the HTML) */
.qx {
  --c-surface-container: 238 238 238;
  --c-secondary-fixed: 228 226 226;
  --c-inverse-on-surface: 240 241 241;
  --c-surface-tint: 95 94 94;
  --c-on-tertiary-fixed: 7 0 108;
  --c-on-surface: 26 28 28;
  --c-on-tertiary-fixed-variant: 47 46 190;
  --c-on-error: 255 255 255;
  --c-surface-container-highest: 226 226 226;
  --c-surface-container-high: 232 232 232;
  --c-tertiary: 21 21 21;
  --c-on-secondary-container: 98 98 98;
  --c-secondary-fixed-dim: 199 198 198;
  --c-on-secondary-fixed-variant: 70 71 71;
  --c-on-primary: 255 255 255;
  --c-on-surface-variant: 68 71 72;
  --c-tertiary-fixed-dim: 192 193 255;
  --c-on-background: 26 28 28;
  --c-on-primary-fixed-variant: 71 70 70;
  --c-primary-fixed-dim: 200 198 197;
  --c-on-tertiary-container: 112 115 255;
  --c-outline: 116 120 120;
  --c-on-secondary: 255 255 255;
  --c-primary-fixed: 229 226 225;
  --c-on-error-container: 147 0 10;
  --c-on-primary-container: 133 131 131;
  --c-primary-container: 28 27 27;
  --c-on-tertiary: 255 255 255;
  --c-inverse-surface: 47 49 49;
  --c-on-primary-fixed: 28 27 27;
  --c-secondary-container: 225 223 223;
  --c-background: 249 249 249;
  --c-surface-container-lowest: 255 255 255;
  --c-error: 186 26 26;
  --c-secondary: 94 94 94;
  --c-tertiary-container: 7 0 108;
  --c-outline-variant: 196 199 199;
  --c-surface-dim: 218 218 218;
  --c-surface: 249 249 249;
  --c-tertiary-fixed: 225 224 255;
  --c-error-container: 255 218 214;
  --c-surface-bright: 249 249 249;
  --c-primary: 21 21 21;
  --c-surface-variant: 226 226 226;
  --c-inverse-primary: 200 198 197;
  --c-surface-container-low: 243 243 243;
  --c-on-secondary-fixed: 27 28 28;

  /* Your app already has a `primary` colour (blue). Inside .qx ONLY,
     point it at the landing page's primary (near-black / near-white). */
  --primary: rgb(var(--c-primary));

  transition: background-color 0.2s, color 0.2s;
}

/* Dark palette: your root layout puts the `dark` class on <html> */
.dark .qx {
  --c-surface: 21 21 21;
  --c-background: 21 21 21;
  --c-surface-dim: 21 21 21;
  --c-surface-bright: 27 27 27;
  --c-surface-container-lowest: 15 15 15;
  --c-surface-container-low: 27 27 27;
  --c-surface-container: 33 33 33;
  --c-surface-container-high: 42 42 42;
  --c-surface-container-highest: 51 51 51;
  --c-surface-variant: 46 46 46;
  --c-on-surface: 236 236 236;
  --c-on-background: 236 236 236;
  --c-on-surface-variant: 196 199 199;
  --c-outline: 142 145 146;
  --c-outline-variant: 58 61 61;
  --c-primary: 242 242 242;
  --c-on-primary: 21 21 21;
  --c-tertiary: 242 242 242;
  --c-on-tertiary: 21 21 21;
  --c-inverse-surface: 236 236 236;
  --c-inverse-on-surface: 21 21 21;
  --c-secondary: 199 198 198;
  --c-surface-tint: 200 198 197;
}

/* The old tailwind.config → Tailwind v4 theme.
   `primary` and `background` are intentionally NOT redefined here
   (they already exist in your app). */
@theme inline {
  --color-surface-container: rgb(var(--c-surface-container));
  --color-secondary-fixed: rgb(var(--c-secondary-fixed));
  --color-inverse-on-surface: rgb(var(--c-inverse-on-surface));
  --color-surface-tint: rgb(var(--c-surface-tint));
  --color-on-tertiary-fixed: rgb(var(--c-on-tertiary-fixed));
  --color-on-surface: rgb(var(--c-on-surface));
  --color-on-tertiary-fixed-variant: rgb(var(--c-on-tertiary-fixed-variant));
  --color-on-error: rgb(var(--c-on-error));
  --color-surface-container-highest: rgb(var(--c-surface-container-highest));
  --color-surface-container-high: rgb(var(--c-surface-container-high));
  --color-tertiary: rgb(var(--c-tertiary));
  --color-on-secondary-container: rgb(var(--c-on-secondary-container));
  --color-secondary-fixed-dim: rgb(var(--c-secondary-fixed-dim));
  --color-on-secondary-fixed-variant: rgb(var(--c-on-secondary-fixed-variant));
  --color-on-primary: rgb(var(--c-on-primary));
  --color-on-surface-variant: rgb(var(--c-on-surface-variant));
  --color-tertiary-fixed-dim: rgb(var(--c-tertiary-fixed-dim));
  --color-on-background: rgb(var(--c-on-background));
  --color-on-primary-fixed-variant: rgb(var(--c-on-primary-fixed-variant));
  --color-primary-fixed-dim: rgb(var(--c-primary-fixed-dim));
  --color-on-tertiary-container: rgb(var(--c-on-tertiary-container));
  --color-outline: rgb(var(--c-outline));
  --color-on-secondary: rgb(var(--c-on-secondary));
  --color-primary-fixed: rgb(var(--c-primary-fixed));
  --color-on-error-container: rgb(var(--c-on-error-container));
  --color-on-primary-container: rgb(var(--c-on-primary-container));
  --color-primary-container: rgb(var(--c-primary-container));
  --color-on-tertiary: rgb(var(--c-on-tertiary));
  --color-inverse-surface: rgb(var(--c-inverse-surface));
  --color-on-primary-fixed: rgb(var(--c-on-primary-fixed));
  --color-secondary-container: rgb(var(--c-secondary-container));
  --color-surface-container-lowest: rgb(var(--c-surface-container-lowest));
  --color-error: rgb(var(--c-error));
  --color-secondary: rgb(var(--c-secondary));
  --color-tertiary-container: rgb(var(--c-tertiary-container));
  --color-outline-variant: rgb(var(--c-outline-variant));
  --color-surface-dim: rgb(var(--c-surface-dim));
  --color-surface: rgb(var(--c-surface));
  --color-tertiary-fixed: rgb(var(--c-tertiary-fixed));
  --color-error-container: rgb(var(--c-error-container));
  --color-surface-bright: rgb(var(--c-surface-bright));
  --color-surface-variant: rgb(var(--c-surface-variant));
  --color-inverse-primary: rgb(var(--c-inverse-primary));
  --color-surface-container-low: rgb(var(--c-surface-container-low));
  --color-on-secondary-fixed: rgb(var(--c-on-secondary-fixed));

  /* Fonts: reuses the Geist you already load with next/font */
  --font-body: var(--font-geist-sans), "Inter", sans-serif;
  --font-h1: var(--font-geist-sans), "Inter", sans-serif;
  --font-h2: var(--font-geist-sans), "Inter", sans-serif;
  --font-h3: var(--font-geist-sans), "Inter", sans-serif;
  --font-button: var(--font-geist-sans), "Inter", sans-serif;
  --font-label-caps: var(--font-geist-sans), "Inter", sans-serif;

  /* Type scale: text-body, text-h1, text-h2, text-h3, text-button, text-label-caps */
  --text-body: 17px;
  --text-body--line-height: 1.6;
  --text-body--letter-spacing: 0em;
  --text-body--font-weight: 400;

  --text-h3: 28px;
  --text-h3--line-height: 1.2;
  --text-h3--letter-spacing: -0.01em;
  --text-h3--font-weight: 500;

  --text-button: 14px;
  --text-button--line-height: 1;
  --text-button--letter-spacing: 0.01em;
  --text-button--font-weight: 500;

  --text-label-caps: 12px;
  --text-label-caps--line-height: 1;
  --text-label-caps--letter-spacing: 0.05em;
  --text-label-caps--font-weight: 600;

  --text-h1: 84px;
  --text-h1--line-height: 0.95;
  --text-h1--letter-spacing: -0.04em;
  --text-h1--font-weight: 600;

  --text-h2: 48px;
  --text-h2--line-height: 1.1;
  --text-h2--letter-spacing: -0.02em;
  --text-h2--font-weight: 600;
}

/* Material Symbols icon class.
   Own class name (qx-icon) on purpose: Google's stylesheet ships an
   un-layered .material-symbols-outlined { font-size: 24px } that would
   beat Tailwind v4's layered utilities (text-4xl, text-[20px]...). */
@layer components {
  .qx-icon {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  }
  .qx-icon-filled {
    font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
  }
}

/* Tailwind v4 buttons default to the arrow cursor; v3 (the HTML) used a pointer */
@layer base {
  .qx button:not(:disabled) {
    cursor: pointer;
  }
}
```

---

## Step 2: `app/(public)/layout.tsx` (replace the whole file)

This loads the icon font. The landing page has its own theme toggle in the navbar, so I removed `FloatingThemeToggle` here to avoid two toggles overlapping.

```tsx
// app/(public)/layout.tsx
// Public pages: landing, about, pricing, contact etc.
// No dock here.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Material Symbols icon font used by the landing page */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </>
  );
}
```

---

## Step 3: `app/(public)/page.tsx` (replace the whole file)

```tsx
// app/(public)/page.tsx
import type { Metadata } from "next";
import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { Metrics } from "./_components/metrics";
import { Features } from "./_components/features";
import { Referral } from "./_components/referral";
import { AiTrading } from "./_components/ai-trading";
import { HowItWorks } from "./_components/how-it-works";
import { Wallets } from "./_components/wallets";
import { Pricing } from "./_components/pricing";
import { Security } from "./_components/security";
import { Faq } from "./_components/faq";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: "Qouantex - Crypto Wealth & Trading Ecosystem",
};

export default function HomePage() {
  return (
    <div className="qx min-h-screen bg-surface font-body text-body text-on-surface">
      <Navbar />
      <main className="pt-32 pb-32">
        <Hero />
        <Metrics />
        <Features />
        <Referral />
        <AiTrading />
        <HowItWorks />
        <Wallets />
        <Pricing />
        <Security />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
```

---

## Step 4: create the `app/(public)/_components/` files

The folder starts with `_`, so Next.js never treats it as a route.

### `data.ts`
All the text and numbers that the HTML's JavaScript used to render. Edit content here.

```ts
// app/(public)/_components/data.ts

/** Shared card surface used by most boxes on the page */
export const CARD = "bg-surface-container-lowest border border-outline-variant";

export type IconItem = { icon: string; title: string; desc: string };

/* ---------- Hero preview card ---------- */
export const WALLET_TABS = ["Main", "Investment", "Trading", "Mining", "Referral"];
export const ACTIVE_WALLET_TAB = "Investment";

export const PNL = [
  { label: "Today", value: "+1.8%" },
  { label: "7-Day", value: "+9.4%" },
  { label: "30-Day", value: "+31.2%" },
  { label: "All-Time", value: "+86.7%" },
];

/* ---------- Trust strip ---------- */
export const METRICS = [
  { value: "$10M+", label: "Total assets managed" },
  { value: "2.5%", label: "Max daily plan return" },
  { value: "68.4%", label: "AI trading win rate" },
  { value: "99.98%", label: "Platform uptime" },
  { value: "50,000+", label: "Active traders" },
];

/* ---------- Features ---------- */
export const FEATURES: (IconItem & { cta: string })[] = [
  {
    icon: "trending_up",
    title: "Automated Daily Profits",
    desc: "Plans from 1.7% to 2.5% per day, credited every 24 hours to your Investment Wallet.",
    cta: "Explore plans",
  },
  {
    icon: "smart_toy",
    title: "Quantitative AI Trading",
    desc: "Momentum, EMA and grid-scalping strategies with automated risk controls.",
    cta: "Explore AI trading",
  },
  {
    icon: "memory",
    title: "Zero-Hardware Cloud Mining",
    desc: "Daily BTC mining rewards on 30 to 90 day contracts with no machines to manage.",
    cta: "Explore mining",
  },
  {
    icon: "account_balance_wallet",
    title: "5-Wallet Smart Partitioning",
    desc: "Separate trading capital, investment principal and referral earnings into distinct vaults.",
    cta: "Explore wallets",
  },
  {
    icon: "groups",
    title: "5% Lifetime Affiliate Program",
    desc: "Earn 5% on referral profits, milestone cash bonuses and up to $1,000 monthly leaderboard prizes.",
    cta: "Explore referrals",
  },
  {
    icon: "swap_horiz",
    title: "Instant Peer-to-Peer Transfers",
    desc: "Send funds by Email or User ID with instant settlement and a flat $0.10 fee.",
    cta: "Explore transfers",
  },
];

/* ---------- Referral ---------- */
export const REFERRAL_POINTS = [
  "Claim at 5 referrals for $5.00, or keep going and skip to a bigger payout.",
  "Counter resets to 0 after every claim, so you can earn unlimited bonuses.",
  "Targets run from 5 referrals ($5) up to 150 referrals ($180).",
];

export const REFERRAL_TIERS = [
  { referrals: 5, bonus: 5 },
  { referrals: 10, bonus: 10 },
  { referrals: 15, bonus: 18 },
  { referrals: 20, bonus: 25 },
  { referrals: 30, bonus: 40 },
  { referrals: 50, bonus: 65 },
  { referrals: 100, bonus: 120 },
  { referrals: 150, bonus: 180 },
];

/* ---------- How it works ---------- */
export const STEPS: IconItem[] = [
  {
    icon: "person_add",
    title: "1. Create account",
    desc: "Sign up in under 60 seconds and enable 2FA.",
  },
  {
    icon: "download",
    title: "2. Deposit crypto",
    desc: "Fund your Main Wallet with USDT or USDC via TRC-20, BEP-20 or ERC-20.",
  },
  {
    icon: "tune",
    title: "3. Pick a strategy",
    desc: "Activate a daily profit plan, AI trading package or mining contract.",
  },
  {
    icon: "payments",
    title: "4. Collect & withdraw",
    desc: "Profits credit every 24 hours. Withdraw to your Main Wallet when cycles end.",
  },
];

/* ---------- Wallets ---------- */
export const WALLETS: IconItem[] = [
  {
    icon: "account_balance",
    title: "Main Wallet",
    desc: "Central hub for deposits and withdrawals.",
  },
  {
    icon: "savings",
    title: "Investment Wallet",
    desc: "Daily profit growth and reinvestment.",
  },
  {
    icon: "candlestick_chart",
    title: "Trading Wallet",
    desc: "Dedicated margin for AI strategies and manual orders.",
  },
  {
    icon: "memory",
    title: "Mining Wallet",
    desc: "Accumulates cloud mining yields.",
  },
  {
    icon: "redeem",
    title: "Referral Wallet",
    desc: "Commissions and milestone bonuses.",
  },
  {
    icon: "swap_horiz",
    title: "Zero-Fee Transfers",
    desc: "Move funds between your wallets instantly.",
  },
];

/* ---------- Pricing ---------- */
export type Plan = {
  name: string;
  price: string;
  unit: string;
  desc: string;
  cta: string;
  popular?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "1.7%",
    unit: "/day",
    desc: "Daily profit plan from $30, credited every 24 hours.",
    cta: "Start Plan",
  },
  {
    name: "Growth",
    price: "2.1%",
    unit: "/day",
    desc: "Higher daily rate with automatic crediting to your Investment Wallet.",
    cta: "Start Plan",
  },
  {
    name: "AI Trading",
    price: "$100",
    unit: "min",
    desc: "Algorithmic trading with a 15-day lock and daily P&L updates.",
    cta: "Activate",
  },
  {
    name: "Elite",
    price: "2.5%",
    unit: "/day",
    desc: "Our top daily profit tier with a live dividend countdown.",
    cta: "Go Elite",
    popular: true,
  },
  {
    name: "Cloud Mining",
    price: "5 TH/s",
    unit: "+",
    desc: "Rigs from 5 TH/s with 30 to 90 day contracts and daily BTC rewards.",
    cta: "Buy Rig",
  },
];

/* ---------- Security ---------- */
export const SECURITY = [
  { title: "2FA", desc: "Google Authenticator" },
  { title: "KYC", desc: "4-step verification" },
  { title: "IP Tracking", desc: "Login audit trail" },
  { title: "24/7", desc: "Ticket support" },
];

/* ---------- FAQ ---------- */
export const FAQ = [
  {
    q: "Can I claim multiple referral targets simultaneously?",
    a: "No. Once you claim a target, your counter resets to 0. Claim smaller targets along the way or hold out for higher tier rewards.",
  },
  {
    q: "When are AI trading results credited?",
    a: "Results are recorded and credited every 24 hours inside your strategy dashboard.",
  },
  {
    q: "Can I cancel my AI Trading Package before 15 days?",
    a: "No. Funds are deployed in open positions, so capital stays locked for the full 15-day cycle.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: "Once a cycle completes or a bonus is claimed, funds can be withdrawn according to standard platform wallet limits.",
  },
];

/* ---------- Footer ---------- */
export const FOOTER_COLUMNS: Record<string, string[]> = {
  Products: ["Daily Profit", "AI Trading", "Cloud Mining", "Manual Trading"],
  Wallets: ["Deposit", "Withdraw", "Transfer", "History"],
  Community: ["Live Chat", "Announcements", "Referral Leaderboard", "Support"],
  Legal: ["Privacy", "Terms", "Security"],
};
```

### `icon.tsx`

```tsx
// app/(public)/_components/icon.tsx
type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className = "", filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`qx-icon${filled ? " qx-icon-filled" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
```

### `section-heading.tsx`

```tsx
// app/(public)/_components/section-heading.tsx
export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-16">
      <h2
        className={`font-h2 text-h2 text-on-surface${subtitle ? " mb-4" : ""}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-body text-on-surface-variant max-w-[600px] mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

### `icon-card.tsx`
Used by both "How it works" and "Wallets" (they have identical markup).

```tsx
// app/(public)/_components/icon-card.tsx
import { Icon } from "./icon";
import { CARD, type IconItem } from "./data";

export function IconCard({ icon, title, desc }: IconItem) {
  return (
    <div
      className={`${CARD} rounded-[20px] p-6 hover:bg-surface-container-low transition-colors`}
    >
      <Icon name={icon} className="text-3xl text-outline mb-4" />
      <h3 className="font-h3 text-xl text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}
```

### `theme-toggle.tsx` (client component)
It uses the same localStorage key (`crypto_invest_theme`) and the same `<html>` class logic as your root layout script, so a saved choice is applied on the next load.

```tsx
// app/(public)/_components/theme-toggle.tsx
"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./icon";

const STORAGE_KEY = "crypto_invest_theme";

// Re-render whenever the <html> class list changes (from anywhere)
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => true; // your app defaults to dark

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
    >
      <Icon name={isDark ? "light_mode" : "dark_mode"} className="text-[20px]" />
    </button>
  );
}
```

### `dividend-countdown.tsx` (client component)
Counts down to the next UTC midnight, like the original script.

```tsx
// app/(public)/_components/dividend-countdown.tsx
"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const secondsLeft = () => 86400 - (Math.floor(Date.now() / 1000) % 86400);

export function DividendCountdown() {
  const [s, setS] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setS(secondsLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const label =
    s === null
      ? "--:--:--"
      : [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
          .map(pad)
          .join(":");

  return (
    <div className="text-xs text-on-surface-variant font-mono">{label}</div>
  );
}
```

### `navbar.tsx`

```tsx
// app/(public)/_components/navbar.tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-0 w-full z-50 px-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto w-full max-w-[560px] flex items-center justify-between bg-surface-container-high border border-outline-variant rounded-full pl-6 pr-2 py-2 backdrop-blur-xl">
        <Link
          href="/"
          className="text-lg font-bold tracking-tighter text-on-surface"
        >
          Qouantex
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/signup"
            className="inline-flex items-center bg-primary text-on-primary font-button text-button px-6 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95 duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

### `hero.tsx`

```tsx
// app/(public)/_components/hero.tsx
import Link from "next/link";
import { Icon } from "./icon";
import { DividendCountdown } from "./dividend-countdown";
import { CARD, PNL, WALLET_TABS, ACTIVE_WALLET_TAB } from "./data";

export function Hero() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 flex flex-col items-center text-center mt-12 mb-[150px]">
      {/* Announcement pill */}
      <div className="inline-flex items-center space-x-2 bg-surface-container-high px-4 py-2 rounded-full mb-8 border border-outline-variant">
        <span className="bg-tertiary text-on-tertiary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
          New
        </span>
        <span className="text-sm font-medium text-on-surface">
          Referral Milestone Bonuses are live
        </span>
        <Icon name="arrow_forward" className="text-sm text-outline" />
      </div>

      <h1 className="font-h1 text-h1 text-on-surface max-w-[900px] mb-8">
        The all-in-one crypto wealth &amp; trading ecosystem
      </h1>
      <p className="font-body text-body text-on-surface-variant max-w-[620px] mb-12">
        Automated daily profit plans, professional AI trading and cloud mining,
        organized in a segregated 5-wallet system with 2FA, KYC and login
        tracking built in.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center bg-primary text-on-primary font-button text-button px-8 py-4 rounded-full hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          Start Investing
        </Link>
        <a
          href="#features"
          className="inline-flex items-center justify-center bg-transparent border border-outline-variant text-on-surface font-button text-button px-8 py-4 rounded-full hover:bg-surface-container transition-colors w-full sm:w-auto"
        >
          Explore Platform
        </a>
      </div>

      {/* Dashboard preview */}
      <div className="w-full max-w-[1024px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 shadow-sm">
        <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/50 relative p-6 md:p-8 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mb-1">
                Portfolio Value
              </div>
              <div className="text-4xl font-semibold tracking-tight">
                $12,480.55
              </div>
            </div>
            <div className="flex gap-2">
              {WALLET_TABS.map((tab) => (
                <span
                  key={tab}
                  className={`px-3 py-1 rounded-full text-xs font-medium border border-outline-variant ${
                    tab === ACTIVE_WALLET_TAB
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {PNL.map((p) => (
              <div key={p.label} className={`${CARD} rounded-xl p-4`}>
                <div className="text-xs text-on-surface-variant mb-1">
                  {p.label} P&amp;L
                </div>
                <div className="text-lg font-semibold">{p.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-lowest/90 border border-outline-variant rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center"
              >
                <Icon name="schedule" filled />
              </button>
              <div>
                <div className="text-sm font-medium">Next dividend credit</div>
                <DividendCountdown />
              </div>
            </div>
            <div className="flex space-x-1 items-end">
              <div className="w-1 h-6 bg-primary rounded-full animate-pulse" />
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse delay-75" />
              <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-150" />
              <div className="w-1 h-7 bg-primary rounded-full animate-pulse delay-200" />
              <div className="w-1 h-5 bg-outline rounded-full" />
              <div className="w-1 h-3 bg-outline rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `metrics.tsx`

```tsx
// app/(public)/_components/metrics.tsx
import { METRICS } from "./data";

export function Metrics() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-[80px] mb-[150px] border-y border-surface-variant">
      <p className="text-center text-sm font-medium text-outline mb-8 uppercase tracking-widest">
        The platform at a glance
      </p>
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-center">
        {METRICS.map((m) => (
          <div key={m.label}>
            <div className="text-4xl font-semibold tracking-tight">
              {m.value}
            </div>
            <div className="text-sm text-outline mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### `features.tsx`

```tsx
// app/(public)/_components/features.tsx
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import { CARD, FEATURES } from "./data";

export function Features() {
  return (
    <section id="features" className="max-w-[1280px] mx-auto px-6 mb-[150px]">
      <SectionHeading
        title="Everything your capital needs"
        subtitle="Six systems, one dashboard: grow, trade, mine, transfer and earn from your network."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`${CARD} rounded-[24px] p-6 hover:shadow-sm transition-shadow duration-300 group flex flex-col h-full`}
          >
            <div className="mb-6 bg-surface-container h-40 rounded-xl flex items-center justify-center">
              <Icon
                name={f.icon}
                className="text-4xl text-outline group-hover:text-primary transition-colors"
              />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2 text-xl">
              {f.title}
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4 grow">
              {f.desc}
            </p>
            <a
              className="text-sm font-medium text-primary hover:underline inline-flex items-center"
              href="#"
            >
              {f.cta} <Icon name="arrow_forward" className="text-[16px] ml-1" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### `referral.tsx`

```tsx
// app/(public)/_components/referral.tsx
import { Icon } from "./icon";
import { REFERRAL_POINTS, REFERRAL_TIERS } from "./data";

export function Referral() {
  return (
    <section
      id="referral"
      className="max-w-[1280px] mx-auto px-6 mb-[150px] grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
    >
      {/* Left: copy */}
      <div className="md:col-span-5 flex flex-col space-y-6">
        <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
          Referral Milestone Bonus System
        </span>
        <h2 className="font-h2 text-h2 text-on-surface">
          Invite friends. Claim instant cash.
        </h2>
        <p className="font-body text-body text-on-surface-variant">
          Meet your active referral target and claim a cash bonus straight to
          your account. Claim early, or skip ahead and save progress for a
          bigger payout.
        </p>
        <ul className="space-y-4">
          {REFERRAL_POINTS.map((t) => (
            <li key={t} className="flex items-start">
              <Icon
                name="check_circle"
                className="text-primary mr-3 mt-1 text-[20px]"
              />
              <span className="text-on-surface-variant text-sm">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: targets card */}
      <div className="md:col-span-7 bg-surface-container-low border border-outline-variant rounded-[24px] p-8 shadow-sm relative overflow-hidden">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50">
          <div className="mb-4 text-xs font-medium text-on-surface-variant tracking-widest uppercase">
            Referral Targets &amp; Cash Rewards
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {REFERRAL_TIERS.map((t) => (
              <div
                key={t.referrals}
                className="bg-surface border border-outline-variant rounded-lg p-3 text-center"
              >
                <div className="text-xs text-on-surface-variant">
                  {t.referrals} Referrals
                </div>
                <div className="text-lg font-bold">${t.bonus}.00</div>
              </div>
            ))}
          </div>

          <div className="bg-surface p-4 rounded-lg border border-outline-variant mb-6 text-sm text-on-surface font-mono leading-relaxed">
            0 Referrals &rarr; Reach{" "}
            <span className="bg-primary/10 text-primary px-1 rounded-sm">
              10 Referrals
            </span>{" "}
            &rarr; Claim $10.00 &rarr; Counter resets to 0
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-on-surface-variant">
                <span>Progress to 10 referrals</span>
                <span>7 / 10</span>
              </div>
              <div className="h-2 bg-surface-variant rounded-full">
                <div className="h-full bg-primary rounded-full w-[70%]" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t border-surface-variant pt-4 mt-6">
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center"
            >
              <Icon name="redeem" filled />
            </button>
            <div className="text-sm text-on-surface-variant">
              Plus <b className="text-on-surface">5% lifetime commission</b> on
              referral profits.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `ai-trading.tsx`

```tsx
// app/(public)/_components/ai-trading.tsx
import { Icon } from "./icon";

const DAYS = [
  { day: 1, text: "+$2.50 Profit", loss: false },
  { day: 2, text: "+$1.20 Profit", loss: false },
  { day: 3, text: "-$0.80 Loss", loss: true },
  { day: 4, text: "+$3.10 Profit", loss: false },
  { day: 5, text: "+$1.70 Profit", loss: false },
];

const CHIPS = ["From $100", "15-day strategy lock", "Daily P&L updates"];

export function AiTrading() {
  return (
    <section
      id="trading"
      className="max-w-[1280px] mx-auto px-6 mb-[150px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
    >
      {/* Code window */}
      <div className="bg-[#111318] rounded-[24px] p-8 overflow-hidden shadow-lg border border-outline-variant/20 order-2 md:order-1">
        <div className="flex space-x-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
          <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
          <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
        </div>
        <pre className="text-sm font-mono text-white/80 whitespace-pre-wrap">
          <code>
            <span className="text-on-tertiary-container">package</span>
            {" = AI_Trading(min="}
            <span className="text-secondary-fixed-dim">{'"$100.00"'}</span>
            {", lock="}
            <span className="text-secondary-fixed-dim">{'"15 days"'}</span>
            {")\n\n"}
            {DAYS.map((d) => (
              <span key={d.day}>
                {`Day ${d.day}:  `}
                <span
                  className={
                    d.loss
                      ? "text-on-tertiary-container"
                      : "text-secondary-fixed-dim"
                  }
                >
                  {d.text}
                </span>
                {"\n"}
              </span>
            ))}
            {"\n# Day 15 -> principal + net P&L unlocked"}
          </code>
        </pre>
      </div>

      {/* Copy */}
      <div className="flex flex-col space-y-6 order-1 md:order-2">
        <h2 className="font-h2 text-h2 text-on-surface">
          Quantitative AI Trading
        </h2>
        <p className="font-body text-body text-on-surface-variant">
          Algorithmic execution 24/7 on top pairs. Every 24 hours your real
          daily performance is updated. Returns are never fixed or guaranteed
          and reflect genuine market movement.
        </p>
        <div className="flex flex-wrap gap-3">
          {CHIPS.map((c) => (
            <span
              key={c}
              className="px-3 py-1 bg-surface-container border border-outline-variant rounded-full text-xs font-medium"
            >
              {c}
            </span>
          ))}
        </div>
        <a
          className="text-sm font-medium text-primary hover:underline inline-flex items-center mt-4"
          href="#"
        >
          View AI strategies{" "}
          <Icon name="arrow_forward" className="text-[16px] ml-1" />
        </a>
      </div>
    </section>
  );
}
```

### `how-it-works.tsx`

```tsx
// app/(public)/_components/how-it-works.tsx
import { SectionHeading } from "./section-heading";
import { IconCard } from "./icon-card";
import { STEPS } from "./data";

export function HowItWorks() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 mb-[150px]">
      <SectionHeading
        title="How it works"
        subtitle="From sign-up to withdrawal in four steps."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((s) => (
          <IconCard key={s.title} {...s} />
        ))}
      </div>
    </section>
  );
}
```

### `wallets.tsx`

```tsx
// app/(public)/_components/wallets.tsx
import { SectionHeading } from "./section-heading";
import { IconCard } from "./icon-card";
import { WALLETS } from "./data";

export function Wallets() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 mb-[150px]">
      <SectionHeading
        title="Five wallets. Total clarity."
        subtitle="Trading risk never bleeds into your long-term investment. Internal transfers are zero-fee."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {WALLETS.map((w) => (
          <IconCard key={w.title} {...w} />
        ))}
      </div>
    </section>
  );
}
```

### `pricing.tsx`

```tsx
// app/(public)/_components/pricing.tsx
import { SectionHeading } from "./section-heading";
import { CARD, PLANS } from "./data";

export function Pricing() {
  return (
    <section id="plans" className="max-w-[1280px] mx-auto px-6 mb-[150px]">
      <SectionHeading
        title="Choose your strategy"
        subtitle="Daily profit tiers, AI trading and cloud mining. Start from $30."
      />
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex-1 rounded-[24px] p-6 flex flex-col ${
              p.popular
                ? "relative bg-surface-container border-2 border-primary lg:-translate-y-4 shadow-md"
                : CARD
            }`}
          >
            {p.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <h3
              className={`text-lg font-medium text-on-surface mb-2${
                p.popular ? " mt-2" : ""
              }`}
            >
              {p.name}
            </h3>
            <div className="text-3xl font-bold text-on-surface mb-6">
              {p.price}
              <span className="text-sm font-normal text-on-surface-variant">
                {p.unit}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 grow">
              {p.desc}
            </p>
            <button
              type="button"
              className={
                p.popular
                  ? "w-full py-2 px-4 rounded-full bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity"
                  : "w-full py-2 px-4 rounded-full border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
              }
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### `security.tsx`

```tsx
// app/(public)/_components/security.tsx
import { Icon } from "./icon";
import { SECURITY } from "./data";

export function Security() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 mb-[150px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-y border-surface-variant py-[80px]">
      <div className="flex flex-col space-y-6">
        <h2 className="font-h2 text-h2 text-on-surface">
          Bank-grade safety &amp; compliance
        </h2>
        <p className="font-body text-body text-on-surface-variant">
          Google Authenticator 2FA with backup codes, a 4-step KYC flow, a full
          login audit trail with IP and device flags, and one-click session
          revocation. Withdrawals require 2FA confirmation.
        </p>
        <a
          className="text-sm font-medium text-primary hover:underline inline-flex items-center"
          href="#"
        >
          Learn about security{" "}
          <Icon name="arrow_forward" className="text-[16px] ml-1" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SECURITY.map((s) => (
          <div
            key={s.title}
            className="border border-outline-variant rounded-xl p-6 bg-surface-container-lowest flex flex-col items-center justify-center text-center h-32"
          >
            <span className="font-bold text-on-surface mb-1 text-lg">
              {s.title}
            </span>
            <span className="text-xs text-on-surface-variant">{s.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### `faq.tsx`
Uses native `<details>`, so it needs no client JavaScript.

```tsx
// app/(public)/_components/faq.tsx
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import { CARD, FAQ } from "./data";

export function Faq() {
  return (
    <section className="max-w-[800px] mx-auto px-6 mb-[150px]">
      <SectionHeading title="Frequently asked questions" />
      <div className="space-y-4">
        {FAQ.map((f) => (
          <details key={f.q} className={`${CARD} rounded-[20px] p-6 group`}>
            <summary className="cursor-pointer font-medium text-on-surface list-none [&::-webkit-details-marker]:hidden flex justify-between items-center">
              {f.q}
              <Icon
                name="expand_more"
                className="text-outline group-open:rotate-180 transition-transform"
              />
            </summary>
            <p className="text-sm text-on-surface-variant leading-relaxed mt-4">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
```

### `footer.tsx`

```tsx
// app/(public)/_components/footer.tsx
import Link from "next/link";
import { Icon } from "./icon";
import { FOOTER_COLUMNS } from "./data";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-variant bg-surface-bright pt-24 pb-12">
      {/* Final CTA */}
      <div className="max-w-[1280px] mx-auto px-6 mb-20 text-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-8">
          Ready to grow?
        </h2>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center bg-primary text-on-primary font-button text-lg px-8 py-4 rounded-full hover:opacity-90 transition-opacity active:scale-95 duration-200"
        >
          Create Your Account
        </Link>
      </div>

      {/* Link grid */}
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
        <div className="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="text-2xl font-bold tracking-tighter text-on-surface mb-6">
            Qouantex
          </div>
          <p className="font-body text-sm text-on-surface-variant mb-6 pr-4">
            The all-in-one intelligent crypto wealth and trading ecosystem.
          </p>
          <div className="flex flex-col space-y-2">
            <label
              className="text-xs font-medium text-on-surface"
              htmlFor="newsletter-email"
            >
              Subscribe to updates
            </label>
            <div className="flex">
              <input
                id="newsletter-email"
                type="email"
                placeholder="Email address"
                className="bg-surface-container border border-outline-variant text-on-surface text-sm rounded-l-md px-3 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                className="bg-primary text-on-primary px-4 py-2 rounded-r-md text-sm font-medium hover:opacity-90"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {Object.entries(FOOTER_COLUMNS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-label-caps text-label-caps text-on-surface mb-4">
              {heading}
            </h4>
            <ul className="space-y-3 font-body text-xs leading-relaxed text-on-surface-variant">
              {links.map((l) => (
                <li key={l}>
                  <a className="hover:text-on-surface transition-colors" href="#">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto px-6 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="font-body text-xs leading-relaxed text-outline">
          &copy; 2026 Qouantex. Trading and investing involve risk; past
          performance does not guarantee future results.
        </div>
        <div className="flex space-x-4 text-outline">
          <a
            className="hover:text-on-surface transition-colors"
            href="#"
            aria-label="Website"
          >
            <Icon name="language" className="text-[20px]" />
          </a>
          <a
            className="hover:text-on-surface transition-colors"
            href="#"
            aria-label="Chat"
          >
            <Icon name="chat" className="text-[20px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
```

---

## Step 5: run it and check

1. Run `npm run dev` and open `http://localhost:3000/`.
2. Click the moon/sun icon in the navbar. Both themes should work, and your choice should survive a refresh.
3. Icons should show as real icons. If you see words like `arrow_forward`, the Google font link is blocked (ad-blocker or no network).
4. Open `/signin` or `/dashboard`. The blue `primary` colour should be unchanged there.

## What changed from the HTML, and why

| HTML | Next.js version |
|---|---|
| Tailwind v3 CDN + `tailwind.config` | Tailwind v4 `@theme inline` block in `globals.css` |
| `:root` / `html.dark` colour vars | `.qx` / `.dark .qx`, scoped to the landing page only |
| JS `innerHTML` building every section | React components fed by `data.ts` |
| Geist from Google Fonts | Your existing `next/font` Geist (`--font-geist-sans`) |
| `.material-symbols-outlined` class | `.qx-icon` class, because Google's un-layered `font-size: 24px` would override Tailwind v4's size utilities |
| Own theme script and `localStorage.theme` | Toggle that uses your `crypto_invest_theme` key and `<html>` class logic |
| Countdown with `setInterval` | Small client component, same UTC-midnight logic |
| `flex-grow`, `transform`, `rounded` | `grow`, dropped `transform`, `rounded-sm`, because v4 removed or renamed them |

I also made three small additions:
- Three CTAs now link to your existing `/signup` page: navbar "Get Started", hero "Start Investing" and footer "Create Your Account". "Explore Platform" scrolls to `#features`.
- Other `href="#"` links and the pricing buttons are still placeholders, as in the HTML.
- I added a Safari rule so the FAQ `<summary>` triangle stays hidden.

## Things to know

- Your repomix pack only included the `app/` folder, so I couldn't see `components/theme-provider` or `components/theme-toggle`. That is why the toggle is self-contained. If your `ThemeProvider` exposes a `useTheme()` hook, you can swap the toggle's click handler for it.
- The `h1` is 84px at every screen size, exactly like the HTML. If you want it smaller on phones, change it to `text-5xl md:text-h1` in `hero.tsx`.
- If `text-h1` or `text-h2` ignore their weight or letter-spacing, your Tailwind is an early 4.0.x. Update `tailwindcss` and `@tailwindcss/postcss` to 4.1 or newer.