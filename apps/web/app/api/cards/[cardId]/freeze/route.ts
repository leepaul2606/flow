import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const POST = handler(
  async (request: Request, ctx: { params: Promise<{ cardId: string }> }) => {
    const { userId } = await requireSession();
    const { cardId } = await ctx.params;
    const body = await request.json().catch(() => null);
    const frozen = (body as { frozen?: unknown } | null)?.frozen;

    if (typeof frozen !== "boolean") {
      return NextResponse.json(
        { error: "frozen must be a boolean" },
        { status: 400 },
      );
    }

    return respond(await getCardProvider().setCardFrozen(userId, cardId, frozen));
  },
);
