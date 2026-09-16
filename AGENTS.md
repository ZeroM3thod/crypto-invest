Now I have the full picture. Let me map out the complete restructure plan for you.

---

## Full Website Restructure Guide

Here's the complete architecture split into 3 panels — **Public**, **User Panel**, and **Admin Panel** — with the dock only showing in the User Panel. Zero UI changes.

---

## 🗂️ New Folder Structure

```
app/
  (public)/                    ← Public layout group (no dock)
    layout.tsx                 ← Public layout (no GlobalDock)
    page.tsx                   ← Landing page (existing home page)
    about/
      page.tsx                 ← About page
    pricing/
      page.tsx                 ← Pricing page
    contact/
      page.tsx                 ← Contact page

  (user)/                      ← User Panel layout group (WITH dock)
    layout.tsx                 ← User layout (has GlobalDock)
    dashboard/
      page.tsx                 ← Existing dashboard (unchanged UI)
    markets/
      page.tsx                 ← Markets page
    wallet/
      page.tsx
    fund/
      page.tsx

  (admin)/                     ← Admin Panel layout group (no dock)
    layout.tsx                 ← Admin layout (no GlobalDock)
    dashboard/
      page.tsx                 ← Admin dashboard

app/
  layout.tsx                   ← Root layout (fonts, globals.css ONLY — no dock)
  globals.css                  ← Unchanged

components/
  app/
    global-dock.tsx            ← Unchanged
    icons.tsx                  ← Unchanged
  motion/
    ...                        ← All unchanged
lib/
  ...                          ← All unchanged
```

---

## How Route Groups Work

Next.js App Router supports **route groups** using `(folderName)` — the parens make the folder invisible to the URL. So:

- `app/(public)/page.tsx` → renders at `/`
- `app/(user)/dashboard/page.tsx` → renders at `/dashboard`
- `app/(admin)/dashboard/page.tsx` → renders at `/admin/dashboard`

Each group gets its own `layout.tsx` that can include (or exclude) the dock.

---

## Step 1 — Update Root Layout (remove dock from here)

The current `app/layout.tsx` has `<GlobalDock />` in the body. Move it out of here. The root layout should ONLY handle fonts and global CSS.

**`app/layout.tsx`** — replace entirely:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Invest",
  description: "Your investment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
```

---

## Step 2 — Create Public Layout Group

**`app/(public)/layout.tsx`** — new file:

```tsx
// app/(public)/layout.tsx
// Public pages: landing, about, pricing, contact etc.
// No dock here.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**`app/(public)/page.tsx`** — move your existing `app/page.tsx` here (exact same content, zero change):

```tsx
// app/(public)/page.tsx
"use client";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-foreground">Home Page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The dock is now fixed at the bottom on every page.
      </p>
    </div>
  );
}
```

> After moving, **delete** `app/page.tsx` (the original root one). The `(public)/page.tsx` covers `/`.

---

**`app/(public)/about/page.tsx`** — example public page:

```tsx
// app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground">About Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        About page — public, no dock.
      </p>
    </div>
  );
}
```

---

## Step 3 — Create User Panel Layout Group (Dock lives here)

**`app/(user)/layout.tsx`** — new file. This is where `GlobalDock` goes:

```tsx
// app/(user)/layout.tsx
// User panel: dashboard, markets, wallet, fund, referral, support etc.
// ONLY this layout has the GlobalDock.

import { GlobalDock } from "@/components/app/global-dock";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <GlobalDock />
    </>
  );
}
```

**`app/(user)/dashboard/page.tsx`** — move your existing `app/dashboard/page.tsx` here. **Zero code changes** — exact same file:

```tsx
// app/(user)/dashboard/page.tsx
// (paste the entire existing dashboard/page.tsx content here — no changes at all)
"use client";

import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  CircleUserRound,
  Command,
  History,
  Inbox,
  LayoutGrid,
  LogOut,
  NotebookTabs,
  PanelLeft,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Workflow,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/motion/context-menu";

const destinations = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Markets", icon: Target },
  {
    label: "Investment",
    icon: Sparkles,
    children: ["Overview", "Daily Profit", "AI Trading", "Cloud Mining", "OTC Trading"],
  },
  {
    label: "Trading",
    icon: Workflow,
    children: ["Manual Trading", "Open Orders", "Trade History", "Trading Portfolio"],
  },
  {
    label: "Wallet",
    icon: Building2,
    children: ["Main Wallet", "Investment Wallet", "Trading Wallet", "Mining Wallet", "Referral Wallet", "Wallet History"],
  },
  {
    label: "Fund",
    icon: Inbox,
    children: ["Deposit", "Withdraw", "Transfer", "Fund History"],
  },
  {
    label: "Referral",
    icon: CircleUserRound,
    children: ["Referral Dashboard", "My Referrals", "Referral Earnings", "Referral History"],
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

export default function DashboardPage() {
  const [active, setActive] = useState("Dashboard");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const handleProfileClick = () => {
    const btn = profileButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const syntheticEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top,
    });
    btn.dispatchEvent(syntheticEvent);
  };

  return (
    <AnimatedSidebarProvider className="min-h-svh">
      <AnimatedSidebar
        ariaLabel="User Panel"
        collapsible="icon"
        panelClassName="border-foreground/[0.08]"
      >
        <AnimatedSidebarHeader className="p-3 pb-2">
          <div className="flex min-h-11 items-center gap-3 overflow-hidden px-2">
            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-background">
              <Command aria-hidden="true" className="size-4" />
            </div>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[state=collapsed]/sidebar:hidden"
            >
              <span className="truncate text-sm font-semibold text-foreground">
                Acme Inc
              </span>
              <ChevronsUpDown
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            </button>
            <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:bg-muted md:hidden">
              <X aria-hidden="true" className="size-4" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent className="px-2 pt-1">
          <AnimatedSidebarGroup className="pt-1">
            <AnimatedSidebarGroupLabel>User Panel</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {destinations.map(({ label, icon: Icon, children }) => (
                  <AnimatedSidebarMenuItem key={label}>
                    <AnimatedSidebarMenuButton
                      isActive={
                        active === label ||
                        children?.includes(active) === true
                      }
                      ariaExpanded={
                        children ? openSection === label : undefined
                      }
                      icon={<Icon className="size-4" />}
                      onSelect={() => {
                        setOpenSection((current) => {
                          if (!children) {
                            setActive(label);
                            return null;
                          }
                          return current === label ? null : label;
                        });
                      }}
                    >
                      {label}
                    </AnimatedSidebarMenuButton>
                    {children ? (
                      <AnimatedSidebarMenuSub open={openSection === label}>
                        {children.map((child) => (
                          <AnimatedSidebarMenuSubItem key={child}>
                            <AnimatedSidebarMenuSubButton
                              isActive={active === child}
                              onSelect={() => setActive(child)}
                            >
                              {child}
                            </AnimatedSidebarMenuSubButton>
                          </AnimatedSidebarMenuSubItem>
                        ))}
                      </AnimatedSidebarMenuSub>
                    ) : null}
                  </AnimatedSidebarMenuItem>
                ))}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        </AnimatedSidebarContent>

        <AnimatedSidebarFooter className="gap-3 border-none p-3">
          <ContextMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
            <ContextMenuTrigger>
              <button
                ref={profileButtonRef}
                type="button"
                onClick={handleProfileClick}
                className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-xl p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d5ff66] text-xs font-semibold text-[#172000]">
                  AS
                </span>
                <span className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
                  <span className="block truncate text-sm font-medium text-foreground">
                    Ava Stone
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    ava@solace.app
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground group-data-[state=collapsed]/sidebar:hidden"
                />
              </button>
            </ContextMenuTrigger>

            <ContextMenuContent ariaLabel="Profile actions" className="w-60">
              <ContextMenuLabel>Profile</ContextMenuLabel>
              <ContextMenuItem
                textValue="Personal Information"
                onSelect={() => setActive("Personal Information")}
              >
                <User aria-hidden="true" className="h-4 w-4" />
                Personal Information
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Security"
                onSelect={() => setActive("Security")}
              >
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                Security
              </ContextMenuItem>
              <ContextMenuItem
                textValue="KYC Verification"
                onSelect={() => setActive("KYC Verification")}
              >
                <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                KYC Verification
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Login History"
                onSelect={() => setActive("Login History")}
              >
                <History aria-hidden="true" className="h-4 w-4" />
                Login History
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Notification Settings"
                onSelect={() => setActive("Notification Settings")}
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
                Notification Settings
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Account Settings"
                onSelect={() => setActive("Account Settings")}
              >
                <Settings aria-hidden="true" className="h-4 w-4" />
                Account Settings
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem
                tone="destructive"
                textValue="Log out"
                onSelect={() => console.log("logout")}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Log out
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </AnimatedSidebarFooter>

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      <AnimatedSidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-3 border-border border-b px-4">
          <AnimatedSidebarTrigger className="text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <PanelLeft aria-hidden="true" className="size-4" />
          </AnimatedSidebarTrigger>
          <div className="h-5 w-px bg-border" />
          <p className="text-sm font-medium text-foreground">{active}</p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden p-5 sm:p-7">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Wednesday, July 29
            </p>
            <h3 className="mt-2 max-w-md text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Good morning, Ava.
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Your workspace stays in place while the navigation folds down
              to a focused icon rail.
            </p>
          </div>

          <div className="flex items-end justify-between border-border border-t pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Active view
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {active}
              </p>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Press ⌘B to toggle
            </p>
          </div>
        </div>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
```

> After creating this file, **delete** the old `app/dashboard/page.tsx`.

---

## Step 4 — Create Admin Panel Layout Group

**`app/(admin)/layout.tsx`** — new file:

```tsx
// app/(admin)/layout.tsx
// Admin panel: admin-only pages, no dock.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**`app/(admin)/dashboard/page.tsx`** — new file (starter admin page):

```tsx
// app/(admin)/dashboard/page.tsx
// Access route: /admin/dashboard
// Add your admin auth guard here later.

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin-only area. No dock here.
      </p>
    </div>
  );
}
```

> **Important:** The admin route above renders at `/admin/dashboard` — not `/dashboard`. The `(admin)` folder doesn't prefix the route, but the `dashboard` subfolder does. So to get `/admin/dashboard`, the structure is `app/(admin)/admin/dashboard/page.tsx` — or just name the folder explicitly. Here's the cleaner approach: keep it as `app/(admin)/admin/dashboard/page.tsx` so the URL is `/admin/dashboard`.

Adjust to:

```
app/
  (admin)/
    admin/
      dashboard/
        page.tsx   → /admin/dashboard
      users/
        page.tsx   → /admin/users
```

---

## Step 5 — Delete Old Files

After creating the new group structure, delete these originals:

- `app/page.tsx` → replaced by `app/(public)/page.tsx`
- `app/dashboard/page.tsx` → replaced by `app/(user)/dashboard/page.tsx`

---

## Summary of All File Changes

| Action | File |
|--------|------|
| **MODIFY** | `app/layout.tsx` — remove `GlobalDock`, fonts only |
| **CREATE** | `app/(public)/layout.tsx` — empty wrapper, no dock |
| **MOVE** | `app/page.tsx` → `app/(public)/page.tsx` |
| **CREATE** | `app/(public)/about/page.tsx` — example public page |
| **CREATE** | `app/(user)/layout.tsx` — wrapper WITH `GlobalDock` |
| **MOVE** | `app/dashboard/page.tsx` → `app/(user)/dashboard/page.tsx` |
| **CREATE** | `app/(admin)/layout.tsx` — empty wrapper, no dock |
| **CREATE** | `app/(admin)/admin/dashboard/page.tsx` — admin starter |
| **DELETE** | `app/page.tsx` (original) |
| **DELETE** | `app/dashboard/page.tsx` (original) |
| **UNCHANGED** | Everything in `components/`, `lib/`, `globals.css`, configs |

---

## Key Points

- **No UI code changes** — zero. All your sidebar, context menu, dock, animations stay identical.
- **Dock only in `(user)` group** — it's in that layout only, so it shows on `/dashboard`, `/markets`, etc. but NOT on landing page or admin.
- **Route groups** (`(public)`, `(user)`, `(admin)`) don't affect URLs — they're invisible to the router.
- **Admin auth** — the `(admin)` layout is just the shell. You'll add middleware or a server-side auth check later to protect those routes.
- **No `middleware.ts` needed yet** — the structure is clean and ready for it when you add auth.