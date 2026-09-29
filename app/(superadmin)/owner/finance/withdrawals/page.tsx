// app/(superadmin)/owner/finance/withdrawals/page.tsx
// TODO: add your owner auth guard here (server-side).
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { WithdrawManagement } from "../../../_components/withdraw-management";
import { getWithdrawals } from "@/lib/finance-data";

export default function WithdrawalsPage() {
  return (
    <SuperAdminShell active="Withdrawals">
      <WithdrawManagement initial={getWithdrawals()} />
    </SuperAdminShell>
  );
}
