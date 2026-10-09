// app/(superadmin)/_components/history-view.tsx
"use client";

import { ArrowDownToLine, ArrowUpFromLine, Coins, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Table, type TableColumn } from "@/components/motion/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { getSendMoneyFees, type HistoryItem } from "@/lib/admin-finance-data";
import {
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
  usd,
} from "./finance-ui";

type Filter = "all" | "Deposit" | "Withdraw";

const columns: TableColumn<HistoryItem>[] = [
  { key: "id", header: "ID", width: "110px" },
  {
    key: "user",
    header: "User",
    sortable: true,
    width: "1.3fr",
    cell: (r) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{r.user}</p>
        <p className="truncate text-xs text-muted-foreground">{r.email}</p>
      </div>
    ),
  },
  {
    key: "userId" as never,
    header: "User ID",
    width: "100px",
    cell: (r) => (
      <span className="font-mono text-xs text-muted-foreground">{r.userId || "—"}</span>
    ),
  },
  { key: "type", header: "Type", sortable: true, width: "120px" },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    align: "right",
    width: "110px",
    cell: (r) => <span className="tabular-nums">{usd(r.amount)}</span>,
  },
  {
    key: "fee",
    header: "Fee",
    sortable: true,
    align: "right",
    width: "90px",
    cell: (r) => <span className="tabular-nums">{usd(r.fee)}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "130px",
    cell: (r) => <StatusBadge status={r.status} />,
  },
  { key: "date", header: "Date", sortable: true, width: "150px" },
];

export function HistoryView({ items: initialItems }: { items: HistoryItem[] }) {
  const [items, setItems] = useState<HistoryItem[]>(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const done = items.filter((i) => i.status === "completed");
    const sum = (t: string) =>
      done.filter((i) => i.type === t).reduce((a, i) => a + i.amount, 0);
    return {
      total: items.length,
      moneyIn: sum("Deposit"),
      moneyOut: sum("Withdraw"),
      fees: getSendMoneyFees(),
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === "all" || i.type === filter) &&
        (!q ||
          [i.id, i.user, i.email, i.userId, i.type].some((v) =>
            v?.toLowerCase().includes(q),
          )),
    );
  }, [items, filter, query]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="History"
        description="Every deposit and withdrawal transaction on the platform."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total transactions"
          value={stats.total}
          icon={ListChecks}
        />
        <StatCard
          label="Money in (completed)"
          value={stats.moneyIn}
          format={(n) => usd(Math.round(n))}
          icon={ArrowDownToLine}
        />
        <StatCard
          label="Money out (completed)"
          value={stats.moneyOut}
          format={(n) => usd(Math.round(n))}
          icon={ArrowUpFromLine}
        />
        <StatCard
          label="Fees collected"
          value={stats.fees}
          hint="From send money"
          format={usd}
          icon={Coins}
          positive
        />
      </div>

      <section className="rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            variant="segment"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Deposit">Deposits</TabsTrigger>
              <TabsTrigger value="Withdraw">Withdrawals</TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search user, ID, email…"
          />
        </div>

        <div className="mt-4">
          <Table
            data={visible}
            columns={columns}
            getRowId={(r) => r.id}
            defaultSort={{ key: "date", direction: "desc" }}
            height={520}
            rowHeight={60}
            className="rounded-xl"
            emptyState={
              <span className="text-sm text-muted-foreground">
                No transactions found
              </span>
            }
          />
        </div>
      </section>
    </div>
  );
}

