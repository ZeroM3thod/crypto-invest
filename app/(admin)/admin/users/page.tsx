// app/(admin)/admin/users/page.tsx
// Access route: /admin/users
import { AdminShell } from "../../_components/admin-shell";
import { UsersManagement } from "../../_components/users-management";
import { getUsers, toRow } from "@/lib/users-data";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminUsersPage() {
  await requireAdmin();
  const rows = getUsers().map(toRow);

  return (
    <AdminShell active="All Users">
      <UsersManagement rows={rows} />
    </AdminShell>
  );
}
