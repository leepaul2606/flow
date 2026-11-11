import { NextResponse } from "next/server";

import { handler } from "@/lib/api-response";
import { writeCardDesign } from "@/lib/card-design-store";
import { isCardDesignId } from "@flow/core";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const POST = handler(
  async (request: Request, ctx: { params: Promise<{ cardId: string }> }) => {
    const { userId } = await requireSession();
    const { cardId } = await ctx.params;
    const body = await request.json().catch(() => null);
    const design = (body as { design?: unknown } | null)?.design;

    // Validate against the registry rather than trusting the string — an
    // unknown id would render a card with no styling at all.
    if (!isCardDesignId(design)) {
      return NextResponse.json(
        { error: "Unknown card design" },
        { status: 400 },
      );
    }

    const result = await getCardProvider().setCardDesign(userId, cardId, design);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 422 },
      );
    }

    // Persist outside the provider's in-memory state, which does not survive
    // serverless instance recycling
    await writeCardDesign(cardId, design);

    return NextResponse.json({ ...result.data, design });
  },
);
