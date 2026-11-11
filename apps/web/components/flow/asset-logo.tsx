import { cn } from "@/lib/cn";
import type { StableSymbol } from "@flow/core";

const BRAND: Record<StableSymbol, string> = {
  USDC: "#2775CA",
  USDT: "#26A17B",
};

/** Circular token mark for USDC and USDT, drawn rather than bitmapped. */
export function AssetLogo({
  symbol,
  size = 44,
  className,
}: {
  symbol: StableSymbol;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full", className)}
      style={{ width: size, height: size, backgroundColor: BRAND[symbol] }}
      aria-hidden="true"
    >
      {symbol === "USDC" ? (
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
          />
          <path
            d="M12 6.2v11.6"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M14.6 9.1c-.5-.9-1.5-1.4-2.6-1.4-1.6 0-2.7.9-2.7 2.2 0 1.2.8 1.9 2.6 2.3 1.9.4 2.8 1.1 2.8 2.4 0 1.4-1.2 2.3-2.8 2.3-1.3 0-2.3-.5-2.8-1.5"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24">
          <path
            d="M5 5.5h14v3.2h-5.2v2.1c3.4.2 5.9.9 5.9 1.8s-2.5 1.6-5.9 1.8v4.1h-3.6v-4.1C6.8 14.2 4.3 13.5 4.3 12.6s2.5-1.6 5.9-1.8V8.7H5Z"
            fill="#fff"
          />
        </svg>
      )}
    </span>
  );
}
