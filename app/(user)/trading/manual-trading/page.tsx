// app/(user)/trading/manual-trading/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { TradingChart } from "@/components/motion/trading-chart";
import { OrderPanel, type OrderValue } from "@/components/motion/order-panel";
import { useState } from "react";

export default function ManualTradingPage() {
  const [order, setOrder] = useState<OrderValue>({
    mode: "buy",
    amount: "115",
    expiryId: "15m",
  });

  return (
    <UserShell active="Manual Trading">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground">Live market</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Manual Trading
          </h1>
        </div>

        <div className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-5">
          <section className="min-w-0" aria-label="Chart">
            <TradingChart />
          </section>

          <aside className="w-full min-w-0 lg:sticky lg:top-6" aria-label="Order panel">
            <OrderPanel
              price={0.167}
              value={order}
              onValueChange={setOrder}
              balance={500}
              holding={125}
              quickAmounts={[1, 5, 10, 100]}
              className="max-w-none"
            />
          </aside>
        </div>

        <div className="h-20" />
      </div>
    </UserShell>
  );
}
