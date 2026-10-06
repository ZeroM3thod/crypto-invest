// app/(superadmin)/owner/users/kyc/page.tsx
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { KycView } from "@/app/(admin)/_components/kyc-view";
import { getKycData } from "@/lib/admin-kyc-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerKycPage() {
  await requireOwner();
  const applications = getKycData(); // swap for your own data source

  return (
    <SuperAdminShell active="KYC Requests">
      <KycView initial={applications} />
    </SuperAdminShell>
  );
}
