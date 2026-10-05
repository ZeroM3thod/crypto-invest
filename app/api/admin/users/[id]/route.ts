// app/api/admin/users/[id]/route.ts
// Admin-scoped user updates. Admins may edit profile/KYC/status data, but
// wallet balances, transactions and wallet addresses stay owner-only:
// lib/auth/require-admin.ts + this 403 are the server-side enforcement.
import { adminUnauthorized, getAdminOrNull } from "@/lib/auth/require-admin";
import { getUser } from "@/lib/users-data";

/** Fields only the owner may change. */
const OWNER_ONLY_FIELDS = ["wallets", "walletAddress"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminOrNull();
  if (!session) return adminUnauthorized();

  const { id } = await params;
  const stored = getUser(id);
  if (!stored) return Response.json({ error: "User not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ownerOnly = OWNER_ONLY_FIELDS.filter(
    (field) =>
      field in body &&
      JSON.stringify(body[field]) !== JSON.stringify(stored[field as keyof typeof stored]),
  );
  if (ownerOnly.length > 0) {
    return Response.json(
      { error: `Owner-only change rejected: ${ownerOnly.join(", ")}` },
      { status: 403 },
    );
  }

  // 1. validate the remaining fields (e.g. with zod), never trust the client
  // 2. update the DB, write an audit-log row
  return Response.json({ ok: true, id, updatedBy: session.id });
}
