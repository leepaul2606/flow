"use client";

import Link from "next/link";
import { useCallback } from "react";

import { BalanceChange } from "@/components/flow/balance-change";
import { CardFace } from "@/components/flow/card-face";
import { TransactionRow } from "@/components/flow/transaction-row";
import { Button } from "@/components/ui/button";
import { CircleAction } from "@/components/ui/circle-action";
import { Icon } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list-row";
import { SectionHeading } from "@/components/ui/panel";
import { RoundIconButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useGreeting } from "@/lib/hooks/use-greeting";
import { useResource } from "@/lib/hooks/use-resource";
import { formatUsd, maskValue } from "@flow/core";
import { useApp } from "@/lib/store/app-provider";

export default function HomePage() {
  const { balanceHidden, toggleBalanceHidden } = useApp();

  const greeting = useGreeting();

  const user = useResource(useCallback(() => api.getUser(), []));
  const portfolio = useResource(useCallback(() => api.getPortfolio(), []));
  const cards = useResource(useCallback(() => api.getCards(), []));

  const firstName = user.data?.personalInfo.firstName?.trim();
  const activity = useResource(
    useCallback(() => api.getTransactions({ limit: 3 }), []),
  );

  const physicalCard = cards.data?.find((card) => card.kind === "physical");

  return (
    <Screen>
      <div className="flex min-h-[44px] items-center justify-between pt-4">
        {/* Falls back to the time of day until we know their name, and stays
            on it if they never gave one */}
        <p className="text-[19px] font-semibold text-ink">
          {firstName ? `Hey ${firstName}` : greeting}
        </p>
        <RoundIconButton
          icon={balanceHidden ? "eye" : "eye-off"}
          label={balanceHidden ? "Show balances" : "Hide balances"}
          onClick={toggleBalanceHidden}
        />
      </div>

      <section className="mt-2">
        <p className="text-[15px] text-ink-muted">Portfolio Value</p>

        {portfolio.loading ? (
          <div className="mt-2 h-[58px] w-64 animate-pulse rounded-lg bg-hairline/60" />
        ) : portfolio.data ? (
          <>
            <p className="mt-1 font-display text-[54px] leading-none text-ink tabular">
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
          <ErrorLine message={portfolio.error} onRetry={portfolio.reload} />
        )}
      </section>

      <section className="mt-7">
        {cards.loading ? (
          <div className="aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
        ) : physicalCard ? (
          <Link href="/card" aria-label="Open card">
            <CardFace
              card={physicalCard}
              showBalance
              balanceHidden={balanceHidden}
              priority
            />
          </Link>
        ) : (
          <ErrorLine message={cards.error} onRetry={cards.reload} />
        )}
      </section>

      <section className="mt-8 flex items-start justify-around">
        <CircleAction icon="plus" label="Load Card" href="/card/load" />
        <span className="mt-3 h-14 w-px bg-hairline" aria-hidden="true" />
        <CircleAction icon="arrow-up-right" label="Send" href="/wallet/send" />
        <span className="mt-3 h-14 w-px bg-hairline" aria-hidden="true" />
        <CircleAction icon="arrow-down" label="Receive" href="/wallet/receive" />
      </section>

      <section className="mt-10">
        <SectionHeading
          action={
            <Link href="/activity" className="text-[15px] font-medium text-gold">
              View All
            </Link>
          }
        >
          Recent Activity
        </SectionHeading>

        {activity.loading ? (
          <div className="h-56 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
        ) : activity.data && activity.data.length > 0 ? (
          <ListGroup>
            {activity.data.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                balanceHidden={balanceHidden}
              />
            ))}
          </ListGroup>
        ) : (
          <EmptyActivity />
        )}
      </section>
    </Screen>
  );
}

/** Dynamic empty state — V1 has no dedicated empty screens. */
function EmptyActivity() {
  return (
    <div className="rounded-[var(--radius-panel)] border border-hairline/70 bg-surface px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-wash text-gold">
        <Icon name="activity" size={24} />
      </span>
      <p className="text-[15px] font-medium text-ink">No activity yet</p>
      <p className="mx-auto mt-1.5 max-w-[16rem] text-[14px] text-ink-muted">
        Load your card or receive crypto and it&rsquo;ll show up here.
      </p>
    </div>
  );
}

function ErrorLine({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="mt-3 rounded-[var(--radius-panel)] border border-hairline/70 bg-surface p-5">
      <p className="text-[15px] text-ink">{message ?? "Couldn't load this"}</p>
      <Button
        variant="secondary"
        size="sm"
        fullWidth={false}
        className="mt-3"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
