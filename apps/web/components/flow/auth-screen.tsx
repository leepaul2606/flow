import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * Shared layout for the verification and passcode steps: a gold outline icon,
 * a serif headline, supporting copy, then the interactive content and
 * actions pinned toward the bottom.
 */
export function AuthScreen({
  icon,
  title,
  subtitle,
  children,
  actions,
  footnote,
  className,
}: {
  icon?: IconName;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen-safe flex-col px-5 pb-10", className)}>
      <div className="flex flex-1 flex-col items-center pt-6 text-center">
        {icon ? (
          <span className="mb-8 text-gold">
            <Icon name={icon} size={76} strokeWidth={1.4} />
          </span>
        ) : null}

        <h1 className="font-display text-[40px] leading-[1.12] text-ink">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-4 max-w-[19rem] text-[17px] leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        ) : null}

        {children ? <div className="mt-10 w-full">{children}</div> : null}
      </div>

      {actions ? <div className="mt-8 space-y-3">{actions}</div> : null}

      {footnote ? (
        <div className="mt-6 flex items-start justify-center gap-2.5 px-2 text-center">
          {footnote}
        </div>
      ) : null}
    </div>
  );
}

/** The reassurance line under the passcode step. */
export function SecurityNote({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="mt-0.5 shrink-0 text-gold">
        <Icon name="shield" size={22} />
      </span>
      <p className="max-w-[20rem] text-left text-[14px] leading-relaxed text-ink-muted">
        {children}
      </p>
    </>
  );
}
