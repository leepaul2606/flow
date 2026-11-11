import { NextResponse } from "next/server";

import { handler, respond } from "@/lib/api-response";
import { getCardProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export const GET = handler(async () => {
  const { userId } = await requireSession();
  return respond(await getCardProvider().getUser(userId));
});

export const PATCH = handler(async (request: Request) => {
  const { userId } = await requireSession();
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Allowlist the editable fields — never spread client input straight into
  // the stored record.
  const { firstName, lastName, phone, address } = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof firstName === "string") patch.firstName = firstName;
  if (typeof lastName === "string") patch.lastName = lastName;
  if (typeof phone === "string") patch.phone = phone;
  if (address && typeof address === "object") patch.address = address;

  return respond(await getCardProvider().updatePersonalInfo(userId, patch));
});
