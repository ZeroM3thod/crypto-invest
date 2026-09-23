// components/app/global-dock.tsx
"use client";

import {
  BriefcaseBusiness,
  CandlestickChart,
  Home,
  Landmark,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

import {
  type OverflowActionItem,
  OverflowActions,
} from "@/components/motion/overflow-actions";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "investment", icon: BriefcaseBusiness, label: "Investment" },
  { id: "trading", icon: CandlestickChart, label: "Trading" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "fund", icon: Landmark, label: "Fund" },
];

export function GlobalDock() {
  const [active, setActive] = useState("home");
  const [expanded, setExpanded] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // All 5 nav icons live in the overflow group, and primaryActions stays
  // empty — so collapsed state shows ONLY the 3-dot toggle button.
  const overflowActions: OverflowActionItem[] = NAV_ITEMS.map(
    ({ id, icon: Icon, label }) => ({
      id,
      label,
      ariaLabel: label,
      icon: (
        <Icon
          className={
            active === id
              ? "h-4 w-4 text-primary"
              : "h-4 w-4 text-foreground"
          }
        />
      ),
      onClick: () => setActive(id),
    }),
  );

  return (
    <div
      ref={constraintsRef}
      className="pointer-events-none fixed inset-0 z-50"
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.06}
        dragConstraints={constraintsRef}
        whileDrag={{ cursor: "grabbing" }}
        initial={false}
        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
      >
        <OverflowActions
          primaryActions={[]}
          overflowActions={overflowActions}
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapseOnAction={false}
          openLabel="Open navigation"
          closeLabel="Close navigation"
        />
      </motion.div>
    </div>
  );
}
