"use client";

import { useEffect, useRef } from "react";

/**
 * Lifts its children into place the first time they are scrolled to.
 *
 * It renders plain and visible, and only hides itself once the effect has
 * run, so the markup a crawler or a reader without JS receives is the
 * finished page rather than an empty one. Anything already on screen when
 * that happens is left alone, since it would otherwise blink out and back
 * during load, and nothing is applied at all for anyone who has asked for
 * reduced motion.
 *
 * The state lives in a data attribute rather than React state: there is
 * nothing to re-render, only a class of styling to switch.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Already in view, so leave it be rather than flashing it out and back
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.dataset.reveal = "waiting";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        el.dataset.reveal = "in";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
