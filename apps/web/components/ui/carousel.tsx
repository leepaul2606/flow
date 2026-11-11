"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Horizontal scroll-snap carousel.
 *
 * Built on native overflow scrolling rather than a drag library: momentum,
 * rubber-banding and accessibility all come free and behave correctly on iOS,
 * which hand-rolled drag handlers rarely do.
 *
 * Controlled — the parent owns `activeIndex`, so the dots, the swipe and any
 * external selection stay in step.
 */
export function Carousel({
  activeIndex,
  onChange,
  count,
  label,
  children,
  className,
}: {
  activeIndex: number;
  onChange: (index: number) => void;
  /** Number of slides — must match the children passed. */
  count: number;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  /** Suppresses scroll handling while we animate to a slide programmatically. */
  const scrollingProgrammatically = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[index] as HTMLElement | undefined;
    if (!slide) return;

    scrollingProgrammatically.current = true;
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: smooth ? "smooth" : "auto",
    });

    // Release the guard once the smooth scroll has settled
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      scrollingProgrammatically.current = false;
    }, 400);
  }, []);

  // Follow external index changes (dot taps, parent state)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[activeIndex] as HTMLElement | undefined;
    if (!slide) return;

    // Only move if we're not already showing it, so this doesn't fight a
    // user mid-swipe
    const current = track.scrollLeft;
    const target = slide.offsetLeft - track.offsetLeft;
    if (Math.abs(current - target) > 8) {
      scrollToIndex(activeIndex);
    }
  }, [activeIndex, scrollToIndex]);

  const handleScroll = () => {
    if (scrollingProgrammatically.current) return;

    const track = trackRef.current;
    if (!track) return;

    // Nearest slide to the current scroll position
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

    if (nearest !== activeIndex) onChange(nearest);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" && activeIndex < count - 1) {
      event.preventDefault();
      onChange(activeIndex + 1);
    }
    if (event.key === "ArrowLeft" && activeIndex > 0) {
      event.preventDefault();
      onChange(activeIndex - 1);
    }
  };

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto",
          "outline-none focus-visible:ring-2 focus-visible:ring-gold",
          "rounded-[var(--radius-card)]",
        )}
      >
        {children}
      </div>

      {/* Plain buttons, not a tablist: there are no tabpanels here, and
          announcing a tab interface that doesn't exist misleads screen
          readers. aria-current marks the one in view. */}
      {count > 1 ? (
        <div
          className="mt-5 flex items-center justify-center gap-2.5"
          role="group"
          aria-label={`${label} pagination`}
        >
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`Go to item ${index + 1} of ${count}`}
              onClick={() => onChange(index)}
              className={cn(
                "size-2.5 rounded-full transition-colors duration-200",
                index === activeIndex ? "bg-ink" : "bg-hairline",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A single slide. Full width by default so one card shows at a time. */
export function CarouselSlide({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full shrink-0 snap-center", className)}>
      {children}
    </div>
  );
}
