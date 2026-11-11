import { describe, expect, it } from "vitest";

import { estimateNetworkFee } from "./fees";
import { parseToMinorUnits } from "./money";
import type { ChainNetwork } from "./types";

const NETWORKS: ChainNetwork[] = ["ethereum", "polygon", "tron", "bsc"];

describe("estimateNetworkFee", () => {
  it("returns the fee in the asset's minor units", () => {
    // 0.35 USDC at 6dp
    expect(estimateNetworkFee("ethereum", "USDC")).toEqual({
      amount: 350_000,
      decimals: 6,
      symbol: "USDC",
    });
  });

  it("always returns a whole number of minor units", () => {
    for (const network of NETWORKS) {
      for (const symbol of ["USDC", "USDT"] as const) {
        const fee = estimateNetworkFee(network, symbol);
        expect(Number.isInteger(fee.amount)).toBe(true);
        expect(fee.amount).toBeGreaterThan(0);
      }
    }
  });

  it("tags the fee with the asset it is charged in", () => {
    expect(estimateNetworkFee("tron", "USDT").symbol).toBe("USDT");
    expect(estimateNetworkFee("tron", "USDC").symbol).toBe("USDC");
  });

  it("adds to a send amount without floating-point drift", () => {
    // The case the Send screen shows: 1,250 + 0.35 = 1,250.35
    const amount = parseToMinorUnits("1250", 6);
    const fee = estimateNetworkFee("ethereum", "USDC");
    expect(amount! + fee.amount).toBe(parseToMinorUnits("1250.35", 6));
  });

  it("prices networks differently", () => {
    const ethereum = estimateNetworkFee("ethereum", "USDC").amount;
    const polygon = estimateNetworkFee("polygon", "USDC").amount;
    expect(ethereum).toBeGreaterThan(polygon);
  });
});
