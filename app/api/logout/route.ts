import { NextRequest, NextResponse } from "next/server";
import { hash, supabase, q } from "@/lib/auth/backend";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  
  if (token) {
    // Revoke session in DB
    await supabase(`auth_sessions?token_hash=eq.${q(hash(token))}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    }).catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("auth_session");
  res.cookies.delete("pending_2fa");
  return res;
}
