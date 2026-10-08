import { NextRequest } from "next/server";
import { bad, getSession, supabase, q } from "@/lib/auth/backend";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return bad("Forbidden", 403);
  }

  const investments = await supabase<any[]>(
    `ai_trading_investments?select=*,user:auth_users(first_name,last_name,email)&order=created_at.desc`
  );

  return Response.json({ investments });
}
