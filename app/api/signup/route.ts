import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Replace with real validation + DB insert.
  if (body.email?.toLowerCase().startsWith("taken@")) {
    return NextResponse.json(
      { message: "That email is already registered." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
