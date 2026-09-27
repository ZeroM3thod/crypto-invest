import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  // Replace with real OTP verification (e.g. check against a stored code/expiry).
  if (code !== "123456") {
    return NextResponse.json({ message: "Invalid code." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
