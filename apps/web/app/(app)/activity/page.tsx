"use client";

import { useCallback, useMemo, useState } from "react";

import { TransactionRow } from "@/components/flow/transaction-row";
import { Icon } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list-row";
import { Screen, ScreenTitle } from "@/components/ui/screen";
import { api } from "@flow/core";
import { cn } from "@/lib/cn";
import { useResource } from "@/lib/hooks/use-resource";
import { useApp } from "@/lib/store/app-provider";
import type { Transaction, TransactionKind } from "@flow/core";

type Filter = "all" | "card" | "loads" | "sends" | "receives";

const FILTERS: { id: Filter; label: string; kinds?: TransactionKind[] }[] = [
  { id: "all", label: "All" },
  { id: "card", label: "Card", kinds: ["card_purchase", "refund"] },
  { id: "loads", label: "Loads", kinds: ["card_load", "fiat_topup"] },
  { id: "sends", label: "Sends", kinds: ["send"] },
  { id: "receives", label: "Receives", kinds: ["receive"] },
];

export default function ActivityPage() {
  const { balanceHidden } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const activity = useResource(useCallback(() => api.getTransactions(), []));

  const filtered = useMemo(() => {
    const kinds = FILTERS.find((f) => f.id === filter)?.kinds;
    const all = activity.data ?? [];
    return kinds ? all.filter((txn) => kinds.includes(txn.kind)) : all;
  }, [activity.data, filter]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <Screen>
      <ScreenTitle
        className="pt-6"
        title="Activity"
        subtitle="Every movement, in one place."
      />

      {/* Toggle buttons, not tabs — these filter a list in place rather than
          switching between tabpanels */}
      <div
        className={cn(
          "no-scrollbar -mx-5 mt-7 flex gap-6 overflow-x-auto px-5",
          // The rule runs the full width; each active tab sits on top of it
          "border-b border-hairline",
        )}
        role="group"
        aria-label="Filter activity"
      >
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-3 text-[15px]",
              "transition-colors duration-200",
              filter === option.id
                ? "border-gold font-semibold text-ink"
                : "border-transparent font-medium text-ink-faint",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {activity.loading ? (
        <div className="mt-6 h-72 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
      ) : groups.length > 0 ? (
        <div className="mt-6 space-y-7">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2.5 text-[14px] font-medium text-ink-muted">
                {group.label}
              </h2>
              <ListGroup>
                {group.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    balanceHidden={balanceHidden}
                  />
                ))}
              </ListGroup>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState filtered={filter !== "all"} />
      )}
    </Screen>
  );
}

interface DayGroup {
  label: string;
  transactions: Transaction[];
}

/** Groups transactions under Today / Yesterday / date headings. */
function groupByDay(transactions: Transaction[]): DayGroup[] {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(new Date());

  const buckets = new Map<number, Transaction[]>();

  for (const transaction of transactions) {
    const day = startOfDay(new Date(transaction.occurredAt));
    const existing = buckets.get(day);
    if (existing) existing.push(transaction);
    else buckets.set(day, [transaction]);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([day, group]) => {
      const dayDiff = Math.round((today - day) / 86_400_000);
      const label =
        dayDiff === 0
          ? "Today"
          : dayDiff === 1
            ? "Yesterday"
            : new Date(day).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year:
                  new Date(day).getFullYear() === new Date().getFullYear()
                    ? undefined
                    : "numeric",
              });

      return { label, transactions: group };
    });
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="mt-6 rounded-[var(--radius-panel)] border border-hairline/70 bg-surface px-6 py-14 text-center">
      <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-wash text-gold">
        <Icon name="activity" size={24} />
      </span>
      <p className="text-[15px] font-medium text-ink">
        {filtered ? "Nothing here yet" : "No activity yet"}
      </p>
      <p className="mx-auto mt-1.5 max-w-[17rem] text-[14px] text-ink-muted">
        {filtered
          ? "Try a different filter to see more of your history."
          : "Load your card or receive crypto and it'll show up here."}
      </p>
    </div>
  );
}
