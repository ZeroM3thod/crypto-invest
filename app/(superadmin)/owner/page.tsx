// app/(superadmin)/owner/page.tsx
import { SuperAdminShell } from "../_components/super-admin-shell";

export default function AdminDashboardPage() {
  return (
    <SuperAdminShell active="Dashboard">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold text-foreground">Super Admin Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Owner-only area.
        </p>
      </div>
    </SuperAdminShell>
  );
}