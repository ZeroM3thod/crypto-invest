// lib/auth/session.ts
// Server-side session helpers for the admin panel.
import { cookies } from "next/headers";

export type SessionUser = { id: string; role: string };

/**
 * Resolve the signed-in user on the server.
 * TODO: replace the placeholder with your real session lookup (JWT / session table).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // No auth layer exists in this repo yet — see lib/auth/require-owner.ts.
  return { id: "OWNER-001", role: "owner" };
}

/**
 * The admin the current request should act as.
 *
 * While the owner is impersonating, `impersonating_admin_id` names the admin.
 * The cookie only counts if the real session is the owner, so a forged cookie
 * does nothing once getSessionUser() is wired to real sessions.
 */
export async function getEffectiveAdminId(): Promise<{
  id: string | undefined;
  impersonating: boolean;
}> {
  const session = await getSessionUser();
  const imp = (await cookies()).get("impersonating_admin_id")?.value;
  if (imp && session?.role === "owner") return { id: imp, impersonating: true };
  return { id: session?.id, impersonating: false };
}

/** True while the owner has an active admin-impersonation cookie. */
export async function isImpersonating(): Promise<boolean> {
  return (await cookies()).has("impersonating_admin_id");
}
