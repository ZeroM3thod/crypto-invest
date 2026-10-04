// app/(admin)/admin/withdraws/page.tsx
// Access route: /admin/withdraws
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { WithdrawsView } from "../../_components/withdraws-view";
import { getWithdraws } from "@/lib/admin-review-data";

export default async function AdminWithdrawsPage() {
  const withdraws = getWithdraws(); // swap for your own data source

  return (
    <AdminShell active="Withdrawals">
      <WithdrawsView initial={withdraws} />
    </AdminShell>
  );
}
