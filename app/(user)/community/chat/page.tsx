// app/(user)/community/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Pin,
  SendHorizonal,
  Smile,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────

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

// ── Mock data ────────────────────────────────────────────────────────────

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

// ── Small building blocks ────────────────────────────────────────────────

function AvatarGlyph({ letter }: { letter: string }) {
  return (
    <span className="grid size-full place-items-center rounded-full border border-black/15 text-[11px] font-semibold dark:border-white/20">
      {letter.toUpperCase()}
    </span>
  );
}

function PinnedMessage({ msg }: { msg: ChatMessageData }) {
  return (
    <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <Pin className="mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Pinned — Admin
        </p>
        <p className="text-xs leading-relaxed">{msg.text}</p>
      </div>
    </div>
  );
}

function RulesBanner() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="mx-4 mb-2 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      >
        <span className="text-[11px] font-semibold">Community Rules</span>
        {open ? (
          <ChevronUp className="size-3.5 text-black/40 dark:text-white/40" />
        ) : (
          <ChevronDown className="size-3.5 text-black/40 dark:text-white/40" />
        )}
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-black/10 px-4 pb-3 pt-2 dark:border-white/10">
          {COMMUNITY_RULES.map((rule, i) => (
            <p key={rule} className="text-xs text-black/60 dark:text-white/60">
              <span className="font-semibold text-black dark:text-white">{i + 1}.</span> {rule}
            </p>
          ))}
        </div>
      )}
    </Card>
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
  const list = (
    <div className="flex-1 overflow-y-auto py-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
          <div className="relative size-7 shrink-0">
            <AvatarGlyph letter={u.avatar} />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white bg-black dark:border-black dark:bg-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">{u.username}</p>
            <p className="text-[10px] text-black/40 dark:text-white/40">{u.lang}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-56 shrink-0 flex-col border-l border-black/10 bg-white dark:border-white/10 dark:bg-black lg:flex">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold">
            <Users className="size-3.5" /> Online
          </p>
          <Badge variant="outline">{users.length}</Badge>
        </div>
        {list}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute right-0 top-0 flex h-full w-56 flex-col border-l border-black/10 bg-white dark:border-white/10 dark:bg-black">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Users className="size-3.5" /> Online
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{users.length}</Badge>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-black/40 outline-none hover:text-black dark:text-white/40 dark:hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            {list}
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
    <Card className="absolute bottom-full left-0 z-30 mb-2 p-3 shadow-lg">
      <div className="grid grid-cols-6 gap-1.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              onSelect(e);
              onClose();
            }}
            className="grid size-8 place-items-center rounded-md text-base transition-colors outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black dark:hover:bg-white/10 dark:focus-visible:ring-white"
          >
            {e}
          </button>
        ))}
      </div>
    </Card>
  );
}

function MessageBubble({ msg }: { msg: ChatMessageData }) {
  return (
    <div className={`flex items-end gap-2 ${msg.own ? "flex-row-reverse self-end" : "self-start"} max-w-[85%]`}>
      <div className="size-7 shrink-0">
        <AvatarGlyph letter={msg.avatar} />
      </div>
      <div className={msg.own ? "text-right" : ""}>
        <div className={`mb-1 flex items-center gap-1.5 text-[10px] text-black/40 dark:text-white/40 ${msg.own ? "justify-end" : ""}`}>
          <span className="font-medium text-black/60 dark:text-white/60">{msg.own ? "You" : msg.username}</span>
          {msg.lang && (
            <span className="inline-flex items-center gap-0.5">
              <Globe className="size-2.5" />
              {msg.lang}
            </span>
          )}
          <span>{msg.timestamp}</span>
        </div>
        <div
          className={`inline-block rounded-lg px-3 py-2 text-sm leading-relaxed ${
            msg.own
              ? "rounded-br-sm bg-black text-white dark:bg-white dark:text-black"
              : "rounded-bl-sm border border-black/15 dark:border-white/20"
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function CommunityChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modNotice, setModNotice] = useState<string | null>(null);

  const modTimer = useRef<number | undefined>(undefined);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(modTimer.current), []);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
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
  }, [input]);

  return (
    <UserShell active="Community">
      <div
        className="flex h-[calc(100dvh-var(--shell-offset,0px))] max-h-full min-h-0 w-full overflow-hidden"
        style={{ "--shell-offset": "64px" } as CSSProperties}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-black">

          {/* ── Header ────────────────────────────────── */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">International Chat</p>
              <p className="truncate text-[11px] text-black/40 dark:text-white/40">
                {ONLINE_USERS.length} members online
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="inline-block size-1.5 rounded-full bg-black dark:bg-white" />
              {ONLINE_USERS.length} Online
            </Button>
          </header>

          {/* ── Rules + Pinned ───────────────────────────── */}
          <div className="shrink-0 border-b border-black/10 pb-1 pt-3 dark:border-white/10">
            <RulesBanner />
            <PinnedMessage msg={PINNED_MESSAGE} />
          </div>

          {/* ── Moderation notice ─────────────────────────── */}
          {modNotice && (
            <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-lg border border-black/70 px-4 py-2 dark:border-white/70">
              <span className="text-xs font-semibold">{modNotice}</span>
            </div>
          )}

          {/* ── Messages ─────────────────────────────────── */}
          <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          </div>

          {/* ── Input ─────────────────────────────────────── */}
          <div className="shrink-0 border-t border-black/10 p-3 dark:border-white/10">
            <div className="relative mx-auto flex max-w-3xl items-center gap-2">
              {emojiOpen && (
                <EmojiPicker
                  onSelect={(e) => setInput((p) => p + e)}
                  onClose={() => setEmojiOpen(false)}
                />
              )}
              <button
                type="button"
                onClick={() => setEmojiOpen((p) => !p)}
                aria-label="Add emoji"
                className="grid size-9 shrink-0 place-items-center rounded-full text-black/40 outline-none transition-colors hover:bg-black/5 hover:text-black focus-visible:ring-2 focus-visible:ring-black dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white"
              >
                <Smile className="size-4" />
              </button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message the community… (@ to mention)"
                className="h-10 flex-1 rounded-full"
              />
              <Button
                size="icon"
                className="shrink-0 rounded-full"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </div>

        <OnlineSidebar users={ONLINE_USERS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </UserShell>
  );
}