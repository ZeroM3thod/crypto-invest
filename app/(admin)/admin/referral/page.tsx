// app/(admin)/admin/referral/page.tsx
// Access route: /admin/referral
import { AdminShell } from "../../_components/admin-shell";
import { ReferralManagement } from "../../_components/referral-management";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminReferralPage() {
  await requireAdmin();

  return (
    <AdminShell active="Basic Management">
      <ReferralManagement view="basic" />
    </AdminShell>
  );
}
