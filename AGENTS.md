Now that I can see your real `Table`, `ui.tsx` and `finance-ui.tsx`, here is the page rebuilt on them. It uses your `Table` from `@/components/motion/table` and your existing `Badge`, `Btn`, `StatCard`, `Drawer`, `InfoRow` and `api` helpers. It also follows the same pattern as your deposit and withdraw pages: click a row for a drawer, and API routes under `/api/owner/...`.

Your `Table` shows no built-in row selection in what you sent, so I did selection with a checkbox column plus row click. If it does support selection, tell me and I'll switch to it.

## Step 1: Shell (`super-admin-shell.tsx`)

You already have "Settings → Admins & Roles", which should stay for roles and permissions. Add this as its own top-level item:

```tsx
// lucide-react import: add UserCog
import { ..., UserCog } from "lucide-react";

// ROUTES (top-level block)
"Admin Management": "/owner/admin-management",

// destinations, right after Dashboard
{ label: "Admin Management", icon: UserCog },
```

## Step 2: One-line change to `finance-ui.tsx`

Login-as-admin needs a POST, and your `api()` only allows PATCH and DELETE:

```tsx
export async function api(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
```

## Step 3: Types and data (`lib/admin-data.ts`)

```ts
// lib/admin-data.ts
import type { UserRow } from "@/lib/users-data";

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
```

For the page's data, reuse whatever you already use to build `UserRow[]` for the Users page and add `hiddenFromAdmins: row.hidden_from_admins` to each item. The Step 6 page has placeholders for this.

## Step 4: The management component

`app/(superadmin)/_components/admin-management.tsx`

```tsx
// app/(superadmin)/_components/admin-management.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/motion/table";
import type { AdminRow, ManagedUser } from "@/lib/admin-data";
import { Badge, Btn, StatCard } from "./ui";
import { Drawer, InfoRow, api, usd } from "./finance-ui";

const kycTone = { verified: "green", pending: "amber", rejected: "red", not_submitted: "gray" } as const;

/** Columns for both user tables. First column is a checkbox driven by `selected`. */
function makeUserColumns(selected: Set<string>): TableColumn<ManagedUser>[] {
  return [
    {
      key: "select",
      header: "",
      width: "48px",
      cell: (u) => (
        // Row click toggles selection, so the checkbox is display-only.
        <input
          type="checkbox"
          readOnly
          checked={selected.has(u.id)}
          className="pointer-events-none size-4"
          aria-label={`Select ${u.name}`}
        />
      ),
    },
    { key: "id", header: "User ID", sortable: true, width: "120px" },
    {
      key: "name",
      header: "Name",
      sortable: true,
      width: "1.2fr",
      cell: (u) => <span className="font-medium">{u.name}</span>,
    },
    { key: "email", header: "Email", sortable: true, width: "1.6fr" },
    { key: "country", header: "Country", sortable: true, width: "130px" },
    { key: "joinedAt", header: "Joined", sortable: true, width: "120px" },
    {
      key: "kyc",
      header: "KYC",
      sortable: true,
      width: "130px",
      cell: (u) => <Badge tone={kycTone[u.kyc]}>{u.kyc.replace("_", " ")}</Badge>,
    },
    {
      key: "totalBalance",
      header: "Balance",
      sortable: true,
      align: "right",
      width: "120px",
      cell: (u) => <span className="tabular-nums">{usd(u.totalBalance)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "110px",
      cell: (u) => <Badge tone={u.status === "active" ? "green" : "red"}>{u.status}</Badge>,
    },
  ];
}

export function AdminManagement({
  admins,
  users: initialUsers,
}: {
  admins: AdminRow[];
  users: ManagedUser[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [q, setQ] = useState("");
  const [selVisible, setSelVisible] = useState<Set<string>>(new Set());
  const [selHidden, setSelHidden] = useState<Set<string>>(new Set());
  const [openAdmin, setOpenAdmin] = useState<AdminRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const flash = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(null), 3500);
  };

  // ---------- derived data ----------
  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term),
    );
  }, [users, q]);

  const visibleRows = useMemo(() => filteredUsers.filter((u) => !u.hiddenFromAdmins), [filteredUsers]);
  const hiddenRows = useMemo(() => filteredUsers.filter((u) => u.hiddenFromAdmins), [filteredUsers]);

  const stats = useMemo(
    () => ({
      admins: admins.length,
      activeAdmins: admins.filter((a) => a.status === "active").length,
      visible: users.filter((u) => !u.hiddenFromAdmins).length,
      hidden: users.filter((u) => u.hiddenFromAdmins).length,
    }),
    [admins, users],
  );

  // ---------- columns ----------
  const adminColumns = useMemo<TableColumn<AdminRow>[]>(
    () => [
      { key: "id", header: "Admin ID", sortable: true, width: "120px" },
      {
        key: "name",
        header: "Admin",
        sortable: true,
        width: "1.4fr",
        cell: (a) => (
          <div className="flex flex-col leading-tight">
            <span className="font-medium">{a.name}</span>
            <span className="text-xs text-muted-foreground">{a.email}</span>
          </div>
        ),
      },
      { key: "role", header: "Role", sortable: true, width: "130px" },
      {
        key: "status",
        header: "Status",
        sortable: true,
        width: "120px",
        cell: (a) => <Badge tone={a.status === "active" ? "green" : "red"}>{a.status}</Badge>,
      },
      { key: "usersManaged", header: "Users", sortable: true, align: "right", width: "90px" },
      { key: "lastLogin", header: "Last Login", sortable: true, width: "160px" },
      { key: "createdAt", header: "Created", sortable: true, width: "120px" },
      {
        key: "actions",
        header: "",
        align: "right",
        width: "150px",
        cell: (a) => (
          <button
            type="button"
            disabled={a.status !== "active" || busy}
            onClick={(e) => {
              e.stopPropagation(); // don't also open the drawer
              loginAsAdmin(a);
            }}
            className="h-8 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Login as admin
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy],
  );

  const visibleColumns = useMemo(() => makeUserColumns(selVisible), [selVisible]);
  const hiddenColumns = useMemo(() => makeUserColumns(selHidden), [selHidden]);

  // ---------- selection helpers ----------
  const toggle = (setter: typeof setSelVisible, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ---------- actions ----------
  async function changeVisibility(ids: string[], hidden: boolean) {
    if (ids.length === 0) return;
    const msg = hidden
      ? `Hide ${ids.length} user(s) from all admins? They will disappear from every admin panel.`
      : `Make ${ids.length} user(s) visible to admins again?`;
    if (!confirm(msg)) return;

    setBusy(true);
    try {
      await api("/api/owner/users/visibility", "PATCH", { userIds: ids, hidden });
      const set = new Set(ids);
      setUsers((list) => list.map((u) => (set.has(u.id) ? { ...u, hiddenFromAdmins: hidden } : u)));
      setSelVisible(new Set());
      setSelHidden(new Set());
      flash(hidden ? `${ids.length} user(s) hidden from admins` : `${ids.length} user(s) now visible to admins`);
    } catch {
      flash("Request failed. Check your API route.");
    } finally {
      setBusy(false);
    }
  }

  async function loginAsAdmin(a: AdminRow) {
    if (!confirm(`Open the admin panel as ${a.name}? This action is logged.`)) return;
    setBusy(true);
    try {
      await api(`/api/owner/admins/${a.id}/impersonate`, "POST");
      router.push("/admin"); // <- your admin panel root
      router.refresh();
    } catch {
      flash("Could not start admin session.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Admin Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage admins, control which users they can see, and open any admin panel.
          </p>
        </div>
        {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Admins" value={stats.admins} />
        <StatCard label="Active Admins" value={stats.activeAdmins} />
        <StatCard label="Visible to Admins" value={stats.visible.toLocaleString()} hint="Users admins can see" />
        <StatCard label="Super Admin Only" value={stats.hidden.toLocaleString()} hint="Hidden from every admin" />
      </div>

      {/* ---------- admins ---------- */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Admins</h2>
          <p className="text-xs text-muted-foreground">Click a row for details, or use “Login as admin”.</p>
        </div>
        <Table
          data={admins}
          columns={adminColumns}
          getRowId={(a) => a.id}
          resizable
          defaultSort={{ key: "createdAt", direction: "desc" }}
          onRowClick={setOpenAdmin}
          height={360}
          rowHeight={56}
          className="rounded-2xl"
          emptyState="No admins found"
        />
      </section>

      {/* ---------- shared search for both user tables ---------- */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Search users (applies to both tables below)</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email or user ID"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:w-96"
        />
      </div>

      {/* ---------- visible users ---------- */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Users visible to admins <span className="text-sm font-normal opacity-60">{visibleRows.length}</span>
            </h2>
            <p className="text-xs text-muted-foreground">Click rows to select, then hide them from admins.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={() =>
                setSelVisible(selVisible.size ? new Set() : new Set(visibleRows.map((u) => u.id)))
              }
              disabled={busy || visibleRows.length === 0}
            >
              {selVisible.size ? "Clear" : `Select all (${visibleRows.length})`}
            </Btn>
            <Btn
              tone="danger"
              onClick={() => changeVisibility([...selVisible], true)}
              disabled={busy || selVisible.size === 0}
            >
              Hide from admins ({selVisible.size})
            </Btn>
          </div>
        </div>
        <Table
          data={visibleRows}
          columns={visibleColumns}
          getRowId={(u) => u.id}
          resizable
          defaultSort={{ key: "joinedAt", direction: "desc" }}
          onRowClick={(u) => toggle(setSelVisible, u.id)}
          height={420}
          rowHeight={52}
          className="rounded-2xl"
          emptyState="No visible users"
        />
      </section>

      {/* ---------- hidden users ---------- */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Super admin only users <span className="text-sm font-normal opacity-60">{hiddenRows.length}</span>
            </h2>
            <p className="text-xs text-muted-foreground">Admins cannot see these users anywhere.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={() =>
                setSelHidden(selHidden.size ? new Set() : new Set(hiddenRows.map((u) => u.id)))
              }
              disabled={busy || hiddenRows.length === 0}
            >
              {selHidden.size ? "Clear" : `Select all (${hiddenRows.length})`}
            </Btn>
            <Btn
              tone="primary"
              onClick={() => changeVisibility([...selHidden], false)}
              disabled={busy || selHidden.size === 0}
            >
              Make visible ({selHidden.size})
            </Btn>
          </div>
        </div>
        <Table
          data={hiddenRows}
          columns={hiddenColumns}
          getRowId={(u) => u.id}
          resizable
          defaultSort={{ key: "joinedAt", direction: "desc" }}
          onRowClick={(u) => toggle(setSelHidden, u.id)}
          height={420}
          rowHeight={52}
          className="rounded-2xl"
          emptyState="No hidden users"
        />
      </section>

      {/* ---------- admin details drawer ---------- */}
      <Drawer
        open={!!openAdmin}
        onClose={() => setOpenAdmin(null)}
        title={openAdmin ? openAdmin.name : ""}
        subtitle={openAdmin ? `${openAdmin.id} · ${openAdmin.email}` : undefined}
        footer={
          openAdmin ? (
            <div className="flex justify-end gap-2">
              <Btn onClick={() => setOpenAdmin(null)} disabled={busy}>Close</Btn>
              <Btn
                tone="primary"
                onClick={() => loginAsAdmin(openAdmin)}
                disabled={busy || openAdmin.status !== "active"}
              >
                {busy ? "Opening..." : "Login as admin"}
              </Btn>
            </div>
          ) : null
        }
      >
        {openAdmin ? (
          <div className="flex flex-col gap-5">
            <Badge tone={openAdmin.status === "active" ? "green" : "red"}>{openAdmin.status}</Badge>
            <div className="divide-y divide-border rounded-xl border border-border px-3">
              <InfoRow label="Admin ID" value={openAdmin.id} />
              <InfoRow label="Name" value={openAdmin.name} />
              <InfoRow label="Email" value={openAdmin.email} />
              <InfoRow label="Role" value={openAdmin.role} />
              <InfoRow label="Users managed" value={openAdmin.usersManaged} />
              <InfoRow label="Last login" value={openAdmin.lastLogin} />
              <InfoRow label="Created" value={openAdmin.createdAt} />
            </div>
            {openAdmin.status !== "active" ? (
              <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
                This admin is suspended, so you can&apos;t open their panel.
              </p>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
```

## Step 5: API routes (same style as your deposit/withdraw routes)

Replace `requireOwner` with your own owner guard. It must check the session on the server.

**`app/api/owner/users/visibility/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireOwner } from "@/lib/auth/require-owner";

export async function PATCH(req: Request) {
  await requireOwner();

  const { userIds, hidden } = await req.json();
  if (
    !Array.isArray(userIds) ||
    userIds.length === 0 ||
    userIds.length > 500 ||
    !userIds.every((id) => typeof id === "string") ||
    typeof hidden !== "boolean"
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await db.from("profiles").update({ hidden_from_admins: hidden }).in("id", userIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

**`app/api/owner/admins/[id]/impersonate/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { requireOwner } from "@/lib/auth/require-owner";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: target } = await db.from("profiles").select("id, role, status").eq("id", id).single();
  if (!target || target.role !== "admin" || target.status !== "active") {
    return NextResponse.json({ error: "Not an active admin" }, { status: 400 });
  }

  await db.from("impersonation_log").insert({ owner_id: owner.id, admin_id: id });

  (await cookies()).set("impersonating_admin_id", id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true });
}
```

**`app/api/owner/impersonation/route.ts`** (exit)

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE() {
  (await cookies()).delete("impersonating_admin_id");
  return NextResponse.json({ ok: true });
}
```

## Step 6: The page

`app/(superadmin)/owner/admin-management/page.tsx`

```tsx
// Owner-only area. Add your owner auth guard here (server-side) before rendering.
import { AdminManagement } from "../../_components/admin-management";
import { SuperAdminShell } from "../../_components/super-admin-shell";
import { requireOwner } from "@/lib/auth/require-owner";
import type { AdminRow, ManagedUser } from "@/lib/admin-data";

// TODO: replace with your real queries (Supabase). Column names are guesses.
async function getAdmins(): Promise<AdminRow[]> {
  return [
    { id: "ADM-001", name: "Sarah Khan", email: "sarah@example.com", role: "Admin", status: "active", usersManaged: 128, lastLogin: "2026-09-28 14:20", createdAt: "2026-01-12" },
    { id: "ADM-002", name: "Tanvir Ahmed", email: "tanvir@example.com", role: "Admin", status: "suspended", usersManaged: 54, lastLogin: "2026-08-02 09:05", createdAt: "2026-03-04" },
  ];
}

async function getManagedUsers(): Promise<ManagedUser[]> {
  // Use the same query/mapper as your Users page, then add:
  //   hiddenFromAdmins: row.hidden_from_admins
  return [];
}

export default async function AdminManagementPage() {
  await requireOwner();
  const [admins, users] = await Promise.all([getAdmins(), getManagedUsers()]);

  return (
    <SuperAdminShell active="Admin Management">
      <AdminManagement admins={admins} users={users} />
    </SuperAdminShell>
  );
}
```

## Step 7: Finish the admin side

1. **Database:** run the SQL from my earlier message. It adds `profiles.hidden_from_admins`, the restrictive RLS policy that blocks admins from reading hidden users, and the `impersonation_log` table.
2. **Admin panel identity:** in your admin layout or auth helper, resolve the effective admin like this:

```ts
import { cookies } from "next/headers";

export async function getEffectiveAdminId() {
  const session = await getSessionUser(); // your existing helper
  const imp = (await cookies()).get("impersonating_admin_id")?.value;
  if (imp && session?.role === "owner") return { id: imp, impersonating: true };
  return { id: session?.id, impersonating: false };
}
```

The cookie only counts if the real session is the owner, so a forged cookie does nothing.

3. **Data layer:** while impersonating, queries run under the owner's session, so RLS sees an owner. The admin panel's queries must therefore also filter `hidden_from_admins = false` explicitly, so the owner sees exactly what that admin would see.
4. **Exit banner:** add this to the admin layout when `impersonating` is true:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { api } from "@/app/(superadmin)/_components/finance-ui";

export function ImpersonationBanner({ adminName }: { adminName: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
      <span>Viewing as {adminName}</span>
      <button
        type="button"
        className="rounded-lg border border-current px-3 py-1 text-xs font-medium"
        onClick={async () => {
          await api("/api/owner/impersonation", "DELETE");
          router.push("/owner/admin-management");
          router.refresh();
        }}
      >
        Exit
      </button>
    </div>
  );
}
```

## Notes

- **Your `Table` API is assumed to re-render cells when `columns` changes.** The checkboxes rely on this. If the checks don't update on click, tell me and I'll adjust.
- **The row actions button uses a plain `<button>`** rather than `Btn`, because `Btn.onClick` takes no event and I needed `stopPropagation` so it doesn't also open the drawer.
- **`/admin` in `router.push("/admin")` is a placeholder** for your admin panel's root route.
- **Block money-moving routes while impersonating.** Consider rejecting deposit and withdrawal approvals when `impersonating` is true, so an audit trail never shows the admin approving something the owner did.