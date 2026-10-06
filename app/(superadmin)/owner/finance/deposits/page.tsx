// app/(superadmin)/owner/finance/deposits/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { DepositsView } from "@/app/(superadmin)/_components/deposits-view";
import { getDeposits } from "@/lib/admin-review-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerDepositsPage() {
  await requireOwner();
  const deposits = getDeposits(); // swap for your own data source

  return (
    <SuperAdminShell active="Deposits">
      <DepositsView initial={deposits} />
    </SuperAdminShell>
  );
}
