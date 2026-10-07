import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Redirect /join?ref=CODE to /signup?ref=CODE
  if (pathname === "/join") {
    const ref = searchParams.get("ref");
    const signupUrl = new URL("/signup", req.url);
    if (ref) {
      signupUrl.searchParams.set("ref", ref);
    }
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/join"],
};
