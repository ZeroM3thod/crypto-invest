Good changes — let me set up a small sandbox to actually verify the country flag data and dialog behavior before handing you code that might not compile.I'll build this as two changes:

1. **Country** → a proper closed dropdown (like a native `<select>`, but styled to match `Input`), listing every country with its flag emoji, searchable.
2. **Date of birth** → looks like a normal `Input` field (label, rounded pill, click target) showing the formatted date as text — but clicking it opens a dialog/modal containing the exact same `WheelPicker` trio from before.

No changes to `WheelPicker`, `Input`, `Button`, or animation tokens — I'm only adding a dropdown component, a dialog wrapper, and a trigger field.

---

### 1. `lib/countries.ts` (replace previous version — full list with flags)

```ts
// ISO 3166-1 country list with flag emoji (derived from the two-letter code)
// and calling code. Flag emoji are just regional indicator symbols — no image
// assets needed, they render natively on every modern OS/browser.

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string;
}

function flagFromCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

const RAW: [string, string][] = [
  ["AF", "Afghanistan"], ["AL", "Albania"], ["DZ", "Algeria"], ["AD", "Andorra"],
  ["AO", "Angola"], ["AG", "Antigua and Barbuda"], ["AR", "Argentina"], ["AM", "Armenia"],
  ["AU", "Australia"], ["AT", "Austria"], ["AZ", "Azerbaijan"], ["BS", "Bahamas"],
  ["BH", "Bahrain"], ["BD", "Bangladesh"], ["BB", "Barbados"], ["BY", "Belarus"],
  ["BE", "Belgium"], ["BZ", "Belize"], ["BJ", "Benin"], ["BT", "Bhutan"],
  ["BO", "Bolivia"], ["BA", "Bosnia and Herzegovina"], ["BW", "Botswana"], ["BR", "Brazil"],
  ["BN", "Brunei"], ["BG", "Bulgaria"], ["BF", "Burkina Faso"], ["BI", "Burundi"],
  ["CV", "Cabo Verde"], ["KH", "Cambodia"], ["CM", "Cameroon"], ["CA", "Canada"],
  ["CF", "Central African Republic"], ["TD", "Chad"], ["CL", "Chile"], ["CN", "China"],
  ["CO", "Colombia"], ["KM", "Comoros"], ["CG", "Congo"], ["CD", "Congo (DRC)"],
  ["CR", "Costa Rica"], ["CI", "Côte d'Ivoire"], ["HR", "Croatia"], ["CU", "Cuba"],
  ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["DJ", "Djibouti"],
  ["DM", "Dominica"], ["DO", "Dominican Republic"], ["EC", "Ecuador"], ["EG", "Egypt"],
  ["SV", "El Salvador"], ["GQ", "Equatorial Guinea"], ["ER", "Eritrea"], ["EE", "Estonia"],
  ["SZ", "Eswatini"], ["ET", "Ethiopia"], ["FJ", "Fiji"], ["FI", "Finland"],
  ["FR", "France"], ["GA", "Gabon"], ["GM", "Gambia"], ["GE", "Georgia"],
  ["DE", "Germany"], ["GH", "Ghana"], ["GR", "Greece"], ["GD", "Grenada"],
  ["GT", "Guatemala"], ["GN", "Guinea"], ["GW", "Guinea-Bissau"], ["GY", "Guyana"],
  ["HT", "Haiti"], ["HN", "Honduras"], ["HU", "Hungary"], ["IS", "Iceland"],
  ["IN", "India"], ["ID", "Indonesia"], ["IR", "Iran"], ["IQ", "Iraq"],
  ["IE", "Ireland"], ["IL", "Israel"], ["IT", "Italy"], ["JM", "Jamaica"],
  ["JP", "Japan"], ["JO", "Jordan"], ["KZ", "Kazakhstan"], ["KE", "Kenya"],
  ["KI", "Kiribati"], ["KP", "Korea (North)"], ["KR", "Korea (South)"], ["KW", "Kuwait"],
  ["KG", "Kyrgyzstan"], ["LA", "Laos"], ["LV", "Latvia"], ["LB", "Lebanon"],
  ["LS", "Lesotho"], ["LR", "Liberia"], ["LY", "Libya"], ["LI", "Liechtenstein"],
  ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MG", "Madagascar"], ["MW", "Malawi"],
  ["MY", "Malaysia"], ["MV", "Maldives"], ["ML", "Mali"], ["MT", "Malta"],
  ["MH", "Marshall Islands"], ["MR", "Mauritania"], ["MU", "Mauritius"], ["MX", "Mexico"],
  ["FM", "Micronesia"], ["MD", "Moldova"], ["MC", "Monaco"], ["MN", "Mongolia"],
  ["ME", "Montenegro"], ["MA", "Morocco"], ["MZ", "Mozambique"], ["MM", "Myanmar"],
  ["NA", "Namibia"], ["NR", "Nauru"], ["NP", "Nepal"], ["NL", "Netherlands"],
  ["NZ", "New Zealand"], ["NI", "Nicaragua"], ["NE", "Niger"], ["NG", "Nigeria"],
  ["MK", "North Macedonia"], ["NO", "Norway"], ["OM", "Oman"], ["PK", "Pakistan"],
  ["PW", "Palau"], ["PA", "Panama"], ["PG", "Papua New Guinea"], ["PY", "Paraguay"],
  ["PE", "Peru"], ["PH", "Philippines"], ["PL", "Poland"], ["PT", "Portugal"],
  ["QA", "Qatar"], ["RO", "Romania"], ["RU", "Russia"], ["RW", "Rwanda"],
  ["KN", "Saint Kitts and Nevis"], ["LC", "Saint Lucia"], ["VC", "Saint Vincent and the Grenadines"],
  ["WS", "Samoa"], ["SM", "San Marino"], ["ST", "Sao Tome and Principe"], ["SA", "Saudi Arabia"],
  ["SN", "Senegal"], ["RS", "Serbia"], ["SC", "Seychelles"], ["SL", "Sierra Leone"],
  ["SG", "Singapore"], ["SK", "Slovakia"], ["SI", "Slovenia"], ["SB", "Solomon Islands"],
  ["SO", "Somalia"], ["ZA", "South Africa"], ["SS", "South Sudan"], ["ES", "Spain"],
  ["LK", "Sri Lanka"], ["SD", "Sudan"], ["SR", "Suriname"], ["SE", "Sweden"],
  ["CH", "Switzerland"], ["SY", "Syria"], ["TW", "Taiwan"], ["TJ", "Tajikistan"],
  ["TZ", "Tanzania"], ["TH", "Thailand"], ["TL", "Timor-Leste"], ["TG", "Togo"],
  ["TO", "Tonga"], ["TT", "Trinidad and Tobago"], ["TN", "Tunisia"], ["TR", "Turkey"],
  ["TM", "Turkmenistan"], ["TV", "Tuvalu"], ["UG", "Uganda"], ["UA", "Ukraine"],
  ["AE", "United Arab Emirates"], ["GB", "United Kingdom"], ["US", "United States"],
  ["UY", "Uruguay"], ["UZ", "Uzbekistan"], ["VU", "Vanuatu"], ["VA", "Vatican City"],
  ["VE", "Venezuela"], ["VN", "Vietnam"], ["YE", "Yemen"], ["ZM", "Zambia"],
  ["ZW", "Zimbabwe"],
];

export const COUNTRIES: Country[] = RAW.map(([code, name]) => ({
  code,
  name,
  flag: flagFromCode(code),
})).sort((a, b) => a.name.localeCompare(b.name));
```

---

### 2. `components/motion/country-select.tsx` (replaced — now a real dropdown)

A button styled exactly like `Input`'s field chrome, opening an absolutely-positioned panel with a search box and a scrollable, filtered list. No new dependency — pure React state + your existing motion/ease tokens.

```tsx
"use client";
// beui.dev/components/motion/country-select
// Closed-by-default dropdown, styled to match Input's field chrome exactly
// (h-11, rounded-full, same border/focus states). Opens a floating panel
// with a search box and the full country list, each row showing its flag.

import { Check, ChevronDown, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { COUNTRIES } from "@/lib/countries";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface CountrySelectProps {
  label?: string;
  /** Country name (matches Country["name"]) or "" for none selected. */
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | boolean;
  reserveErrorLine?: boolean;
  success?: boolean;
  className?: string;
}

export function CountrySelect({
  label = "Country",
  value,
  onValueChange,
  placeholder = "Select your country",
  disabled,
  error,
  reserveErrorLine = false,
  success,
  className,
}: CountrySelectProps) {
  const reduce = useReducedMotion();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;
  const selected = COUNTRIES.find((c) => c.name === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  // Close on outside click / Escape — same pattern any dialog-lite needs.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus the search box next tick so the open animation isn't janked by focus scroll.
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="px-1 text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div ref={rootRef} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((o) => !o)}
          data-state={hasError ? "error" : success ? "success" : open ? "focused" : "idle"}
          className={cn(
            "relative flex h-11 w-full items-center gap-2 rounded-full border pl-3.5 pr-3.5 text-left transition-colors duration-200",
            "border-border",
            open && !hasError && "border-foreground/40 ring-2 ring-ring/40",
            hasError && "border-destructive ring-2 ring-destructive/25",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {selected ? (
            <>
              <span className="text-base leading-none">{selected.flag}</span>
              <span className="flex-1 truncate text-base text-foreground">
                {selected.name}
              </span>
            </>
          ) : (
            <span className="flex-1 truncate text-base text-muted-foreground/60">
              {placeholder}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              role="listbox"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 flex max-h-72 flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search countries…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>

              <ul className="overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    No countries match "{query}".
                  </li>
                ) : (
                  filtered.map((c) => {
                    const isSelected = c.name === value;
                    return (
                      <li key={c.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onValueChange?.(c.name);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-muted/60",
                            isSelected && "bg-muted/40",
                          )}
                        >
                          <span className="text-base leading-none">{c.flag}</span>
                          <span className="flex-1 truncate text-foreground">{c.name}</span>
                          {isSelected ? (
                            <Check className="h-4 w-4 shrink-0 text-foreground" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={reserveErrorLine ? "min-h-4" : "contents"}>
        <AnimatePresence initial={false}>
          {errorMessage ? (
            <motion.p
              role="alert"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="px-1 text-xs text-destructive"
            >
              {errorMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

> **Note:** this uses `bg-popover` — if your theme tokens don't define `--popover`, swap it for `bg-background` or `bg-card` (whatever your `Input` field uses).

---

### 3. `components/motion/dob-field.tsx` (new — the trigger + dialog)

The visible field looks exactly like `Input` (label, h-11 pill, left icon, click target). Clicking opens a centered dialog with your **unmodified** three-drum `WheelPicker` layout from `wheel-picker.preview.tsx`, plus a Done button.

```tsx
"use client";
// beui.dev/components/motion/dob-field
// Renders like Input (label + h-11 pill), but the field itself is a button.
// Clicking it opens a centered dialog containing the exact three-WheelPicker
// month/day/year layout from wheel-picker.preview.tsx.

import { Calendar } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { WheelPicker } from "@/components/motion/wheel-picker";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysIn(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

export interface DobValue {
  month: string;
  day: string;
  year: string;
}

export interface DobFieldProps {
  label?: string;
  value: DobValue;
  onValueChange: (value: DobValue) => void;
  disabled?: boolean;
  sound?: boolean;
  error?: string | boolean;
  reserveErrorLine?: boolean;
  success?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

function formatDob(v: DobValue) {
  if (!v.month || !v.day || !v.year) return "";
  return `${v.month} ${v.day}, ${v.year}`;
}

export function DobField({
  label = "Date of birth",
  value,
  onValueChange,
  disabled,
  sound = false,
  error,
  reserveErrorLine = false,
  success,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  className,
}: DobFieldProps) {
  const reduce = useReducedMotion();
  const id = useId();
  const [open, setOpen] = useState(false);
  // Draft lets Cancel discard in-dialog changes; Done commits them.
  const [draft, setDraft] = useState<DobValue>(value);

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const monthIndex = Math.max(0, MONTHS.indexOf(draft.month));
  const dayCount = daysIn(monthIndex, Number(draft.year) || minYear);
  const days = Array.from({ length: dayCount }, (_, i) => String(i + 1));

  useEffect(() => {
    if (Number(draft.day) > dayCount) {
      setDraft((d) => ({ ...d, day: String(dayCount) }));
    }
  }, [dayCount, draft.day]);

  const display = formatDob(value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="px-1 text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        data-state={hasError ? "error" : success ? "success" : "idle"}
        className={cn(
          "relative flex h-11 w-full items-center gap-2.5 rounded-full border pl-3.5 pr-3.5 text-left transition-colors duration-200",
          "border-border",
          hasError && "border-destructive ring-2 ring-destructive/25",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
          <Calendar />
        </span>
        <span
          className={cn(
            "flex-1 truncate text-base",
            display ? "text-foreground" : "text-muted-foreground/60",
          )}
        >
          {display || "Select your date of birth"}
        </span>
      </button>

      <div className={reserveErrorLine ? "min-h-4" : "contents"}>
        <AnimatePresence initial={false}>
          {errorMessage ? (
            <motion.p
              role="alert"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="px-1 text-xs text-destructive"
            >
              {errorMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Dialog panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="relative z-10 flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-border bg-background p-6"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground">
                  Scroll or drag each wheel to set your birthday.
                </p>
              </div>

              {/* Exact same 3-wheel layout as wheel-picker.preview.tsx */}
              <div className="flex items-stretch gap-1 self-center rounded-3xl border border-border bg-background p-2">
                <WheelPicker
                  options={MONTHS}
                  value={draft.month}
                  onValueChange={(m) => setDraft((d) => ({ ...d, month: m }))}
                  className="w-32 border-0 bg-transparent"
                  visibleCount={7}
                  itemHeight={42}
                  sound={sound}
                  aria-label="Month"
                />
                <WheelPicker
                  options={days}
                  value={draft.day}
                  onValueChange={(d2) => setDraft((d) => ({ ...d, day: d2 }))}
                  className="w-14 border-0 bg-transparent"
                  visibleCount={7}
                  itemHeight={42}
                  sound={sound}
                  aria-label="Day"
                />
                <WheelPicker
                  options={years}
                  value={draft.year}
                  onValueChange={(y) => setDraft((d) => ({ ...d, year: y }))}
                  className="w-20 border-0 bg-transparent"
                  visibleCount={7}
                  itemHeight={42}
                  sound={sound}
                  aria-label="Year"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 flex-1 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onValueChange(draft);
                    setOpen(false);
                  }}
                  className="h-10 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
```

---

### 4. `components/motion/signup-form-extended.tsx` — only the field wiring changes

Replace the `country` and `dob` blocks in your existing file with this (everything else stays the same):

```tsx
// Update the imports at the top:
import { CountrySelect } from "@/components/motion/country-select";
import { DobField, type DobValue } from "@/components/motion/dob-field";

// ...

// Replace the "ADDED: Country" block with:
<CountrySelect
  value={values.country}
  onValueChange={(next) => {
    setValue("country", next);
    touch("country");
  }}
  disabled={isSubmitting}
  error={shownError("country")}
  reserveErrorLine
  success={isValid("country")}
/>

// Replace the "ADDED: Date of birth" block with:
<DobField
  value={values.dob}
  onValueChange={(next) => {
    setValue("dob", next);
    touch("dob");
  }}
  disabled={isSubmitting}
  sound={dobSound}
  error={shownError("dob")}
  reserveErrorLine
/>
```

Since both components now handle their own error line the same way `Input` does, you can delete the manual `<div className="min-h-4 px-1">...</div>` error wrappers you had around them before — they're built in now.

---

## Setup guide

1. `npm i lucide-react` if not already there (uses `Calendar`, `Search`, `Check`, `ChevronDown` — you already have `lucide-react` from the button icons).
2. Add/replace:
   - `lib/countries.ts` (full replace)
   - `components/motion/country-select.tsx` (full replace)
   - `components/motion/dob-field.tsx` (new file)
   - Update `signup-form-extended.tsx` imports + the two field blocks as shown
3. **Delete** `components/motion/dob-picker.tsx` if you added it earlier — it's superseded by `dob-field.tsx` (the old one rendered wheels inline instead of behind a dialog).
4. If `bg-popover` / `text-popover-foreground` aren't in your theme, swap for `bg-background`/`text-foreground` in `country-select.tsx`.

Everything else — the signup page, the API route, `WheelPicker` itself — stays exactly as already given.