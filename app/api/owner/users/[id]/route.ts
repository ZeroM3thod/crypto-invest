// app/api/owner/users/[id]/route.ts
import { requireOwner } from "@/lib/auth/require-owner";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. verify the caller is the owner (session/role check)
  await requireOwner();
  // 2. validate the body (e.g. with zod), never trust the client
  // 3. update the DB, write an audit-log row
  return Response.json({ ok: true });
}
