// app/(admin)/admin/referral/leaderboard/page.tsx
// Access route: /admin/referral/leaderboard
import { AdminShell } from "../../../_components/admin-shell";
import { ReferralManagement } from "../../../_components/referral-management";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminReferralLeaderboardPage() {
  await requireAdmin();

  return (
    <AdminShell active="Leaderboard Management">
      <ReferralManagement view="leaderboard" />
    </AdminShell>
  );
}
