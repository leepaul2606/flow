"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Countdown {
  /** Whole seconds remaining. */
  remaining: number;
  /** mm:ss, e.g. "04:55". */
  formatted: string;
  finished: boolean;
  restart: (seconds: number) => void;
}

/**
 * Counts down in real time.
 *
 * Tracks an absolute deadline rather than decrementing a counter, so the
 * timer stays accurate when the tab is backgrounded — mobile browsers throttle
 * intervals aggressively and a naive counter drifts badly.
 *
 * The deadline is established in an effect rather than during render: reading
 * the clock while rendering is impure and would give a different answer on
 * every re-render.
 */
export function useCountdown(initialSeconds: number): Countdown {
  const deadline = useRef<number | null>(null);
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    deadline.current = Date.now() + initialSeconds * 1000;

    const tick = () => {
      if (deadline.current === null) return;
      setRemaining(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    };

    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [initialSeconds]);

  const restart = useCallback((seconds: number) => {
    deadline.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return {
    remaining,
    formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    finished: remaining === 0,
    restart,
  };
}
