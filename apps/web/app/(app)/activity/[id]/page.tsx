"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { formatWhen } from "@/components/flow/transaction-row";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { cn } from "@/lib/cn";
import { useResource } from "@/lib/hooks/use-resource";
import { formatAsset, formatUsd } from "@flow/core";
import { explorerUrl, networkLabel, truncateAddress } from "@flow/core";
import type { TransactionStatus } from "@flow/core";

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen-safe bg-ground" />}>
      <TransactionDetail />
    </Suspense>
  );
}

function TransactionDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justSent = searchParams.get("sent") === "1";

  const [copied, setCopied] = useState<string | null>(null);

  const transaction = useResource(
    useCallback(() => api.getTransaction(params.id), [params.id]),
  );

  const txn = transaction.data;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/activity" />
      </div>

      {transaction.loading ? (
        <div className="mt-10 space-y-4">
          <div className="mx-auto h-14 w-52 animate-pulse rounded-lg bg-hairline/60" />
          <div className="h-64 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
        </div>
      ) : txn ? (
        <>
          {justSent ? (
            <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-panel)] bg-positive-wash px-4 py-3.5">
              <span className="shrink-0 text-positive">
                <Icon name="check-circle" size={22} />
              </span>
              <p className="text-[14px] text-ink">
                Transfer submitted. It&rsquo;ll confirm on-chain shortly.
              </p>
            </div>
          ) : null}

          <section className="mt-8 flex flex-col items-center text-center">
            <StatusBadge status={txn.status} />

            <p
              className={cn(
                "mt-5 font-display text-[46px] leading-none tabular",
                txn.amountUsd > 0 ? "text-positive" : "text-ink",
              )}
            >
              {formatUsd(txn.amountUsd, { signed: true })}
            </p>

            {txn.assetAmount ? (
              <p className="mt-2 text-[16px] text-ink-muted tabular">
                {formatAsset(txn.assetAmount, { withSymbol: true })}
              </p>
            ) : null}

            <p className="mt-4 text-[17px] font-medium text-ink">{txn.title}</p>
            {txn.subtitle ? (
              <p className="mt-0.5 text-[15px] text-ink-muted">
                {txn.subtitle}
              </p>
            ) : null}
          </section>

          <ListGroup className="mt-8">
            <ListRow
              icon="activity"
              title="Date & time"
              showChevron={false}
              trailing={
                <span className="text-[15px] font-medium text-ink">
                  {formatWhen(txn.occurredAt)}
                </span>
              }
            />

            {txn.card ? (
              <ListRow
                icon="card"
                title="Card"
                showChevron={false}
                trailing={
                  <span className="text-[15px] font-medium text-ink tabular">
                    •••• {txn.card.last4}
                  </span>
                }
              />
            ) : null}

            {txn.chain ? (
              <>
                <ListRow
                  icon="layers"
                  title="Network"
                  showChevron={false}
                  trailing={
                    <span className="text-[15px] font-medium text-ink">
                      {networkLabel(txn.chain.network)}
                    </span>
                  }
                />
                <ListRow
                  icon="user"
                  title={txn.kind === "send" ? "To" : "From"}
                  showChevron={false}
                  trailing={
                    <button
                      type="button"
                      onClick={() =>
                        copy("address", txn.chain!.counterpartyAddress)
                      }
                      className="flex items-center gap-2 text-[15px] font-medium text-ink"
                    >
                      {truncateAddress(txn.chain.counterpartyAddress)}
                      <span className="text-gold">
                        <Icon
                          name={copied === "address" ? "check" : "copy"}
                          size={16}
                        />
                      </span>
                    </button>
                  }
                />
                <ListRow
                  icon="check-circle"
                  title="Confirmations"
                  showChevron={false}
                  trailing={
                    <span className="text-[15px] font-medium text-ink tabular">
                      {txn.chain.confirmations}
                    </span>
                  }
                />
              </>
            ) : null}

            {txn.reference ? (
              <ListRow
                icon="document"
                title="Reference"
                showChevron={false}
                trailing={
                  <button
                    type="button"
                    onClick={() => copy("reference", txn.reference!)}
                    className="flex items-center gap-2 text-[15px] font-medium text-ink tabular"
                  >
                    {txn.reference}
                    <span className="text-gold">
                      <Icon
                        name={copied === "reference" ? "check" : "copy"}
                        size={16}
                      />
                    </span>
                  </button>
                }
              />
            ) : null}
          </ListGroup>

          {txn.chain ? (
            <a
              href={explorerUrl(txn.chain.network, txn.chain.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 py-3 text-[15px] font-medium text-gold"
            >
              View on block explorer
              <Icon name="external" size={18} />
            </a>
          ) : null}

          <Button variant="secondary" className="mt-4">
            <Icon name="help" size={20} />
            Get help with this transaction
          </Button>
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-[16px] text-ink">
            {transaction.error ?? "Transaction not found"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            fullWidth={false}
            className="mt-4"
            onClick={transaction.reload}
          >
            Try again
          </Button>
        </div>
      )}
    </Screen>
  );
}

const STATUS_STYLE: Record<
  TransactionStatus,
  { label: string; className: string; icon: Parameters<typeof Icon>[0]["name"] }
> = {
  completed: {
    label: "Completed",
    className: "bg-positive-wash text-positive",
    icon: "check-circle",
  },
  pending: {
    label: "Pending",
    className: "bg-warning-wash text-warning",
    icon: "activity",
  },
  processing: {
    label: "Processing",
    className: "bg-warning-wash text-warning",
    icon: "activity",
  },
  failed: {
    label: "Failed",
    className: "bg-negative/10 text-negative",
    icon: "alert",
  },
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  const style = STATUS_STYLE[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2",
        "text-[14px] font-medium",
        style.className,
      )}
    >
      <Icon name={style.icon} size={17} />
      {style.label}
    </span>
  );
}
