// app/(superadmin)/owner/users/[userId]/page.tsx
// TODO: add your owner auth guard here (server-side).
import { notFound } from "next/navigation";
import { SuperAdminShell } from "../../../_components/super-admin-shell";
import { UserDetail } from "../../../_components/user-detail";
import { getUser } from "@/lib/users-data";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params; // Next 15. On Next 14 use: params.userId directly
  const user = getUser(userId);
  if (!user) notFound();

  return (
    <SuperAdminShell active="All Users">
      <UserDetail initialUser={user} />
    </SuperAdminShell>
  );
}
