import { NextResponse } from "next/server";

import { handler } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

/**
 * Returns full card credentials.
 *
 * This is the most sensitive endpoint in the app. Before production it needs
 * step-up authentication (re-entered passcode or biometric assertion) and
 * server-side rate limiting — a session cookie alone should not be enough to
 * read a PAN.
 */
export const GET = handler(
  async (_request: Request, ctx: { params: Promise<{ cardId: string }> }) => {
    const { userId } = await requireSession();
    const { cardId } = await ctx.params;

    const result = await getCardProvider().getCardSecrets(userId, cardId);
    const response = NextResponse.json(
      result.ok ? result.data : { error: result.error, code: result.code },
      { status: result.ok ? 200 : 422 },
    );

    // Card credentials must never sit in any cache.
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  },
);
