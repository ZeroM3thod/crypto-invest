// lib/admin-review-data.ts
export type ReviewStatus = "pending" | "approved" | "rejected";
export type Network = "TRC20" | "ERC20" | "BEP20";
export type Coin = "USDT" | "USDC";

export type Deposit = {
  id: string;
  name: string;
  username: string;
  userId: string;
  coin: Coin;
  amount: number;
  network: Network;
  hash: string;
  date: string; // YYYY-MM-DD
  reason: string;
  status: ReviewStatus;
};

export type Withdraw = {
  id: string;
  name: string;
  username: string;
  userId: string;
  coin: Coin;
  amount: number;
  fee: number;
  network: Network;
  address: string;
  date: string; // YYYY-MM-DD
  reason: string;
  status: ReviewStatus;
};

export function getDeposits(): Deposit[] {
  return [
    { id: "DEP-2041", name: "Rahim Uddin", username: "@rahim", userId: "u1", coin: "USDT", amount: 1200, network: "TRC20", hash: "a91f3c77d20b84e1c5f0a2b7e9d4c681f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b", date: "2026-10-03", reason: "", status: "pending" },
    { id: "DEP-2040", name: "Mim Chowdhury", username: "@mim", userId: "u2", coin: "USDC", amount: 5000, network: "ERC20", hash: "0x7be41c09aa31f5d2e8c4b6a07d19e3f5a2c8d4b6e0f1a3c5d7e9b1f2a4c6e8d0", date: "2026-10-03", reason: "", status: "approved" },
    { id: "DEP-2039", name: "Sadia Akter", username: "@sadia", userId: "u3", coin: "USDT", amount: 320, network: "BEP20", hash: "0x55aa91c3e7d2b4f6a8c0e1d3b5f7a9c2e4d6b8f0a1c3e5d7b9f1a3c5e7d9b1f3", date: "2026-10-03", reason: "", status: "pending" },
    { id: "DEP-2038", name: "Tanvir Hasan", username: "@tanvir", userId: "u4", coin: "USDT", amount: 750, network: "TRC20", hash: "c41e09d8b7a6f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0918273645", date: "2026-10-02", reason: "", status: "approved" },
    { id: "DEP-2037", name: "Imran Khan", username: "@imran", userId: "u5", coin: "USDC", amount: 90, network: "ERC20", hash: "0x12ff00aa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc", date: "2026-10-02", reason: "Transaction hash not found on chain.", status: "rejected" },
    { id: "DEP-2036", name: "Nusrat Jahan", username: "@nusrat", userId: "u6", coin: "USDT", amount: 2100, network: "TRC20", hash: "7bd0aa11cc22dd33ee44ff5566778899aabbccddeeff00112233445566778899", date: "2026-10-02", reason: "", status: "approved" },
    { id: "DEP-2035", name: "Arif Hossain", username: "@arif", userId: "u7", coin: "USDT", amount: 450, network: "BEP20", hash: "0x9c8b7a6f5e4d3c2b1a09f8e7d6c5b4a3928170605f4e3d2c1b0a9f8e7d6c5b4a", date: "2026-10-01", reason: "", status: "approved" },
    { id: "DEP-2034", name: "Farhana Islam", username: "@farhana", userId: "u8", coin: "USDC", amount: 1800, network: "TRC20", hash: "e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4", date: "2026-10-01", reason: "", status: "pending" },
  ];
}

export function getWithdraws(): Withdraw[] {
  return [
    { id: "WDR-1311", name: "Sadia Akter", username: "@sadia", userId: "u3", coin: "USDT", amount: 450, fee: 45, network: "TRC20", address: "TXk3v8Qe5mYb2LpR9aZc7NfUdHs4JwG1xT", date: "2026-10-03", reason: "", status: "pending" },
    { id: "WDR-1310", name: "Rahim Uddin", username: "@rahim", userId: "u1", coin: "USDC", amount: 2000, fee: 200, network: "ERC20", address: "0x7c19aa4f2e8b6d0a3c5e7f9b1d3a5c7e9f1b3d5a", date: "2026-10-03", reason: "", status: "pending" },
    { id: "WDR-1309", name: "Farhana Islam", username: "@farhana", userId: "u8", coin: "USDT", amount: 620, fee: 62, network: "BEP20", address: "0x41aa7bd0c2e4f6a8b0d2e4f6a8c0e2d4b6f8a0c2", date: "2026-10-02", reason: "", status: "approved" },
    { id: "WDR-1308", name: "Imran Khan", username: "@imran", userId: "u5", coin: "USDT", amount: 800, fee: 80, network: "TRC20", address: "TQn9Lw2Vb6KeR4xYzC8mPaUdJs3HfG7tNo", date: "2026-10-02", reason: "Wallet address failed verification.", status: "rejected" },
    { id: "WDR-1307", name: "Mim Chowdhury", username: "@mim", userId: "u2", coin: "USDC", amount: 3000, fee: 300, network: "ERC20", address: "0x9034bb71c3e5d7f9a1b3c5e7d9f1a3b5c7e9d1f3", date: "2026-10-02", reason: "", status: "approved" },
    { id: "WDR-1306", name: "Tanvir Hasan", username: "@tanvir", userId: "u4", coin: "USDT", amount: 150, fee: 15, network: "TRC20", address: "TLr5Yp8Kc2WxB7vNfQ9eUaZdHs4MjG1xTb", date: "2026-10-01", reason: "", status: "approved" },
    { id: "WDR-1305", name: "Nusrat Jahan", username: "@nusrat", userId: "u6", coin: "USDT", amount: 980, fee: 98, network: "BEP20", address: "0x61bb22cc33dd44ee55ff66aa77bb88cc99dd00ee", date: "2026-10-01", reason: "", status: "pending" },
  ];
}
