// app/(admin)/admin/deposits/page.tsx
// Access route: /admin/deposits
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { DepositsView } from "../../_components/deposits-view";
import { getDeposits } from "@/lib/admin-review-data";

export default async function AdminDepositsPage() {
  const deposits = getDeposits(); // swap for your own data source

  return (
    <AdminShell active="Deposits">
      <DepositsView initial={deposits} />
    </AdminShell>
  );
}
