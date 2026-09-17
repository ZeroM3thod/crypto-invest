// app/(user)/dashboard/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CloudLightning,
  FileText,
  FolderKanban,
  LayoutGrid,
  PackageCheck,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { WalletCard } from "@/components/motion/wallet-card";
import {
  ReturnsCalendar,
  ReturnsCalendarGrid,
  ReturnsCalendarTooltip,
} from "@/components/charts/returns-calendar";
import { TableAsyncPreview } from "@/components/previews/motion/table-async.preview";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "destructive" | "muted" }) {
  const colors: Record<string, string> = {
    default:     "bg-primary/10 text-primary",
    success:     "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted:       "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}>
      {label}
    </span>
  );
}

function Stat({ label, value, delta, loading = false }: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-lg font-semibold text-foreground">{value}</p>
      )}
      {delta && !loading && (
        <p className={`flex items-center gap-1 text-xs font-medium ${delta.positive ? "text-success" : "text-destructive"}`}>
          {delta.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta.value}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }: {
  title: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action && actionLabel && (
        <button
          type="button"
          onClick={action}
          className="text-xs font-medium text-primary transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message, actionLabel }: {
  icon: React.ElementType;
  message: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "inactive" | "pending" | "paused" }) {
  const colors: Record<string, string> = {
    active:   "bg-success",
    inactive: "bg-muted-foreground",
    pending:  "bg-primary",
    paused:   "bg-destructive",
  };
  return <span className={`inline-block size-1.5 rounded-full ${colors[status]}`} />;
}

const WALLET_ACCOUNTS = [
  { id: "main",       name: "Main Wallet",       address: "0x8f3Cb1a29e4D7c6F1B2a3E9d0C4b5A6f7D8e9C0b" },
  { id: "investment", name: "Investment Wallet",  address: "0x8f3Cb1a29e4D7c6F1B2a3E9d0C4b5A6f7D8e9C0b" },
  { id: "mining",     name: "Mining Wallet",      address: "0x8f3Cb1a29e4D7c6F1B2a3E9d0C4b5A6f7D8e9C0b" },
  { id: "trading",    name: "Trading Wallet",     address: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B" },
  { id: "refer",      name: "Referral Wallet",    address: "0x9F8e7D6c5B4a3E2d1C0b9A8f7E6d5C4b3A2e1F0d" },
];

const RECENT_SEARCHES = ["vitalik.eth", "0xA0b8…6EB4", "Uniswap", "Send to Trading"];

export default function DashboardPage() {
  const [walletBalance] = useState(12480.32);
  const loading = false;

  return (
    <UserShell active="Dashboard">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Greeting ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Good morning, Ava.
          </h1>
        </div>

        {/* ── Wallet Card ───────────────────────────────── */}
        <section aria-label="Wallet">
          <div className="flex w-full flex-col items-start gap-4 p-2">
            <WalletCard
              accounts={WALLET_ACCOUNTS}
              balance={walletBalance}
              defaultChange={124.5}
              searchRecent={RECENT_SEARCHES}
              hasNotifications
              onDeposit={() => {}}
              onWithdraw={() => {}}
              onTransfer={() => {}}
              onInvest={() => {}}
            />
          </div>
        </section>

        {/* ── P&L Overview ──────────────────────────────── */}
        <section aria-label="Profit and Loss">
          <SectionHeader title="Profit & Loss" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Today's P/L",  value: "+$84.57",    positive: true },
              { label: "7-Day P/L",    value: "+$312.80",   positive: true },
              { label: "30-Day P/L",   value: "+$1,024.40", positive: true },
              { label: "Total P/L",    value: "+$3,480.55", positive: true },
            ].map((item) => (
              <Card key={item.label}>
                <Stat
                  label={item.label}
                  value={item.value}
                  delta={{ value: item.positive ? "Realized" : "Unrealized", positive: item.positive }}
                  loading={loading}
                />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Returns Calendar ─────────────────────────── */}
        <section aria-label="Monthly Returns">
          <SectionHeader title="Monthly Returns" />
          <ReturnsCalendar
            className="w-full"
            years={[2021, 2022, 2023, 2024, 2025]}
            returns={(() => {
              let seed = 2021;
              const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
              return [2021, 2022, 2023, 2024, 2025].map((_, yi) =>
                Array.from({ length: 12 }).map(() =>
                  Math.round(((yi === 1 ? -1.6 : 0.9) + (rnd() - 0.5) * 12) * 10) / 10,
                ),
              );
            })()}
          >
            <ReturnsCalendarGrid>
              <ReturnsCalendarTooltip />
            </ReturnsCalendarGrid>
          </ReturnsCalendar>
        </section>

        {/* ── Activity Overview ─────────────────────────── */}
        <section aria-label="Activity Overview">
          <SectionHeader title="Activity Overview" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Investment</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium text-foreground">$5,500.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Plans</span>
                  <span className="font-medium text-foreground">3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today&apos;s Profit</span>
                  <span className="font-medium text-success">+$28.40</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Profit</span>
                  <span className="font-medium text-success">+$1,240.00</span>
                </div>
              </div>
              <button type="button" className="mt-4 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                View Investments
              </button>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">AI Trading</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trading Balance</span>
                  <span className="font-medium text-foreground">$1,820.30</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Strategies</span>
                  <span className="font-medium text-foreground">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current P/L</span>
                  <span className="font-medium text-success">+$34.17</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total P/L</span>
                  <span className="font-medium text-success">+$820.50</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">Past performance does not guarantee future results.</p>
              <button type="button" className="mt-3 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                View AI Trading
              </button>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CloudLightning className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Cloud Mining</p>
                </div>
                <Badge label="Active" tone="success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Contracts</span>
                  <span className="font-medium text-foreground">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium text-foreground">$980.25</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Hashrate</span>
                  <span className="font-medium text-foreground">120 TH/s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today&apos;s Earnings</span>
                  <span className="font-medium text-success">+$12.40</span>
                </div>
              </div>
              <button type="button" className="mt-4 w-full rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                View Mining
              </button>
            </Card>

          </div>
        </section>

        {/* ── Manual Trading + Referral ─────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Manual Trading</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Trading Balance</span>
                <span className="font-medium text-foreground">$1,820.30</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Open Positions</span>
                <span className="font-medium text-foreground">1</span>
              </div>
              <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today&apos;s P/L</span>
                <span className="font-medium text-success">+$22.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-medium text-foreground">$4,820.00</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">Trade</button>
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">History</button>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Referral</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Referrals</span>
                <span className="font-medium text-foreground">14</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Referrals</span>
                <span className="font-medium text-foreground">9</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="font-medium text-success">+$970.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pending Earnings</span>
                <span className="font-medium text-foreground">$120.00</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">Referrals</button>
              <button type="button" className="flex-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring">Earnings</button>
            </div>
          </Card>

        </div>

       
        {/* ── Activity Table ───────────────────────────── */}
        <section aria-label="Activity Table">
          <SectionHeader title="Recent Transactions" />
          <TableAsyncPreview />
        </section>
        <section aria-label="Activity Table">
          <SectionHeader title="Trade History" />
          <TableAsyncPreview />
        </section>

        {/* ── Notifications ───────────────────────────────── */}
        <section aria-label="Notifications">
          <SectionHeader title="Notifications" />
          <BouncyAccordion
            defaultValue="1"
            items={[
  {
    id: "1",
    title: "Deposit Confirmed",
    description: "Your deposit of $500 has been confirmed.",
    icon: <ArrowDownRight className="h-4 w-4" />,
  },
  {
    id: "2",
    title: "AI Trading Activated",
    description: "AI Trading strategy activated successfully.",
    icon: <RadioTower className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "New Login Detected",
    description: "New login detected from Dhaka, Bangladesh.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    id: "4",
    title: "Mining Earnings Credited",
    description: "Mining contract #MC-882 earnings credited.",
    icon: <PackageCheck className="h-4 w-4" />,
  },
]}
          />
        </section>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}