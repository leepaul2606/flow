"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/**
 * Standard screen scaffold: safe-area padding, horizontal gutters, and room
 * at the bottom so content clears the tab bar.
 */
export function Screen({
  children,
  className,
  /** Set false on screens without the bottom tab bar (auth, modals). */
  hasTabBar = true,
}: {
  children: ReactNode;
  className?: string;
  hasTabBar?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-screen-safe px-5 pt-safe",
        hasTabBar ? "pb-32" : "pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Circular back button used on every pushed screen. */
export function BackButton({
  href,
  onClick,
  className,
}: {
  href?: string;
  /** Overrides navigation, e.g. to step back within a multi-phase screen. */
  onClick?: () => void;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={onClick ?? (() => (href ? router.push(href) : router.back()))}
      className={cn(
        "grid size-11 place-items-center rounded-full",
        "border border-gold/35 text-gold bg-surface/60",
        "active:bg-gold-wash/60 transition-colors",
        className,
      )}
    >
      <Icon name="arrow-left" size={20} />
    </button>
  );
}

/**
 * Large screen title in the display serif, with the optional supporting line
 * and a trailing action (the eye toggle, the settings cog).
 */
export function ScreenTitle({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[40px] leading-[1.1] text-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </div>
  );
}

/** Small circular icon button, e.g. the hide-balance eye and settings cog. */
export function RoundIconButton({
  icon,
  label,
  onClick,
  href,
  className,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick ?? (href ? () => router.push(href) : undefined)}
      className={cn(
        "grid size-11 place-items-center rounded-full",
        "bg-surface-raised text-gold border border-hairline/60",
        "active:bg-gold-wash/60 transition-colors",
        className,
      )}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
