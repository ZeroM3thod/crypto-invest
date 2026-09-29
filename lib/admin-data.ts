// lib/admin-data.ts
// MOCK DATA LAYER. Replace the in-memory store with real DB calls (Supabase).
import { getUsers, toRow, type UserRow } from "@/lib/users-data";

export type AdminRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended";
  usersManaged: number;
  lastLogin: string; // "YYYY-MM-DD HH:mm" or ""
  createdAt: string;
};

/** Your existing UserRow + whether admins are blocked from seeing it. */
export type ManagedUser = UserRow & { hiddenFromAdmins: boolean };

const ADMINS: AdminRow[] = [
  {
    id: "ADM-001",
    name: "Sarah Khan",
    email: "sarah@example.com",
    role: "Admin",
    status: "active",
    usersManaged: 128,
    lastLogin: "2026-09-28 14:20",
    createdAt: "2026-01-12",
  },
  {
    id: "ADM-002",
    name: "Tanvir Ahmed",
    email: "tanvir@example.com",
    role: "Admin",
    status: "suspended",
    usersManaged: 54,
    lastLogin: "2026-08-02 09:05",
    createdAt: "2026-03-04",
  },
  {
    id: "ADM-003",
    name: "Rifat Hasan",
    email: "rifat@example.com",
    role: "Admin",
    status: "active",
    usersManaged: 87,
    lastLogin: "2026-09-29 08:11",
    createdAt: "2026-02-20",
  },
  {
    id: "ADM-004",
    name: "Nadia Islam",
    email: "nadia@example.com",
    role: "Admin",
    status: "active",
    usersManaged: 41,
    lastLogin: "2026-09-27 19:44",
    createdAt: "2026-04-15",
  },
  {
    id: "ADM-005",
    name: "Imran Chowdhury",
    email: "imran@example.com",
    role: "Admin",
    status: "active",
    usersManaged: 63,
    lastLogin: "2026-09-26 11:02",
    createdAt: "2026-05-30",
  },
  {
    id: "ADM-006",
    name: "Farah Kabir",
    email: "farah@example.com",
    role: "Admin",
    status: "suspended",
    usersManaged: 12,
    lastLogin: "2026-07-18 16:37",
    createdAt: "2026-06-11",
  },
];

// In-memory store for profiles.hidden_from_admins (swap for a DB column).
const hiddenIds = new Set<string>(["USR-1007", "USR-1021", "USR-1088"]);

// In-memory impersonation audit log (swap for the impersonation_log table).
export type ImpersonationEntry = {
  ownerId: string;
  adminId: string;
  at: string;
};
const impersonationLog: ImpersonationEntry[] = [];

export function getAdmins(): AdminRow[] {
  return ADMINS;
}

export function getAdminById(id: string): AdminRow | undefined {
  return ADMINS.find((a) => a.id === id);
}

export function getManagedUsers(): ManagedUser[] {
  return getUsers().map((u) => ({ ...toRow(u), hiddenFromAdmins: hiddenIds.has(u.id) }));
}

/** What an admin panel is allowed to see: only users NOT hidden from admins. */
export function getAdminVisibleUsers(): ManagedUser[] {
  return getManagedUsers().filter((u) => !u.hiddenFromAdmins);
}

export function setUserHidden(ids: string[], hidden: boolean): void {
  for (const id of ids) {
    if (hidden) hiddenIds.add(id);
    else hiddenIds.delete(id);
  }
}

export function logImpersonation(ownerId: string, adminId: string): void {
  impersonationLog.push({ ownerId, adminId, at: new Date().toISOString() });
}

export function getImpersonationLog(): ImpersonationEntry[] {
  return impersonationLog;
}
