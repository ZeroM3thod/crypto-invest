// app/api/admin/users/[id]/route.ts
// Admin-scoped user updates. Admins may edit profile/KYC/status data and set
// the balances of the Main + Investment wallets (every balance change is
// audited: admin id, old value, new value). All other money fields — other
// wallets, transactions, locked balances, wallet addresses — stay owner-only:
// lib/auth/require-admin.ts + the 403s below are the server-side enforcement.
// `rewards` is ignored here: rewards are created only through
// POST /api/admin/users/[id]/rewards so they cannot be double-credited.
import { adminUnauthorized, getAdminOrNull } from "@/lib/auth/require-admin";
import { logBalanceChange } from "@/lib/admin-data";
import { getUser, type WalletKey } from "@/lib/users-data";

/** Fields only the owner may change. */
const OWNER_ONLY_FIELDS = ["walletAddress"] as const;

/** The only wallet balances an admin may set. */
const ADMIN_BALANCE_WALLETS: readonly WalletKey[] = ["main", "investment"];

/** Top-level fields an admin may update. Identity (`id`), `walletAddress`,
 *  `rewards` and the rest of `wallets` are handled separately. */
const ADMIN_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "joinedAt",
  "dob",
  "country",
  "referredBy",
  "twoFA",
  "status",
  "kyc",
  "referrals",
  "investments",
  "aiStrategies",
  "manualTrades",
  "logins",
  "dailyProfits",
  "aiTrades",
] as const;

const err = (error: string, status: number) => Response.json({ error }, { status });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminOrNull();
  if (!session) return adminUnauthorized();

  const { id } = await params;
  const stored = getUser(id);
  if (!stored) return err("User not found", 404);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return err("Invalid JSON body", 400);

  // 1. identity is immutable (rows are keyed by it)
  if ("id" in body && body.id !== stored.id) return err("User id cannot be changed", 400);

  // rewards only exist through POST .../rewards — never applied here
  delete body.rewards;

  // 2. owner-only fields
  const ownerOnly = OWNER_ONLY_FIELDS.filter(
    (field) =>
      field in body &&
      JSON.stringify(body[field]) !== JSON.stringify(stored[field as keyof typeof stored]),
  );
  if (ownerOnly.length > 0) {
    return err(`Owner-only change rejected: ${ownerOnly.join(", ")}`, 403);
  }

  // 3. wallets: only main/investment `balance` may change for an admin,
  //    and only with a sane number. Everything else is owner-only.
  const balanceChanges: { wallet: WalletKey; from: number; to: number }[] = [];
  if ("wallets" in body) {
    const wallets = body.wallets;
    if (!wallets || typeof wallets !== "object" || Array.isArray(wallets)) {
      return err("Invalid wallets payload", 400);
    }
    for (const [key, sent] of Object.entries(wallets as Record<string, unknown>)) {
      const current = stored.wallets[key as WalletKey];
      if (!current) return err(`Unknown wallet: ${key}`, 400);
      if (!sent || typeof sent !== "object" || Array.isArray(sent)) {
        return err(`Invalid wallet payload: ${key}`, 400);
      }

      const adminMaySet = ADMIN_BALANCE_WALLETS.includes(key as WalletKey);
      for (const [field, value] of Object.entries(sent as Record<string, unknown>)) {
        if (JSON.stringify(value) === JSON.stringify((current as Record<string, unknown>)[field])) {
          continue; // unchanged
        }
        if (adminMaySet && field === "balance") continue; // validated below
        return err(`Owner-only change rejected: wallets.${key}.${field}`, 403);
      }

      if (!adminMaySet || !("balance" in (sent as Record<string, unknown>))) continue;
      const balance = (sent as { balance: unknown }).balance;
      if (typeof balance !== "number" || !Number.isFinite(balance) || balance < 0) {
        return err(`wallets.${key}.balance must be a number >= 0`, 400);
      }
      if (balance !== current.balance) {
        balanceChanges.push({ wallet: key as WalletKey, from: current.balance, to: balance });
      }
    }
  }

  // 4. validate the admin-editable fields, then apply them
  const updates: [field: string, value: unknown][] = [];
  for (const field of ADMIN_FIELDS) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value === undefined) continue;
    if (field === "status" && value !== "active" && value !== "suspended") {
      return err("Invalid status: expected active | suspended", 400);
    }
    if (field === "twoFA" && typeof value !== "boolean") {
      return err("Invalid twoFA: expected boolean", 400);
    }
    if (field === "kyc" && (!value || typeof value !== "object" || Array.isArray(value))) {
      return err("Invalid kyc payload", 400);
    }
    updates.push([field, value]);
  }

  const target = stored as unknown as Record<string, unknown>;
  for (const [field, value] of updates) target[field] = value;
  for (const change of balanceChanges) {
    stored.wallets[change.wallet].balance = change.to;
    // audit trail: who changed it, and from which value to which value
    logBalanceChange({
      adminId: session.id,
      userId: id,
      wallet: change.wallet,
      from: change.from,
      to: change.to,
    });
  }

  return Response.json({ ok: true, id, updatedBy: session.id });
}
