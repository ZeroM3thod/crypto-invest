import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Replace with real credential check.
  if (body.email?.toLowerCase() !== "demo@example.com" || body.password !== "password123") {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
