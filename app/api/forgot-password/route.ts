import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Replace with real lookup (find user by email + send OTP via email/SMS).
  if (body.email?.toLowerCase() !== "demo@example.com") {
    return NextResponse.json(
      { message: "We couldn't find an account with that email." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}