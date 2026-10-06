// app/(superadmin)/owner/users/page.tsx
import { SuperAdminShell } from "../../_components/super-admin-shell";
import { UsersManagement } from "../../_components/users-management";
import { getUsers, toRow } from "@/lib/users-data";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function OwnerUsersPage() {
  await requireOwner();
  const rows = getUsers().map(toRow);

  return (
    <SuperAdminShell active="All Users">
      <UsersManagement rows={rows} />
    </SuperAdminShell>
  );
}
