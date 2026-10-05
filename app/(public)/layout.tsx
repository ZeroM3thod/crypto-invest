// app/(public)/layout.tsx
// Public pages: landing, about, pricing, contact etc.
// No dock here.

import { FloatingThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FloatingThemeToggle />
      {children}
    </>
  );
}
