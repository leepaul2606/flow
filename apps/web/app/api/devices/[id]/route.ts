import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const DELETE = handler(
  async (_request: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { userId } = await requireSession();
    const { id } = await ctx.params;
    return respond(await getCardProvider().revokeDevice(userId, id));
  },
);
