import { NextResponse } from "next/server";

import type { Result } from "@flow/core";
import { UnauthorizedError } from "./session";

/** Map a provider Result onto an HTTP response with a sensible status code. */
export function respond<T>(result: Result<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data ?? null);
  }
  return NextResponse.json(
    { error: result.error, code: result.code },
    { status: statusForCode(result.code) },
  );
}

function statusForCode(code?: string): number {
  switch (code) {
    case "not_found":
    case "no_address":
      return 404;
    case "insufficient_funds":
    case "bad_amount":
    case "bad_network":
    case "unknown_asset":
    case "card_frozen":
    case "card_cancelled":
    case "current_device":
      return 422;
    default:
      return 400;
  }
}

/**
 * Wrap a route handler so thrown errors become clean JSON instead of leaking
 * stack traces to the client.
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      console.error("[api] unhandled error", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  };
}
