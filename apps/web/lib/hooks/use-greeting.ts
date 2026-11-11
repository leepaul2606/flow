"use client";

import { useEffect, useState } from "react";

/**
 * Time-of-day greeting, resolved on the client.
 *
 * Deliberately not computed during render: reading the clock while rendering
 * is impure, and the server's timezone is not the user's — a server-rendered
 * "Good morning" would mismatch the client and trip a hydration error. Returns
 * null on the first paint so callers can render nothing rather than a wrong
 * greeting that then flips.
 */
export function useGreeting(): string | null {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    // Reading the system clock is exactly the "synchronise with an external
    // system" case effects exist for; the rule can't tell it apart from a
    // render-cascading setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
    );
  }, []);

  return greeting;
}
