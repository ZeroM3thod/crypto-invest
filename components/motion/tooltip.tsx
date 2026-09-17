"use client";

import { AnimatePresence } from "motion/react";
import {
  cloneElement,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TooltipSurface } from "@/components/motion/tooltip-surface";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverGesture } from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  children?: ReactElement;
  anchorRef?: RefObject<HTMLElement | SVGElement | null>;
  anchorPoint?: { x: number; y: number };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  side?: Side;
  delay?: number;
  className?: string;
  wrapperClassName?: string;
}

const GAP = 8;

const anchorTransform: Record<Side, string> = {
  top: "translate(-50%, -100%)",
  bottom: "translate(-50%, 0)",
  left: "translate(-100%, -50%)",
  right: "translate(0, -50%)",
};

const transformOrigin: Record<Side, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

const WARM_WINDOW_MS = 300;
let lastHiddenAt = 0;

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 120,
  className,
  wrapperClassName,
  anchorRef: externalAnchorRef,
  anchorPoint,
  open: controlledOpen,
  onOpenChange,
  id: providedId,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const anchorRef = externalAnchorRef ?? wrapperRef;
  const hover = useHoverGesture();
  const surfaceRef = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width * (anchorPoint?.x ?? 0.5);
    const cy = r.top + r.height * (anchorPoint?.y ?? 0.5);
    const point: Record<Side, { top: number; left: number }> = {
      top: { top: (anchorPoint ? cy : r.top) - GAP, left: cx },
      bottom: { top: (anchorPoint ? cy : r.bottom) + GAP, left: cx },
      left: { top: cy, left: (anchorPoint ? cx : r.left) - GAP },
      right: { top: cy, left: (anchorPoint ? cx : r.right) + GAP },
    };
    const next = point[side];
    const width = surfaceRef.current?.offsetWidth ?? 0;
    const height = surfaceRef.current?.offsetHeight ?? 0;
    const dx = side === "left" ? width : side === "right" ? 0 : width / 2;
    const dy = side === "top" ? height : side === "bottom" ? 0 : height / 2;
    next.left = Math.max(GAP + dx, Math.min(next.left, window.innerWidth - GAP - width + dx));
    next.top = Math.max(GAP + dy, Math.min(next.top, window.innerHeight - GAP - height + dy));
    setCoords(previous => previous?.top === next.top && previous.left === next.left ? previous : next);
  }, [side, anchorRef, anchorPoint]);

  const positioned = coords !== null;
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const observer = new ResizeObserver(place);
    if (anchorRef.current) observer.observe(anchorRef.current);
    if (positioned && surfaceRef.current) observer.observe(surfaceRef.current);
    return () => observer.disconnect();
  }, [open, place, anchorRef, positioned]);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    const warm = Date.now() - lastHiddenAt < WARM_WINDOW_MS;
    timer.current = setTimeout(
      () => {
        place();
        setOpen(true);
      },
      warm ? 0 : delay,
    );
  }, [delay, place, setOpen]);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (open) lastHiddenAt = Date.now();
    setOpen(false);
  }, [open, setOpen]);

  const tap = useTapGesture<boolean>();

  const toggleOnTap = useCallback(() => {
    const gesture = tap.take();
    if (!gesture || gesture.pointerType === "mouse") return;
    if (gesture.state) {
      hide();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    place();
    setOpen(true);
  }, [hide, place, tap, setOpen]);

  useDismiss(open, hide, anchorRef);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!externalAnchorRef && !isValidElement(children)) return children;

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": id,
      })
    : null;

  return (
    <>
      {!externalAnchorRef ? (
        <span
          ref={wrapperRef}
          className={cn("relative inline-flex align-middle", wrapperClassName)}
          onPointerEnter={(event: PointerEvent) => {
            if (hover.enter(event)) show();
          }}
          onPointerLeave={(event: PointerEvent) => {
            if (hover.leave(event)) hide();
          }}
          onFocus={show}
          onBlur={hide}
          onPointerDown={(event: PointerEvent) => tap.start(event, open)}
          onPointerCancel={tap.drop}
          onKeyDown={tap.drop}
          onClick={toggleOnTap}
        >
          {trigger}
        </span>
      ) : null}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open && coords ? (
                <span
                  className="pointer-events-none fixed z-[9999]"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    transform: anchorTransform[side],
                  }}
                >
                  <TooltipSurface
                    ref={surfaceRef}
                    id={id}
                    side={side}
                    style={{ transformOrigin: transformOrigin[side], maxWidth: "calc(100vw - 16px)", whiteSpace: "normal" }}
                    className={className}
                  >
                    {content}
                  </TooltipSurface>
                </span>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
