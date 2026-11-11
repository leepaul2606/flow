import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";
import type { ChainNetwork, StableSymbol } from "@flow/core";

const SUPPORTED_ASSETS: StableSymbol[] = ["USDC", "USDT"];
const SUPPORTED_NETWORKS: ChainNetwork[] = ["ethereum", "polygon", "tron", "bsc"];

export const POST = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { assetSymbol, network, toAddress, amount } = body;

  if (
    typeof assetSymbol !== "string" ||
    !SUPPORTED_ASSETS.includes(assetSymbol as StableSymbol)
  ) {
    return NextResponse.json(
      { error: "assetSymbol must be USDC or USDT" },
      { status: 400 },
    );
  }
  if (
    typeof network !== "string" ||
    !SUPPORTED_NETWORKS.includes(network as ChainNetwork)
  ) {
    return NextResponse.json({ error: "Unsupported network" }, { status: 400 });
  }
  if (typeof toAddress !== "string" || toAddress.trim() === "") {
    return NextResponse.json(
      { error: "A recipient address is required" },
      { status: 400 },
    );
  }
  if (!Number.isSafeInteger(amount) || (amount as number) <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive integer in minor units" },
      { status: 400 },
    );
  }

  return respond(
    await getCardProvider().send(userId, {
      assetSymbol: assetSymbol as StableSymbol,
      network: network as ChainNetwork,
      toAddress: toAddress.trim(),
      amount: amount as number,
    }),
  );
});
