import { cn } from "@/lib/cn";
import type { KycStatus } from "@flow/core";

const STATUS: Record<KycStatus, { label: string; className: string }> = {
  approved: { label: "Verified", className: "bg-positive-wash text-positive" },
  in_review: { label: "In review", className: "bg-warning-wash text-warning" },
  document_required: {
    label: "Action needed",
    className: "bg-warning-wash text-warning",
  },
  personal_info_required: {
    label: "Action needed",
    className: "bg-warning-wash text-warning",
  },
  not_started: { label: "Not started", className: "bg-hairline text-ink-muted" },
  rejected: { label: "Rejected", className: "bg-negative/10 text-negative" },
};

export function KycBadge({
  status,
  className,
}: {
  status: KycStatus;
  className?: string;
}) {
  const style = STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5",
        "text-[13px] font-medium",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
