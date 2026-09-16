// app/(public)/layout.tsx
// Public pages: landing, about, pricing, contact etc.
// No dock here.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
