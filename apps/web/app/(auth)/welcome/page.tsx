"use client";

import { useState } from "react";

import {
  AnimatedWordmark,
  fadeIn,
  riseIn,
} from "@/components/flow/animated-wordmark";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const SLIDES = [
  {
    headline: "The private card\nfor limitless freedom.",
    body: "Spend globally. Your money, your way.\nPrivate, secure and built for you.",
  },
  {
    headline: "Your stablecoins,\nspendable anywhere.",
    body: "Hold your stablecoins, load your card\nin seconds, and pay wherever Visa works.",
  },
  {
    headline: "Built for how\nyou actually move.",
    body: "Freeze and unfreeze instantly. Track every\ntransaction. Stay in control from anywhere.",
  },
];

/**
 * Entry sequence, in step with the wordmark draw:
 * the stream finishes at 1.5s, the logo settles by ~2.1s, and the copy and
 * actions rise behind it. Changing slide swaps the text without restarting
 * the animation — it plays once on entry, not on every tap.
 */
const HEADLINE_AT = 1700;
const COPY_AT = 1840;
const PRIMARY_AT = 1980;
const SECONDARY_AT = 2080;
const DOTS_AT = 2240;

export default function WelcomePage() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <div className="flex min-h-screen-safe flex-col px-5 pt-safe pb-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatedWordmark width={236} />

        <h1
          className="mt-12 whitespace-pre-line font-sans text-[34px] font-semibold leading-[1.2] tracking-tight text-ink"
          style={riseIn(HEADLINE_AT)}
        >
          {slide.headline}
        </h1>

        <p
          className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-ink-muted"
          style={riseIn(COPY_AT)}
        >
          {slide.body}
        </p>
      </div>

      <div className="space-y-3.5">
        <div style={riseIn(PRIMARY_AT)}>
          <ButtonLink href="/login?mode=signup">Get Started</ButtonLink>
        </div>
        <div style={riseIn(SECONDARY_AT)}>
          <ButtonLink href="/login?mode=login" variant="secondary">
            Log In
          </ButtonLink>
        </div>
      </div>

      <div
        className="mt-8 flex items-center justify-center gap-2.5"
        role="group"
        aria-label="Introduction slides"
        style={fadeIn(DOTS_AT)}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === index ? "true" : undefined}
            aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
            onClick={() => setIndex(i)}
            className={cn(
              "size-2.5 rounded-full transition-colors duration-200",
              i === index ? "bg-gold" : "bg-gold/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
