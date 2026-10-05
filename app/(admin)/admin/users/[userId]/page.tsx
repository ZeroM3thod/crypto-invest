// app/(admin)/admin/users/[userId]/page.tsx
// Access route: /admin/users/:userId
import { notFound } from "next/navigation";
import { AdminShell } from "../../../_components/admin-shell";
import { UserDetail } from "../../../_components/user-detail";
import { getUser } from "@/lib/users-data";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const user = getUser(userId);
  if (!user) notFound();

  return (
    <AdminShell active="All Users">
      <UserDetail initialUser={user} />
    </AdminShell>
  );
}
