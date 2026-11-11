"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { CardFace } from "@/components/flow/card-face";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselSlide } from "@/components/ui/carousel";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { BackButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import {
  CARD_DESIGNS,
  CARD_DESIGN_ORDER,
  DEFAULT_CARD_DESIGN,
  type CardDesignId,
} from "@flow/core";
import { cardArtworkUrl } from "@/lib/card-artwork";
import { cn } from "@/lib/cn";
import { useResource } from "@/lib/hooks/use-resource";
import { formatUsd } from "@flow/core";
import type { PaymentCard } from "@flow/core";

export default function VirtualCardsPage() {
  const cards = useResource(useCallback(() => api.getCards(), []));

  const [active, setActive] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [design, setDesign] = useState<CardDesignId>(DEFAULT_CARD_DESIGN);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const virtualCards = (cards.data ?? []).filter((c) => c.kind === "virtual");

  const handleCreate = async () => {
    if (label.trim() === "") {
      setError("Give the card a name");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const created = await api.createVirtualCard(label.trim(), design);
      const next = [...(cards.data ?? []), created];
      cards.set(next);
      // Bring the new card into view
      setActive(next.filter((c) => c.kind === "virtual").length - 1);
      setCreateOpen(false);
      setLabel("");
      setDesign(DEFAULT_CARD_DESIGN);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create the card",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/card" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Virtual Cards
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Separate card numbers for subscriptions and one-off payments.
      </p>

      {cards.loading ? (
        <div className="mt-7 aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
      ) : virtualCards.length > 0 ? (
        <section className="mt-7">
          <Carousel
            activeIndex={Math.min(active, virtualCards.length - 1)}
            onChange={setActive}
            count={virtualCards.length}
            label="Your virtual cards"
          >
            {virtualCards.map((card, index) => (
              <CarouselSlide key={card.id}>
                <CardFace card={card} priority={index === 0} />
              </CarouselSlide>
            ))}
          </Carousel>

          {/* Details track the card in view */}
          <VirtualCardDetails
            card={virtualCards[Math.min(active, virtualCards.length - 1)]}
          />
        </section>
      ) : (
        <div className="mt-7 rounded-[var(--radius-panel)] border border-hairline/70 bg-surface px-6 py-12 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-wash text-gold">
            <Icon name="layers" size={24} />
          </span>
          <p className="text-[15px] font-medium text-ink">No virtual cards</p>
          <p className="mx-auto mt-1.5 max-w-[16rem] text-[14px] text-ink-muted">
            Create one to keep subscriptions off your main card.
          </p>
        </div>
      )}

      <Button className="mt-7" onClick={() => setCreateOpen(true)}>
        <Icon name="plus" size={20} />
        Create virtual card
      </Button>

      <Sheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create virtual card"
      >
        <h2 className="text-[22px] font-semibold text-ink">
          Create virtual card
        </h2>
        <p className="mt-2 text-[15px] text-ink-muted">
          Name it so you can tell your cards apart later.
        </p>

        <Field
          className="mt-5"
          label="Card name"
          placeholder="Subscriptions"
          value={label}
          maxLength={40}
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        <p className="mt-6 mb-3 text-[15px] font-medium text-ink">Design</p>
        <DesignPicker selected={design} onSelect={setDesign} />

        <div className="mt-6 space-y-3">
          <Button loading={creating} onClick={handleCreate}>
            Create card
          </Button>
          <Button
            variant="secondary"
            disabled={creating}
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

function VirtualCardDetails({ card }: { card: PaymentCard }) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[18px] font-semibold text-ink">
          {card.label ?? `Virtual ••${card.last4}`}
        </p>
        <p className="shrink-0 text-[16px] text-ink-muted tabular">
          {formatUsd(card.availableToSpend)}
        </p>
      </div>

      <p className="mt-0.5 text-[14px] text-ink-muted tabular">
        •••• {card.last4}
        {card.status === "frozen" ? " · Frozen" : ""}
      </p>

      <Link
        href={`/card/design?card=${card.id}`}
        className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-medium text-gold"
      >
        {CARD_DESIGNS[card.design].name}
        <Icon name="chevron-right" size={16} />
      </Link>
    </div>
  );
}

/**
 * Compact swatch row for choosing a design inside a sheet, where there isn't
 * room for the full preview treatment on /card/design.
 */
function DesignPicker({
  selected,
  onSelect,
}: {
  selected: CardDesignId;
  onSelect: (id: CardDesignId) => void;
}) {
  return (
    <ul className="grid grid-cols-3 gap-2.5">
      {CARD_DESIGN_ORDER.map((id) => {
        const design = CARD_DESIGNS[id];
        const chosen = id === selected;

        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={chosen}
              className="w-full"
            >
              <span
                className={cn(
                  "relative block aspect-[1.586/1] overflow-hidden rounded-lg transition-all",
                  chosen
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-ground"
                    : "ring-1 ring-hairline",
                )}
                style={{ backgroundColor: design.fallback }}
              >
                <Image
                  src={cardArtworkUrl(design)}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {chosen ? (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-gold-gradient text-ink shadow">
                    <Icon name="check" size={12} strokeWidth={2.8} />
                  </span>
                ) : null}
              </span>

              <span
                className={cn(
                  "mt-1.5 block text-center text-[11px] leading-tight",
                  chosen
                    ? "font-semibold text-ink"
                    : "font-medium text-ink-muted",
                )}
              >
                {design.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
