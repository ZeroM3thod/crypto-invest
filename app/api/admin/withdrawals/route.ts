import { NextRequest } from "next/server";
import { bad, getSession } from "@/lib/auth/backend";
import { mockDb } from "@/lib/db/mock-db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  // Fetch all withdrawals with user information from database
  const withdrawals = mockDb.getAllWithdrawals();

  return Response.json({
    withdrawals: withdrawals.map((w) => {
      const user = mockDb.getUserById(w.user_id) || {
        user_id: "N/A",
        first_name: "Unknown",
        last_name: "User",
        email: "N/A",
      };
      return {
        id: w.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        username: user.email,
        userId: user.user_id,
        coin: w.coin,
        amount: w.amount,
        fee: w.fee_amount,
        network: w.network_code,
        address: w.wallet_address,
        date: w.created_at.split("T")[0],
        reason: w.rejection_reason || "",
        status: w.status,
      };
    }),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const withdrawalId = String(body?.withdrawalId || "").trim();
  const action = String(body?.action || "").trim();
  const reason = String(body?.reason || "").trim();

  if (!withdrawalId) return bad("withdrawalId required");
  if (!["approve", "reject"].includes(action)) return bad("Invalid action");

  if (action === "approve") {
    const success = mockDb.approveWithdrawal(withdrawalId, session.user.id);
    if (!success) return bad("Withdrawal not found or not in pending state");
  } else {
    if (!reason || reason.length < 5) return bad("Rejection reason required (min 5 chars)");
    const success = mockDb.rejectWithdrawal(withdrawalId, session.user.id, reason);
    if (!success) return bad("Withdrawal not found or not in pending state");
  }

  return Response.json({ success: true });
}

// Owner can update withdrawal details
export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const withdrawalId = String(body?.withdrawalId || "").trim();
  const coin = String(body?.coin || "").trim();
  const network = String(body?.network || "").trim();
  const amount = parseFloat(body?.amount) || 0;
  const walletAddress = String(body?.walletAddress || "").trim();
  const date = String(body?.date || "").trim();

  if (!withdrawalId) return bad("withdrawalId required");
  if (!coin || !["USDT", "USDC"].includes(coin)) return bad("Invalid coin");
  if (!network) return bad("Invalid network");
  if (amount <= 0) return bad("Amount must be greater than 0");
  if (!walletAddress) return bad("Wallet address required");

  const success = mockDb.updateWithdrawal(withdrawalId, {
    coin: coin as "USDT" | "USDC",
    network: network as "BEP20" | "Aptos",
    amount,
    walletAddress,
    date,
  });

  if (!success) return bad("Withdrawal record not found");

  return Response.json({ success: true });
}
