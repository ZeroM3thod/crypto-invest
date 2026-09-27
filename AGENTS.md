Good, I now have both files completely. Let me identify every blue/yellow occurrence:

**Investment Overview (`investment/overview/page.tsx`):**
- `bg-primary/10 text-primary` → default Badge tone (blue, used for tier badges like "Pro", "Starter", "Elite")
- `bg-primary` → ProgressBar fill (blue bar)
- `text-primary` → SectionHeader action button + ActivePlanCard icon

**Cloud Mining (`investment/cloud-mining/page.tsx`):**
- `bg-yellow-500/10 text-yellow-600` → warning Badge tone (used for "Elite" tier)
- `tierTone` returns `"warning"` for Elite tier

Here are the exact changes:

---

## `app/(user)/investment/overview/page.tsx`

**3 spots to change:**

**① Badge `default` tone — remove blue:**

Find:
```tsx
const colors: Record<string, string> = {
  default:     "bg-primary/10 text-primary",
  success:     "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted:       "bg-muted text-muted-foreground",
  warning:     "bg-yellow-500/10 text-yellow-600",
};
```

Replace with:
```tsx
const colors: Record<string, string> = {
  default:     "bg-foreground/10 text-foreground",
  success:     "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted:       "bg-muted text-muted-foreground",
  warning:     "bg-destructive/10 text-destructive",
};
```

**② ProgressBar fill — remove blue:**

Find:
```tsx
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
```

Replace with:
```tsx
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-foreground/40 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
```

**③ ActivePlanCard icon + SectionHeader action — remove blue:**

Find:
```tsx
className="text-xs font-medium text-primary transition-opacity hover:opacity-75 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
```

Replace with:
```tsx
className="text-xs font-medium text-muted-foreground transition-opacity hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
```

Find:
```tsx
<div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
  <TrendingUp className="size-4" />
</div>
```

Replace with:
```tsx
<div className="grid size-8 place-items-center rounded-xl bg-muted text-muted-foreground shrink-0">
  <TrendingUp className="size-4" />
</div>
```

---

## `app/(user)/investment/cloud-mining/page.tsx`

**2 spots to change:**

**① Badge `warning` tone — remove yellow:**

Find:
```tsx
const colors: Record<string, string> = {
  default:     "bg-foreground/10 text-foreground",
  success:     "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted:       "bg-muted text-muted-foreground",
  warning:     "bg-yellow-500/10 text-yellow-600",
};
```

Replace with:
```tsx
const colors: Record<string, string> = {
  default:     "bg-foreground/10 text-foreground",
  success:     "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted:       "bg-muted text-muted-foreground",
  warning:     "bg-foreground/10 text-foreground",
};
```

**② `tierTone` function — map "Elite" away from warning:**

Find:
```tsx
const tierTone = (t: MiningPlan["tier"]): "default" | "success" | "warning" => {
  if (t === "Starter") return "default";
  if (t === "Pro")     return "success";
  return "warning";
};
```

Replace with:
```tsx
const tierTone = (t: MiningPlan["tier"]): "default" | "success" | "muted" => {
  if (t === "Starter") return "muted";
  if (t === "Pro")     return "success";
  return "default";
};
```

---

That's it — just those 6 targeted swaps across the two files. No layout or logic touched at all. After these changes:
- **Tier badges** (Pro, Starter, Elite) → neutral `bg-foreground/10 text-foreground` or `bg-muted`
- **Progress bars** → subtle `bg-foreground/40` (dark-theme neutral grey-white)
- **Action links** → `text-muted-foreground` hovering to `text-foreground`
- **Yellow** completely gone from both pages