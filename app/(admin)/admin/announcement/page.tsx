// app/(admin)/admin/announcement/page.tsx
// Access route: /admin/announcement
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { AnnouncementView } from "../../_components/announcement-view";
import { getAnnouncements } from "@/lib/admin-announcement-data";

export default async function AdminAnnouncementPage() {
  const announcements = getAnnouncements(); // swap for your own data source

  return (
    <AdminShell active="Announcements">
      <AnnouncementView initial={announcements} />
    </AdminShell>
  );
}
