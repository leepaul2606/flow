import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Leading gold line icon, as used across the settings screens. */
  icon?: IconName;
  /** Custom leading element (asset logos, merchant avatars). */
  leading?: ReactNode;
  /** Trailing content shown before the chevron. */
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  leading,
  trailing,
  href,
  onClick,
  showChevron,
  className,
}: ListRowProps) {
  const interactive = Boolean(href || onClick);
  const chevron = showChevron ?? interactive;

  const content = (
    <>
      {leading ??
        (icon ? (
          <span className="shrink-0 text-gold">
            <Icon name={icon} size={24} />
          </span>
        ) : null)}

      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] font-medium text-ink">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
            {subtitle}
          </span>
        ) : null}
      </span>

      {trailing ? <span className="shrink-0">{trailing}</span> : null}

      {chevron ? (
        <span className="shrink-0 text-ink-faint">
          <Icon name="chevron-right" size={18} />
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-4 px-5 py-4",
    interactive && "active:bg-hairline/30 transition-colors",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

/**
 * Groups rows into a single panel with hairlines between them.
 * Dividers are inset to align with the row text, matching the mocks.
 */
export function ListGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-panel)] bg-surface",
        "border border-hairline/70",
        "[&>*+*]:border-t [&>*+*]:border-hairline/70",
        className,
      )}
    >
      {children}
    </div>
  );
}
