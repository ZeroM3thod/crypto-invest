// app/(superadmin)/owner/admin-management/page.tsx
// Owner-only area.
import { AdminManagement } from "../../_components/admin-management";
import { SuperAdminShell } from "../../_components/super-admin-shell";
import { requireOwner } from "@/lib/auth/require-owner";
import { getAdmins, getManagedUsers } from "@/lib/admin-data";

export default async function AdminManagementPage() {
  await requireOwner();
  const admins = getAdmins();
  const users = getManagedUsers();

  return (
    <SuperAdminShell active="Admin Management">
      <AdminManagement admins={admins} users={users} />
    </SuperAdminShell>
  );
}
