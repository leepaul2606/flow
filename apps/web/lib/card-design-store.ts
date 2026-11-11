import "server-only";

import { cookies } from "next/headers";

import { isCardDesignId, type CardDesignId } from "@flow/core";
import type { PaymentCard } from "@flow/core";

/**
 * Durable store for the user's chosen card designs.
 *
 * The mock provider holds its state in module memory, which does not survive
 * on serverless — each request can land on a different instance, and
 * instances are recycled freely. That made a saved design appear to revert to
 * the fixture default on its own.
 *
 * Design is purely presentational, so a signed-in-user-scoped cookie is a
 * legitimate home for it rather than a reason to stand up a database. When the
 * real provider lands and owns this, delete this file and the overlay call.
 */

const COOKIE = "flow.card-designs";
const ONE_YEAR = 60 * 60 * 24 * 365;

type DesignMap = Record<string, CardDesignId>;

export async function readCardDesigns(): Promise<DesignMap> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    // Validate every entry — a hand-edited cookie must not be able to put an
    // unknown design id into the render path
    const clean: DesignMap = {};
    for (const [cardId, design] of Object.entries(parsed)) {
      if (isCardDesignId(design)) clean[cardId] = design;
    }
    return clean;
  } catch {
    return {};
  }
}

export async function writeCardDesign(
  cardId: string,
  design: CardDesignId,
): Promise<void> {
  const next = { ...(await readCardDesigns()), [cardId]: design };

  (await cookies()).set(COOKIE, JSON.stringify(next), {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    // Not httpOnly: this is a display preference, not a credential, and
    // nothing security-relevant is derived from it.
    httpOnly: false,
  });
}

/** Overlays stored choices onto whatever the provider returned. */
export function applyCardDesigns(
  cards: PaymentCard[],
  designs: DesignMap,
): PaymentCard[] {
  return cards.map((card) =>
    designs[card.id] ? { ...card, design: designs[card.id] } : card,
  );
}
