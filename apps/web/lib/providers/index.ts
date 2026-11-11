import "server-only";

import { mockProvider } from "./mock-provider";
import type { CardProvider } from "./types";

/**
 * Resolves the active card provider.
 *
 * Set CARD_PROVIDER=bsc once the real integration exists and register it
 * below. Until then every environment uses the in-memory mock.
 *
 * Nothing here may be imported from a client component — these modules read
 * server-side credentials.
 */
export function getCardProvider(): CardProvider {
  const configured = process.env.CARD_PROVIDER ?? "mock";

  switch (configured) {
    case "mock":
      return mockProvider;
    // case "bsc":
    //   return new BscCardProvider({
    //     apiKey: requireEnv("BSC_API_KEY"),
    //     baseUrl: requireEnv("BSC_API_BASE_URL"),
    //   });
    default:
      throw new Error(
        `Unknown CARD_PROVIDER "${configured}". Expected "mock".`,
      );
  }
}

export type { CardProvider } from "./types";
