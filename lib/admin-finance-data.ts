// lib/admin-finance-data.ts
// Real transactions from database (deposits & withdrawals). Trade-related logic removed.
import { mockDb } from "@/lib/db/mock-db";

export type HistoryStatus = "completed" | "pending" | "failed";

export type HistoryType = "Deposit" | "Withdraw";

export type HistoryItem = {
  id: string;
  user: string;
  email: string;
  userId?: string;
  type: HistoryType;
  amount: number;
  fee: number;
  status: HistoryStatus;
  date: string;
};

export function getHistory(): HistoryItem[] {
  return mockDb.getHistoryItems() as HistoryItem[];
}

export function getSendMoneyFees(): number {
  return mockDb.getTotalSendFees();
}

