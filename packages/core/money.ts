import type { Money, StableSymbol } from "./types";

/** On-chain decimals for the stablecoins Flow supports. */
export const ASSET_DECIMALS: Record<StableSymbol, number> = {
  USDC: 6,
  USDT: 6,
};

export const USD_DECIMALS = 2;

/**
 * Format USD cents as a currency string, e.g. 2842512 -> "$28,425.12".
 * `signed` prefixes a explicit + for positive values (used by activity rows).
 */
export function formatUsd(
  cents: number,
  opts: { signed?: boolean; showCents?: boolean } = {},
): string {
  const { signed = false, showCents = true } = opts;
  const negative = cents < 0;
  const abs = Math.abs(cents);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(abs / 100);

  if (negative) return `-${formatted}`;
  return signed ? `+${formatted}` : formatted;
}

/**
 * Format a token amount, e.g. { amount: 18562410000, decimals: 6 }
 * -> "18,562.41". Trailing zeros beyond `maxFractionDigits` are dropped.
 */
export function formatAsset(
  money: Money,
  opts: { maxFractionDigits?: number; withSymbol?: boolean } = {},
): string {
  const { maxFractionDigits = 2, withSymbol = false } = opts;
  const value = money.amount / 10 ** money.decimals;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);

  return withSymbol ? `${formatted} ${money.symbol}` : formatted;
}

/** Format a ratio as a percentage, e.g. 0.0458 -> "4.58%". */
export function formatPercent(ratio: number, signed = false): string {
  const pct = ratio * 100;
  const formatted = `${Math.abs(pct).toFixed(2)}%`;
  if (pct < 0) return `-${formatted}`;
  return signed ? `+${formatted}` : formatted;
}

/**
 * Parse user-typed decimal input into minor units.
 * Returns null for anything that isn't a clean, non-negative number, so
 * callers can reject rather than silently coercing to NaN or 0.
 */
export function parseToMinorUnits(input: string, decimals: number): number | null {
  const trimmed = input.trim().replace(/,/g, "");
  if (trimmed === "" || !/^\d*\.?\d*$/.test(trimmed)) return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  // More precision than the asset supports would be silently truncated
  if (fraction.length > decimals) return null;

  const padded = fraction.padEnd(decimals, "0");
  const combined = `${whole}${padded}`.replace(/^0+(?=\d)/, "");
  const result = Number(combined);

  return Number.isSafeInteger(result) ? result : null;
}

/** Convert a stablecoin amount to USD cents, assuming a 1:1 peg. */
export function stableToUsdCents(money: Money): number {
  return Math.round((money.amount / 10 ** money.decimals) * 100);
}

/** Build a Money value from a human decimal string. Throws on bad input. */
export function money(value: string, symbol: StableSymbol): Money {
  const decimals = ASSET_DECIMALS[symbol];
  const amount = parseToMinorUnits(value, decimals);
  if (amount === null) {
    throw new Error(`Invalid ${symbol} amount: ${value}`);
  }
  return { amount, decimals, symbol };
}

/** Mask a value behind dots when the user has hidden balances. */
export function maskValue(formatted: string, hidden: boolean): string {
  return hidden ? "••••••" : formatted;
}
