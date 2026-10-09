import { NextRequest } from "next/server";
import { bad, getSession } from "@/lib/auth/backend";
import { mockDb } from "@/lib/db/mock-db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  // Fetch all deposits with user information from database
  const deposits = mockDb.getAllDeposits();

  return Response.json({
    deposits: deposits.map((d) => {
      const user = mockDb.getUserById(d.user_id) || {
        user_id: "N/A",
        first_name: "Unknown",
        last_name: "User",
        email: "N/A",
      };
      return {
        id: d.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        username: user.email,
        userId: user.user_id,
        coin: d.coin,
        amount: d.amount,
        network: d.network_code === "Polygon_POS" ? "Polygon POS" : d.network_code,
        hash: d.transaction_hash || "",
        date: d.created_at.split("T")[0],
        reason: d.rejection_reason || "",
        status: d.status,
      };
    }),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const depositId = String(body?.depositId || "").trim();
  const action = String(body?.action || "").trim();
  const reason = String(body?.reason || "").trim();

  if (!depositId) return bad("depositId required");
  if (!["approve", "reject"].includes(action)) return bad("Invalid action");

  if (action === "approve") {
    const success = mockDb.approveDeposit(depositId, session.user.id);
    if (!success) return bad("Deposit not found or not in pending state");
  } else {
    if (!reason || reason.length < 5) return bad("Rejection reason required (min 5 chars)");
    const success = mockDb.rejectDeposit(depositId, session.user.id, reason);
    if (!success) return bad("Deposit not found or not in pending state");
  }

  return Response.json({ success: true });
}

// Owner can update deposit details
export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const depositId = String(body?.depositId || "").trim();
  const coin = String(body?.coin || "").trim();
  const network = String(body?.network || "").trim();
  const amount = parseFloat(body?.amount) || 0;
  const transactionHash = String(body?.transactionHash || "").trim();

  if (!depositId) return bad("depositId required");
  if (!coin || !["USDT", "USDC"].includes(coin)) return bad("Invalid coin");
  if (!network) return bad("Invalid network");
  if (amount <= 0) return bad("Amount must be greater than 0");
  if (!transactionHash) return bad("Transaction hash required");

  const success = mockDb.updateDeposit(depositId, {
    coin: coin as "USDT" | "USDC",
    network: (network === "Polygon POS" ? "Polygon_POS" : network) as any,
    amount,
    transactionHash,
  });

  if (!success) return bad("Deposit record not found");

  return Response.json({ success: true });
}
