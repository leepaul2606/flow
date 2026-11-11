import { ASSET_DECIMALS } from "./money";
import type { ChainNetwork, Money, StableSymbol } from "./types";

/**
 * Estimated network fee per chain, in whole token units.
 *
 * Flat estimates standing in for live gas oracles. The server is the
 * authority — the client shows this only so the review step isn't blank, and
 * the figure is recomputed server-side before any balance moves.
 */
const FEE_BY_NETWORK: Record<ChainNetwork, number> = {
  ethereum: 0.35,
  polygon: 0.01,
  tron: 1.0,
  bsc: 0.05,
};

export function estimateNetworkFee(
  network: ChainNetwork,
  symbol: StableSymbol,
): Money {
  const decimals = ASSET_DECIMALS[symbol];
  const amount = Math.round(FEE_BY_NETWORK[network] * 10 ** decimals);
  return { amount, decimals, symbol };
}
