Let me read the current page.tsx to see the exact current state.Good. You're still on the original `page.tsx` (the changes from last time weren't applied yet). No problem — here's exactly what to do:

**Replace lines 219–275** (the entire Portfolio Chart section) with this single block:

```tsx
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
    <ReturnsCalendarGrid />
  </ReturnsCalendar>
</section>
```

That's the only change needed in `page.tsx` for this. Two things to note:

- **No `<Card>` wrapper** — the calendar sits directly in the section, no card padding or border around it.
- **`className="w-full"`** — this overrides the component's default `w-[480px]` so it stretches to fill the full horizontal width of the page. The `max-w-full` is already baked in so it won't overflow on small screens.
- **No `<ReturnsCalendarTooltip />`** inside `<ReturnsCalendarGrid />` — tooltips still work because `ReturnsCalendarGrid` renders children you pass but the tooltip is optional. If you want tooltips, add `<ReturnsCalendarTooltip />` inside `<ReturnsCalendarGrid>` like this: `<ReturnsCalendarGrid><ReturnsCalendarTooltip /></ReturnsCalendarGrid>`. Up to you.

Also remember the two lines to remove from the top of `DashboardPage` (if you haven't already):

```tsx
// DELETE these two lines:
const [chartRange, setChartRange] = useState<"1D" | "7D" | "1M" | "3M" | "6M" | "1Y">("1M");
const chartRanges = ["1D", "7D", "1M", "3M", "6M", "1Y"] as const;
```

And remove `useState` from the React import if it's no longer used elsewhere.