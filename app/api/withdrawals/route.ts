import { NextRequest } from "next/server";
import { bad, getSession } from "@/lib/auth/backend";
import { mockDb } from "@/lib/db/mock-db";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const amount = parseFloat(body?.amount) || 0;
  const coin = String(body?.coin || "").trim();
  const network = String(body?.network || "").trim();
  const walletAddress = String(body?.walletAddress || "").trim();

  if (amount < 10) return bad("Minimum withdrawal amount is $10");
  if (!coin || !["USDT", "USDC"].includes(coin)) return bad("Invalid coin");
  if (!network || !["BEP20", "Aptos"].includes(network)) return bad("Invalid network");
  if (!walletAddress || walletAddress.length < 20) return bad("Valid wallet address required");

  const result = mockDb.createWithdrawal({
    userId: session.user.id,
    coin: coin as "USDT" | "USDC",
    network: network as "BEP20" | "Aptos",
    amount,
    walletAddress,
  });

  if (!result.success) {
    return bad(result.error || "Withdrawal failed");
  }

  return Response.json({ success: true, withdrawal: result.withdrawal });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const withdrawals = mockDb.getUserWithdrawals(session.user.id);

  return Response.json({
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      date: w.created_at.split("T")[0],
      amount: w.amount,
      fee: w.fee_amount,
      receive: w.net_payout,
      coin: w.coin,
      network: w.network_code,
      wallet: w.wallet_address,
      status: w.status,
      reason: w.rejection_reason || "",
    })),
  });
}
