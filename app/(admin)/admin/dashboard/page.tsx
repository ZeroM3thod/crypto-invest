// app/(admin)/admin/dashboard/page.tsx
// Access route: /admin/dashboard
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";

export default function AdminDashboardPage() {
  return (
    <AdminShell active="Dashboard">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin-only area.
        </p>
      </div>
    </AdminShell>
  );
}