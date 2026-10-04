// app/(admin)/admin/support/page.tsx
// Access route: /admin/support
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { SupportView } from "../../_components/support-view";
import { getTickets } from "@/lib/admin-support-data";

export default async function AdminSupportPage() {
  const tickets = getTickets(); // swap for your own data source

  return (
    <AdminShell active="Support">
      <SupportView initial={tickets} />
    </AdminShell>
  );
}
