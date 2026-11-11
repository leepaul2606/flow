import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * The Flow wordmark.
 *
 * The supplied PNG arrived with its transparency flattened — the design tool's
 * checkerboard had become real pixels. `scripts/make-transparent-logo.mjs`
 * rebuilds the alpha channel from pixel coverage, so this now sits cleanly on
 * any background. Replace with the designer's SVG when one exists.
 */
export function FlowLogo({
  width = 236,
  className,
  priority = false,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/flow-logo.png"
      alt="Flow"
      width={1754}
      height={896}
      priority={priority}
      style={{ width }}
      className={cn("h-auto", className)}
    />
  );
}
