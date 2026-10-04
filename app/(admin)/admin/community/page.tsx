// app/(admin)/admin/community/page.tsx
// Access route: /admin/community
// Add your admin auth guard here later.
import { AdminShell } from "../../_components/admin-shell";
import { CommunityChatView } from "../../_components/community-chat-view";
import {
  getChatUsers,
  getInitialBans,
  getInitialMessages,
  getSavedScripts,
  INITIAL_BLOCKED_WORDS,
  INITIAL_RULES,
} from "@/lib/admin-community-data";

export default async function AdminCommunityPage() {
  // swap these for your own data source
  return (
    <AdminShell active="Community">
      <CommunityChatView
        initialMessages={getInitialMessages()}
        users={getChatUsers()}
        initialBans={getInitialBans()}
        initialRules={INITIAL_RULES}
        initialBlockedWords={INITIAL_BLOCKED_WORDS}
        initialScripts={getSavedScripts()}
      />
    </AdminShell>
  );
}
