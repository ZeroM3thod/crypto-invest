// app/(public)/page.tsx
"use client";

import { useState } from "react";

const ITEMS = [
  { id: "home", label: "Home" },
  { id: "mail", label: "Mail" },
  { id: "calendar", label: "Calendar" },
  { id: "music", label: "Music" },
  { id: "discover", label: "Discover" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-foreground">Home Page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The dock is now fixed at the bottom on every page.
      </p>
    </div>
  );
}
