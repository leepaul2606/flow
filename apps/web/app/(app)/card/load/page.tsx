"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AssetLogo } from "@/components/flow/asset-logo";
import { CardFace } from "@/components/flow/card-face";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import {
  ASSET_DECIMALS,
  formatAsset,
  formatUsd,
  parseToMinorUnits,
} from "@flow/core";
import type { StableSymbol, Transaction } from "@flow/core";

const QUICK_AMOUNTS = [10_000, 25_000, 50_000, 100_000]; // USD cents

export default function LoadCardPage() {
  const router = useRouter();

  const portfolio = useResource(useCallback(() => api.getPortfolio(), []));
  const cards = useResource(useCallback(() => api.getCards(), []));

  const [symbol, setSymbol] = useState<StableSymbol>("USDC");
  const [amountText, setAmountText] = useState("");
  const [assetSheetOpen, setAssetSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const card = cards.data?.find((c) => c.kind === "physical");
  const assets = portfolio.data?.assets ?? [];
  const asset = assets.find((a) => a.symbol === symbol);

  const decimals = ASSET_DECIMALS[symbol];
  const amount = parseToMinorUnits(amountText, decimals);
  const exceedsBalance =
    amount !== null && asset ? amount > asset.balance.amount : false;

  const canSubmit =
    Boolean(card) && amount !== null && amount > 0 && !exceedsBalance;

  const handleLoad = async () => {
    if (!card || amount === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const transaction = await api.loadCard({
        cardId: card.id,
        assetSymbol: symbol,
        amount,
      });

      // Read the balance back rather than deriving it from the copy we
      // rendered with — that copy is only correct until anything else moves
      // the card, and a receipt showing a wrong balance is a real defect
      const fresh = await api.getCards();
      cards.set(fresh);
      setNewBalance(
        fresh.find((c) => c.id === card.id)?.availableToSpend ?? null,
      );
      setReceipt(transaction);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load your card",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <div className="flex items-center pt-4">
        <BackButton href="/card" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Load Card
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        {receipt
          ? "Your funds are ready to spend."
          : "Add funds to your card instantly."}
      </p>

      <section className="mt-6">
        {cards.loading ? (
          <div className="aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
        ) : card ? (
          <CardFace card={card} priority />
        ) : (
          <p className="text-[15px] text-ink-muted">No card available</p>
        )}
      </section>

      {receipt ? (
        <LoadReceipt
          transaction={receipt}
          newBalance={newBalance}
          onDone={() => router.push("/card")}
        />
      ) : (
        <>
          <Panel className="mt-7">
            <p className="text-[14px] text-ink-muted">Pay with</p>
            <button
              type="button"
              onClick={() => setAssetSheetOpen(true)}
              className="mt-2.5 flex w-full items-center gap-3"
            >
              <AssetLogo symbol={symbol} size={34} />
              <span className="flex-1 text-left">
                <span className="block text-[17px] font-medium text-ink">
                  {symbol}
                </span>
                <span className="text-[14px] text-ink-muted tabular">
                  {asset
                    ? `${formatAsset(asset.balance)} available`
                    : "Loading…"}
                </span>
              </span>
              <span className="text-ink-faint">
                <Icon name="chevron-right" size={20} />
              </span>
            </button>
          </Panel>

          <Panel className="mt-3.5">
            <label htmlFor="load-amount" className="block text-[14px] text-ink-muted">
              Amount
            </label>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-[38px] leading-none text-ink-faint">
                $
              </span>
              <input
                id="load-amount"
                value={amountText}
                onChange={(e) => {
                  setAmountText(e.target.value);
                  setError(null);
                }}
                inputMode="decimal"
                placeholder="0.00"
                className="min-w-0 flex-1 bg-transparent font-display text-[38px] leading-none text-ink outline-none tabular placeholder:text-ink-faint"
              />
            </div>

            <div className="mt-4 flex gap-2">
              {QUICK_AMOUNTS.map((cents) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => {
                    setAmountText((cents / 100).toFixed(2));
                    setError(null);
                  }}
                  className="flex-1 rounded-full bg-hairline/60 py-2.5 text-[14px] font-semibold text-ink active:bg-gold-wash"
                >
                  {formatUsd(cents, { showCents: false })}
                </button>
              ))}
            </div>
          </Panel>

          {exceedsBalance ? (
            <p role="alert" className="mt-4 text-[14px] text-negative">
              That&rsquo;s more than your {symbol} balance.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          <Button
            className="mt-6"
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleLoad}
          >
            Confirm
          </Button>
        </>
      )}

      <Sheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        title="Choose asset"
      >
        <h2 className="mb-4 text-[19px] font-semibold text-ink">Pay with</h2>
        <div className="space-y-2">
          {assets.map((option) => (
            <button
              key={option.symbol}
              type="button"
              onClick={() => {
                setSymbol(option.symbol);
                setAssetSheetOpen(false);
              }}
              className="flex w-full items-center gap-3.5 rounded-[var(--radius-field)] bg-surface p-4 active:bg-hairline/40"
            >
              <AssetLogo symbol={option.symbol} size={40} />
              <span className="flex-1 text-left">
                <span className="block text-[16px] font-semibold text-ink">
                  {option.symbol}
                </span>
                <span className="text-[14px] text-ink-muted tabular">
                  {formatAsset(option.balance, { withSymbol: true })}
                </span>
              </span>
              {option.symbol === symbol ? (
                <span className="text-gold">
                  <Icon name="check" size={20} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

/** Success state shown in place of the form once the load settles. */
function LoadReceipt({
  transaction,
  newBalance,
  onDone,
}: {
  transaction: Transaction;
  newBalance: number | null;
  onDone: () => void;
}) {
  return (
    <>
      <div className="mt-9 flex flex-col items-center text-center">
        <span className="grid size-[104px] place-items-center rounded-full bg-surface-raised shadow-sm ring-8 ring-surface/60">
          <span className="text-positive">
            <Icon name="check" size={42} strokeWidth={2.2} />
          </span>
        </span>

        <h2 className="mt-6 text-[24px] font-semibold text-ink">
          Card loaded successfully
        </h2>
        <p className="mt-2 text-[16px] text-ink-muted">
          {formatUsd(transaction.amountUsd)} USD has been added to your card.
        </p>
      </div>

      <ListGroup className="mt-7">
        <ListRow
          icon="arrow-down"
          title="Amount loaded"
          trailing={
            <span className="text-[15px] font-semibold text-ink tabular">
              {formatUsd(transaction.amountUsd)} USD
            </span>
          }
          showChevron={false}
        />
        <ListRow
          icon="activity"
          title="Date & time"
          trailing={
            <span className="text-[15px] font-medium text-ink">
              {new Date(transaction.occurredAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          }
          showChevron={false}
        />
        <ListRow
          icon="card"
          title="New balance"
          trailing={
            <span className="text-[15px] font-semibold text-ink tabular">
              {newBalance !== null
                ? `${formatUsd(newBalance)} USD`
                : "Not available"}
            </span>
          }
          showChevron={false}
        />
      </ListGroup>

      <Button className="mt-7" onClick={onDone}>
        View Balance
      </Button>
    </>
  );
}
