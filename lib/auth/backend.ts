import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const OTP_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

type Dob = { month?: string; day?: string; year?: string };
type DbUser = {
  id: string;
  email: string;
  user_id: string | null;
  password_hash: string;
  status: "pending" | "active";
  role?: string;
};
type OtpPurpose = "signup" | "password_reset";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function supabaseHeaders(extra?: HeadersInit) {
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function supabase<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: supabaseHeaders(init.headers),
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

function q(value: string) {
  return encodeURIComponent(value);
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function getDevice(req: NextRequest) {
  const existing = req.cookies.get("auth_device_id")?.value;
  return { id: existing || randomBytes(16).toString("hex"), isNew: !existing };
}

export function setDeviceCookie(res: NextResponse, deviceId: string) {
  res.cookies.set("auth_device_id", deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}

export async function assertRateLimit(req: NextRequest, action: string, deviceId: string) {
  const since = new Date(Date.now() - TWELVE_HOURS_MS).toISOString();
  const ipHash = hash(getIp(req));
  const deviceHash = hash(deviceId || req.headers.get("user-agent") || "unknown");
  const [ipRows, deviceRows] = await Promise.all([
    supabase<{ id: string }[]>(`auth_attempts?select=id&action=eq.${q(action)}&ip_hash=eq.${q(ipHash)}&created_at=gte.${q(since)}`),
    supabase<{ id: string }[]>(`auth_attempts?select=id&action=eq.${q(action)}&device_hash=eq.${q(deviceHash)}&created_at=gte.${q(since)}`),
  ]);
  if (ipRows.length >= 5 || deviceRows.length >= 5) {
    throw new Error("Too many attempts. Please try again after 12 hours.");
  }
  await supabase("auth_attempts", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ action, ip_hash: ipHash, device_hash: deviceHash }),
  });
  return { ipHash, deviceHash };
}

export function validatePhone(phone: string) {
  return PHONE_PATTERN.test(phone.replace(/[\s-]/g, ""));
}

export function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"));
  const expected = Buffer.from(key);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function otpHash(email: string, code: string, purpose: OtpPurpose) {
  return hash(`${email}:${purpose}:${code}:${process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`);
}

function code6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(email: string, code: string, purpose: OtpPurpose) {
  const subject = purpose === "signup" ? "Confirm your account" : "Reset your password";
  const text = `Your ${subject.toLowerCase()} code is ${code}. It expires in 15 minutes.`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (apiKey && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: email, subject, text }),
    });
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth:${purpose}] ${email} code: ${code}`);
        return;
      }
      throw new Error(await res.text());
    }
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Email provider is not configured.");
  console.info(`[auth:${purpose}] ${email} code: ${code}`);
}

export async function createOtp(userId: string, email: string, purpose: OtpPurpose) {
  const code = code6();
  await supabase("auth_otps", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      purpose,
      code_hash: otpHash(email, code, purpose),
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    }),
  });
  await sendOtp(email, code, purpose);
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose, consume = true) {
  const users = await supabase<DbUser[]>(`auth_users?select=*&email=eq.${q(email)}&limit=1`);
  const user = users[0];
  if (!user) return null;
  const rows = await supabase<{ id: string; expires_at: string }[]>(
    `auth_otps?select=id,expires_at&user_id=eq.${q(user.id)}&purpose=eq.${q(purpose)}&code_hash=eq.${q(otpHash(email, code, purpose))}&consumed_at=is.null&order=created_at.desc&limit=1`,
  );
  const otp = rows[0];
  if (!otp || new Date(otp.expires_at).getTime() < Date.now()) return null;
  if (consume) {
    await supabase(`auth_otps?id=eq.${q(otp.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ consumed_at: new Date().toISOString() }),
    });
  }
  return user;
}

async function userIdExists(userId: string) {
  const rows = await supabase<{ id: string }[]>(`auth_users?select=id&user_id=eq.${q(userId)}&limit=1`);
  return rows.length > 0;
}

export async function generateUserId() {
  for (let i = 0; i < 20; i++) {
    const userId = String(Math.floor(100000 + Math.random() * 900000));
    if (!(await userIdExists(userId))) return userId;
  }
  throw new Error("Could not generate user ID.");
}

export async function findUserByEmail(email: string) {
  const rows = await supabase<DbUser[]>(`auth_users?select=*&email=eq.${q(email)}&limit=1`);
  return rows[0] || null;
}

export async function deleteExpiredPendingUsers() {
  const cutoff = new Date(Date.now() - OTP_TTL_MS).toISOString();
  await supabase(`auth_users?status=eq.pending&created_at=lt.${q(cutoff)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function findUserByIdentifier(identifier: string) {
  const column = /^\d{6}$/.test(identifier) ? "user_id" : "email";
  const rows = await supabase<DbUser[]>(`auth_users?select=*&${column}=eq.${q(identifier.toLowerCase())}&limit=1`);
  return rows[0] || null;
}

export async function createPendingUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  country: string;
  dob: Dob;
  referral: string;
  password: string;
  ipHash: string;
  deviceHash: string;
}) {
  const body = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email,
    phone: input.mobile.trim(),
    country: input.country.trim(),
    dob_month: input.dob.month || null,
    dob_day: input.dob.day || null,
    dob_year: input.dob.year || null,
    dob_raw: input.dob,
    referral_code: input.referral.trim() || null,
    password_hash: passwordHash(input.password),
    created_ip_hash: input.ipHash,
    created_device_hash: input.deviceHash,
    status: "pending",
  };
  const rows = await supabase<DbUser[]>("auth_users", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return rows[0];
}

export async function updateUser(id: string, body: Record<string, unknown>) {
  const rows = await supabase<DbUser[]>(`auth_users?id=eq.${q(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return rows[0];
}

export async function createSession(user: DbUser, remember: boolean) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (remember ? SESSION_TTL_MS : 24 * 60 * 60 * 1000)).toISOString();
  await supabase("auth_sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: user.id, token_hash: hash(token), expires_at: expiresAt }),
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? SESSION_TTL_MS / 1000 : 24 * 60 * 60,
    path: "/",
  });
  return res;
}

export async function getSessionTokenUser(token: string) {
  const rows = await supabase<{ user_id: string; expires_at: string; auth_users: DbUser }[]>(
    `auth_sessions?select=user_id,expires_at,auth_users(*)&token_hash=eq.${q(hash(token))}&revoked_at=is.null&limit=1`,
  );
  const session = rows[0];
  if (!session || new Date(session.expires_at).getTime() < Date.now()) return null;
  return session.auth_users;
}
