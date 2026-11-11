"use client";

import Link from "next/link";
import { useCallback } from "react";

import { AssetLogo } from "@/components/flow/asset-logo";
import { BalanceChange } from "@/components/flow/balance-change";
import { Icon } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list-row";
import { Panel, SectionHeading } from "@/components/ui/panel";
import { RoundIconButton, Screen, ScreenTitle } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { formatAsset, formatUsd, maskValue } from "@flow/core";
import { useApp } from "@/lib/store/app-provider";

export default function WalletPage() {
  const { balanceHidden, toggleBalanceHidden } = useApp();
  const portfolio = useResource(useCallback(() => api.getPortfolio(), []));

  const assets = portfolio.data?.assets ?? [];
  const hasAssets = assets.some((asset) => asset.balance.amount > 0);

  return (
    <Screen>
      <ScreenTitle
        className="pt-6"
        title="Wallet"
        subtitle="Your assets, all in one place."
        action={
          <RoundIconButton
            icon={balanceHidden ? "eye" : "eye-off"}
            label={balanceHidden ? "Show balances" : "Hide balances"}
            onClick={toggleBalanceHidden}
          />
        }
      />

      <Panel className="mt-7">
        <p className="text-[15px] text-ink-muted">Total Balance</p>

        {portfolio.loading ? (
          <div className="mt-2 h-[52px] w-56 animate-pulse rounded-lg bg-hairline/60" />
        ) : portfolio.data ? (
          <>
            <p className="mt-1.5 font-display text-[48px] leading-none text-ink tabular">
              {maskValue(formatUsd(portfolio.data.totalUsdValue), balanceHidden)}
            </p>
            <BalanceChange
              className="mt-4"
              changeUsd={portfolio.data.changeUsd24h}
              changePct={portfolio.data.changePct24h}
              hidden={balanceHidden}
            />
          </>
        ) : (
          <p className="mt-2 text-[15px] text-ink-muted">
            {portfolio.error ?? "Couldn't load your balance"}
          </p>
        )}
      </Panel>

      <section className="mt-8">
        <SectionHeading>Assets</SectionHeading>

        {portfolio.loading ? (
          <div className="h-44 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
        ) : hasAssets ? (
          <ListGroup>
            {assets.map((asset) => (
              <Link
                key={asset.symbol}
                href={`/wallet/${asset.symbol.toLowerCase()}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors active:bg-hairline/30"
              >
                <AssetLogo symbol={asset.symbol} />

                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-ink">
                    {asset.symbol}
                  </span>
                  <span className="mt-0.5 block text-[14px] text-ink-muted">
                    {asset.name}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[16px] font-semibold text-ink tabular">
                    {maskValue(formatAsset(asset.balance), balanceHidden)}
                  </span>
                  <span className="mt-0.5 block text-[14px] text-ink-muted tabular">
                    {maskValue(formatUsd(asset.usdValue), balanceHidden)}
                  </span>
                </span>

                <span className="shrink-0 text-ink-faint">
                  <Icon name="chevron-right" size={18} />
                </span>
              </Link>
            ))}
          </ListGroup>
        ) : (
          <EmptyAssets />
        )}
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-[14px] text-ink-muted">
        <Icon name="lock" size={16} />
        Only you can see your balances.
      </p>
    </Screen>
  );
}

function EmptyAssets() {
  return (
    <div className="rounded-[var(--radius-panel)] border border-hairline/70 bg-surface px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-wash text-gold">
        <Icon name="wallet" size={24} />
      </span>
      <p className="text-[15px] font-medium text-ink">No assets yet</p>
      <p className="mx-auto mt-1.5 max-w-[16rem] text-[14px] text-ink-muted">
        Receive a stablecoin to get started.
      </p>
      <Link
        href="/wallet/receive"
        className="mt-4 inline-block text-[15px] font-medium text-gold"
      >
        Receive crypto
      </Link>
    </div>
  );
}
