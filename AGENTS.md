

## What to change

You need to:
1. **Remove** the `RECENT_TRANSACTIONS` const, `RECENT_TRADES` const, and both their `<section>` blocks from `page.tsx`
2. **Replace** them with a single section using `TableAsyncPreview`
3. **Create** the `TableAsyncPreview` component and all its dependencies (since you said nothing is in your project yet)

---

## Step 1 — Install dependencies

Run this in your project root:

```bash
npm i @tanstack/react-virtual clsx lucide-react motion tailwind-merge
```

---

## Step 2 — Create the utility files

### `lib/utils.ts`
(Skip if you already have it)

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `lib/ease.ts`

```ts
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

export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

### `lib/touch.ts`

```ts
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

export const TOUCH_GESTURE_CONTENT_CLASS =
  "[-webkit-touch-callout:none] pointer-coarse:select-none";

export function holdSelection(element: HTMLElement) {
  element.style.setProperty("user-select", "none");
  element.style.setProperty("-webkit-user-select", "none");
  return () => {
    element.style.removeProperty("user-select");
    element.style.removeProperty("-webkit-user-select");
  };
}

export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}

export const isHoveringPointer = (event: {
  pointerType: string;
  buttons: number;
}) => event.pointerType !== "touch" && event.buttons === 0;
```

---

## Step 3 — Create the Table component files

Create this folder: `components/motion/table/`

### `components/motion/table/types.ts`

```ts
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
};

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  cell?: (row: T) => ReactNode;
  editable?: boolean;
  sortValue?: (row: T) => string | number;
};

export type InsertPosition = "before" | "after";

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T, index: number) => string;
  selectable?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  resizable?: boolean;
  minColumnWidth?: number;
  onColumnResize?: (key: string, width: number) => void;
  reorderable?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  onCellEdit?: (rowId: string, columnKey: string, value: string) => void;
  onColumnRename?: (columnKey: string, value: string) => void;
  onInsertRow?: (index: number, position: InsertPosition) => void;
  onDeleteRow?: (rowId: string, index: number) => void;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  rowHeight?: number;
  height?: number;
  overscan?: number;
  onEndReached?: () => void;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  className?: string;
}

export type TableRow<T> = { row: T; id: string };

export type HeaderCellRefs = {
  current: Record<string, HTMLTableCellElement | null>;
};
```

### `components/motion/table/utils.ts`

```ts
import type { ReactNode } from "react";
import type { TableColumn } from "./types";

export const CHECKBOX_PX = 48;
export const CHECKBOX_WIDTH = `${CHECKBOX_PX}px`;

export const COLUMN_ACTIVE_SHADOW = "inset 0 1px 0 var(--color-primary)";

export function alignFlex(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

export function alignText(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function readCell<T>(row: T, column: TableColumn<T>): ReactNode {
  if (column.cell) return column.cell(row);
  return (row as Record<string, ReactNode>)[column.key];
}

export function readSortValue<T>(
  row: T,
  column: TableColumn<T>,
): string | number {
  if (column.sortValue) return column.sortValue(row);
  return (row as Record<string, string | number>)[column.key];
}
```

### `components/motion/table/editable-cell.tsx`

```tsx
"use client";

export function EditableCell({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      value={value}
      aria-label={label}
      size={1}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Empty"
      className="-mx-2 w-full min-w-0 appearance-none rounded-md border-0 bg-transparent px-2 py-1 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:bg-muted focus:ring-1 focus:ring-ring"
    />
  );
}
```

### `components/motion/table/skeleton-rows.tsx`

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { TableColumn } from "./types";
import { alignText } from "./utils";

export function SkeletonRows<T>({
  count,
  columns,
  selectable,
  rowHeight,
}: {
  count: number;
  columns: TableColumn<T>[];
  selectable: boolean;
  rowHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, r) => (
        <tr key={r} style={{ height: rowHeight }} className="border-border/60 border-b">
          {selectable ? <td /> : null}
          {columns.map((column) => (
            <td key={column.key} className={cn("px-4", alignText(column.align))}>
              <div
                className={cn(
                  "h-3 animate-pulse rounded-full bg-muted",
                  column.align === "right" ? "ml-auto w-10" : "w-2/3",
                )}
              />
            </td>
          ))}
          <td aria-hidden />
        </tr>
      ))}
    </>
  );
}
```

### `components/motion/table/table-menu.tsx`

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type TableMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

const MENU_WIDTH = 188;

export function TableMenu({
  items,
  ariaLabel,
  trigger,
  triggerClassName,
}: {
  items: TableMenuItem[];
  ariaLabel: string;
  trigger: ReactNode;
  triggerClassName?: string;
}) {
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const open = coords !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setCoords(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) { setCoords(null); return; }
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: Math.max(8, r.right - MENU_WIDTH) });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <div className="fixed inset-0 z-40" onPointerDown={() => setCoords(null)} />
              <motion.div
                role="menu"
                className="fixed z-50 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl"
                style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : SPRING_PANEL}
              >
                {items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => { setCoords(null); item.onSelect(); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors [&_svg]:h-4 [&_svg]:w-4",
                      item.destructive
                        ? "text-rose-500 hover:bg-rose-500/10"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
```

### `components/motion/table/row-handle.tsx`

```tsx
"use client";

import { ArrowDownToLine, ArrowUpToLine, MoreVertical, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { TableMenu } from "./table-menu";

export function RowHandle({
  rowEl,
  id,
  index,
  onInsertRow,
  onDeleteRow,
  onEnter,
  onLeave,
}: {
  rowEl: HTMLTableRowElement | null;
  id: string;
  index: number;
  onInsertRow?: (index: number, position: "before" | "after") => void;
  onDeleteRow?: (rowId: string, index: number) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    window.addEventListener("scroll", onLeave, true);
    return () => window.removeEventListener("scroll", onLeave, true);
  }, [onLeave]);

  if (!rowEl || typeof document === "undefined") return null;
  const rect = rowEl.getBoundingClientRect();

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: rect.top + rect.height / 2,
        left: rect.left,
        transform: "translate(-50%, -50%)",
        zIndex: 40,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <TableMenu
        ariaLabel={`Row ${index + 1} options`}
        triggerClassName="flex h-6 w-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        trigger={<MoreVertical className="h-3 w-3" />}
        items={[
          ...(onInsertRow
            ? [
                { label: "Insert before", icon: <ArrowUpToLine />, onSelect: () => onInsertRow(index, "before") },
                { label: "Insert after", icon: <ArrowDownToLine />, onSelect: () => onInsertRow(index, "after") },
              ]
            : []),
          ...(onDeleteRow
            ? [{ label: "Delete row", icon: <Trash2 />, destructive: true, onSelect: () => onDeleteRow(id, index) }]
            : []),
        ]}
      />
    </div>,
    document.body,
  );
}
```

### `components/motion/table/use-column-reorder.ts`

```ts
import { type PointerEvent as ReactPointerEvent, useCallback, useMemo, useState } from "react";
import { capturePointer, releasePointer } from "@/lib/touch";
import type { HeaderCellRefs, TableColumn } from "./types";

export function useColumnReorder<T>({
  columns,
  thRefs,
  onColumnOrderChange,
}: {
  columns: TableColumn<T>[];
  thRefs: HeaderCellRefs;
  onColumnOrderChange?: (keys: string[]) => void;
}) {
  const [order, setOrder] = useState<string[]>(() => columns.map((c) => c.key));
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const orderedColumns = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c]));
    const resultKeys = order.filter((k) => byKey.has(k));
    const present = new Set(resultKeys);
    columns.forEach((column, i) => {
      if (present.has(column.key)) return;
      let at = resultKeys.length;
      if (i === 0) { at = 0; }
      else {
        const idx = resultKeys.indexOf(columns[i - 1].key);
        at = idx === -1 ? i : idx + 1;
      }
      resultKeys.splice(at, 0, column.key);
      present.add(column.key);
    });
    return resultKeys.map((k) => byKey.get(k)).filter((c): c is TableColumn<T> => c !== undefined);
  }, [order, columns]);

  const dropIndexFor = useCallback(
    (clientX: number) => {
      for (let i = 0; i < orderedColumns.length; i++) {
        const rect = thRefs.current[orderedColumns[i].key]?.getBoundingClientRect();
        if (rect && clientX < rect.left + rect.width / 2) return i;
      }
      return orderedColumns.length;
    },
    [orderedColumns, thRefs],
  );

  const startReorder = useCallback((key: string, e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragKey(key);
    capturePointer(e.currentTarget, e.pointerId);
  }, []);

  const moveReorder = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragKey) return;
      setDropIndex(dropIndexFor(e.clientX));
    },
    [dragKey, dropIndexFor],
  );

  const endReorder = useCallback(
    (e: ReactPointerEvent) => {
      releasePointer(e.currentTarget, e.pointerId);
      if (dragKey && dropIndex !== null) {
        const keys = orderedColumns.map((c) => c.key);
        const from = keys.indexOf(dragKey);
        if (from !== -1) {
          const without = keys.filter((_, i) => i !== from);
          let to = dropIndex;
          if (from < to) to--;
          without.splice(to, 0, dragKey);
          setOrder(without);
          onColumnOrderChange?.(without);
        }
      }
      setDragKey(null);
      setDropIndex(null);
    },
    [dragKey, dropIndex, orderedColumns, onColumnOrderChange],
  );

  return { orderedColumns, dragKey, dropIndex, startReorder, moveReorder, endReorder };
}
```

### `components/motion/table/use-column-resize.ts`

```ts
import { type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from "react";
import { capturePointer, releasePointer } from "@/lib/touch";
import type { HeaderCellRefs, TableColumn } from "./types";

export function useColumnResize<T>({
  orderedColumns,
  thRefs,
  minColumnWidth,
  onColumnResize,
}: {
  orderedColumns: TableColumn<T>[];
  thRefs: HeaderCellRefs;
  minColumnWidth: number;
  onColumnResize?: (key: string, width: number) => void;
}) {
  const resizeRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});

  const startResize = useCallback(
    (key: string, e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const snapshot = { ...widths };
      for (const column of orderedColumns) {
        if (snapshot[column.key] == null) {
          const measured = thRefs.current[column.key]?.getBoundingClientRect().width;
          snapshot[column.key] = measured ? Math.round(measured) : minColumnWidth;
        }
      }
      resizeRef.current = { key, startX: e.clientX, startWidth: snapshot[key] };
      setWidths(snapshot);
      capturePointer(e.currentTarget, e.pointerId);
    },
    [minColumnWidth, orderedColumns, thRefs, widths],
  );

  const moveResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      if (!state) return;
      const width = Math.max(minColumnWidth, state.startWidth + (e.clientX - state.startX));
      setWidths((prev) => ({ ...prev, [state.key]: width }));
    },
    [minColumnWidth],
  );

  const endResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      resizeRef.current = null;
      releasePointer(e.currentTarget, e.pointerId);
      if (state) onColumnResize?.(state.key, widths[state.key] ?? state.startWidth);
    },
    [onColumnResize, widths],
  );

  return { widths, startResize, moveResize, endResize };
}
```

### `components/motion/table/use-column-sort.ts`

```ts
import { useCallback, useMemo, useState } from "react";
import type { SortState, TableColumn, TableRow } from "./types";
import { readSortValue } from "./utils";

export function useColumnSort<T>({
  rows,
  columns,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
}: {
  rows: TableRow<T>[];
  columns: TableColumn<T>[];
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
}) {
  const [internalSort, setInternalSort] = useState<SortState | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : internalSort;

  const commit = useCallback(
    (next: SortState | null) => {
      if (sortProp === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [sortProp, onSortChange],
  );

  const toggleSort = useCallback(
    (key: string) => {
      if (!sort || sort.key !== key) { commit({ key, direction: "asc" }); }
      else if (sort.direction === "asc") { commit({ key, direction: "desc" }); }
      else { commit(null); }
    },
    [sort, commit],
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = readSortValue(a.row, column);
      const bv = readSortValue(b.row, column);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") { cmp = av - bv; }
      else { cmp = String(av).localeCompare(String(bv)); }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  return { sort, sortedRows, toggleSort };
}
```

### `components/motion/table/use-row-selection.ts`

```ts
import { useCallback, useMemo, useState } from "react";
import type { TableRow } from "./types";

export function useRowSelection<T>({
  sortedRows,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
}: {
  sortedRows: TableRow<T>[];
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedRowIds),
  );
  const selected = useMemo(
    () => selectedRowIds !== undefined ? new Set(selectedRowIds) : internalSelected,
    [selectedRowIds, internalSelected],
  );

  const commit = useCallback(
    (next: Set<string>) => {
      if (selectedRowIds === undefined) setInternalSelected(next);
      onSelectionChange?.([...next]);
    },
    [selectedRowIds, onSelectionChange],
  );

  const allSelected = sortedRows.length > 0 && sortedRows.every((r) => selected.has(r.id));
  const someSelected = sortedRows.some((r) => selected.has(r.id));

  const toggleAll = useCallback(() => {
    const next = new Set(selected);
    if (allSelected) { for (const r of sortedRows) next.delete(r.id); }
    else { for (const r of sortedRows) next.add(r.id); }
    commit(next);
  }, [allSelected, sortedRows, selected, commit]);

  const toggleRow = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commit(next);
    },
    [selected, commit],
  );

  return { selected, allSelected, someSelected, toggleAll, toggleRow };
}
```

### `components/motion/checkbox.tsx`

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

const CHECK_PATH = "M5 13l4 4L19 7";
const INDETERMINATE_PATH = "M6 12h12";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  indeterminate,
  label,
  className,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduce = useReducedMotion();
  const showMark = checked || indeterminate;
  const path = indeterminate ? INDETERMINATE_PATH : CHECK_PATH;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <motion.button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
        transition={SPRING_PRESS}
        data-state={checked ? "checked" : indeterminate ? "indeterminate" : "unchecked"}
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 outline-none transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          showMark
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50 bg-background hover:border-muted-foreground",
        )}
      >
        <AnimatePresence initial={false}>
          {showMark ? (
            <motion.svg
              key={indeterminate ? "indeterminate" : "checked"}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
              aria-hidden
            >
              <title>{indeterminate ? "Partially selected" : "Selected"}</title>
              <motion.path
                d={path}
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? { duration: 0 } : { duration: indeterminate ? 0.2 : 0.3, ease: EASE_OUT, delay: 0.04 }}
              />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </motion.button>
      {label ? (
        <span className={cn("select-none text-sm text-foreground", disabled && "opacity-60")}>
          {label}
        </span>
      ) : null}
    </label>
  );
}
```

### `components/motion/table/table-header.tsx`

```tsx
"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { type PointerEvent as ReactPointerEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { Checkbox } from "@/components/motion/checkbox";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";
import { TableMenu } from "./table-menu";
import type { HeaderCellRefs, InsertPosition, SortState, TableColumn } from "./types";
import { alignFlex, alignText, COLUMN_ACTIVE_SHADOW } from "./utils";

export interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  rowHeight: number;
  reduce: boolean;
  thRefs: HeaderCellRefs;
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  sort: SortState | null;
  onToggleSort: (key: string) => void;
  resizable: boolean;
  onResizeStart: (key: string, e: ReactPointerEvent) => void;
  onResizeMove: (e: ReactPointerEvent) => void;
  onResizeEnd: (e: ReactPointerEvent) => void;
  reorderable: boolean;
  dragKey: string | null;
  dropIndex: number | null;
  onReorderStart: (key: string, e: ReactPointerEvent) => void;
  onReorderMove: (e: ReactPointerEvent) => void;
  onReorderEnd: (e: ReactPointerEvent) => void;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  onColumnRename?: (columnKey: string, value: string) => void;
  activeColumn: string | null;
  onColumnActivate?: (key: string) => void;
  onColumnDeactivate?: () => void;
}

function columnMenuItems<T>(
  column: TableColumn<T>,
  index: number,
  onInsertColumn?: (index: number, position: InsertPosition) => void,
  onDeleteColumn?: (columnKey: string, index: number) => void,
) {
  return [
    ...(onInsertColumn
      ? [
          { label: "Insert before", icon: <ArrowLeftToLine />, onSelect: () => onInsertColumn(index, "before") },
          { label: "Insert after", icon: <ArrowRightToLine />, onSelect: () => onInsertColumn(index, "after") },
        ]
      : []),
    ...(onDeleteColumn
      ? [{ label: "Delete column", icon: <Trash2 />, destructive: true, onSelect: () => onDeleteColumn(column.key, index) }]
      : []),
  ];
}

function ColumnHandle<T>({
  column,
  index,
  thRefs,
  onInsertColumn,
  onDeleteColumn,
  onEnter,
  onLeave,
}: {
  column: TableColumn<T>;
  index: number;
  thRefs: HeaderCellRefs;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    window.addEventListener("scroll", onLeave, true);
    return () => window.removeEventListener("scroll", onLeave, true);
  }, [onLeave]);

  const el = thRefs.current[column.key];
  if (!el || typeof document === "undefined") return null;
  const rect = el.getBoundingClientRect();

  return createPortal(
    <div
      style={{ position: "fixed", top: rect.top, left: rect.left + rect.width / 2, transform: "translate(-50%, -50%)", zIndex: 40 }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <TableMenu
        ariaLabel={`${column.key} column options`}
        triggerClassName="flex h-2 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        trigger={<MoreHorizontal className="h-3 w-3" />}
        items={columnMenuItems(column, index, onInsertColumn, onDeleteColumn)}
      />
    </div>,
    document.body,
  );
}

export function TableHeader<T>({
  columns, rowHeight, reduce, thRefs, selectable, allSelected, someSelected, onToggleAll,
  sort, onToggleSort, resizable, onResizeStart, onResizeMove, onResizeEnd,
  reorderable, dragKey, dropIndex, onReorderStart, onReorderMove, onReorderEnd,
  onInsertColumn, onDeleteColumn, onColumnRename, activeColumn, onColumnActivate, onColumnDeactivate,
}: TableHeaderProps<T>) {
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  const activeIndex = columns.findIndex((c) => c.key === activeColumn);
  return (
    <>
      {hasColumnMenu && activeColumn && activeIndex >= 0 ? (
        <ColumnHandle
          column={columns[activeIndex]}
          index={activeIndex}
          thRefs={thRefs}
          onInsertColumn={onInsertColumn}
          onDeleteColumn={onDeleteColumn}
          onEnter={() => onColumnActivate?.(activeColumn)}
          onLeave={() => onColumnDeactivate?.()}
        />
      ) : null}
      <thead>
        <tr style={{ height: rowHeight }}>
          {selectable ? (
            <th className="sticky top-0 z-10 border-border border-b bg-muted">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all rows"
                  className="size-6"
                />
              </div>
            </th>
          ) : null}
          {columns.map((column, index) => {
            const active = sort?.key === column.key;
            const isDragging = dragKey === column.key;
            const isActive = activeColumn === column.key;
            return (
              <th
                key={column.key}
                ref={(el) => { thRefs.current[column.key] = el; }}
                onPointerEnter={() => onColumnActivate?.(column.key)}
                onPointerLeave={() => onColumnDeactivate?.()}
                style={isActive ? { boxShadow: COLUMN_ACTIVE_SHADOW } : undefined}
                aria-sort={active ? (sort?.direction === "asc" ? "ascending" : "descending") : undefined}
                data-drop={dragKey ? dropIndex === index : undefined}
                data-dropend={dragKey ? dropIndex === columns.length && index === columns.length - 1 : undefined}
                className={cn(
                  "group sticky top-0 z-10 border-border border-b bg-muted p-0 font-medium text-muted-foreground",
                  "data-[drop=true]:before:absolute data-[drop=true]:before:inset-y-0 data-[drop=true]:before:left-0 data-[drop=true]:before:w-0.5 data-[drop=true]:before:bg-primary",
                  "data-[dropend=true]:after:absolute data-[dropend=true]:after:inset-y-0 data-[dropend=true]:after:right-0 data-[dropend=true]:after:w-0.5 data-[dropend=true]:after:bg-primary",
                )}
              >
                <motion.div
                  className={cn("flex h-full items-center", alignFlex(column.align))}
                  style={{ height: rowHeight }}
                  animate={reduce ? { opacity: isDragging ? 0.5 : 1 } : { scale: isDragging ? 1.04 : 1, opacity: isDragging ? 0.5 : 1 }}
                  transition={SPRING_PRESS}
                >
                  {reorderable ? (
                    <button
                      type="button"
                      aria-label={`Reorder ${column.key} column`}
                      onPointerDown={(e) => onReorderStart(column.key, e)}
                      onPointerMove={onReorderMove}
                      onPointerUp={onReorderEnd}
                      className={cn("flex h-full w-6 cursor-grab touch-none items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing", TOUCH_GESTURE_CLASS)}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onToggleSort(column.key)}
                      className={cn("flex h-full min-w-0 flex-1 select-none items-center gap-1 px-4 transition-colors hover:text-foreground", alignFlex(column.align), active && "text-foreground")}
                    >
                      <span className="truncate">{column.header}</span>
                      <motion.span
                        aria-hidden
                        className="inline-flex shrink-0"
                        animate={{ rotate: active && sort?.direction === "desc" ? 180 : 0, opacity: active ? 1 : 0.35 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </motion.span>
                    </button>
                  ) : onColumnRename ? (
                    <input
                      value={typeof column.header === "string" ? column.header : ""}
                      aria-label={`Rename ${column.key} column`}
                      size={1}
                      onChange={(e) => onColumnRename(column.key, e.target.value)}
                      className={cn("min-w-0 flex-1 truncate appearance-none rounded-md border-0 bg-transparent px-4 font-medium text-muted-foreground outline-none transition-colors focus:bg-muted focus:text-foreground", alignText(column.align))}
                    />
                  ) : (
                    <span className={cn("min-w-0 flex-1 truncate px-4", alignText(column.align))}>
                      {column.header}
                    </span>
                  )}
                </motion.div>
                {resizable ? (
                  <button
                    type="button"
                    aria-label={`Resize ${column.key} column`}
                    tabIndex={-1}
                    onPointerDown={(e) => onResizeStart(column.key, e)}
                    onPointerMove={onResizeMove}
                    onPointerUp={onResizeEnd}
                    className={cn("absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/40", TOUCH_GESTURE_CLASS)}
                  />
                ) : null}
              </th>
            );
          })}
          <th aria-hidden className="sticky top-0 z-10 border-border border-b bg-muted" />
        </tr>
      </thead>
    </>
  );
}
```

### `components/motion/table/index.tsx`

```tsx
"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "./editable-cell";
import { RowHandle } from "./row-handle";
import { SkeletonRows } from "./skeleton-rows";
import { TableHeader } from "./table-header";
import type { HeaderCellRefs, TableProps } from "./types";
import { useColumnReorder } from "./use-column-reorder";
import { useColumnResize } from "./use-column-resize";
import { useColumnSort } from "./use-column-sort";
import { useRowSelection } from "./use-row-selection";
import { alignText, CHECKBOX_PX, CHECKBOX_WIDTH, readCell } from "./utils";

export type { SortDirection, SortState, TableColumn, TableProps } from "./types";

const INPUT_COLUMN_WIDTH = 120;
const DEFAULT_ROOT_FONT_SIZE = 16;

function useRootFontSize() {
  const [size, setSize] = useState(DEFAULT_ROOT_FONT_SIZE);
  useEffect(() => {
    const measured = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (measured > 0) setSize(measured);
  }, []);
  return size;
}

function resolveColumnWidth(width: string | undefined, rootFontSize: number): number | null {
  if (!width) return null;
  const value = Number.parseFloat(width);
  if (!Number.isFinite(value)) return null;
  if (width.endsWith("px")) return value;
  if (width.endsWith("rem")) return value * rootFontSize;
  return null;
}

export function Table<T>({
  data, columns, getRowId, selectable = false, selectedRowIds, defaultSelectedRowIds,
  onSelectionChange, sort: sortProp, defaultSort = null, onSortChange, resizable = false,
  minColumnWidth = 64, onColumnResize, reorderable = false, onColumnOrderChange, onCellEdit,
  onColumnRename, onInsertRow, onDeleteRow, onInsertColumn, onDeleteColumn,
  rowHeight = 48, height = 440, overscan = 10, onEndReached, loading = false,
  skeletonRows = 3, emptyState = "No data", className,
}: TableProps<T>) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thRefs: HeaderCellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const rows = useMemo(
    () => data.map((row, index) => ({ row, id: getRowId ? getRowId(row, index) : String(index) })),
    [data, getRowId],
  );

  const { orderedColumns, dragKey, dropIndex, startReorder, moveReorder, endReorder } =
    useColumnReorder({ columns, thRefs, onColumnOrderChange });

  const { sort, sortedRows, toggleSort } = useColumnSort({ rows, columns, sort: sortProp, defaultSort, onSortChange });

  const { widths, startResize, moveResize, endResize } = useColumnResize({ orderedColumns, thRefs, minColumnWidth, onColumnResize });

  const { selected, allSelected, someSelected, toggleAll, toggleRow } = useRowSelection({ sortedRows, selectedRowIds, defaultSelectedRowIds, onSelectionChange });

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

  const hasRowMenu = !!(onInsertRow || onDeleteRow);
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  const sized = orderedColumns.length > 0 && orderedColumns.every((c) => widths[c.key] != null);

  const rootFontSize = useRootFontSize();
  const minTableWidth = useMemo(() => {
    const inputOnly = (column: (typeof orderedColumns)[number]) =>
      Boolean(onColumnRename) || (!column.cell && Boolean(column.editable));
    const total = orderedColumns.reduce((sum, column) => {
      const resized = widths[column.key];
      if (resized != null) return sum + resized;
      const declared = resolveColumnWidth(column.width, rootFontSize);
      if (declared != null) return sum + declared;
      return sum + (inputOnly(column) ? Math.max(minColumnWidth, INPUT_COLUMN_WIDTH) : minColumnWidth);
    }, selectable ? CHECKBOX_PX : 0);
    return Math.round(total);
  }, [minColumnWidth, onColumnRename, orderedColumns, rootFontSize, selectable, widths]);

  const endReachedRef = useRef(false);
  useEffect(() => { if (!loading) endReachedRef.current = false; }, [loading]);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onEndReached || loading || endReachedRef.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < rowHeight * 4) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [onEndReached, loading, rowHeight]);

  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const deactivateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateColumn = useCallback((key: string) => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = null;
    setActiveColumn(key);
  }, []);
  const deactivateColumn = useCallback(() => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = setTimeout(() => setActiveColumn(null), 100);
  }, []);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [activeRow, setActiveRow] = useState<{ id: string; index: number } | null>(null);
  const rowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateRow = useCallback((id: string, index: number) => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = null;
    setActiveRow({ id, index });
  }, []);
  const deactivateRow = useCallback(() => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = setTimeout(() => setActiveRow(null), 100);
  }, []);
  const activeRowEl = activeRow ? rowRefs.current[activeRow.id] : null;
  const leadColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cn("w-full overflow-hidden border border-border bg-background text-sm", className)}>
      <div ref={scrollRef} onScroll={handleScroll} className="overflow-auto" style={{ height }}>
        <table
          className={cn("border-collapse", sized ? "w-max" : undefined)}
          style={{ tableLayout: "fixed", minWidth: `max(100%, ${minTableWidth}px)` }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {orderedColumns.map((column) => {
              const override = widths[column.key];
              const width = override ? `${override}px` : column.width;
              return <col key={column.key} style={width ? { width } : undefined} />;
            })}
            <col />
          </colgroup>

          <TableHeader
            columns={orderedColumns}
            rowHeight={rowHeight}
            reduce={!!reduce}
            thRefs={thRefs}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={toggleAll}
            sort={sort}
            onToggleSort={toggleSort}
            resizable={resizable}
            onResizeStart={startResize}
            onResizeMove={moveResize}
            onResizeEnd={endResize}
            reorderable={reorderable}
            dragKey={dragKey}
            dropIndex={dropIndex}
            onReorderStart={startReorder}
            onReorderMove={moveReorder}
            onReorderEnd={endReorder}
            onInsertColumn={onInsertColumn}
            onDeleteColumn={onDeleteColumn}
            onColumnRename={onColumnRename}
            activeColumn={hasColumnMenu ? activeColumn : null}
            onColumnActivate={hasColumnMenu ? activateColumn : undefined}
            onColumnDeactivate={hasColumnMenu ? deactivateColumn : undefined}
          />

          <tbody>
            {sortedRows.length === 0 ? (
              loading ? (
                <SkeletonRows
                  count={Math.max(1, Math.ceil(height / rowHeight))}
                  columns={orderedColumns}
                  selectable={selectable}
                  rowHeight={rowHeight}
                />
              ) : (
                <tr>
                  <td colSpan={leadColumns + 1} className="p-10 text-center text-muted-foreground">
                    {emptyState}
                  </td>
                </tr>
              )
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {virtualItems.map((vItem) => {
                  const entry = sortedRows[vItem.index];
                  const isSelected = selected.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      ref={(el) => { rowRefs.current[entry.id] = el; }}
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      onPointerEnter={hasRowMenu ? () => activateRow(entry.id, vItem.index) : undefined}
                      onPointerLeave={hasRowMenu ? deactivateRow : undefined}
                      className={cn(
                        "border-border/60 border-b transition-colors",
                        "data-[selected=true]:bg-primary/5",
                        "hover:bg-muted/50",
                      )}
                    >
                      {selectable ? (
                        <td className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(entry.id)}
                              aria-label={`Select row ${vItem.index + 1}`}
                            />
                          </div>
                        </td>
                      ) : null}
                      {orderedColumns.map((column) => (
                        <td key={column.key} className={cn("truncate px-4 text-foreground", alignText(column.align))}>
                          {!column.cell && column.editable ? (
                            <EditableCell
                              value={String(readCell(entry.row, column) ?? "")}
                              label={`${column.key} for row ${vItem.index + 1}`}
                              onChange={(next) => onCellEdit?.(entry.id, column.key, next)}
                            />
                          ) : (
                            readCell(entry.row, column)
                          )}
                        </td>
                      ))}
                      <td aria-hidden />
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {loading ? (
                  <SkeletonRows
                    count={skeletonRows}
                    columns={orderedColumns}
                    selectable={selectable}
                    rowHeight={rowHeight}
                  />
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
      {hasRowMenu && activeRow ? (
        <RowHandle
          rowEl={activeRowEl}
          id={activeRow.id}
          index={activeRow.index}
          onInsertRow={onInsertRow}
          onDeleteRow={onDeleteRow}
          onEnter={() => activateRow(activeRow.id, activeRow.index)}
          onLeave={deactivateRow}
        />
      ) : null}
    </div>
  );
}
```

---

## Step 4 — Create the preview component

### `components/previews/motion/table-async.preview.tsx`

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, type TableColumn } from "@/components/motion/table";
import { cn } from "@/lib/utils";

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  mrr: number;
};

const FIRST = ["Ava", "Leo", "Mia", "Kai", "Zoe", "Eli", "Noa", "Ren", "Ivy", "Jude"];
const LAST = ["Cole", "Frost", "Vale", "Reyes", "Okafor", "Sato", "Lund", "Marsh", "Bose", "Quinn"];
const ROLES = ["Owner", "Admin", "Member", "Viewer"];
const STATUSES: Person["status"][] = ["active", "invited", "suspended"];

const PAGE_SIZE = 20;
const MAX_PAGES = 8;

function buildPage(page: number): Person[] {
  const out: Person[] = [];
  const start = page * PAGE_SIZE;
  for (let n = start; n < start + PAGE_SIZE; n++) {
    const first = FIRST[n % FIRST.length];
    const last = LAST[(n * 7) % LAST.length];
    out.push({
      id: String(n),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${n}@beui.dev`,
      role: ROLES[(n * 3) % ROLES.length],
      status: STATUSES[(n * 5) % STATUSES.length],
      mrr: 12 + ((n * 37) % 488),
    });
  }
  return out;
}

const STATUS_STYLES: Record<Person["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function TableAsyncPreview() {
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || pageRef.current >= MAX_PAGES) return;
    loadingRef.current = true;
    setLoading(true);
    setTimeout(() => {
      const page = pageRef.current;
      setRows((prev) => [...prev, ...buildPage(page)]);
      pageRef.current = page + 1;
      loadingRef.current = false;
      setLoading(false);
    }, 700);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMore(); }, []);

  const columns = useMemo<TableColumn<Person>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (r) => <span className="font-medium">{r.name}</span>,
      },
      { key: "email", header: "Email", width: "220px" },
      { key: "role", header: "Role", width: "110px" },
      {
        key: "status",
        header: "Status",
        width: "120px",
        cell: (r) => (
          <span className={cn("rounded-full px-2 py-0.5 font-medium text-xs capitalize", STATUS_STYLES[r.status])}>
            {r.status}
          </span>
        ),
      },
      {
        key: "mrr",
        header: "MRR",
        align: "right",
        width: "100px",
        cell: (r) => <span className="tabular-nums">${r.mrr.toLocaleString()}</span>,
      },
    ],
    [],
  );

  const done = pageRef.current >= MAX_PAGES;

  return (
    <div className="flex w-full justify-center p-4">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
          <span>{rows.length.toLocaleString()} loaded</span>
          <span>{loading ? "Loading…" : done ? "All loaded" : "Scroll for more"}</span>
        </div>
        <Table
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          height={420}
          rowHeight={52}
          onEndReached={loadMore}
          loading={loading}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
```

---

## Step 5 — Update `page.tsx`

Make these two changes:

**1. Add the import** at the top (with the other imports):

```tsx
import { TableAsyncPreview } from "@/components/previews/motion/table-async.preview";
```

**2. Remove** the `RECENT_TRANSACTIONS` and `RECENT_TRADES` const arrays (lines 143–155 in your file), and **remove** both their `<section>` blocks.

**Replace** both sections with this single section:

```tsx
{/* ── Activity Table ───────────────────────────── */}
<section aria-label="Activity Table">
  <SectionHeader title="Recent Activity" />
  <TableAsyncPreview />
</section>
```

That's it. The `Notifications` section and everything else stays untouched.

---

## Quick file structure summary

```
lib/
  utils.ts
  ease.ts
  touch.ts
components/
  motion/
    checkbox.tsx
    table/
      index.tsx
      types.ts
      utils.ts
      editable-cell.tsx
      skeleton-rows.tsx
      table-menu.tsx
      table-header.tsx
      row-handle.tsx
      use-column-reorder.ts
      use-column-resize.ts
      use-column-sort.ts
      use-row-selection.ts
  previews/
    motion/
      table-async.preview.tsx
```