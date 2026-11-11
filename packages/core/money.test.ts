import { describe, expect, it } from "vitest";

import {
  ASSET_DECIMALS,
  formatAsset,
  formatPercent,
  formatUsd,
  maskValue,
  money,
  parseToMinorUnits,
  stableToUsdCents,
} from "./money";

/**
 * These cover the integer money paths. A rounding slip here is a real
 * discrepancy against the provider's ledger, not a cosmetic bug, which is why
 * this is the one part of the app with tests before anything else.
 */

describe("parseToMinorUnits", () => {
  it("converts whole and decimal input at the asset's scale", () => {
    expect(parseToMinorUnits("1", 6)).toBe(1_000_000);
    expect(parseToMinorUnits("1.5", 6)).toBe(1_500_000);
    expect(parseToMinorUnits("0.000001", 6)).toBe(1);
    expect(parseToMinorUnits("18562.41", 6)).toBe(18_562_410_000);
    expect(parseToMinorUnits("12.34", 2)).toBe(1234);
  });

  it("strips thousands separators", () => {
    expect(parseToMinorUnits("1,250", 6)).toBe(1_250_000_000);
  });

  it("rejects more precision than the asset supports rather than truncating", () => {
    // Silently dropping the 7th decimal would lose real value
    expect(parseToMinorUnits("0.0000001", 6)).toBeNull();
    expect(parseToMinorUnits("1.234", 2)).toBeNull();
  });

  it("rejects anything that isn't a clean non-negative number", () => {
    expect(parseToMinorUnits("", 6)).toBeNull();
    expect(parseToMinorUnits("abc", 6)).toBeNull();
    expect(parseToMinorUnits("-5", 6)).toBeNull();
    expect(parseToMinorUnits("1.2.3", 6)).toBeNull();
    expect(parseToMinorUnits("1e6", 6)).toBeNull();
  });

  it("rejects amounts beyond safe integer precision", () => {
    expect(parseToMinorUnits("99999999999.999999", 6)).toBeNull();
  });

  it("never returns a float", () => {
    for (const input of ["0.1", "0.2", "0.3", "1.1", "2.675"]) {
      const result = parseToMinorUnits(input, 6);
      expect(result === null || Number.isInteger(result)).toBe(true);
    }
  });
});

describe("formatUsd", () => {
  it("formats cents as currency", () => {
    expect(formatUsd(2_842_512)).toBe("$28,425.12");
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("puts the minus sign outside the symbol", () => {
    expect(formatUsd(-129_900)).toBe("-$1,299.00");
  });

  it("adds an explicit plus only when asked", () => {
    expect(formatUsd(50_000, { signed: true })).toBe("+$500.00");
    expect(formatUsd(50_000)).toBe("$500.00");
    // A negative value stays negative regardless of `signed`
    expect(formatUsd(-50_000, { signed: true })).toBe("-$500.00");
  });

  it("can drop the cents", () => {
    expect(formatUsd(100_000, { showCents: false })).toBe("$1,000");
  });
});

describe("formatAsset", () => {
  it("formats token minor units at their scale", () => {
    expect(formatAsset({ amount: 18_562_410_000, decimals: 6, symbol: "USDC" })).toBe(
      "18,562.41",
    );
  });

  it("appends the symbol on request", () => {
    expect(
      formatAsset(
        { amount: 7_842_710_000, decimals: 6, symbol: "USDT" },
        { withSymbol: true },
      ),
    ).toBe("7,842.71 USDT");
  });

  it("always shows at least two decimals", () => {
    expect(formatAsset({ amount: 1_000_000, decimals: 6, symbol: "USDC" })).toBe(
      "1.00",
    );
  });
});

describe("stableToUsdCents", () => {
  it("converts a 1:1 pegged balance to cents", () => {
    expect(
      stableToUsdCents({ amount: 18_562_410_000, decimals: 6, symbol: "USDC" }),
    ).toBe(1_856_241);
  });

  it("round-trips against parseToMinorUnits", () => {
    const amount = parseToMinorUnits("1250.35", 6);
    expect(amount).not.toBeNull();
    expect(
      stableToUsdCents({ amount: amount!, decimals: 6, symbol: "USDC" }),
    ).toBe(125_035);
  });
});

describe("money", () => {
  it("builds a Money value at the asset's own scale", () => {
    expect(money("500", "USDC")).toEqual({
      amount: 500_000_000,
      decimals: ASSET_DECIMALS.USDC,
      symbol: "USDC",
    });
  });

  it("throws rather than silently coercing bad input", () => {
    expect(() => money("not a number", "USDC")).toThrow();
  });
});

describe("formatPercent", () => {
  it("formats a ratio to two places", () => {
    expect(formatPercent(0.0458)).toBe("4.58%");
    expect(formatPercent(-0.0123)).toBe("-1.23%");
    expect(formatPercent(0.0458, true)).toBe("+4.58%");
  });
});

describe("maskValue", () => {
  it("hides the value only when asked", () => {
    expect(maskValue("$28,425.12", true)).toBe("••••••");
    expect(maskValue("$28,425.12", false)).toBe("$28,425.12");
  });
});
