"use client";

import { useEffect, useRef } from "react";

/** Degrees of lean once the pointer reaches an edge of the card. Past about
    8 it stops reading as a card catching the light and starts reading as a
    gimmick. */
const MAX_TILT = 6;

/**
 * Leans the hero card towards the pointer, and lets it settle back.
 *
 * Writes straight to the DOM rather than going through state. This fires on
 * every pointer move, and re-rendering the hero that often to shift a card a
 * few degrees would be wasteful. Mouse only: on a touch screen there is no
 * hover to answer, so the card simply keeps the resting tilt it animates
 * into, and the same goes for anyone who has asked for reduced motion.
 */
export function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;

    const lean = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // -1 at one edge, +1 at the other, so MAX_TILT is reached at the edge
        const box = el.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
        const y = ((event.clientY - box.top) / box.height - 0.5) * 2;

        // Short follow while tracking, so fast moves smooth out without lag
        el.style.setProperty("--tilt-ease", "110ms");
        el.style.setProperty("--tilt-x", `${(-y * MAX_TILT).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(x * MAX_TILT).toFixed(2)}deg`);
      });
    };

    const settle = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      // Longer on the way out, so it relaxes rather than snaps
      el.style.setProperty("--tilt-ease", "620ms");
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };

    el.dataset.tilt = "on";
    el.addEventListener("pointermove", lean);
    el.addEventListener("pointerleave", settle);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", lean);
      el.removeEventListener("pointerleave", settle);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
