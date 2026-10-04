Admin can now edit the online number. It's a setting with two modes: **Automatic** (the real count of members) or a **Custom number** you type in. Everything else stays as it is, so these are small edits to `community-chat-view.tsx`.

## 1. Icon import

Add `Pencil` to the lucide import list:

```tsx
import {
  ArrowDown,
  ArrowUp,
  Ban as BanIcon,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Pencil, // ← new
  Pin,
  // …rest unchanged
```

## 2. `SidePanel`: show the displayed count and an edit link

Replace the `SidePanel` function's props and top part with this (the banned list part is unchanged):

```tsx
function SidePanel({
  tab,
  onTab,
  online,
  onlineCount,
  onEditCount,
  bans,
  onBan,
  onUnban,
}: {
  tab: "online" | "banned";
  onTab: (t: "online" | "banned") => void;
  online: ChatUser[];
  onlineCount: number;
  onEditCount: () => void;
  bans: Ban[];
  onBan: (u: { userId: string; username: string }) => void;
  onUnban: (b: Ban) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border p-3">
        <Tabs
          value={tab}
          onValueChange={(v) => onTab(v as "online" | "banned")}
          variant="segment"
        >
          <TabsList>
            <TabsTrigger value="online">Online ({onlineCount})</TabsTrigger>
            <TabsTrigger value="banned">Banned ({bans.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "online" ? (
          <p className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>Listing {online.length} real members</span>
            <button
              type="button"
              onClick={onEditCount}
              className="inline-flex items-center gap-1 font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil className="size-3" />
              Edit count
            </button>
          </p>
        ) : null}
      </div>

      {/* …the existing <div className="flex-1 overflow-y-auto py-2"> block stays exactly the same… */}
```

## 3. State and logic

Put this inside `CommunityChatView`, next to the other `useState` lines (for example under `const [locked, setLocked] = useState(false);`):

```tsx
  // online count override (null = automatic)
  const [onlineOverride, setOnlineOverride] = useState<number | null>(null);
  const [onlineOpen, setOnlineOpen] = useState(false);
  const [onlineMode, setOnlineMode] = useState<"auto" | "custom">("auto");
  const [onlineDraft, setOnlineDraft] = useState("");
```

Add this just below the existing `const postable = …` / `const activePersona = …` lines (it needs `online`):

```tsx
  const onlineCount = onlineOverride ?? online.length;

  const openOnline = () => {
    setOnlineMode(onlineOverride === null ? "auto" : "custom");
    setOnlineDraft(String(onlineOverride ?? online.length));
    setOnlineOpen(true);
  };
  const closeOnline = useCallback(() => setOnlineOpen(false), []);

  const bumpOnline = (delta: number) =>
    setOnlineDraft((v) => String(Math.max(0, (Number(v) || 0) + delta)));

  const saveOnline = () => {
    if (onlineMode === "auto") {
      // TODO: call your API here (clear the online count override)
      setOnlineOverride(null);
      showToast("✓ Online count is automatic again.");
      closeOnline();
      return;
    }
    const n = Number(onlineDraft);
    if (onlineDraft.trim() === "" || !Number.isInteger(n) || n < 0 || n > 100000) {
      showToast("Enter a whole number between 0 and 100,000.");
      return;
    }
    // TODO: call your API here (save the online count override)
    setOnlineOverride(n);
    showToast(`✓ Online count set to ${n.toLocaleString()}.`);
    closeOnline();
  };
```

## 4. Pass the new props to `SidePanel`

Update the `side` constant:

```tsx
  const side = (
    <SidePanel
      tab={sideTab}
      onTab={setSideTab}
      online={online}
      onlineCount={onlineCount}
      onEditCount={openOnline}
      bans={activeBans}
      onBan={openBan}
      onUnban={unban}
    />
  );
```

## 5. Header: clickable online count

In the chat header, replace the `<p className="truncate text-[11px] …">` line that shows `{online.length} members online · …` with:

```tsx
                <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={openOnline}
                    title="Edit online count"
                    className="group inline-flex items-center gap-1 rounded font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {onlineCount.toLocaleString()} members online
                    {onlineOverride !== null ? (
                      <span className="rounded-full border border-dashed border-border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Custom
                      </span>
                    ) : null}
                    <Pencil className="size-3 opacity-60 group-hover:opacity-100" />
                  </button>
                  <span>
                    · {activeBans.length} banned · {messages.length} messages
                  </span>
                </p>
```

## 6. The edit dialog

Add this next to the other dialogs (for example right above `{/* ---------- ban dialog ---------- */}`):

```tsx
      {/* ---------- online count dialog ---------- */}
      <Dialog open={onlineOpen} onClose={closeOnline} maxWidth="max-w-md">
        <DialogHeader
          title="Edit online count"
          subtitle="This is the number members see as “members online”."
          onClose={closeOnline}
        />
        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          <Tabs
            value={onlineMode}
            onValueChange={(v) => setOnlineMode(v as "auto" | "custom")}
            variant="segment"
          >
            <TabsList>
              <TabsTrigger value="auto">Automatic</TabsTrigger>
              <TabsTrigger value="custom">Custom number</TabsTrigger>
            </TabsList>
          </Tabs>

          {onlineMode === "auto" ? (
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Real members online
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {online.length.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                The count follows the real member list, excluding banned users.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLS}>Number shown to members</span>
                <input
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  value={onlineDraft}
                  onChange={(e) => setOnlineDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveOnline()}
                  className={`${FIELD_CLS} h-12 text-lg font-semibold tabular-nums`}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[-10, -1, 1, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => bumpOnline(d)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOnlineDraft(String(online.length))}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Use real ({online.length})
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The member list on the right still shows the {online.length}{" "}
                real members. Only the displayed number changes.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button size="md" variant="ghost" onClick={closeOnline}>
            Cancel
          </Button>
          <Button size="md" variant="primary" onClick={saveOnline}>
            Save
          </Button>
        </div>
      </Dialog>
```

## How it works

- **Where to edit:** click the "N members online" text in the chat header, or **Edit count** at the top of the Online list. A small pencil icon marks it as editable.
- **Automatic:** the count follows the real member list (banned users excluded). This is the default.
- **Custom number:** type any whole number from 0 to 100,000, or use the quick buttons (−10, −1, +1, +10, or **Use real**). Enter also saves it.
- **While a custom number is active:**
  - the header shows a dashed **Custom** tag next to the count;
  - the Online tab label uses the same number;
  - the member list still shows the real members, and a note above it says how many.
- **Reset:** switch to **Automatic** and save.

## Things to know

- **Local state only:** the override is not saved anywhere yet. `// TODO: call your API here` marks where to store it.
- **User page:** the user chat header still shows `ONLINE_USERS.length`. To show your custom number there, store it as a setting such as `onlineCountOverride: number | null` and display `onlineCountOverride ?? realCount` in the "N members online" header and the "N Online" button on mobile.