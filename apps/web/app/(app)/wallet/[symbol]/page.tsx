"use client";

import { notFound, useParams } from "next/navigation";
import { useCallback } from "react";

import { AssetLogo } from "@/components/flow/asset-logo";
import { TransactionRow } from "@/components/flow/transaction-row";
import { CircleAction } from "@/components/ui/circle-action";
import { ListGroup } from "@/components/ui/list-row";
import { Panel, SectionHeading } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { formatAsset, formatUsd, maskValue } from "@flow/core";
import { networkLabel } from "@flow/core";
import { useApp } from "@/lib/store/app-provider";
import type { StableSymbol } from "@flow/core";

const SUPPORTED: StableSymbol[] = ["USDC", "USDT"];

export default function AssetDetailPage() {
  const params = useParams<{ symbol: string }>();
  const { balanceHidden } = useApp();

  const symbol = params.symbol?.toUpperCase() as StableSymbol;
  if (!SUPPORTED.includes(symbol)) notFound();

  const portfolio = useResource(useCallback(() => api.getPortfolio(), []));
  const activity = useResource(
    useCallback(() => api.getTransactions({ limit: 25 }), []),
  );

  const asset = portfolio.data?.assets.find((a) => a.symbol === symbol);

  // Only transactions that actually moved this asset
  const assetActivity = (activity.data ?? []).filter(
    (txn) => txn.assetAmount?.symbol === symbol,
  );

  return (
    <Screen>
      <div className="flex items-center justify-between pt-4">
        <BackButton href="/wallet" />
      </div>

      <section className="mt-8 flex flex-col items-center text-center">
        <AssetLogo symbol={symbol} size={64} />

        <h1 className="mt-4 text-[20px] font-semibold text-ink">{symbol}</h1>
        <p className="mt-0.5 text-[15px] text-ink-muted">
          {asset?.name ?? (symbol === "USDC" ? "USD Coin" : "Tether")}
        </p>

        {portfolio.loading ? (
          <div className="mt-6 h-[52px] w-52 animate-pulse rounded-lg bg-hairline/60" />
        ) : asset ? (
          <>
            <p className="mt-6 font-display text-[48px] leading-none text-ink tabular">
              {maskValue(formatAsset(asset.balance), balanceHidden)}
            </p>
            <p className="mt-2 text-[17px] text-ink-muted tabular">
              {maskValue(formatUsd(asset.usdValue), balanceHidden)}
            </p>
          </>
        ) : (
          <p className="mt-6 text-[15px] text-ink-muted">
            {portfolio.error ?? "Couldn't load this asset"}
          </p>
        )}
      </section>

      <section className="mt-9 flex items-start justify-center gap-14">
        <CircleAction
          icon="arrow-up-right"
          label="Send"
          href={`/wallet/send?asset=${symbol}`}
          disabled={!asset || asset.balance.amount === 0}
        />
        <CircleAction
          icon="arrow-down"
          label="Receive"
          href={`/wallet/receive?asset=${symbol}`}
        />
      </section>

      <Panel className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-ink-muted">Networks</span>
          <span className="text-[15px] font-medium text-ink">
            {(asset?.networks ?? []).map(networkLabel).join(", ") || "None"}
          </span>
        </div>
      </Panel>

      <section className="mt-8">
        <SectionHeading>{symbol} Activity</SectionHeading>

        {activity.loading ? (
          <div className="h-40 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
        ) : assetActivity.length > 0 ? (
          <ListGroup>
            {assetActivity.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                balanceHidden={balanceHidden}
              />
            ))}
          </ListGroup>
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-hairline/70 bg-surface px-6 py-10 text-center">
            <p className="text-[15px] text-ink-muted">
              No {symbol} transactions yet.
            </p>
          </div>
        )}
      </section>
    </Screen>
  );
}
