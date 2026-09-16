// app/(admin)/layout.tsx
// Admin panel: admin-only pages, no dock.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
