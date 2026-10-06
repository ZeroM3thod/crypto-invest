// app/(superadmin)/owner/finance/withdrawals/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { WithdrawsView } from "@/app/(superadmin)/_components/withdraws-view";
import { getWithdraws } from "@/lib/admin-review-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerWithdrawalsPage() {
  await requireOwner();
  const withdraws = getWithdraws(); // swap for your own data source

  return (
    <SuperAdminShell active="Withdrawals">
      <WithdrawsView initial={withdraws} />
    </SuperAdminShell>
  );
}
