// app/api/owner/admins/[id]/impersonate/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/require-owner";
import { getAdminByPublicId, logImpersonation } from "@/lib/admin-data";
import { createSession, findUserById } from "@/lib/auth/backend";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;

  const target = await getAdminByPublicId(id);
  if (!target || target.status !== "active") {
    return NextResponse.json({ error: "Not an active admin" }, { status: 400 });
  }

  // Audit trail: who impersonated whom, when.
  await logImpersonation(owner.id, target.id);

  const admin = await findUserById(target.id);
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  const res = await createSession(admin, false);
  res.cookies.set("impersonating_admin_id", target.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60 * 60,
  });
  return res;
}
