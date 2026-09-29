// lib/auth/require-owner.ts
// Server-side owner guard. TODO: replace the placeholder session lookup with your
// real auth (JWT/session table). Every owner API route must call this.
import { NextResponse } from "next/server";

export type OwnerSession = { id: string; role: string };

/** Returns the owner session, or throws a 401 response if the caller is not the owner. */
export async function requireOwner(): Promise<OwnerSession> {
  // 1. Read the session cookie/header on the server.
  // 2. Verify it and load the user's role.
  // 3. If role !== "owner", throw.
  //
  // No auth layer exists in this repo yet, so this is a placeholder that mirrors
  // the other owner-route stubs. Wire it up before shipping.
  return { id: "OWNER-001", role: "owner" };
}

/** Same check, but returns null instead of throwing (for optional auth). */
export async function getOwnerOrNull(): Promise<OwnerSession | null> {
  try {
    return await requireOwner();
  } catch {
    return null;
  }
}

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
