// app/api/owner/admins/[id]/impersonate/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireOwner } from "@/lib/auth/require-owner";
import { getAdminById, logImpersonation } from "@/lib/admin-data";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;

  const target = getAdminById(id);
  if (!target || target.status !== "active") {
    return NextResponse.json({ error: "Not an active admin" }, { status: 400 });
  }

  // Audit trail: who impersonated whom, when.
  logImpersonation(owner.id, id);

  (await cookies()).set("impersonating_admin_id", id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true });
}
