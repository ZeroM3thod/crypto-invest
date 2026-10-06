// app/(superadmin)/owner/finance/history/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { HistoryView } from "@/app/(admin)/_components/history-view";
import { getHistory } from "@/lib/admin-finance-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerHistoryPage() {
  await requireOwner();
  const items = getHistory(); // swap for your DB / API call

  return (
    <SuperAdminShell active="Fund History">
      <HistoryView items={items} />
    </SuperAdminShell>
  );
}
