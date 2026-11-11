import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const POST = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const body = await request.json().catch(() => null);
  const enabled = (body as { enabled?: unknown } | null)?.enabled;

  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled must be a boolean" },
      { status: 400 },
    );
  }

  return respond(await getCardProvider().setTwoFactorEnabled(userId, enabled));
});
