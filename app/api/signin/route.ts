import { NextRequest } from "next/server";
import {
  assertRateLimit,
  bad,
  createSession,
  createPending2fa,
  findUserByIdentifier,
  getDevice,
  setDeviceCookie,
  verifyPassword,
} from "@/lib/auth/backend";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const device = getDevice(req);

  try {
    await assertRateLimit(req, "signin", device.id);
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const user = await findUserByIdentifier(identifier);
    if (!user || user.status !== "active" || !verifyPassword(password, user.password_hash)) {
      return setDeviceCookie(bad("Invalid email/user ID or password.", 401), device.id);
    }
    if (user.two_fa_enabled && user.two_fa_secret) {
      return setDeviceCookie(createPending2fa(user, Boolean(body?.remember)), device.id);
    }
    return setDeviceCookie(await createSession(user, Boolean(body?.remember)), device.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed.";
    return setDeviceCookie(bad(message, message.startsWith("Too many") ? 429 : 500), device.id);
  }
}
