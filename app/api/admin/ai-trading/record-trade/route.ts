import { NextRequest } from "next/server";
import { bad, getSession, supabase } from "@/lib/auth/backend";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return bad("Forbidden", 403);
  }

  const body = await req.json().catch(() => null);
  const { investment_id, trade_size, duration_minutes, pnl } = body;

  // Call DB function to record trade
  await supabase("rpc/record_ai_trade", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      p_investment_id: investment_id,
      p_trade_size: trade_size,
      p_duration_minutes: duration_minutes,
      p_pnl: pnl,
    }),
  });

  return Response.json({ success: true });
}
