import { NextRequest } from "next/server";
import { bad, getSession } from "@/lib/auth/backend";
import { mockDb } from "@/lib/db/mock-db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const mainBalance = mockDb.getMainBalance(session.user.id);

  return Response.json({
    mainBalance,
  });
}
