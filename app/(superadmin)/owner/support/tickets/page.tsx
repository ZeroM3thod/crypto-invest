// app/(superadmin)/owner/support/tickets/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { SupportView } from "@/app/(admin)/_components/support-view";
import { getTickets } from "@/lib/admin-support-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerSupportPage() {
  await requireOwner();
  const tickets = getTickets(); // swap for your own data source

  return (
    <SuperAdminShell active="Support">
      <SupportView initial={tickets} />
    </SuperAdminShell>
  );
}
