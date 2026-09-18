// app/(user)/_components/user-shell.tsx
"use client";

import Avatar9 from "@/components/base-ui/avatar2";

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
import { useRef, useState, type ReactNode } from "react";
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
    children: ["Overview", "Daily Profit", "AI Trading", "Cloud Mining"],
  },
  {
    label: "Trading",
    icon: Workflow,
    children: ["Manual Trading", "Open Orders", "Trade History", "Trading Portfolio"],
  },
  {
    label: "Wallet",
    icon: Building2,
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
    icon: Inbox,
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

interface UserShellProps {
  /** The nav item or sub-item label that should appear active. */
  active: string;
  /** The page content rendered inside the inset area, below the header. */
  children: ReactNode;
}

export function UserShell({ active: initialActive, children }: UserShellProps) {
  const [active, setActive] = useState(initialActive);
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
              <span   aria-label="Profile"
                      active={active === "profile"}
                      onClick={() => setActive("profile")}
                       >
          <Avatar9/>
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

        {/* Page content goes here */}
        {children}
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
