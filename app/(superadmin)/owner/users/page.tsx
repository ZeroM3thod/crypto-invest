// app/(superadmin)/owner/users/page.tsx
// TODO: add your owner auth guard here (server-side).
import { SuperAdminShell } from "../../_components/super-admin-shell";
import { UsersManagement } from "../../_components/users-management";
import { getUsers, toRow } from "@/lib/users-data";

export default function UsersPage() {
  const rows = getUsers().map(toRow);
  return (
    <SuperAdminShell active="All Users">
      <UsersManagement rows={rows} />
    </SuperAdminShell>
  );
}
