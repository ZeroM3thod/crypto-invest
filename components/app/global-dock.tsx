// components/app/global-dock.tsx
"use client";

import { Calendar, Home, Mail, Music, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";

const ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "music", icon: Music, label: "Music" },
  { id: "discover", icon: Sparkles, label: "Discover" },
];

export function GlobalDock() {
  const [active, setActive] = useState("home");

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
          aria-label="Settings"
          active={active === "settings"}
          onClick={() => setActive("settings")}
        >
          <Settings className="h-4 w-4" />
        </DockItem>
        <DockItem aria-label="GitHub">
          <GithubIcon className="h-4 w-4" />
        </DockItem>
      </Dock>
    </div>
  );
}