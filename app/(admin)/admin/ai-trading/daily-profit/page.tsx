// app/(admin)/admin/ai-trading/daily-profit/page.tsx
// Route: /admin/ai-trading/daily-profit
// TODO: admin-only guard here (middleware + this handler) -> 403 for any other role.
import { AdminShell } from "../../../_components/admin-shell";
import { DailyProfitView } from "../../../_components/daily-profit-view";

export default async function AdminDailyProfitPage() {
  return (
    <AdminShell active="AI Trading">
      <DailyProfitView />
    </AdminShell>
  );
}
