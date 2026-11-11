"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Icon } from "@/components/ui/icon";
import { CARD_DESIGNS, CARD_DESIGN_ORDER } from "@flow/core";
import { cn } from "@/lib/cn";
import { cardArtworkUrl } from "@/lib/card-artwork";

/** How long each design is held before the carousel moves on. */
const AUTOPLAY_MS = 3800;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * The viewer's reduced-motion setting, re-rendering if they change it.
 *
 * useSyncExternalStore rather than an effect, so the value is already right
 * on the first client render and the server snapshot stays false to match the
 * markup Next.js sent.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * The scroll position that puts `slide` in the middle of the track.
 *
 * The slides snap to centre in CSS, so anything that moves the track by hand
 * has to aim at the same place, or the card sitting in the middle stops being
 * the card marked active. The track is padded by half the empty space either
 * side, so the first and last designs can reach the middle too and this never
 * needs clamping.
 */
function centreOf(track: HTMLElement, slide: HTMLElement): number {
  const left = slide.offsetLeft - track.offsetLeft;
  return left - (track.clientWidth - slide.clientWidth) / 2;
}

/**
 * The card designs on the landing page.
 *
 * Built on native scroll-snap rather than a drag library so touch gets real
 * momentum and rubber-banding, with arrows added for pointer users who have
 * nothing to swipe. Slides sit under full width so the neighbouring cards
 * peek in — that peek is what tells someone there is more to see, which a
 * flat grid never does.
 *
 * It advances on its own, and stands down for good the moment someone swipes,
 * taps a dot or uses an arrow: once a visitor is steering, moving the deck
 * under them is just rude. It also idles while the pointer is over it, while
 * focus is inside it, while it is off screen, and entirely for anyone who has
 * asked for reduced motion.
 *
 * At the last design it turns round and walks back rather than rewinding. A
 * six-slide sweep to the start reads as a glitch and an instant jump reads as
 * a dropped frame, where reversing reads as deliberate.
 */
export function DesignCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const programmatic = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [autoplay, setAutoplay] = useState(true);
  const [engaged, setEngaged] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const step = useRef(1);
  const reducedMotion = usePrefersReducedMotion();

  const count = CARD_DESIGN_ORDER.length;

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[index] as HTMLElement | undefined;
    if (!slide) return;

    programmatic.current = true;
    track.scrollTo({
      left: centreOf(track, slide),
      behavior: "smooth",
    });

    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      programmatic.current = false;
    }, 420);

    setActive(index);
  }, []);

  /** A dot, an arrow or a swipe: the visitor is steering now. */
  const takeOver = useCallback(
    (index: number) => {
      setAutoplay(false);
      goTo(index);
    },
    [goTo],
  );

  // Keep the dots and the caption in step with a manual swipe
  const handleScroll = () => {
    if (programmatic.current) return;

    const track = trackRef.current;
    if (!track) return;

    let nearest = 0;
    let smallest = Infinity;

    for (let i = 0; i < track.children.length; i++) {
      const slide = track.children[i] as HTMLElement;
      const distance = Math.abs(centreOf(track, slide) - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        nearest = i;
      }
    }

    if (nearest !== active) setActive(nearest);
  };

  // Don't animate to an empty room
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries[0]?.isIntersecting ?? false),
      { threshold: 0.35 },
    );

    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // One hop at a time, rescheduled on every landing, so a manual move also
  // resets the clock instead of being cut short by a timer already in flight.
  useEffect(() => {
    if (reducedMotion || !autoplay || engaged || !onScreen || count < 2) return;

    const timer = setTimeout(() => {
      let next = active + step.current;

      if (next > count - 1) {
        step.current = -1;
        next = active - 1;
      } else if (next < 0) {
        step.current = 1;
        next = active + 1;
      }

      goTo(next);
    }, AUTOPLAY_MS);

    return () => clearTimeout(timer);
  }, [active, autoplay, engaged, onScreen, reducedMotion, count, goTo]);

  useEffect(() => {
    return () => {
      if (settle.current) clearTimeout(settle.current);
    };
  }, []);

  const design = CARD_DESIGNS[CARD_DESIGN_ORDER[active]];

  return (
    <div
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
    >
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={() => setAutoplay(false)}
        /* Padded by half the leftover width, so the first and last designs
           can sit in the middle like every other one. The inner min() is half
           a slide, mirroring the w-[70vw] max-w-[380px] below. */
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.5rem,calc(50vw-min(35vw,190px)))] md:gap-8 md:px-[max(1.5rem,calc(50vw-min(17vw,190px)))]"
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
        {/* Silent while it moves by itself: announcing a new name every few
            seconds would talk over whatever the visitor is actually reading. */}
        <p
          aria-live={autoplay ? "off" : "polite"}
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
                onClick={() => takeOver(i)}
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
              onClick={() => takeOver(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Previous design"
              className="grid size-11 place-items-center rounded-full border border-gold/45 text-gold transition-opacity disabled:opacity-30"
            >
              <Icon name="arrow-left" size={19} />
            </button>
            <button
              type="button"
              onClick={() => takeOver(Math.min(count - 1, active + 1))}
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
