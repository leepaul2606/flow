import Link from "next/link";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

/**
 * The round quick-actions under the card on Home (Load Card / Send / Receive)
 * and the row on the Card screen (Card Details / View PIN / Freeze / More).
 */
export function CircleAction({
  icon,
  label,
  href,
  onClick,
  disabled = false,
  className,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const circle = (
    <span
      className={cn(
        "grid size-[68px] place-items-center rounded-full",
        "bg-surface-raised border border-hairline/60 text-ink",
        !disabled && "active:bg-gold-wash/50 transition-colors",
      )}
    >
      <Icon name={icon} size={26} />
    </span>
  );

  const caption = (
    <span className="text-[13px] font-medium text-ink">{label}</span>
  );

  const wrapper = cn(
    "flex flex-col items-center gap-2.5",
    disabled && "opacity-40 pointer-events-none",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={wrapper}>
        {circle}
        {caption}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={wrapper}
    >
      {circle}
      {caption}
    </button>
  );
}
