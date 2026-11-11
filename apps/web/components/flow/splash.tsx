"use client";

import { AnimatedWordmark } from "./animated-wordmark";

/**
 * Boot screen.
 *
 * Runs the wordmark draw on its own — no copy, no actions — while the app
 * works out where to send the user. Replaces what used to be a blank cream
 * screen during that resolution.
 *
 * The animation holds on its final frame rather than looping: a loop would
 * imply progress that isn't being made, and this state is usually over in
 * well under a second.
 */
export function Splash({ label = "Loading Flow" }: { label?: string }) {
  return (
    <div
      className="grid min-h-screen-safe place-items-center bg-ground px-8"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <AnimatedWordmark width={196} />
    </div>
  );
}
