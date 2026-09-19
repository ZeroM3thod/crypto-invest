// app/(user)/community/chat/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import {
  Send,
  Smile,
  ChevronDown,
  ChevronUp,
  X,
  Pin,
  Globe,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ── Shared primitives (identical to dashboard) ──────────────────────────────

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

// ── Types ───────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  lang?: string;
  own?: boolean;
  pinned?: boolean;
};

type OnlineUser = {
  id: string;
  username: string;
  avatar: string;
  lang: string;
};

// ── Static data ─────────────────────────────────────────────────────────────

const PINNED_MESSAGE: Message = {
  id: "pin1",
  userId: "admin",
  username: "Admin",
  avatar: "A",
  text: "Welcome to the International Community Chat! Please follow the community rules. Spam, abuse, and off-topic promotions are not allowed.",
  timestamp: "09:00",
  pinned: true,
};

const INITIAL_MESSAGES: Message[] = [
  { id: "m1",  userId: "u2", username: "Carlos_M",  avatar: "C", text: "Good morning everyone! 🌅",               timestamp: "09:14", lang: "EN" },
  { id: "m2",  userId: "u3", username: "Yuki_T",    avatar: "Y", text: "Has anyone checked today's BTC price?",   timestamp: "09:15", lang: "EN" },
  { id: "m3",  userId: "u4", username: "Fatima_A",  avatar: "F", text: "It's pumping 🚀 up 4% since midnight.",   timestamp: "09:15", lang: "EN" },
  { id: "m4",  userId: "u1", username: "Ava",       avatar: "A", text: "Mining earnings look solid today too.",   timestamp: "09:16", lang: "EN", own: true },
  { id: "m5",  userId: "u5", username: "Raj_K",     avatar: "R", text: "Agreed! My contract credited early.",     timestamp: "09:17", lang: "EN" },
  { id: "m6",  userId: "u2", username: "Carlos_M",  avatar: "C", text: "Anyone tried the new AI trading plan?",  timestamp: "09:18", lang: "EN" },
  { id: "m7",  userId: "u1", username: "Ava",       avatar: "A", text: "Yes! ROI has been great this week. Highly recommend the Growth tier.", timestamp: "09:19", lang: "EN", own: true },
  { id: "m8",  userId: "u6", username: "Lena_V",    avatar: "L", text: "@Ava which strategy did you pick?",      timestamp: "09:20", lang: "EN" },
  { id: "m9",  userId: "u1", username: "Ava",       avatar: "A", text: "BTC/USDT with the momentum strategy 📈", timestamp: "09:21", lang: "EN", own: true },
  { id: "m10", userId: "u3", username: "Yuki_T",    avatar: "Y", text: "Thanks for the tip! Will try it.",       timestamp: "09:22", lang: "JP" },
];

const ONLINE_USERS: OnlineUser[] = [
  { id: "u1", username: "Ava",      avatar: "A", lang: "EN" },
  { id: "u2", username: "Carlos_M", avatar: "C", lang: "ES" },
  { id: "u3", username: "Yuki_T",   avatar: "Y", lang: "JP" },
  { id: "u4", username: "Fatima_A", avatar: "F", lang: "AR" },
  { id: "u5", username: "Raj_K",    avatar: "R", lang: "EN" },
  { id: "u6", username: "Lena_V",   avatar: "L", lang: "DE" },
  { id: "u7", username: "Omar_H",   avatar: "O", lang: "AR" },
  { id: "u8", username: "Sophie_B", avatar: "S", lang: "FR" },
];

const EMOJIS = ["😀","😂","🔥","🚀","📈","💰","👍","🎉","💎","⚡","🌙","💯"];

const COMMUNITY_RULES = [
  "Be respectful to all members.",
  "No spam, scam links, or unsolicited promotions.",
  "No hate speech, racism, or personal attacks.",
  "Do not share private keys or wallet credentials.",
  "English is preferred but all languages are welcome.",
];

// ── Avatar bubble ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-success/20 text-success",
  "bg-destructive/20 text-destructive",
  "bg-muted text-muted-foreground",
];

function Avatar({ letter, size = "sm" }: { letter: string; size?: "sm" | "md" }) {
  const idx = letter.charCodeAt(0) % AVATAR_COLORS.length;
  const sz  = size === "sm" ? "size-7 text-[11px]" : "size-8 text-xs";
  return (
    <div className={`grid shrink-0 place-items-center rounded-full font-semibold ${sz} ${AVATAR_COLORS[idx]}`}>
      {letter.toUpperCase()}
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.own) {
    return (
      <div className="flex justify-end gap-2 px-4">
        <div className="flex max-w-[72%] flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {msg.lang && (
              <span className="text-[10px] font-medium text-muted-foreground">{msg.lang}</span>
            )}
            <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
          </div>
          <div className="rounded-3xl rounded-tr-md bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground">
            {msg.text}
          </div>
        </div>
        <Avatar letter={msg.avatar} />
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-4">
      <Avatar letter={msg.avatar} />
      <div className="flex max-w-[72%] flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-foreground">{msg.username}</span>
          {msg.lang && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
              <Globe className="size-2.5" />{msg.lang}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
        </div>
        <div className="rounded-3xl rounded-tl-md border border-border bg-card px-4 py-2.5 text-xs text-foreground">
          {msg.text}
        </div>
      </div>
    </div>
  );
}

// ── Pinned message ──────────────────────────────────────────────────────────

function PinnedMessage({ msg }: { msg: Message }) {
  return (
    <div className="mx-4 mb-2 flex items-start gap-2 rounded-2xl border border-border bg-muted px-4 py-3">
      <Pin className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-0.5">Pinned — Admin</p>
        <p className="text-xs text-foreground leading-relaxed">{msg.text}</p>
      </div>
    </div>
  );
}

// ── Rules banner ────────────────────────────────────────────────────────────

function RulesBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-4 mb-2 rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-[11px] font-semibold text-foreground">Community Rules</span>
        {open
          ? <ChevronUp className="size-3.5 text-muted-foreground" />
          : <ChevronDown className="size-3.5 text-muted-foreground" />
        }
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-3 pt-2 space-y-1.5">
          {COMMUNITY_RULES.map((rule, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{i + 1}.</span> {rule}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Online users sidebar ────────────────────────────────────────────────────

function OnlineSidebar({ users, open, onClose }: { users: OnlineUser[]; open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-56 shrink-0 flex-col border-l border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[11px] font-semibold text-foreground">Online</p>
          <Badge label={`${users.length}`} tone="success" />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors">
              <div className="relative">
                <Avatar letter={u.avatar} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-success ring-1 ring-card" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-foreground">{u.username}</p>
                <p className="text-[10px] text-muted-foreground">{u.lang}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute right-0 top-0 h-full w-56 flex flex-col border-l border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[11px] font-semibold text-foreground">Online</p>
              <div className="flex items-center gap-2">
                <Badge label={`${users.length}`} tone="success" />
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground outline-none">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <Avatar letter={u.avatar} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-success ring-1 ring-card" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-foreground">{u.username}</p>
                    <p className="text-[10px] text-muted-foreground">{u.lang}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

// ── Emoji picker ────────────────────────────────────────────────────────────

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 z-30 rounded-2xl border border-border bg-card p-3 shadow-lg">
      <div className="grid grid-cols-6 gap-1.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => { onSelect(e); onClose(); }}
            className="grid size-8 place-items-center rounded-xl text-base hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CommunityChat() {
  const [messages,      setMessages]      = useState<Message[]>(INITIAL_MESSAGES);
  const [input,         setInput]         = useState("");
  const [emojiOpen,     setEmojiOpen]     = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [modNotice,     setModNotice]     = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const PROFANITY = ["badword1", "badword2"]; // extend as needed

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const hasProfanity = PROFANITY.some((w) => trimmed.toLowerCase().includes(w));
    if (hasProfanity) {
      setModNotice("Your message was blocked by the auto-moderation filter.");
      setTimeout(() => setModNotice(null), 3000);
      setInput("");
      return;
    }

    const now = new Date();
    const ts  = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, userId: "u1", username: "Ava", avatar: "A", text: trimmed, timestamp: ts, lang: "EN", own: true },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <UserShell active="Community">
      <div className="flex h-full overflow-hidden">

        {/* ── Main chat column ─────────────────────────── */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-7">
            <div>
              <h1 className="text-sm font-semibold text-foreground">International Chat</h1>
              <p className="text-[11px] text-muted-foreground">{ONLINE_USERS.length} members online</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted lg:hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="size-1.5 rounded-full bg-success inline-block" />
              {ONLINE_USERS.length} Online
            </button>
          </div>

          {/* Rules + Pinned */}
          <div className="border-b border-border pt-3 pb-1">
            <RulesBanner />
            <PinnedMessage msg={PINNED_MESSAGE} />
          </div>

          {/* Moderation notice */}
          {modNotice && (
            <div className="mx-4 mt-2 flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-2">
              <span className="text-xs font-semibold text-destructive">{modNotice}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-border px-4 py-3 sm:px-6">
            <div className="relative flex items-center gap-2 rounded-3xl border border-border bg-muted px-4 py-2.5">
              {/* Emoji picker */}
              {emojiOpen && (
                <EmojiPicker
                  onSelect={(e) => setInput((p) => p + e)}
                  onClose={() => setEmojiOpen(false)}
                />
              )}
              <button
                type="button"
                onClick={() => setEmojiOpen((p) => !p)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <Smile className="size-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message the community… (@ to mention)"
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Online users sidebar ─────────────────────── */}
        <OnlineSidebar
          users={ONLINE_USERS}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </UserShell>
  );
}