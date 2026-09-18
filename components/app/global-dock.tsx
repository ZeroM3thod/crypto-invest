// components/app/global-dock.tsx
"use client";

import {
  BriefcaseBusiness,
  CandlestickChart,
  Home,
  Landmark,
  Moon,
  Sun,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import Avatar8 from "@/components/base-ui/avatar";

import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";

const ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "investment", icon: BriefcaseBusiness, label: "Investment" },
  { id: "trading", icon: CandlestickChart, label: "Trading" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "fund", icon: Landmark, label: "Fund" },
];

export function GlobalDock() {
  const [active, setActive] = useState("home");
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <Dock size={36}>
        {ITEMS.map(({ id, icon: Icon, label }) => (
          <DockItem
            key={id}
            aria-label={label}
            active={active === id}
            onClick={() => setActive(id)}
          >
            <Icon className="h-4 w-4" />
          </DockItem>
        ))}

        <DockSeparator />

        <DockItem
          aria-label={isDark ? "Day Theme" : "Night Theme"}
          active={false}
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </DockItem>

        <DockItem
          aria-label="Profile"
          active={active === "profile"}
          onClick={() => setActive("profile")}
        >
          <Avatar8 />
        </DockItem>
      </Dock>
    </div>
  );
}