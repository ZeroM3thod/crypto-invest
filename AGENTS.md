Now I have everything I need. Let me give you the updated code clearly.

---

## Changes needed: 2 files only

### 1. `app/globals.css` — set background to `#151515` (always dark)

Replace your entire `globals.css` with this:

```css
@import "tailwindcss";

:root {
  --background: #151515;
  --foreground: #ededed;
  --border: #2a2a2a;
  --muted: #1f1f1f;
  --muted-foreground: #71717a;
  --ring: #60a5fa;
  --primary: #60a5fa;
  --card: #1c1c1c;
  --destructive: #ef4444;
  --success: #4ade80;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #151515;
    --foreground: #ededed;
    --border: #2a2a2a;
    --muted: #1f1f1f;
    --muted-foreground: #71717a;
    --ring: #60a5fa;
    --primary: #60a5fa;
    --card: #1c1c1c;
    --destructive: #ef4444;
    --success: #4ade80;
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
  --color-card: var(--card);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans, Arial, Helvetica, sans-serif);
}
```

**Why:** Both `:root` blocks now set `#151515` so the color is always dark regardless of OS theme. I also added `--destructive` and `--success` which the context menu component uses.

---

### 2. `app/dashboard/page.tsx` — wire the Profile button to the context menu

You need to:
- Add the context menu component file (see below)
- Update the dashboard page to import and use it on the Profile button

First, **create this new file** `components/motion/context-menu.tsx` — just paste the full source from the `components/motion/context-menu.tsx` code you already shared in your message above. It's the exact same file, no changes needed to it.

Then also **create `lib/touch.ts`** — paste the full `lib/touch.ts` source from your message above. No changes needed there either.

Now **update `app/dashboard/page.tsx`**. Here's the full updated file:

```tsx
"use client";

import {
  Building2,
  ChevronRight,
  ChevronsUpDown,
  CircleUserRound,
  Command,
  Copy,
  CreditCard,
  LayoutGrid,
  LogOut,
  NotebookTabs,
  PanelLeft,
  Settings,
  Sparkles,
  Target,
  User,
  Workflow,
  X,
  Inbox,
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
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
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
  const [notifications, setNotifications] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Opens the context menu positioned above the profile button, centered on it
  const handleProfileClick = () => {
    const btn = profileButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    // We dispatch a synthetic contextmenu event at the top-center of the button
    // so the context menu's built-in positioning logic places it above the button.
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

        {/* Profile button with context menu */}
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
              <ContextMenuLabel>Ava Stone</ContextMenuLabel>
              <ContextMenuItem
                textValue="Profile"
                onSelect={() => setActive("Profile")}
              >
                <User aria-hidden="true" className="h-4 w-4" />
                Profile
                <ContextMenuShortcut>⌘P</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Billing"
                onSelect={() => setActive("Billing")}
              >
                <CreditCard aria-hidden="true" className="h-4 w-4" />
                Billing
                <ContextMenuShortcut>⌘B</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Settings"
                onSelect={() => setActive("Settings")}
              >
                <Settings aria-hidden="true" className="h-4 w-4" />
                Settings
                <ContextMenuShortcut>⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                textValue="Copy email"
                onSelect={() => navigator.clipboard.writeText("ava@solace.app")}
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy email
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuCheckboxItem
                textValue="Notifications"
                checked={notifications}
                closeOnSelect={false}
                onCheckedChange={setNotifications}
              >
                Notifications
              </ContextMenuCheckboxItem>

              <ContextMenuSeparator />

              <ContextMenuItem
                tone="destructive"
                textValue="Log out"
                onSelect={() => console.log("logout")}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Log out
                <ContextMenuShortcut>⌘Q</ContextMenuShortcut>
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

---

## Quick guide (3 steps)

**Step 1** — Replace `app/globals.css` with the CSS above. This locks the whole site to `#151515` dark background.

**Step 2** — Create `components/motion/context-menu.tsx` and `lib/touch.ts` by pasting the exact source code you already have in the snippets at the top of your message. No edits needed to those files.

**Step 3** — Replace `app/dashboard/page.tsx` with the updated version above.

**How the positioning works:** The Profile button dispatches a `contextmenu` event at `clientX = button center X`, `clientY = button top Y` when clicked. The context menu's own viewport-clamping logic in `ContextMenuContent` then positions it above the button, centered on it — no manual positioning math needed from our side, the component handles it cleanly.