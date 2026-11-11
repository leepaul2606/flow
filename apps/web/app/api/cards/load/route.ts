import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";
import type { StableSymbol } from "@flow/core";

const SUPPORTED_ASSETS: StableSymbol[] = ["USDC", "USDT"];

export const POST = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { cardId, assetSymbol, amount } = body;

  if (typeof cardId !== "string" || cardId === "") {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }
  if (
    typeof assetSymbol !== "string" ||
    !SUPPORTED_ASSETS.includes(assetSymbol as StableSymbol)
  ) {
    return NextResponse.json(
      { error: "assetSymbol must be USDC or USDT" },
      { status: 400 },
    );
  }
  // Amounts are integer minor units. Reject floats outright rather than
  // rounding — a silent round here is a real money discrepancy.
  if (!Number.isSafeInteger(amount) || (amount as number) <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive integer in minor units" },
      { status: 400 },
    );
  }

  return respond(
    await getCardProvider().loadCard(userId, {
      cardId,
      assetSymbol: assetSymbol as StableSymbol,
      amount: amount as number,
    }),
  );
});
