// app/(admin)/admin/kyc/page.tsx
// Access route: /admin/kyc
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { KycView } from "../../_components/kyc-view";
import { getKycData } from "@/lib/admin-kyc-data";

export default async function AdminKycPage() {
  const applications = getKycData(); // swap for your own data source

  return (
    <AdminShell active="KYC Requests">
      <KycView initial={applications} />
    </AdminShell>
  );
}
