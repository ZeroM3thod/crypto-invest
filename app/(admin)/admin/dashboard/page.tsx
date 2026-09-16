// app/(admin)/admin/dashboard/page.tsx
// Access route: /admin/dashboard
// Add your admin auth guard here later.

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin-only area. No dock here.
      </p>
    </div>
  );
}
