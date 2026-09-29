// app/(superadmin)/owner/page.tsx
// Owner-only area. Add your owner auth guard here (server-side) before rendering.
import { OwnerDashboard } from "../_components/owner-dashboard";
import { SuperAdminShell } from "../_components/super-admin-shell";

export default function AdminDashboardPage() {
  return (
    <SuperAdminShell active="Dashboard">
      <OwnerDashboard />
    </SuperAdminShell>
  );
}
