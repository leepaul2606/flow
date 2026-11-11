"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { CardFace } from "@/components/flow/card-face";
import { Button } from "@/components/ui/button";
import { CircleAction } from "@/components/ui/circle-action";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { RoundIconButton, Screen, ScreenTitle } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import { CARD_DESIGNS } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { formatUsd, maskValue } from "@flow/core";
import { useApp } from "@/lib/store/app-provider";

export default function CardPage() {
  const { balanceHidden } = useApp();
  const cards = useResource(useCallback(() => api.getCards(), []));

  const [moreOpen, setMoreOpen] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = cards.data?.find((c) => c.kind === "physical");
  const frozen = card?.status === "frozen";

  const toggleFreeze = async () => {
    if (!card) return;
    setFreezing(true);
    setError(null);

    try {
      const updated = await api.setCardFrozen(card.id, !frozen);
      cards.set(
        (cards.data ?? []).map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update your card",
      );
    } finally {
      setFreezing(false);
    }
  };

  return (
    <Screen>
      <ScreenTitle
        className="pt-6"
        title="Card"
        subtitle="Spend anywhere. No limits."
        action={
          <RoundIconButton
            icon="more"
            label="Card actions"
            onClick={() => setMoreOpen(true)}
          />
        }
      />

      <section className="mt-6">
        {cards.loading ? (
          <div className="aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
        ) : card ? (
          <CardFace card={card} priority />
        ) : (
          <p className="text-[15px] text-ink-muted">
            {cards.error ?? "No card on your account yet"}
          </p>
        )}
      </section>

      <section className="mt-8 flex items-start justify-between px-1">
        <CircleAction
          icon="card"
          label="Card Details"
          href="/card/details"
          disabled={!card}
        />
        <CircleAction icon="eye" label="View PIN" href="/card/pin" disabled={!card} />
        <CircleAction
          icon="snowflake"
          label={frozen ? "Unfreeze" : "Freeze Card"}
          onClick={toggleFreeze}
          disabled={!card || freezing}
        />
        <CircleAction
          icon="more"
          label="More"
          onClick={() => setMoreOpen(true)}
          disabled={!card}
        />
      </section>

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-negative">
          {error}
        </p>
      ) : null}

      <Panel className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[15px] text-ink-muted">Available to spend</p>
            <p className="mt-1 font-display text-[30px] leading-none text-ink tabular">
              {card
                ? maskValue(
                    `${formatUsd(card.availableToSpend)} USD`,
                    balanceHidden,
                  )
                : "No card yet"}
            </p>
          </div>

          <Link
            href="/card/load"
            className="flex shrink-0 items-center gap-2 rounded-[var(--radius-field)] bg-gold-wash px-5 py-3.5 text-[16px] font-semibold text-gold active:brightness-95"
          >
            Load Card
            <Icon name="plus" size={18} strokeWidth={2} />
          </Link>
        </div>
      </Panel>

      <ListGroup className="mt-5">
        <ListRow
          icon="sliders"
          title="Spending Limits"
          subtitle="Set and manage card limits"
          href="/card/limits"
        />
        <ListRow
          icon="wallet"
          title="Add to Apple Wallet"
          subtitle="Tap to add your card"
          onClick={() => setMoreOpen(true)}
          trailing={<AppleWalletBadge />}
        />
        <ListRow
          icon="scan"
          title="Card Design"
          subtitle={
            card
              ? CARD_DESIGNS[card.design].name
              : "Choose how your card looks"
          }
          href="/card/design"
        />
        <ListRow
          icon="layers"
          title="Virtual Cards"
          subtitle="Create and manage virtual cards"
          href="/card/virtual"
        />
      </ListGroup>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <h2 className="mb-4 text-[19px] font-semibold text-ink">Card actions</h2>
        <div className="space-y-2">
          <ListRow
            icon="document"
            title="Card statements"
            subtitle="Download monthly statements"
            href="/activity"
            className="rounded-[var(--radius-field)] bg-surface"
          />
          <ListRow
            icon="key"
            title="Replace card"
            subtitle="Report lost or stolen"
            onClick={() => setMoreOpen(false)}
            className="rounded-[var(--radius-field)] bg-surface"
          />
        </div>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => setMoreOpen(false)}
        >
          Close
        </Button>
      </Sheet>
    </Screen>
  );
}

function AppleWalletBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[11px] font-medium leading-tight text-white">
      <Icon name="wallet" size={16} />
      <span>
        Add to
        <br />
        Apple Wallet
      </span>
    </span>
  );
}
