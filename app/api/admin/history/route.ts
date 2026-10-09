// app/api/admin/history/route.ts
import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";

export async function GET() {
  const items = mockDb.getHistoryItems();
  const fees = mockDb.getTotalSendFees();
  return NextResponse.json({
    items,
    fees,
  });
}
