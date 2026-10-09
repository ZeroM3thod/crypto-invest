// lib/db/mock-db.ts
// Robust in-memory database store for deposits, withdrawals, send transactions,
// wallet balances, and user records. Preserves real state across the application.

export type DbUser = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin" | "owner";
  wallet_address: string;
  main_balance: number;
  status: "active" | "pending";
};

export type DbDeposit = {
  id: string;
  user_id: string;
  coin: "USDT" | "USDC";
  network_code: "BEP20" | "ERC20" | "Aptos" | "Polygon_POS" | "Solana";
  amount: number;
  transaction_hash: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
};

export type DbWithdrawal = {
  id: string;
  user_id: string;
  coin: "USDT" | "USDC";
  network_code: "BEP20" | "Aptos";
  amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_payout: number;
  wallet_address: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
};

export type DbSendTransaction = {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  fee: number;
  total: number;
  note?: string;
  tx_hash: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
};

class MockDatabase {
  users: DbUser[] = [
    {
      id: "u-ava-001",
      user_id: "482109",
      email: "ava.thompson@example.com",
      first_name: "Ava",
      last_name: "Thompson",
      role: "user",
      wallet_address: "0x9F3a1C2b4E5d6F7a8B9c0D1e2F3a4B5c6D7e8F90",
      main_balance: 3450.00,
      status: "active",
    },
    {
      id: "u-usr-10234",
      user_id: "102345",
      email: "michael.chen@example.com",
      first_name: "Michael",
      last_name: "Chen",
      role: "user",
      wallet_address: "0xa73e4002d2bd14f11b6637934ca5ae9af7c7c0e7",
      main_balance: 1200.00,
      status: "active",
    },
    {
      id: "u-usr-20341",
      user_id: "203411",
      email: "sadia@example.com",
      first_name: "Sadia",
      last_name: "Akter",
      role: "user",
      wallet_address: "0x77ab901c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      main_balance: 850.00,
      status: "active",
    },
    {
      id: "ADM-001",
      user_id: "900001",
      email: "admin@example.com",
      first_name: "Sarah",
      last_name: "Khan",
      role: "admin",
      wallet_address: "0xAdminWallet00112233445566778899aabbccddeeff",
      main_balance: 50000.00,
      status: "active",
    },
    {
      id: "OWNER-001",
      user_id: "999999",
      email: "owner@example.com",
      first_name: "Platform",
      last_name: "Owner",
      role: "owner",
      wallet_address: "0xOwnerWallet112233445566778899aabbccddeeff00",
      main_balance: 100000.00,
      status: "active",
    },
  ];

  deposits: DbDeposit[] = [
    {
      id: "DEP-9C41A2",
      user_id: "u-ava-001",
      coin: "USDT",
      network_code: "BEP20",
      amount: 500,
      transaction_hash: "0x4f3a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      status: "approved",
      approved_by: "ADM-001",
      approved_at: "2026-10-06T14:30:00Z",
      created_at: "2026-10-06T14:22:00Z",
      updated_at: "2026-10-06T14:30:00Z",
    },
    {
      id: "DEP-B4E2F1",
      user_id: "u-usr-10234",
      coin: "USDC",
      network_code: "ERC20",
      amount: 250,
      transaction_hash: "0x8b2d3c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
      status: "pending",
      created_at: "2026-10-08T09:15:00Z",
      updated_at: "2026-10-08T09:15:00Z",
    },
    {
      id: "DEP-A1C3E5",
      user_id: "u-usr-20341",
      coin: "USDT",
      network_code: "BEP20",
      amount: 80,
      transaction_hash: "0x1c7e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      status: "rejected",
      rejection_reason: "Transaction hash could not be verified on-chain. Please check tx ID.",
      approved_by: "ADM-001",
      approved_at: "2026-10-07T11:20:00Z",
      created_at: "2026-10-07T11:05:00Z",
      updated_at: "2026-10-07T11:20:00Z",
    },
    {
      id: "DEP-F7D2B9",
      user_id: "u-ava-001",
      coin: "USDT",
      network_code: "Polygon_POS",
      amount: 1200,
      transaction_hash: "0x3e2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      status: "pending",
      created_at: "2026-10-08T18:40:00Z",
      updated_at: "2026-10-08T18:40:00Z",
    },
  ];

  withdrawals: DbWithdrawal[] = [
    {
      id: "WD-9F2A7C31",
      user_id: "u-ava-001",
      coin: "USDT",
      network_code: "BEP20",
      amount: 200,
      fee_percentage: 10,
      fee_amount: 20,
      net_payout: 180,
      wallet_address: "0xa73e4002d2bd14f11b6637934ca5ae9af7c7c0e7",
      status: "approved",
      approved_by: "ADM-001",
      approved_at: "2026-10-05T16:20:00Z",
      created_at: "2026-10-05T16:02:00Z",
      updated_at: "2026-10-05T16:20:00Z",
    },
    {
      id: "WD-4B8E1D02",
      user_id: "u-usr-10234",
      coin: "USDC",
      network_code: "Aptos",
      amount: 75,
      fee_percentage: 10,
      fee_amount: 7.5,
      net_payout: 67.5,
      wallet_address: "0x91cd22e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
      status: "pending",
      created_at: "2026-10-08T13:50:00Z",
      updated_at: "2026-10-08T13:50:00Z",
    },
    {
      id: "WD-1C5F9A44",
      user_id: "u-usr-20341",
      coin: "USDT",
      network_code: "BEP20",
      amount: 40,
      fee_percentage: 10,
      fee_amount: 4,
      net_payout: 36,
      wallet_address: "0x77ab901c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      status: "rejected",
      rejection_reason: "Wallet address did not match KYC verified profile records.",
      approved_by: "ADM-001",
      approved_at: "2026-10-06T10:45:00Z",
      created_at: "2026-10-06T10:18:00Z",
      updated_at: "2026-10-06T10:45:00Z",
    },
    {
      id: "WD-3E8A02F4",
      user_id: "u-ava-001",
      coin: "USDT",
      network_code: "BEP20",
      amount: 350,
      fee_percentage: 10,
      fee_amount: 35,
      net_payout: 315,
      wallet_address: "0x9F3a1C2b4E5d6F7a8B9c0D1e2F3a4B5c6D7e8F90",
      status: "pending",
      created_at: "2026-10-08T19:10:00Z",
      updated_at: "2026-10-08T19:10:00Z",
    },
  ];

  sendTransactions: DbSendTransaction[] = [
    {
      id: "SND-7A21F9",
      sender_id: "u-ava-001",
      recipient_id: "u-usr-10234",
      amount: 120,
      fee: 0.1,
      total: 120.1,
      note: "Project contribution",
      tx_hash: "0x7a21f9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
      status: "completed",
      created_at: "2026-10-07T12:41:00Z",
    },
    {
      id: "SND-3B88C0",
      sender_id: "u-usr-10234",
      recipient_id: "u-ava-001",
      amount: 45,
      fee: 0.1,
      total: 45.1,
      note: "Lunch split",
      tx_hash: "0x3b88c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
      status: "completed",
      created_at: "2026-10-07T18:20:00Z",
    },
    {
      id: "SND-2D19E4",
      sender_id: "u-usr-20341",
      recipient_id: "u-ava-001",
      amount: 200,
      fee: 0.1,
      total: 200.1,
      note: "Consulting fee",
      tx_hash: "0x2d19e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
      status: "completed",
      created_at: "2026-10-08T14:10:00Z",
    },
  ];

  // User queries
  getDefaultUser(): DbUser {
    return this.users[0]; // Ava Thompson
  }

  getOwnerUser(): DbUser {
    return this.users.find((u) => u.role === "owner") || this.users[4];
  }

  getAdminUser(): DbUser {
    return this.users.find((u) => u.role === "admin") || this.users[3];
  }

  getUserById(id: string): DbUser | undefined {
    return this.users.find((u) => u.id === id || u.user_id === id);
  }

  getUserByEmail(email: string): DbUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // Wallet
  getMainBalance(userId: string): number {
    const user = this.getUserById(userId);
    return user ? user.main_balance : 0;
  }

  adjustMainBalance(userId: string, delta: number): number {
    const user = this.getUserById(userId);
    if (user) {
      user.main_balance = +(user.main_balance + delta).toFixed(2);
      return user.main_balance;
    }
    return 0;
  }

  // Deposits
  getAllDeposits() {
    return [...this.deposits].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getUserDeposits(userId: string) {
    return this.deposits
      .filter((d) => d.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createDeposit(data: {
    userId: string;
    coin: "USDT" | "USDC";
    network: "BEP20" | "ERC20" | "Aptos" | "Polygon_POS" | "Solana";
    amount: number;
    transactionHash: string;
  }): DbDeposit {
    const id = `DEP-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
    const newDep: DbDeposit = {
      id,
      user_id: data.userId,
      coin: data.coin,
      network_code: data.network,
      amount: data.amount,
      transaction_hash: data.transactionHash,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.deposits.unshift(newDep);
    return newDep;
  }

  approveDeposit(depositId: string, adminId?: string): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== "pending") return false;
    dep.status = "approved";
    dep.approved_by = adminId || "ADM-001";
    dep.approved_at = new Date().toISOString();
    dep.updated_at = new Date().toISOString();

    // Credit user's main wallet balance
    this.adjustMainBalance(dep.user_id, dep.amount);
    return true;
  }

  rejectDeposit(depositId: string, adminId: string, reason: string): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== "pending") return false;
    dep.status = "rejected";
    dep.rejection_reason = reason;
    dep.approved_by = adminId || "ADM-001";
    dep.approved_at = new Date().toISOString();
    dep.updated_at = new Date().toISOString();
    return true;
  }

  updateDeposit(
    depositId: string,
    data: {
      coin?: "USDT" | "USDC";
      network?: "BEP20" | "ERC20" | "Aptos" | "Polygon_POS" | "Solana";
      amount?: number;
      transactionHash?: string;
    }
  ): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep) return false;
    if (data.coin) dep.coin = data.coin;
    if (data.network) dep.network_code = data.network;
    if (data.amount !== undefined && data.amount > 0) dep.amount = data.amount;
    if (data.transactionHash) dep.transaction_hash = data.transactionHash;
    dep.updated_at = new Date().toISOString();
    return true;
  }

  // Withdrawals
  getAllWithdrawals() {
    return [...this.withdrawals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getUserWithdrawals(userId: string) {
    return this.withdrawals
      .filter((w) => w.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createWithdrawal(data: {
    userId: string;
    coin: "USDT" | "USDC";
    network: "BEP20" | "Aptos";
    amount: number;
    walletAddress: string;
  }): { success: boolean; error?: string; withdrawal?: DbWithdrawal } {
    const user = this.getUserById(data.userId);
    if (!user) return { success: false, error: "User not found" };
    if (user.main_balance < data.amount) {
      return { success: false, error: `Insufficient balance. Available: $${user.main_balance.toFixed(2)}` };
    }

    const feeAmount = +(data.amount * 0.1).toFixed(2);
    const netPayout = +(data.amount - feeAmount).toFixed(2);
    const id = `WD-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    // Deduct immediately from main wallet
    this.adjustMainBalance(data.userId, -data.amount);

    const newWd: DbWithdrawal = {
      id,
      user_id: data.userId,
      coin: data.coin,
      network_code: data.network,
      amount: data.amount,
      fee_percentage: 10,
      fee_amount: feeAmount,
      net_payout: netPayout,
      wallet_address: data.walletAddress,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.withdrawals.unshift(newWd);
    return { success: true, withdrawal: newWd };
  }

  approveWithdrawal(withdrawalId: string, adminId?: string): boolean {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== "pending") return false;
    wd.status = "approved";
    wd.approved_by = adminId || "ADM-001";
    wd.approved_at = new Date().toISOString();
    wd.updated_at = new Date().toISOString();
    return true;
  }

  rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): boolean {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== "pending") return false;
    wd.status = "rejected";
    wd.rejection_reason = reason;
    wd.approved_by = adminId || "ADM-001";
    wd.approved_at = new Date().toISOString();
    wd.updated_at = new Date().toISOString();

    // Refund amount back to user's main wallet!
    this.adjustMainBalance(wd.user_id, wd.amount);
    return true;
  }

  updateWithdrawal(
    withdrawalId: string,
    data: {
      coin?: "USDT" | "USDC";
      network?: "BEP20" | "Aptos";
      amount?: number;
      walletAddress?: string;
      date?: string;
    }
  ): boolean {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd) return false;
    if (data.coin) wd.coin = data.coin;
    if (data.network) wd.network_code = data.network;
    if (data.amount !== undefined && data.amount > 0) {
      wd.amount = data.amount;
      wd.fee_amount = +(data.amount * 0.1).toFixed(2);
      wd.net_payout = +(data.amount - wd.fee_amount).toFixed(2);
    }
    if (data.walletAddress) wd.wallet_address = data.walletAddress;
    if (data.date) wd.created_at = data.date;
    wd.updated_at = new Date().toISOString();
    return true;
  }

  // Fees collected from send money
  getTotalSendFees(): number {
    return this.sendTransactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.fee || 0.1), 0);
  }

  recordSendTransaction(tx: {
    sender_id: string;
    recipient_id: string;
    amount: number;
    fee: number;
    total: number;
    note?: string;
    tx_hash: string;
    status?: "completed" | "pending" | "failed";
  }) {
    this.sendTransactions.unshift({
      id: "SND-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      sender_id: tx.sender_id,
      recipient_id: tx.recipient_id,
      amount: tx.amount,
      fee: tx.fee,
      total: tx.total,
      note: tx.note,
      tx_hash: tx.tx_hash,
      status: tx.status || "completed",
      created_at: new Date().toISOString(),
    });
    this.adjustMainBalance(tx.sender_id, -tx.total);
    this.adjustMainBalance(tx.recipient_id, tx.amount);
  }

  // Merged History for Admin & Owner
  getHistoryItems() {
    const history: Array<{
      id: string;
      user: string;
      email: string;
      userId: string;
      type: "Deposit" | "Withdraw";
      amount: number;
      fee: number;
      status: "completed" | "pending" | "failed";
      date: string;
      network?: string;
      hash?: string;
      address?: string;
      reason?: string;
    }> = [];

    // Map deposits
    for (const d of this.deposits) {
      const user = this.getUserById(d.user_id) || {
        first_name: "Unknown",
        last_name: "User",
        email: "unknown@example.com",
        user_id: "N/A",
      };
      const statusMap: Record<string, "completed" | "pending" | "failed"> = {
        approved: "completed",
        pending: "pending",
        rejected: "failed",
      };
      history.push({
        id: d.id,
        user: `${user.first_name} ${user.last_name}`,
        email: user.email,
        userId: user.user_id,
        type: "Deposit",
        amount: d.amount,
        fee: 0,
        status: statusMap[d.status] || "pending",
        date: d.created_at.replace("T", " ").substring(0, 16),
        network: d.network_code,
        hash: d.transaction_hash,
        reason: d.rejection_reason,
      });
    }

    // Map withdrawals
    for (const w of this.withdrawals) {
      const user = this.getUserById(w.user_id) || {
        first_name: "Unknown",
        last_name: "User",
        email: "unknown@example.com",
        user_id: "N/A",
      };
      const statusMap: Record<string, "completed" | "pending" | "failed"> = {
        approved: "completed",
        pending: "pending",
        rejected: "failed",
      };
      history.push({
        id: w.id,
        user: `${user.first_name} ${user.last_name}`,
        email: user.email,
        userId: user.user_id,
        type: "Withdraw",
        amount: w.amount,
        fee: w.fee_amount,
        status: statusMap[w.status] || "pending",
        date: w.created_at.replace("T", " ").substring(0, 16),
        network: w.network_code,
        address: w.wallet_address,
        reason: w.rejection_reason,
      });
    }

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

// Global singleton to persist across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __mockDbInstance: MockDatabase | undefined;
}

export const mockDb: MockDatabase = globalThis.__mockDbInstance || new MockDatabase();
globalThis.__mockDbInstance = mockDb;
