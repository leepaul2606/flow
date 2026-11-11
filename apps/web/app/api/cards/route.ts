import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { applyCardDesigns, readCardDesigns, writeCardDesign } from "@/lib/card-design-store";
import { isCardDesignId } from "@flow/core";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const GET = handler(async () => {
  const { userId } = await requireSession();
  const result = await getCardProvider().getCards(userId);

  if (!result.ok) return respond(result);

  // Overlay the user's stored design choices — the provider's in-memory copy
  // resets whenever a serverless instance is recycled
  const designs = await readCardDesigns();
  return NextResponse.json(applyCardDesigns(result.data, designs));
});

/** Create a virtual card. */
export const POST = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const body = (await request.json().catch(() => null)) as {
    label?: unknown;
    design?: unknown;
  } | null;

  const label = body?.label;
  if (typeof label !== "string" || label.trim() === "") {
    return NextResponse.json(
      { error: "A card name is required" },
      { status: 400 },
    );
  }

  const design = isCardDesignId(body?.design) ? body.design : undefined;

  const result = await getCardProvider().createVirtualCard(
    userId,
    label.trim().slice(0, 40),
    design,
  );

  // Record the choice so it survives an instance reset like any other
  if (result.ok && design) {
    await writeCardDesign(result.data.id, design);
  }

  return respond(result);
});
