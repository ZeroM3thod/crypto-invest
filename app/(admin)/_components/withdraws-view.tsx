// app/(admin)/_components/withdraws-view.tsx
"use client";

import {
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Coins,
  Download,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/motion/button";
import { Table, type TableColumn } from "@/components/motion/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { ReviewStatus, Withdraw } from "@/lib/admin-review-data";
import {
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
} from "./finance-ui";
import {
  DateRange,
  downloadCSV,
  fmtAmt,
  initials,
  type ModalMode,
  ReviewModal,
  shortHash,
  Toast,
  useToast,
} from "./review-ui";

type Filter = "all" | ReviewStatus;

export function WithdrawsView({ initial }: { initial: Withdraw[] }) {
  const { toast, showToast } = useToast();
  const [rows, setRows] = useState(initial);
  const [chip, setChip] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [mode, setMode] = useState<ModalMode>(null);
  const [modalId, setModalId] = useState("");

  const copyText = useCallback(
    (t: string) => {
      navigator.clipboard?.writeText(t).catch(() => {});
      showToast("📋 Copied to clipboard!");
    },
    [showToast],
  );

  const closeModal = () => setMode(null);
  const openView = useCallback((id: string) => {
    setModalId(id);
    setMode("view");
  }, []);
  const openReject = useCallback((id: string) => {
    setModalId(id);
    setMode("reject");
  }, []);

  /* ---------- actions (no DB — local state only) ---------- */

  const doConfirm = useCallback(
    (w: Withdraw) => {
      // TODO: call your API here (mark withdrawal as paid)
      setRows((prev) =>
        prev.map((r) => (r.id === w.id ? { ...r, status: "approved" } : r)),
      );
      showToast(`✓ ${w.id} approved — $${(w.amount - w.fee).toLocaleString()} USDT payout`);
      closeModal();
    },
    [showToast],
  );

  const doReject = (id: string, reason: string) => {
    if (reason.trim().length < 5) {
      showToast("Please enter a rejection reason.");
      return;
    }
    // TODO: call your API here (reject + refund user balance + save reason)
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected", reason: reason.trim() } : r,
      ),
    );
    showToast(`✕ ${id} rejected`);
    closeModal();
  };

  /* ---------- filtering ---------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (w) =>
        (chip === "all" || w.status === chip) &&
        (!q ||
          [w.name, w.username, w.id, w.address, w.network].some((v) =>
            v.toLowerCase().includes(q),
          )) &&
        (!dateFrom || w.date >= dateFrom) &&
        (!dateTo || w.date <= dateTo),
    );
  }, [rows, chip, query, dateFrom, dateTo]);

  const confirmAllPending = () => {
    const pendingRows = filtered.filter((w) => w.status === "pending");
    if (!pendingRows.length) {
      showToast("No pending withdrawals in current view.");
      return;
    }
    const total = pendingRows.reduce((s, w) => s + (w.amount - w.fee), 0);
    if (
      !window.confirm(
        `Approve all ${pendingRows.length} pending withdrawals? Total payout: $${total.toLocaleString()}`,
      )
    )
      return;
    // TODO: call your API here (bulk approve)
    const ids = new Set(pendingRows.map((w) => w.id));
    setRows((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, status: "approved" } : r)),
    );
    showToast(`✓ ${pendingRows.length} withdrawals approved!`);
  };

  const exportCSV = () => {
    downloadCSV(`withdrawals-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["ID", "User", "Username", "Amount", "Fee", "Net", "Network", "Address", "Date", "Status", "Reason"],
      ...filtered.map((w) => [
        w.id, w.name, w.username, w.amount, w.fee, w.amount - w.fee,
        w.network, w.address, w.date, w.status, w.reason,
      ]),
    ]);
    showToast(`✓ Exported ${filtered.length} records`);
  };

  /* ---------- stats ---------- */

  const stats = useMemo(() => {
    const pend = rows.filter((w) => w.status === "pending");
    const conf = rows.filter((w) => w.status === "approved");
    return {
      pendCount: pend.length,
      pendAmt: pend.reduce((s, w) => s + w.amount, 0),
      confCount: conf.length,
      paidOut: conf.reduce((s, w) => s + (w.amount - w.fee), 0),
      feeProfit: conf.reduce((s, w) => s + w.fee, 0),
    };
  }, [rows]);

  /* ---------- table ---------- */

  const columns = useMemo<TableColumn<Withdraw>[]>(
    () => [
      {
        key: "name",
        header: "User",
        sortable: true,
        width: "1.3fr",
        cell: (w) => (
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-muted text-[10px] font-semibold text-foreground">
              {initials(w.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{w.name}</p>
              <p className="truncate text-xs text-muted-foreground">{w.username}</p>
            </div>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        align: "right",
        width: "110px",
        cell: (w) => <span className="tabular-nums">−${fmtAmt(w.amount)}</span>,
      },
      {
        key: "fee",
        header: "Fee",
        sortable: true,
        align: "right",
        width: "90px",
        cell: (w) => (
          <span className="tabular-nums text-(--color-success)">${fmtAmt(w.fee)}</span>
        ),
      },
      {
        key: "net" as never,
        header: "Net payout",
        align: "right",
        width: "120px",
        cell: (w) => (
          <span className="font-medium tabular-nums">${fmtAmt(w.amount - w.fee)}</span>
        ),
      },
      {
        key: "network",
        header: "Network",
        width: "90px",
        cell: (w) => (
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-foreground">
            {w.network}
          </span>
        ),
      },
      {
        key: "address",
        header: "Wallet address",
        width: "170px",
        cell: (w) => (
          <button
            type="button"
            title={w.address}
            onClick={() => copyText(w.address)}
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {shortHash(w.address)}
          </button>
        ),
      },
      { key: "date", header: "Date", sortable: true, width: "110px" },
      {
        key: "status",
        header: "Status",
        width: "120px",
        cell: (w) => <StatusBadge status={w.status} />,
      },
      {
        key: "actions" as never,
        header: "Action",
        align: "right",
        width: "230px",
        cell: (w) =>
          w.status === "pending" ? (
            <div className="flex justify-end gap-1.5">
              <Button size="sm" variant="primary" onClick={() => doConfirm(w)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => openReject(w.id)}>
                Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openView(w.id)}>
                View
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => openView(w.id)}>
              Details
            </Button>
          ),
      },
    ],
    [copyText, doConfirm, openReject, openView],
  );

  const current = rows.find((w) => w.id === modalId);

  return (
    <>
      <Toast toast={toast} />

      <ReviewModal
        mode={mode}
        onClose={closeModal}
        noun="Withdrawal"
        record={
          current && {
            id: current.id,
            status: current.status,
            reason: current.reason,
            copyValue: current.address,
            copyLabel: "Copy address",
          }
        }
        fields={
          current
            ? [
                { label: "User", value: current.name },
                { label: "Username", value: current.username },
                { label: "Amount (USDT)", value: `−$${fmtAmt(current.amount)}`, strong: true },
                { label: "Fee", value: `$${fmtAmt(current.fee)}` },
                { label: "Net payout", value: `$${fmtAmt(current.amount - current.fee)}`, strong: true },
                { label: "Network", value: current.network },
                { label: "Date", value: current.date },
                { label: "Status", value: current.status },
                { label: "Wallet address", value: current.address, full: true, copy: true },
              ]
            : []
        }
        summary={
          current
            ? `You are approving a withdrawal of $${fmtAmt(current.amount)} USDT (net payout $${fmtAmt(current.amount - current.fee)} after the $${fmtAmt(current.fee)} fee) to ${current.name} on ${current.network}. Make sure the payout has been sent to the address below.`
            : ""
        }
        rejectNote="You are about to reject this withdrawal. A rejection reason is required and is saved with the record."
        onSwitch={setMode}
        onConfirm={() => current && doConfirm(current)}
        onReject={(reason) => current && doReject(current.id, reason)}
        onCopy={copyText}
      />

      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-(--color-success)" />
              Admin · Finance · Live
            </span>
            <PageHeader
              title="Withdrawal Management"
              description="Monitor, approve or reject all withdrawal requests."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRange from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
            <Button size="md" variant="primary" onClick={exportCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pending" value={stats.pendCount} icon={Clock} hint={`$${fmtAmt(stats.pendAmt)}`} />
          <StatCard label="Approved" value={stats.confCount} icon={CheckCircle2} hint="Paid out" />
          <StatCard
            label="Total paid out (USDT)"
            value={stats.paidOut}
            format={(n) => `$${(n / 1000).toFixed(1)}K`}
            icon={ArrowUpFromLine}
          />
          <StatCard
            label="Withdrawal fee profit"
            value={stats.feeProfit}
            format={(n) => `$${fmtAmt(n)}`}
            icon={Coins}
            positive
          />
        </div>

        <section className="rounded-2xl border border-border bg-background p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Withdrawal records</h2>
              <p className="text-xs text-muted-foreground">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""} · filtered
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Tabs value={chip} onValueChange={(v) => setChip(v as Filter)} variant="segment">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
              <SearchInput value={query} onChange={setQuery} placeholder="Search users, addresses…" />
              <Button size="md" variant="outline" onClick={confirmAllPending}>
                Approve all pending
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Table
              data={filtered}
              columns={columns}
              getRowId={(w) => w.id}
              height={520}
              rowHeight={60}
              className="rounded-xl"
              emptyState={
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">No withdrawals found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
                </div>
              }
            />
          </div>
        </section>
      </div>
    </>
  );
}
