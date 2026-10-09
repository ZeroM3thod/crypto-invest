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
  const transactionHash = String(body?.transactionHash || "").trim();

  if (amount < 30) return bad("Minimum deposit amount is $30");
  if (!coin || !["USDT", "USDC"].includes(coin)) return bad("Invalid coin");
  if (!network || !["BEP20", "ERC20", "Aptos", "Polygon_POS", "Solana"].includes(network)) {
    return bad("Invalid network");
  }
  if (!transactionHash || transactionHash.length < 5) {
    return bad("Valid transaction hash required");
  }

  const deposit = mockDb.createDeposit({
    userId: session.user.id,
    coin: coin as "USDT" | "USDC",
    network: network as any,
    amount,
    transactionHash,
  });

  return Response.json({ success: true, deposit });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return bad("Unauthorized", 401);

  const deposits = mockDb.getUserDeposits(session.user.id);

  return Response.json({
    deposits: deposits.map((d) => ({
      id: d.id,
      date: d.created_at.split("T")[0],
      amount: d.amount,
      coin: d.coin,
      network: d.network_code === "Polygon_POS" ? "Polygon POS" : d.network_code,
      status: d.status,
      reason: d.rejection_reason || "",
      hash: d.transaction_hash,
    })),
  });
}
