import { cn } from "@/lib/cn";
import { formatPercent, formatUsd } from "@flow/core";
import { Icon } from "@/components/ui/icon";

/** "↑ +$1,245.32 (4.58%) today" — the 24h delta under a balance. */
export function BalanceChange({
  changeUsd,
  changePct,
  hidden = false,
  className,
}: {
  changeUsd: number;
  changePct: number;
  hidden?: boolean;
  className?: string;
}) {
  const positive = changeUsd >= 0;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-full",
          positive ? "bg-positive-wash text-positive" : "bg-negative/10 text-negative",
        )}
      >
        <Icon
          name={positive ? "arrow-up-right" : "arrow-down"}
          size={16}
          strokeWidth={2}
        />
      </span>

      <p className="text-[15px] text-ink-muted">
        {hidden ? (
          "••••••"
        ) : (
          <>
            <span
              className={cn(
                "font-medium tabular",
                positive ? "text-positive" : "text-negative",
              )}
            >
              {formatUsd(changeUsd, { signed: true })}
            </span>{" "}
            <span className="tabular">({formatPercent(changePct)})</span> today
          </>
        )}
      </p>
    </div>
  );
}
