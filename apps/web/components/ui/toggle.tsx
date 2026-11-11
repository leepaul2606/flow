"use client";

import { cn } from "@/lib/cn";

/** iOS-style switch used across the security and card settings screens. */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-gold-gradient" : "bg-hairline",
        disabled && "opacity-40",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] size-[27px] rounded-full bg-white shadow-sm",
          "transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}
