"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { CARD_DESIGNS, CARD_DESIGN_ORDER } from "@flow/core";
import { cn } from "@/lib/cn";
import { cardArtworkUrl } from "@/lib/card-artwork";

/**
 * The card designs on the landing page.
 *
 * Built on native scroll-snap rather than a drag library so touch gets real
 * momentum and rubber-banding, with arrows added for pointer users who have
 * nothing to swipe. Slides sit under full width so the neighbouring cards
 * peek in — that peek is what tells someone there is more to see, which a
 * flat grid never does.
 */
export function DesignCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const programmatic = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = CARD_DESIGN_ORDER.length;

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[index] as HTMLElement | undefined;
    if (!slide) return;

    programmatic.current = true;
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });

    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      programmatic.current = false;
    }, 420);

    setActive(index);
  }, []);

  // Keep the dots and the caption in step with a manual swipe
  const handleScroll = () => {
    if (programmatic.current) return;

    const track = trackRef.current;
    if (!track) return;

    let nearest = 0;
    let smallest = Infinity;

    for (let i = 0; i < track.children.length; i++) {
      const slide = track.children[i] as HTMLElement;
      const distance = Math.abs(
        slide.offsetLeft - track.offsetLeft - track.scrollLeft,
      );
      if (distance < smallest) {
        smallest = distance;
        nearest = i;
      }
    }

    if (nearest !== active) setActive(nearest);
  };

  useEffect(() => {
    return () => {
      if (settle.current) clearTimeout(settle.current);
    };
  }, []);

  const design = CARD_DESIGNS[CARD_DESIGN_ORDER[active]];

  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 md:gap-8"
      >
        {CARD_DESIGN_ORDER.map((id, i) => {
          const d = CARD_DESIGNS[id];
          return (
            <li
              key={id}
              className="w-[70vw] max-w-[380px] shrink-0 snap-center md:w-[34vw]"
            >
              <div
                className={cn(
                  "overflow-hidden rounded-[var(--radius-card)] transition-all duration-500",
                  i === active
                    ? "shadow-[0_40px_70px_-25px_rgba(0,0,0,0.5)]"
                    : "scale-[0.94] opacity-55 shadow-lg",
                )}
              >
                <Image
                  src={cardArtworkUrl(d)}
                  alt={`Flow card in ${d.name}`}
                  width={1578}
                  height={996}
                  className="h-auto w-full"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between gap-6 px-6">
        <p
          aria-live="polite"
          className="font-display text-[19px] text-ink md:text-[22px]"
        >
          {design.name}
        </p>

        <div className="flex items-center gap-5">
          {/* Dots, not tabs — there are no tabpanels here */}
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Card designs"
          >
            {CARD_DESIGN_ORDER.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active ? "true" : undefined}
                aria-label={`Show ${CARD_DESIGNS[id].name}`}
                className={cn(
                  "size-2.5 rounded-full transition-colors duration-200",
                  i === active ? "bg-gold" : "bg-gold/25",
                )}
              />
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Previous design"
              className="grid size-11 place-items-center rounded-full border border-gold/45 text-gold transition-opacity disabled:opacity-30"
            >
              <Icon name="arrow-left" size={19} />
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(count - 1, active + 1))}
              disabled={active === count - 1}
              aria-label="Next design"
              className="grid size-11 place-items-center rounded-full border border-gold/45 text-gold transition-opacity disabled:opacity-30"
            >
              <span className="rotate-180">
                <Icon name="arrow-left" size={19} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
