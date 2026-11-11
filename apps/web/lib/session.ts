import "server-only";

/**
 * Session resolution for API route handlers.
 *
 * PROTOTYPE ONLY. This returns a fixed user id so the screens have data to
 * render. Before this goes anywhere near real money it must be replaced with
 * a verified session:
 *
 *   - httpOnly, Secure, SameSite=Lax session cookie (never localStorage —
 *     any XSS would otherwise hand an attacker the account)
 *   - server-side session store with absolute + idle expiry
 *   - step-up re-authentication for card secrets, sends and loads
 *
 * Every provider call already takes a userId, so swapping this out does not
 * touch screen or provider code.
 */

const PROTOTYPE_USER_ID = "usr_01H8XKQ";

export interface Session {
  userId: string;
}

export async function getSession(): Promise<Session | null> {
  return { userId: PROTOTYPE_USER_ID };
}

/** Throws a 401-shaped error when there is no session. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthorizedError";
  }
}
