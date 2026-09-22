// app/(user)/community/announcements/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  Pin,
  Search,
  Bell,
  ChevronDown,
  Megaphone,
  Wrench,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";

// ── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
      {label}
    </span>
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
          className="text-xs font-medium text-foreground transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Types & data ─────────────────────────────────────────────────────────────

type AnnouncementCategory = "Platform Update" | "Maintenance" | "New Feature" | "Important";

type Announcement = {
  id: string;
  title: string;
  category: AnnouncementCategory;
  date: string;
  content: string;
  pinned?: boolean;
  read?: boolean;
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "🚨 Scheduled Maintenance — July 22, 2025",
    category: "Maintenance",
    date: "2025-07-20",
    pinned: true,
    read: false,
    content: "We will be performing scheduled maintenance on July 22, 2025 from 02:00–04:00 UTC. During this time, deposits, withdrawals, and trading may be temporarily unavailable. We apologize for any inconvenience and thank you for your patience.",
  },
  {
    id: "a2",
    title: "⚡ AI Trading v2.0 Now Live",
    category: "New Feature",
    date: "2025-07-18",
    pinned: true,
    read: false,
    content: "We've launched AI Trading v2.0 with multi-strategy support, improved signal accuracy, and a new risk dashboard. Head to the AI Trading section to activate and configure your strategies.",
  },
  {
    id: "a3",
    title: "Platform Update — v4.1.2 Released",
    category: "Platform Update",
    date: "2025-07-15",
    read: true,
    content: "This update includes performance improvements, bug fixes for the wallet transfer flow, and enhanced charting tools on the trading dashboard. All users will receive the update automatically.",
  },
  {
    id: "a4",
    title: "⚠️ Important: KYC Verification Required",
    category: "Important",
    date: "2025-07-12",
    read: false,
    content: "As part of our compliance obligations, all users must complete KYC verification by August 1, 2025 to continue using withdrawal and investment features. Please complete KYC in your profile settings.",
  },
  {
    id: "a5",
    title: "New Referral Reward Program",
    category: "New Feature",
    date: "2025-07-08",
    read: true,
    content: "Introducing our updated referral program. Earn up to 15% commission on every referred user's platform activity. Share your referral link from the Referral section of your dashboard.",
  },
  {
    id: "a6",
    title: "Platform Update — v4.1.0 Released",
    category: "Platform Update",
    date: "2025-07-01",
    read: true,
    content: "Major update: community features, global chat, announcement system, and improved notification center are now available. Explore the Community section in your sidebar.",
  },
];

const CATEGORIES: ("All" | AnnouncementCategory)[] = [
  "All", "Platform Update", "Maintenance", "New Feature", "Important",
];

const CATEGORY_ICON: Record<AnnouncementCategory, React.ReactNode> = {
  "Platform Update": <Megaphone className="size-3.5" />,
  "Maintenance":     <Wrench className="size-3.5" />,
  "New Feature":     <Sparkles className="size-3.5" />,
  "Important":       <AlertTriangle className="size-3.5" />,
};

// ── Announcement Card ─────────────────────────────────────────────────────────

function AnnouncementCard({ item, onRead }: { item: Announcement; onRead: (id: string) => void }) {
  const [expanded, setExpanded] = useState(item.pinned ?? false);

  function toggle() {
    setExpanded((p) => !p);
    if (!item.read) onRead(item.id);
  }

  return (
    <div
      className={`rounded-4xl border bg-card overflow-hidden transition-colors ${
        item.read ? "border-border" : "border-foreground/20"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-start gap-4 p-6 text-left hover:bg-muted/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Category icon */}
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground mt-0.5">
          {CATEGORY_ICON[item.category]}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2">
            {item.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                <Pin className="size-2.5" /> Pinned
              </span>
            )}
            <Badge label={item.category} />
            {!item.read && (
              <span className="inline-block size-1.5 rounded-full bg-foreground" aria-label="Unread" />
            )}
          </div>

          {/* Title */}
          <p className={`text-sm leading-snug ${item.read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
            {item.title}
          </p>

          {/* Date */}
          <p className="text-[11px] text-muted-foreground">
            {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="ml-[52px] rounded-2xl bg-muted/40 px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityAnnouncements() {
  const [items, setItems]           = useState<Announcement[]>(ANNOUNCEMENTS);
  const [category, setCategory]     = useState<"All" | AnnouncementCategory>("All");
  const [search, setSearch]         = useState("");

  function markRead(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  }

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const matchCat    = category === "All" || a.category === category;
      const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, category, search]);

  const pinned      = filtered.filter((a) => a.pinned);
  const unpinned    = filtered.filter((a) => !a.pinned);
  const unreadCount = items.filter((a) => !a.read).length;

  return (
    <UserShell active="Community">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8 space-y-8">

        {/* ── Header ───────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Community</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Announcements
            </h1>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 shrink-0">
              <Bell className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{unreadCount} unread</span>
            </div>
          )}
        </div>

        {/* ── Filter bar ────────────────────────────── */}
        <section aria-label="Filters">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-0 rounded-2xl border border-border bg-card px-4 py-2.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements…"
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            {/* Category pills — same style as daily profit filter bar */}
            <div className="flex items-center rounded-xl bg-muted p-1 gap-1 flex-wrap shrink-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    category === c
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pinned ────────────────────────────────── */}
        {pinned.length > 0 && (
          <section aria-label="Pinned Announcements">
            <SectionHeader title="Pinned" />
            <div className="space-y-3">
              {pinned.map((a) => (
                <AnnouncementCard key={a.id} item={a} onRead={markRead} />
              ))}
            </div>
          </section>
        )}

        {/* ── All announcements ─────────────────────── */}
        <section aria-label="All Announcements">
          <SectionHeader title={category === "All" ? "All Announcements" : category} />
          {unpinned.length === 0 && pinned.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Megaphone className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">No announcements found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpinned.map((a) => (
                <AnnouncementCard key={a.id} item={a} onRead={markRead} />
              ))}
            </div>
          )}
        </section>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}