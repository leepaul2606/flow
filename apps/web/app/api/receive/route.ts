import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";
import type { StableSymbol } from "@flow/core";

const SUPPORTED_ASSETS: StableSymbol[] = ["USDC", "USDT"];

export const GET = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const asset = new URL(request.url).searchParams.get("asset");

  if (!asset || !SUPPORTED_ASSETS.includes(asset as StableSymbol)) {
    return NextResponse.json(
      { error: "asset must be USDC or USDT" },
      { status: 400 },
    );
  }

  return respond(
    await getCardProvider().getReceiveDetails(userId, asset as StableSymbol),
  );
});
