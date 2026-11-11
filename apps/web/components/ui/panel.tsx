import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The raised surface used throughout the mocks — asset lists, balance cards,
 * settings groups. Soft, near-white, with a hairline rather than a shadow.
 */
export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-panel)] bg-surface border border-hairline/70",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Section label sitting above a panel, e.g. "Assets". */
export function SectionHeading({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between mb-3", className)}>
      <h2 className="text-[17px] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}
