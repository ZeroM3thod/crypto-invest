// app/api/owner/users/visibility/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/require-owner";
import { getManagedUsers, setUserHidden } from "@/lib/admin-data";

export async function PATCH(req: Request) {
  await requireOwner();

  const { userIds, hidden } = await req.json();
  if (
    !Array.isArray(userIds) ||
    userIds.length === 0 ||
    userIds.length > 500 ||
    !userIds.every((id) => typeof id === "string") ||
    typeof hidden !== "boolean"
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const known = new Set(getManagedUsers().map((u) => u.id));
  const unknown = userIds.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Unknown user id(s): ${unknown.slice(0, 5).join(", ")}` },
      { status: 400 },
    );
  }

  // TODO: single DB transaction — update profiles.hidden_from_admins for userIds,
  // then write an audit-log row (owner, action, before/after).
  setUserHidden(userIds, hidden);

  return NextResponse.json({ ok: true });
}
