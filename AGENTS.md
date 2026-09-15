

**Step 1 — Install dependencies**

```bash
npm install motion lucide-react clsx tailwind-merge
```

---

**Step 2 — `lib/ease.ts`** (create this file)

```ts
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

---

**Step 3 — `lib/utils.ts`** (create this file)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

**Step 4 — `components/motion/shared-layout-bg.tsx`** (copy exactly from the source you provided — no changes)

---

**Step 5 — `components/motion/animated-sidebar.tsx`** (copy exactly from the source you provided — no changes)

---

**Step 6 — `app/globals.css`** — replace with this (adds the CSS variables the sidebar uses):

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --border: #e5e7eb;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --ring: #3b82f6;
  --primary: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --border: #27272a;
    --muted: #18181b;
    --muted-foreground: #71717a;
    --ring: #60a5fa;
    --primary: #60a5fa;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-ring: var(--ring);
  --color-primary: var(--primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans, Arial, Helvetica, sans-serif);
}
```

---

**Step 7 — `app/dashboard/page.tsx`** (create this file — this is your actual dashboard page)

```tsx
"use client";

import {
  BarChart2,
  BookOpen,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuSub,
  AnimatedSidebarMenuSubButton,
  AnimatedSidebarMenuSubItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { X } from "lucide-react";

const navItems = [
  { label: "Overview", icon: <Home className="size-4" />, href: "#" },
  {
    label: "Journal",
    icon: <BookOpen className="size-4" />,
    href: "#",
    isActive: true,
  },
  {
    label: "Analytics",
    icon: <BarChart2 className="size-4" />,
    href: "#",
    children: [
      { label: "Performance", href: "#" },
      { label: "Win Rate", href: "#" },
      { label: "Drawdown", href: "#" },
    ],
  },
  {
    label: "Positions",
    icon: <TrendingUp className="size-4" />,
    href: "#",
  },
  { label: "Accounts", icon: <Wallet className="size-4" />, href: "#" },
];

export default function DashboardPage() {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <AnimatedSidebarProvider>
      <AnimatedSidebar collapsible="icon">
        <AnimatedSidebarHeader>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                TJ
              </div>
              <span className="truncate text-sm font-semibold text-foreground">
                TradeJournal
              </span>
            </div>
            <AnimatedSidebarClose className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent>
          <AnimatedSidebarGroup>
            <AnimatedSidebarGroupLabel>Navigation</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {navItems.map((item) => (
                  <AnimatedSidebarMenuItem key={item.label}>
                    <AnimatedSidebarMenuButton
                      icon={item.icon}
                      href={item.children ? undefined : item.href}
                      isActive={item.isActive}
                      ariaExpanded={
                        item.children ? openSubmenus[item.label] ?? false : undefined
                      }
                      onSelect={
                        item.children ? () => toggleSubmenu(item.label) : undefined
                      }
                    >
                      {item.label}
                    </AnimatedSidebarMenuButton>
                    {item.children && (
                      <AnimatedSidebarMenuSub
                        open={openSubmenus[item.label] ?? false}
                      >
                        {item.children.map((child) => (
                          <AnimatedSidebarMenuSubItem key={child.label}>
                            <AnimatedSidebarMenuSubButton href={child.href}>
                              {child.label}
                            </AnimatedSidebarMenuSubButton>
                          </AnimatedSidebarMenuSubItem>
                        ))}
                      </AnimatedSidebarMenuSub>
                    )}
                  </AnimatedSidebarMenuItem>
                ))}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          <AnimatedSidebarGroup>
            <AnimatedSidebarGroupLabel>Settings</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                <AnimatedSidebarMenuItem>
                  <AnimatedSidebarMenuButton
                    icon={<Settings className="size-4" />}
                    href="#"
                  >
                    Preferences
                  </AnimatedSidebarMenuButton>
                </AnimatedSidebarMenuItem>
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        </AnimatedSidebarContent>

        <AnimatedSidebarFooter>
          <AnimatedSidebarMenu>
            <AnimatedSidebarMenuItem>
              <AnimatedSidebarMenuButton
                icon={<LogOut className="size-4" />}
                href="#"
              >
                Log out
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
          </AnimatedSidebarMenu>
        </AnimatedSidebarFooter>

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      <AnimatedSidebarInset>
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <AnimatedSidebarTrigger className="text-muted-foreground hover:text-foreground">
            <LayoutDashboard className="size-5" />
          </AnimatedSidebarTrigger>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your trades.
          </p>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total P&L", value: "+$2,340", trend: "up" },
              { label: "Win Rate", value: "63%", trend: "up" },
              { label: "Total Trades", value: "87", trend: "neutral" },
              { label: "Max Drawdown", value: "-$420", trend: "down" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                        ? "text-red-500"
                        : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </main>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
```

---

**Step 8 — `app/layout.tsx`** — update `body` className so it supports full-height sidebar layout:

```tsx
<body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

Just remove `flex flex-col` from body (the sidebar wrapper handles its own layout). Or keep it as-is — the sidebar uses `min-h-svh` so it's fine either way.

---

**That's it.** File structure you'll end up with:

```
app/
  globals.css          ← updated
  layout.tsx           ← unchanged
  page.tsx             ← unchanged
  dashboard/
    page.tsx           ← new
components/
  motion/
    animated-sidebar.tsx       ← copied from source
    shared-layout-bg.tsx       ← copied from source
lib/
  ease.ts              ← new
  utils.ts             ← new
```

