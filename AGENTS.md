Looking at the uploaded file, let me check what's actually there first.This is a Next.js app with an `(user)/dashboard/page.tsx` — a specific dashboard, not a general site page. To add the 404 page from your doc, it goes in a Next.js `not-found.tsx` file (the App Router convention), not inside this dashboard page. Here's everything you need, ready to paste in.

## 1. `lib/ease.ts` — add these tokens (skip any that already exist in your file)

```tsx
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;
```

## 2. `lib/hooks/use-hover-capable.ts` — new file

```tsx
"use client";

import { useEffect, useState } from "react";

export function useHoverCapable() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return canHover;
}
```

## 3. `components/motion/magnetic.tsx` — new file

```tsx
"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { SPRING_MOUSE } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const enabled = !reduce && canHover;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_MOUSE);
  const sy = useSpring(y, SPRING_MOUSE);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}
```

## 4. `components/motion/not-found/shared.tsx` — new file

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface NotFoundProps {
  className?: string;
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
}

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Page not found",
  description:
    "The page you are looking for moved, vanished, or never existed.",
  homeHref: "/",
  homeLabel: "Back home",
  browseHref: "/dashboard",
  browseLabel: "Back to dashboard",
} as const;

type ActionsProps = Pick
  NotFoundProps,
  "homeHref" | "homeLabel" | "browseHref" | "browseLabel" | "className"
>;

export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  className,
}: ActionsProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const whileTap = reduce ? undefined : { scale: 0.96 };
  const whileHover = reduce || !canHover ? undefined : { scale: 1.02 };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      <motion.a
        href={homeHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {homeLabel}
      </motion.a>
      <motion.a
        href={browseHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
      >
        {browseLabel}
      </motion.a>
    </div>
  );
}

export function NotFoundStage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] w-full flex-col items-center justify-center gap-8 px-4 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

## 5. `components/motion/not-found/magnetic.tsx` — new file

```tsx
"use client";

import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  NotFoundStage,
  type NotFoundProps,
} from "./shared";

export function NotFoundMagnetic({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
}: NotFoundProps) {
  const chars = code.split("");

  return (
    <NotFoundStage className={className}>
      <h1
        aria-label={code}
        className="flex select-none items-center justify-center font-bold leading-none tracking-tighter text-foreground [font-size:clamp(5rem,18vw,12rem)]"
      >
        {chars.map((ch, i) => (
          <Magnetic
            key={i}
            strength={0.6}
            className={cn(i > 0 && "-ml-2")}
          >
            <span aria-hidden className="inline-block px-1 tabular-nums">
              {ch}
            </span>
          </Magnetic>
        ))}
      </h1>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>

      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
      />
    </NotFoundStage>
  );
}
```

## 6. `app/not-found.tsx` — this wires it into the site (Next.js renders this automatically for any unmatched route)

```tsx
import { NotFoundMagnetic } from "@/components/motion/not-found/magnetic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <NotFoundMagnetic />
    </div>
  );
}
```

**Also run:**
```
npm i clsx motion tailwind-merge
```

That's it — no changes needed to your `dashboard/page.tsx`. Next.js will automatically show `app/not-found.tsx` for any route that doesn't match, or you can trigger it manually anywhere by calling `notFound()` from `next/navigation`.