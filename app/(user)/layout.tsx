// app/(user)/layout.tsx
// User panel: dashboard, markets, wallet, fund, referral, support etc.
// ONLY this layout has the GlobalDock.

import { GlobalDock } from "@/components/app/global-dock";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <GlobalDock />
    </>
  );
}
