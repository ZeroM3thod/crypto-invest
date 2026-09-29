// app/(superadmin)/owner/finance/deposits/page.tsx
// TODO: add your owner auth guard here (server-side).
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { DepositManagement } from "../../../_components/deposit-management";
import { getDeposits } from "@/lib/finance-data";

export default function DepositsPage() {
  return (
    <SuperAdminShell active="Deposits">
      <DepositManagement initial={getDeposits()} />
    </SuperAdminShell>
  );
}
