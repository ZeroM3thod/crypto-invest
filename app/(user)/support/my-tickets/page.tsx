// app/(user)/support/my-tickets/page.tsx
"use client";

import { useRef, useState } from "react";
import { UserShell } from "@/app/(user)/_components/user-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Inbox, SendHorizonal } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

interface TicketMessage {
  id: string;
  message: string;
  created_at: string;
  sender: { first_name: string; last_name: string; role: "user" | "admin" };
}

interface Ticket {
  id: string;
  ticket_id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  status: "open" | "pending" | "closed" | "resolved";
  messages: TicketMessage[];
}

// ── Mock data ────────────────────────────────────────────────────────────

const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    ticket_id: "TCK-10231",
    subject: "Unable to update billing address",
    category: "Billing",
    priority: "medium",
    created_at: "2026-09-20T10:12:00Z",
    status: "open",
    messages: [
      { id: "m1", message: "Hi, I tried updating my billing address but it keeps failing.", created_at: "2026-09-20T10:12:00Z", sender: { first_name: "You", last_name: "", role: "user" } },
      { id: "m2", message: "Thanks for reaching out — could you tell us which browser you're using?", created_at: "2026-09-20T11:03:00Z", sender: { first_name: "Maya", last_name: "R.", role: "admin" } },
    ],
  },
  {
    id: "t2",
    ticket_id: "TCK-10184",
    subject: "Investment overview not loading",
    category: "Investment",
    priority: "high",
    created_at: "2026-09-15T08:40:00Z",
    status: "pending",
    messages: [
      { id: "m3", message: "The Investment → Overview page has been blank for me since yesterday.", created_at: "2026-09-15T08:40:00Z", sender: { first_name: "You", last_name: "", role: "user" } },
    ],
  },
  {
    id: "t3",
    ticket_id: "TCK-10022",
    subject: "Question about referral commission payout",
    category: "Referral",
    priority: "low",
    created_at: "2026-09-02T14:20:00Z",
    status: "resolved",
    messages: [
      { id: "m4", message: "When does referral commission move from pending to available?", created_at: "2026-09-02T14:20:00Z", sender: { first_name: "You", last_name: "", role: "user" } },
      { id: "m5", message: "Commissions move to your available balance within 2–3 business days of the referred deposit confirming.", created_at: "2026-09-02T16:05:00Z", sender: { first_name: "Jordan", last_name: "K.", role: "admin" } },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function statusVariant(s: Ticket["status"]): "default" | "outline" | "secondary" | "muted" {
  if (s === "closed") return "muted";
  if (s === "pending") return "outline";
  return "default";
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(s: string) {
  return new Date(s).toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || null;

  const sendChat = () => {
    if (!chatInput.trim() || !activeTicketId || !activeTicket) return;
    if (activeTicket.status === "closed") return;

    const msgText = chatInput;
    setChatInput("");

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: "m-" + Date.now(), message: msgText, created_at: new Date().toISOString(), sender: { first_name: "You", last_name: "", role: "user" as const } },
              ],
            }
          : t,
      ),
    );

    requestAnimationFrame(() => {
      if (chatMessagesRef.current) chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    });
  };

  return (
    <UserShell active="My Tickets">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto w-full max-w-4xl">

          {/* ── Header ────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Help Center
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">My Tickets</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"} on record.
              </p>
            </div>
            <Button asChild>
              <a href="/support/create-ticket">New Ticket</a>
            </Button>
          </div>

          {/* ── Ticket list (table style) ────────────────── */}
          {tickets.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox className="size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No tickets yet. Create one to get started.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="hidden grid-cols-[1fr_130px_110px_120px_110px] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Subject</span>
                <span>Ticket ID</span>
                <span>Category</span>
                <span>Priority</span>
                <span>Status</span>
              </div>
              <div>
                {tickets.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTicketId(t.id)}
                    className={`grid w-full grid-cols-1 gap-2 px-5 py-4 text-left text-sm transition-colors hover:bg-muted sm:grid-cols-[1fr_130px_110px_120px_110px] sm:items-center sm:gap-4 ${i !== 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="truncate font-medium">{t.subject}</span>
                    <span className="font-mono text-xs text-muted-foreground">{t.ticket_id}</span>
                    <span className="text-xs text-muted-foreground sm:text-sm">{t.category}</span>
                    <Badge variant="outline" className="w-fit capitalize">{t.priority}</Badge>
                    <Badge variant={statusVariant(t.status)} className="w-fit capitalize">{t.status}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="h-10" />
      </div>

      {/* ── Ticket Detail Dialog ─────────────────────────── */}
      <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicketId(null)}>
        <DialogContent>
          {activeTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{activeTicket.subject}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-mono text-xs text-muted-foreground">{activeTicket.ticket_id}</span>
                  <Badge variant={statusVariant(activeTicket.status)} className="capitalize">{activeTicket.status}</Badge>
                  <Badge variant="outline" className="capitalize">{activeTicket.priority}</Badge>
                </div>
              </DialogHeader>

              <DialogBody>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
                    <p className="mt-0.5 text-sm font-medium">{activeTicket.category}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Submitted</p>
                    <p className="mt-0.5 text-sm font-medium">{formatDate(activeTicket.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-md border border-border">
                  <div ref={chatMessagesRef} className="flex h-64 flex-col gap-3 overflow-y-auto p-4">
                    {activeTicket.messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
                    ) : (
                      activeTicket.messages.map((m) => {
                        const isAdmin = m.sender.role === "admin";
                        const initials = ((m.sender.first_name[0] || "") + (m.sender.last_name[0] || "")).toUpperCase() || "?";
                        return (
                          <div key={m.id} className={`flex max-w-[85%] items-end gap-2 ${isAdmin ? "ml-auto flex-row-reverse self-end" : "self-start"}`}>
                            <div className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${isAdmin ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                              {initials}
                            </div>
                            <div>
                              <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${isAdmin ? "rounded-br-sm bg-foreground text-background" : "rounded-bl-sm border border-border"}`}>
                                {m.message}
                              </div>
                              <p className={`mt-1 text-[10px] text-muted-foreground ${isAdmin ? "text-right" : ""}`}>
                                {formatTime(m.created_at)}{isAdmin ? ` · ${m.sender.first_name} ${m.sender.last_name}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex gap-2 border-t border-border p-3">
                    <Input
                      value={chatInput}
                      disabled={activeTicket.status === "closed"}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat()}
                      placeholder={activeTicket.status === "closed" ? "This ticket is closed." : "Type a message…"}
                      className="h-9 rounded-full"
                    />
                    <Button
                      size="icon"
                      className="rounded-full"
                      disabled={activeTicket.status === "closed"}
                      onClick={sendChat}
                    >
                      <SendHorizonal />
                    </Button>
                  </div>
                </div>
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </UserShell>
  );
}
