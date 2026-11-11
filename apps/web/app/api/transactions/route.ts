import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const GET = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : undefined;
  const limit =
    parsedLimit !== undefined && Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : undefined;

  return respond(
    await getCardProvider().getTransactions(userId, {
      limit,
      cursor: searchParams.get("cursor") ?? undefined,
    }),
  );
});
