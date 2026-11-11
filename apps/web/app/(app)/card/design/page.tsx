"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { CardFace } from "@/components/flow/card-face";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselSlide } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { BackButton, RoundIconButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import {
  CARD_DESIGNS,
  CARD_DESIGN_ORDER,
  type CardDesignId,
} from "@flow/core";
import { cn } from "@/lib/cn";
import { useResource } from "@/lib/hooks/use-resource";
import type { PaymentCard } from "@flow/core";

export default function CardDesignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen-safe bg-ground" />}>
      <CardDesignPicker />
    </Suspense>
  );
}

function CardDesignPicker() {
  const searchParams = useSearchParams();
  const requestedCardId = searchParams.get("card");

  const cards = useResource(useCallback(() => api.getCards(), []));

  // Which design is previewed. Null means "whatever the card already has".
  const [preview, setPreview] = useState<CardDesignId | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const card: PaymentCard | undefined = requestedCardId
    ? cards.data?.find((c) => c.id === requestedCardId)
    : cards.data?.find((c) => c.kind === "physical");

  const selected = preview ?? card?.design ?? "obsidian_gold";
  const isActive = card?.design === selected;

  const apply = async () => {
    if (!card) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await api.setCardDesign(card.id, selected);
      cards.set(
        (cards.data ?? []).map((c) => (c.id === updated.id ? updated : c)),
      );
      setPreview(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't apply that design",
      );
    } finally {
      setSaving(false);
    }
  };

  const cardLabel =
    card?.kind === "virtual"
      ? (card.label ?? "Your Virtual Card")
      : "Your Flow Card";

  return (
    <Screen>
      <div className="flex items-center justify-between pt-4">
        <BackButton href="/card" />
        <RoundIconButton
          icon="help"
          label="About card designs"
          onClick={() => setInfoOpen(true)}
        />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Card Design
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {card?.kind === "virtual"
          ? "Choose the look for this virtual card."
          : "Choose the look for your card in the app."}
      </p>

      {cards.loading ? (
        <div className="mt-8 aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
      ) : card ? (
        <>
          <p className="mt-7 text-[15px] font-medium text-gold">{cardLabel}</p>

          {/* Swipe through the designs, or tap one in the grid below */}
          <Carousel
            className="mt-3"
            activeIndex={CARD_DESIGN_ORDER.indexOf(selected)}
            onChange={(index) => setPreview(CARD_DESIGN_ORDER[index])}
            count={CARD_DESIGN_ORDER.length}
            label="Card designs"
          >
            {CARD_DESIGN_ORDER.map((id, index) => (
              <CarouselSlide key={id}>
                <CardFace
                  card={card}
                  design={id}
                  priority={index === 0}
                />
              </CarouselSlide>
            ))}
          </Carousel>

          {isActive ? (
            <Panel className="mt-6">
              <div className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-gold">
                  <Icon name="check" size={22} strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold text-ink">
                    Design Active
                  </p>
                  <p className="mt-0.5 text-[14px] text-ink-muted">
                    This design is applied to your card.
                  </p>
                </div>
                <span className="shrink-0 rounded-lg border border-gold/50 px-3 py-1.5 text-[12px] font-semibold tracking-wide text-gold">
                  ACTIVE
                </span>
              </div>
            </Panel>
          ) : (
            <div className="mt-6">
              <Button loading={saving} onClick={apply}>
                Apply {CARD_DESIGNS[selected].name}
              </Button>
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-4 text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          <section className="mt-9">
            <h2 className="mb-4 text-[17px] font-semibold text-ink">
              All Designs
            </h2>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
              {CARD_DESIGN_ORDER.map((id) => {
                const design = CARD_DESIGNS[id];
                const chosen = id === selected;

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setPreview(id)}
                      aria-pressed={chosen}
                      className="w-full text-left"
                    >
                      <span
                        className={cn(
                          "relative block overflow-hidden rounded-xl transition-all",
                          chosen
                            ? "ring-2 ring-gold ring-offset-2 ring-offset-ground"
                            : "ring-1 ring-hairline",
                        )}
                      >
                        <CardFace card={card} design={id} variant="thumb" />

                        {chosen ? (
                          <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-gold-gradient text-ink shadow">
                            <Icon name="check" size={14} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </span>

                      <span
                        className={cn(
                          "mt-2 block text-[13px] leading-tight",
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
          </section>

          <Panel className="mt-8">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-full bg-gold-wash text-gold">
                <Icon name="check-circle" size={22} />
              </span>
              <div>
                <p className="text-[16px] font-semibold text-ink">
                  One card. Every experience.
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  The look changes, but your balance, limits and details stay
                  the same.
                </p>
              </div>
            </div>
          </Panel>
        </>
      ) : (
        <p className="mt-8 text-[15px] text-ink-muted">
          {cards.error ?? "No card available"}
        </p>
      )}

      <Sheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="About card designs"
      >
        <h2 className="text-[22px] font-semibold text-ink">
          About card designs
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          Designs change how your card looks in the Flow app. Your card number,
          balance, limits and spending history are untouched.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          Your physical card keeps the design it was printed with. A new
          colourway applies to the plastic only when a replacement card is
          issued.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setInfoOpen(false)}
        >
          Got it
        </Button>
      </Sheet>
    </Screen>
  );
}
