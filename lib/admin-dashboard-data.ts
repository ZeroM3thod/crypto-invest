// lib/admin-dashboard-data.ts
export type Period = "today" | "7d" | "30d" | "all";

export type PeriodStats = {
  newUsers: number;
  deposit: number;
  withdraw: number;
  manualTradingProfit: number;
  sendMoneyFeeProfit: number;
  withdrawalFeeProfit: number;
  tradesCount: number;
  sendCount: number;
  withdrawCount: number;
};

export type TxnType = "Deposit" | "Withdraw" | "Send Money" | "Manual Trade";
export type TxnStatus = "completed" | "pending" | "failed";

export type Txn = {
  id: string;
  user: string;
  type: TxnType;
  amount: number;
  fee: number;
  status: TxnStatus;
  date: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  balance: number;
  status: "verified" | "pending" | "blocked";
  joined: string;
};

export type DashboardData = {
  totalUsers: number;
  activeUsers: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  totalDeposit: number;
  totalWithdraw: number;
  fundingAvailable: number;
  periods: Record<Period, PeriodStats>;
  transactions: Txn[];
  users: AdminUser[];
};

export function getDashboardData(): DashboardData {
  const periods: Record<Period, PeriodStats> = {
    today: {
      newUsers: 14,
      deposit: 8450,
      withdraw: 3120,
      manualTradingProfit: 640,
      sendMoneyFeeProfit: 96.5,
      withdrawalFeeProfit: 62.4,
      tradesCount: 38,
      sendCount: 112,
      withdrawCount: 41,
    },
    "7d": {
      newUsers: 96,
      deposit: 61200,
      withdraw: 24800,
      manualTradingProfit: 4720,
      sendMoneyFeeProfit: 702.3,
      withdrawalFeeProfit: 496,
      tradesCount: 264,
      sendCount: 801,
      withdrawCount: 298,
    },
    "30d": {
      newUsers: 412,
      deposit: 248900,
      withdraw: 101400,
      manualTradingProfit: 19350,
      sendMoneyFeeProfit: 2980.75,
      withdrawalFeeProfit: 2028,
      tradesCount: 1102,
      sendCount: 3390,
      withdrawCount: 1247,
    },
    all: {
      newUsers: 3860,
      deposit: 1284500,
      withdraw: 612300,
      manualTradingProfit: 96420,
      sendMoneyFeeProfit: 15210.4,
      withdrawalFeeProfit: 12246,
      tradesCount: 5480,
      sendCount: 17120,
      withdrawCount: 6310,
    },
  };

  const totalDeposit = periods.all.deposit;
  const totalWithdraw = periods.all.withdraw;

  return {
    totalUsers: 3860,
    activeUsers: 1245,
    pendingWithdrawals: 23,
    pendingKyc: 57,
    totalDeposit,
    totalWithdraw,
    fundingAvailable: totalDeposit - totalWithdraw,
    periods,
    transactions: [
      { id: "TX-10492", user: "Rahim Uddin", type: "Deposit", amount: 1200, fee: 0, status: "completed", date: "Oct 03, 2026" },
      { id: "TX-10491", user: "Sadia Akter", type: "Withdraw", amount: 450, fee: 9, status: "pending", date: "Oct 03, 2026" },
      { id: "TX-10490", user: "Tanvir Hasan", type: "Send Money", amount: 300, fee: 3, status: "completed", date: "Oct 03, 2026" },
      { id: "TX-10489", user: "Nusrat Jahan", type: "Manual Trade", amount: 2100, fee: 0, status: "completed", date: "Oct 02, 2026" },
      { id: "TX-10488", user: "Imran Khan", type: "Withdraw", amount: 800, fee: 16, status: "failed", date: "Oct 02, 2026" },
      { id: "TX-10487", user: "Mim Chowdhury", type: "Deposit", amount: 5000, fee: 0, status: "completed", date: "Oct 02, 2026" },
      { id: "TX-10486", user: "Arif Hossain", type: "Send Money", amount: 150, fee: 1.5, status: "completed", date: "Oct 01, 2026" },
      { id: "TX-10485", user: "Farhana Islam", type: "Withdraw", amount: 620, fee: 12.4, status: "completed", date: "Oct 01, 2026" },
    ],
    users: [
      { id: "U-3860", name: "Rahim Uddin", email: "rahim@example.com", balance: 1840.5, status: "verified", joined: "Oct 03, 2026" },
      { id: "U-3859", name: "Sadia Akter", email: "sadia@example.com", balance: 320, status: "pending", joined: "Oct 03, 2026" },
      { id: "U-3858", name: "Tanvir Hasan", email: "tanvir@example.com", balance: 90.25, status: "verified", joined: "Oct 02, 2026" },
      { id: "U-3857", name: "Nusrat Jahan", email: "nusrat@example.com", balance: 4210, status: "verified", joined: "Oct 02, 2026" },
      { id: "U-3856", name: "Imran Khan", email: "imran@example.com", balance: 0, status: "blocked", joined: "Oct 01, 2026" },
      { id: "U-3855", name: "Mim Chowdhury", email: "mim@example.com", balance: 5120, status: "verified", joined: "Oct 01, 2026" },
    ],
  };
}
