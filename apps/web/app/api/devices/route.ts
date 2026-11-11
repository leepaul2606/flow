import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const GET = handler(async () => {
  const { userId } = await requireSession();
  return respond(await getCardProvider().getTrustedDevices(userId));
});
