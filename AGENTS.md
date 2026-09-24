Got it — "fix the screen size" likely means the chat isn't filling the viewport height correctly (common issue: `h-full` chains breaking without an explicit height anchor at the top, causing the chat column or message list to collapse or overflow). Let me fix the height chain so it fills the screen properly on both desktop and mobile.

The most common cause: `UserShell`'s content area may not have a fixed/full height itself, so `flex h-full` inside it has nothing to inherit from. Here's the fix — make the outer container anchor to the actual viewport height (`h-dvh` accounts for mobile browser chrome) and tighten the flex/min-h chain all the way down.

### Updated `app/(user)/community/chat/page.tsx` (only the outer wrapper changed)

Replace just the `return` block with this:

```tsx
  return (
    <UserShell active="Community">
      <div className="flex h-[calc(100dvh-var(--shell-offset,0px))] max-h-full min-h-0 w-full overflow-hidden">
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
```

### What changed and why

1. **`h-[calc(100dvh-var(--shell-offset,0px))]`** — anchors the whole chat to the real viewport height (`dvh` handles mobile address-bar resizing better than `vh`). If your `UserShell` has a fixed header/nav of a known height, set `--shell-offset` to that value via inline style or a wrapping class — otherwise it defaults to `0px` and just uses the full screen.
2. Added `shrink-0` to the rules/pinned block and the moderation notice — without it, flex children with content can get squeezed when space is tight, shrinking your message list unpredictably.
3. Kept `min-h-0` on every nested flex container in the chain (`ChatScroller`'s wrapper, the message column) — this is the actual fix for "chat looks squished/won't scroll internally": flex children default to `min-height: auto`, which lets them grow past their container instead of scrolling internally.

**If the issue is actually the opposite** (chat is too *tall*, overflowing the page, or extending past the visible screen with the browser needing to scroll) — that's a sign `UserShell` itself isn't constrained to `h-screen`/`h-dvh`. In that case, tell me what `UserShell`'s outer wrapper looks like and I'll fix the height chain from that end instead.