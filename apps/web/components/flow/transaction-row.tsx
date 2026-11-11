import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatUsd, maskValue } from "@flow/core";
import type { Transaction, TransactionKind } from "@flow/core";
import { Icon, type IconName } from "@/components/ui/icon";

const KIND_ICON: Record<TransactionKind, IconName> = {
  card_purchase: "card",
  card_load: "plus",
  send: "arrow-up-right",
  receive: "arrow-down",
  fiat_topup: "wallet",
  refund: "arrow-down",
};

/** Neutral avatar tint per transaction kind — merchant logos come later. */
const KIND_TINT: Record<TransactionKind, string> = {
  card_purchase: "bg-ink text-white",
  card_load: "bg-gold-wash text-gold",
  send: "bg-hairline text-ink",
  receive: "bg-positive-wash text-positive",
  fiat_topup: "bg-gold-wash text-gold",
  refund: "bg-positive-wash text-positive",
};

export function TransactionRow({
  transaction,
  balanceHidden = false,
  showDate = true,
}: {
  transaction: Transaction;
  balanceHidden?: boolean;
  showDate?: boolean;
}) {
  const { amountUsd, status } = transaction;
  const inflow = amountUsd > 0;
  const pending = status === "pending" || status === "processing";

  return (
    <Link
      href={`/activity/${transaction.id}`}
      className="flex w-full items-center gap-3.5 px-5 py-4 transition-colors active:bg-hairline/30"
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full",
          KIND_TINT[transaction.kind],
        )}
      >
        <Icon name={KIND_ICON[transaction.kind]} size={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">
          {transaction.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-muted">
          {showDate ? <span>{formatWhen(transaction.occurredAt)}</span> : null}
          {pending ? (
            <span className="rounded-full bg-warning-wash px-2 py-0.5 text-[11px] font-medium text-warning">
              Pending
            </span>
          ) : null}
          {status === "failed" ? (
            <span className="rounded-full bg-negative/10 px-2 py-0.5 text-[11px] font-medium text-negative">
              Failed
            </span>
          ) : null}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span
          className={cn(
            "block text-[15px] font-semibold tabular",
            inflow ? "text-positive" : "text-ink",
          )}
        >
          {maskValue(formatUsd(amountUsd, { signed: true }), balanceHidden)}
        </span>
      </span>

      <span className="shrink-0 text-ink-faint">
        <Icon name="chevron-right" size={18} />
      </span>
    </Link>
  );
}

/** "Today, 9:41 AM" / "Yesterday, 6:37 PM" / "12 Aug, 4:05 PM". */
export function formatWhen(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const dayDiff = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}, ${time}`;
}
