// app/(admin)/admin/dashboard/page.tsx
// Access route: /admin/dashboard
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { DashboardView } from "../../_components/dashboard-view";
import { getDashboardData } from "@/lib/admin-dashboard-data";

export default async function AdminDashboardPage() {
  const data = getDashboardData(); // swap for your DB / API call

  return (
    <AdminShell active="Dashboard">
      <DashboardView data={data} />
    </AdminShell>
  );
}
