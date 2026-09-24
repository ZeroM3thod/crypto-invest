"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { Smile, ChevronDown, ChevronUp, X, Pin, Globe } from "lucide-react";
import { useCallback, useRef, useState, useEffect, type CSSProperties } from "react";

import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageHeader,
  ChatBubble,
} from "@/components/chat-message";
import { ChatScroller } from "@/components/chat-scroller";
import { ChatInput } from "@/components/chat-input";

function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "destructive" | "muted";
}) {
  const colors: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[tone]}`}
    >
      {label}
    </span>
  );
}

type ChatMessageData = {
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

const PINNED_MESSAGE: ChatMessageData = {
  id: "pin1",
  userId: "admin",
  username: "Admin",
  avatar: "A",
  text: "Welcome to the International Community Chat! Please follow the community rules. Spam, abuse, and off-topic promotions are not allowed.",
  timestamp: "09:00",
  pinned: true,
};

const INITIAL_MESSAGES: ChatMessageData[] = [
  { id: "m1", userId: "u2", username: "Carlos_M", avatar: "C", text: "Good morning everyone! 🌅", timestamp: "09:14", lang: "EN" },
  { id: "m2", userId: "u3", username: "Yuki_T", avatar: "Y", text: "Has anyone checked today's BTC price?", timestamp: "09:15", lang: "EN" },
  { id: "m3", userId: "u4", username: "Fatima_A", avatar: "F", text: "It's pumping 🚀 up 4% since midnight.", timestamp: "09:15", lang: "EN" },
  { id: "m4", userId: "u1", username: "Ava", avatar: "A", text: "Mining earnings look solid today too.", timestamp: "09:16", lang: "EN", own: true },
  { id: "m5", userId: "u5", username: "Raj_K", avatar: "R", text: "Agreed! My contract credited early.", timestamp: "09:17", lang: "EN" },
  { id: "m6", userId: "u2", username: "Carlos_M", avatar: "C", text: "Anyone tried the new AI trading plan?", timestamp: "09:18", lang: "EN" },
  { id: "m7", userId: "u1", username: "Ava", avatar: "A", text: "Yes! ROI has been great this week. Highly recommend the Growth tier.", timestamp: "09:19", lang: "EN", own: true },
  { id: "m8", userId: "u6", username: "Lena_V", avatar: "L", text: "@Ava which strategy did you pick?", timestamp: "09:20", lang: "EN" },
  { id: "m9", userId: "u1", username: "Ava", avatar: "A", text: "BTC/USDT with the momentum strategy 📈", timestamp: "09:21", lang: "EN", own: true },
  { id: "m10", userId: "u3", username: "Yuki_T", avatar: "Y", text: "Thanks for the tip! Will try it.", timestamp: "09:22", lang: "JP" },
];

const ONLINE_USERS: OnlineUser[] = [
  { id: "u1", username: "Ava", avatar: "A", lang: "EN" },
  { id: "u2", username: "Carlos_M", avatar: "C", lang: "ES" },
  { id: "u3", username: "Yuki_T", avatar: "Y", lang: "JP" },
  { id: "u4", username: "Fatima_A", avatar: "F", lang: "AR" },
  { id: "u5", username: "Raj_K", avatar: "R", lang: "EN" },
  { id: "u6", username: "Lena_V", avatar: "L", lang: "DE" },
  { id: "u7", username: "Omar_H", avatar: "O", lang: "AR" },
  { id: "u8", username: "Sophie_B", avatar: "S", lang: "FR" },
];

const EMOJIS = ["😀", "😂", "🔥", "🚀", "📈", "💰", "👍", "🎉", "💎", "⚡", "🌙", "💯"];

const COMMUNITY_RULES = [
  "Be respectful to all members.",
  "No spam, scam links, or unsolicited promotions.",
  "No hate speech, racism, or personal attacks.",
  "Do not share private keys or wallet credentials.",
  "English is preferred but all languages are welcome.",
];

const PROFANITY = ["badword1", "badword2"];

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-success/20 text-success",
  "bg-destructive/20 text-destructive",
  "bg-muted text-muted-foreground",
];

function AvatarGlyph({ letter }: { letter: string }) {
  const idx = letter.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <span
      className={`grid size-full place-items-center rounded-full text-[11px] font-semibold ${AVATAR_COLORS[idx]}`}
    >
      {letter.toUpperCase()}
    </span>
  );
}

function PinnedMessage({ msg }: { msg: ChatMessageData }) {
  return (
    <div className="mx-4 mb-2 flex items-start gap-2 rounded-2xl border border-border bg-muted px-4 py-3">
      <Pin className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Pinned — Admin
        </p>
        <p className="text-xs leading-relaxed text-foreground">{msg.text}</p>
      </div>
    </div>
  );
}

function RulesBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-4 mb-2 overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-[11px] font-semibold text-foreground">Community Rules</span>
        {open ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-border px-4 pb-3 pt-2">
          {COMMUNITY_RULES.map((rule, i) => (
            <p key={rule} className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{i + 1}.</span> {rule}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function OnlineSidebar({
  users,
  open,
  onClose,
}: {
  users: OnlineUser[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="hidden h-full w-56 shrink-0 flex-col border-l border-border bg-card lg:flex">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[11px] font-semibold text-foreground">Online</p>
          <Badge label={`${users.length}`} tone="success" />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-muted/50">
              <div className="relative size-7 shrink-0">
                <AvatarGlyph letter={u.avatar} />
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

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute right-0 top-0 flex h-full w-56 flex-col border-l border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[11px] font-semibold text-foreground">Online</p>
              <div className="flex items-center gap-2">
                <Badge label={`${users.length}`} tone="success" />
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground outline-none hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-muted/50">
                  <div className="relative size-7 shrink-0">
                    <AvatarGlyph letter={u.avatar} />
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

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (e: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-full left-0 z-30 mb-2 rounded-2xl border border-border bg-card p-3 shadow-lg">
      <div className="grid grid-cols-6 gap-1.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              onSelect(e);
              onClose();
            }}
            className="grid size-8 place-items-center rounded-xl text-base transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modNotice, setModNotice] = useState<string | null>(null);

  const modTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(modTimer.current), []);

  const handleSend = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const hasProfanity = PROFANITY.some((w) => trimmed.toLowerCase().includes(w));
    if (hasProfanity) {
      setModNotice("Your message was blocked by the auto-moderation filter.");
      window.clearTimeout(modTimer.current);
      modTimer.current = window.setTimeout(() => setModNotice(null), 3000);
      setInput("");
      return;
    }

    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        userId: "u1",
        username: "Ava",
        avatar: "A",
        text: trimmed,
        timestamp: ts,
        lang: "EN",
        own: true,
      },
    ]);
    setInput("");
  }, []);

  return (
    <UserShell active="Community">
      <div
        className="flex h-[calc(100dvh-var(--shell-offset,0px))] max-h-full min-h-0 w-full overflow-hidden"
        style={{ "--shell-offset": "64px" } as CSSProperties}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">International Chat</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {ONLINE_USERS.length} members online
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <span className="inline-block size-1.5 rounded-full bg-success" />
              {ONLINE_USERS.length} Online
            </button>
          </header>

          <div className="shrink-0 border-b border-border pb-1 pt-3">
            <RulesBanner />
            <PinnedMessage msg={PINNED_MESSAGE} />
          </div>

          {modNotice ? (
            <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-2">
              <span className="text-xs font-semibold text-destructive">{modNotice}</span>
            </div>
          ) : null}

          <ChatScroller
            className="min-h-0 flex-1"
            viewportClassName="px-3 py-5 sm:px-5"
            contentClassName="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} from={msg.own ? "user" : "other"} animateIn>
                <ChatMessageAvatar>
                  <AvatarGlyph letter={msg.avatar} />
                </ChatMessageAvatar>
                <ChatMessageContent>
                  <ChatMessageHeader>
                    <span>{msg.own ? "You" : msg.username}</span>
                    {msg.lang ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Globe className="size-2.5" />
                        {msg.lang}
                      </span>
                    ) : null}
                    <span>{msg.timestamp}</span>
                  </ChatMessageHeader>
                  <ChatBubble variant={msg.own ? "solid" : "soft"}>{msg.text}</ChatBubble>
                </ChatMessageContent>
              </ChatMessage>
            ))}
          </ChatScroller>

          <div className="shrink-0 border-t border-border p-3">
            <div className="relative mx-auto max-w-3xl">
              {emojiOpen ? (
                <EmojiPicker
                  onSelect={(e) => setInput((p) => p + e)}
                  onClose={() => setEmojiOpen(false)}
                />
              ) : null}
              <ChatInput
                value={input}
                onValueChange={setInput}
                onSubmit={handleSend}
                placeholder="Message the community… (@ to mention)"
                leadingAction={
                  <button
                    type="button"
                    onClick={() => setEmojiOpen((p) => !p)}
                    aria-label="Add emoji"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Smile className="size-4" />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        <OnlineSidebar users={ONLINE_USERS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </UserShell>
  );
}
