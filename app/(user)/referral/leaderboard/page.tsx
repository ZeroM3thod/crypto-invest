// app/(user)/referral/leaderboard/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { useMemo, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */

type BoardType = "monthly" | "weekly";

interface LeaderEntry {
  rank: number;
  userId: string;
  name: string;
  avatarInitials: string;
  activeReferrals: number;
  isCurrentUser?: boolean;
}

/* Placeholder data — wire these to your real API/backend later */
const CURRENT_USER_ID = "USR10234";

const MONTHLY_PRIZES = [1000, 600, 300]; // 1st, 2nd, 3rd
const WEEKLY_PRIZES = [300, 200, 100]; // 1st, 2nd, 3rd

const MONTHLY_LEADERS: Omit<LeaderEntry, "rank">[] = [
  { userId: "USR90011", name: "Rahim Uddin", avatarInitials: "RU", activeReferrals: 214 },
  { userId: "USR90022", name: "Fatima Islam", avatarInitials: "FI", activeReferrals: 187 },
  { userId: "USR90033", name: "Arjun Patel", avatarInitials: "AP", activeReferrals: 165 },
  { userId: "USR90044", name: "Ling Wei", avatarInitials: "LW", activeReferrals: 142 },
  { userId: "USR90055", name: "Carlos Mendez", avatarInitials: "CM", activeReferrals: 129 },
  { userId: "USR90066", name: "Aisha Rahman", avatarInitials: "AR", activeReferrals: 118 },
  { userId: "USR90077", name: "Kwame Boateng", avatarInitials: "KB", activeReferrals: 104 },
  { userId: "USR90088", name: "Yuki Tanaka", avatarInitials: "YT", activeReferrals: 96 },
  { userId: "USR90099", name: "Elena Petrova", avatarInitials: "EP", activeReferrals: 88 },
  { userId: "USR90100", name: "Omar Farouk", avatarInitials: "OF", activeReferrals: 81 },
  { userId: "USR90111", name: "Priya Sharma", avatarInitials: "PS", activeReferrals: 74 },
  { userId: "USR90122", name: "Diego Alves", avatarInitials: "DA", activeReferrals: 69 },
  { userId: "USR90133", name: "Nadia Hassan", avatarInitials: "NH", activeReferrals: 63 },
  { userId: "USR90144", name: "Chen Jie", avatarInitials: "CJ", activeReferrals: 58 },
  { userId: "USR90155", name: "Grace Mensah", avatarInitials: "GM", activeReferrals: 52 },
  { userId: "USR90166", name: "Viktor Petrov", avatarInitials: "VP", activeReferrals: 47 },
  { userId: "USR90177", name: "Layla Ahmed", avatarInitials: "LA", activeReferrals: 41 },
  { userId: "USR90188", name: "Marcus Johnson", avatarInitials: "MJ", activeReferrals: 36 },
  { userId: "USR90199", name: "Sara Kim", avatarInitials: "SK", activeReferrals: 29 },
  { userId: "USR90200", name: "Tariq Malik", avatarInitials: "TM", activeReferrals: 22 },
  // current user, ranked below top 20 for demo purposes
  { userId: CURRENT_USER_ID, name: "Hasan", avatarInitials: "HS", activeReferrals: 15 },
];

const WEEKLY_LEADERS: Omit<LeaderEntry, "rank">[] = [
  { userId: "USR90055", name: "Carlos Mendez", avatarInitials: "CM", activeReferrals: 18 },
  { userId: "USR90011", name: "Rahim Uddin", avatarInitials: "RU", activeReferrals: 16 },
  { userId: CURRENT_USER_ID, name: "Hasan", avatarInitials: "HS", activeReferrals: 12 },
  { userId: "USR90077", name: "Kwame Boateng", avatarInitials: "KB", activeReferrals: 11 },
  { userId: "USR90022", name: "Fatima Islam", avatarInitials: "FI", activeReferrals: 9 },
  { userId: "USR90099", name: "Elena Petrova", avatarInitials: "EP", activeReferrals: 8 },
  { userId: "USR90033", name: "Arjun Patel", avatarInitials: "AP", activeReferrals: 7 },
  { userId: "USR90144", name: "Chen Jie", avatarInitials: "CJ", activeReferrals: 6 },
  { userId: "USR90066", name: "Aisha Rahman", avatarInitials: "AR", activeReferrals: 5 },
  { userId: "USR90111", name: "Priya Sharma", avatarInitials: "PS", activeReferrals: 5 },
  { userId: "USR90188", name: "Marcus Johnson", avatarInitials: "MJ", activeReferrals: 4 },
  { userId: "USR90155", name: "Grace Mensah", avatarInitials: "GM", activeReferrals: 4 },
  { userId: "USR90177", name: "Layla Ahmed", avatarInitials: "LA", activeReferrals: 3 },
  { userId: "USR90200", name: "Tariq Malik", avatarInitials: "TM", activeReferrals: 3 },
  { userId: "USR90122", name: "Diego Alves", avatarInitials: "DA", activeReferrals: 2 },
  { userId: "USR90044", name: "Ling Wei", avatarInitials: "LW", activeReferrals: 2 },
  { userId: "USR90133", name: "Nadia Hassan", avatarInitials: "NH", activeReferrals: 1 },
  { userId: "USR90088", name: "Yuki Tanaka", avatarInitials: "YT", activeReferrals: 1 },
  { userId: "USR90166", name: "Viktor Petrov", avatarInitials: "VP", activeReferrals: 1 },
  { userId: "USR90199", name: "Sara Kim", avatarInitials: "SK", activeReferrals: 1 },
];

/* ────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────── */

function rankLeaders(raw: Omit<LeaderEntry, "rank">[]): LeaderEntry[] {
  return [...raw]
    .sort((a, b) => b.activeReferrals - a.activeReferrals)
    .map((u, i) => ({ ...u, rank: i + 1, isCurrentUser: u.userId === CURRENT_USER_ID }));
}

function prizeForRank(rank: number, prizes: number[]): number | null {
  return rank >= 1 && rank <= prizes.length ? prizes[rank - 1] : null;
}

/* ────────────────────────────────────────────────────────────
   Small UI primitives
──────────────────────────────────────────────────────────── */

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Crown className="size-4" />
      </div>
    );
  if (rank === 2 || rank === 3)
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-foreground">
        <Medal className="size-4" />
      </div>
    );
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-muted-foreground">
      {rank}
    </div>
  );
}

function PrizeTag({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
      <Trophy className="size-3" /> ${amount.toLocaleString()}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */

export default function LeaderboardPage() {
  const [board, setBoard] = useState<BoardType>("monthly");

  const ranked = useMemo(
    () => rankLeaders(board === "monthly" ? MONTHLY_LEADERS : WEEKLY_LEADERS),
    [board]
  );
  const prizes = board === "monthly" ? MONTHLY_PRIZES : WEEKLY_PRIZES;

  const top20 = ranked.slice(0, 20);
  const currentUserEntry = ranked.find((u) => u.isCurrentUser) || null;
  const currentUserInTop20 = currentUserEntry ? currentUserEntry.rank <= 20 : false;

  return (
    <UserShell active="Leaderboard">
      <div className="relative overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Referrals</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Leaderboard
            </h1>
          </div>

          {/* BOARD TABS */}
          <div className="flex items-center gap-2">
            {([
              { id: "monthly", label: "Monthly" },
              { id: "weekly", label: "Weekly" },
            ] as { id: BoardType; label: string }[]).map((tab) => {
              const isActive = board === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBoard(tab.id)}
                  className={[
                    "flex-1 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* PRIZE CARD — dark, white text */}
          <div className="rounded-4xl bg-black p-6 text-white">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="size-4 text-white/70" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">
                {board === "monthly" ? "This Month's Rewards" : "This Week's Rewards"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {prizes.map((amt, i) => (
                <div key={i} className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-white/50">
                    {i === 0 ? "1st Place" : i === 1 ? "2nd Place" : "3rd Place"}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white sm:text-xl">${amt.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/50">
              {board === "monthly"
                ? "Top 3 by total active referrals this month — resets on the 1st of each month."
                : "Top 3 by active referrals gained this week — resets every Monday."}
            </p>
          </div>

          {/* YOUR POSITION — sticky-style card if outside top 20, or highlighted inline if within */}
          {currentUserEntry && !currentUserInTop20 && (
            <div className="rounded-3xl border-2 border-foreground bg-foreground/5 p-4">
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Your Position
              </div>
              <div className="flex items-center gap-3">
                <RankBadge rank={currentUserEntry.rank} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{currentUserEntry.name} (You)</div>
                  <div className="text-xs text-muted-foreground">
                    {currentUserEntry.activeReferrals} active referrals
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-foreground">#{currentUserEntry.rank}</div>
                  {prizeForRank(currentUserEntry.rank, prizes) && (
                    <PrizeTag amount={prizeForRank(currentUserEntry.rank, prizes)!} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOP 20 LIST */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Top 20 Referrers</h2>
            <div className="flex flex-col gap-2">
              {top20.map((entry) => {
                const prize = prizeForRank(entry.rank, prizes);
                return (
                  <div
                    key={entry.userId}
                    className={[
                      "flex items-center justify-between rounded-2xl border p-3.5 transition-colors",
                      entry.isCurrentUser
                        ? "border-foreground bg-foreground/5"
                        : entry.rank <= 3
                        ? "border-foreground/30 bg-muted/20"
                        : "border-border",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <RankBadge rank={entry.rank} />
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                        {entry.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">(You)</span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{entry.activeReferrals} active referrals</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {prize ? (
                        <PrizeTag amount={prize} />
                      ) : (
                        <span className="text-xs text-muted-foreground">#{entry.rank}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty state safeguard */}
          {top20.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No leaderboard data yet.
            </div>
          )}
        </div>
      </div>
    </UserShell>
  );
}