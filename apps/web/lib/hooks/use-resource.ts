"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-runs the loader, e.g. after a mutation. */
  reload: () => Promise<void>;
  /** Replaces the cached value without a round trip. */
  set: (value: T) => void;
}

/**
 * Minimal data-fetching hook for client screens.
 *
 * `loader` must be memoised by the caller (`useCallback`), since its identity
 * is what drives refetching — pass the values it closes over as that
 * callback's dependencies.
 *
 * Deliberately small: the app has one consumer per endpoint and no cache
 * sharing requirements yet. If cross-screen caching or background refetch
 * becomes necessary, swap this for TanStack Query without touching callers.
 */
export function useResource<T>(loader: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards against setting state after unmount, and against a slow earlier
  // request overwriting a newer one
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      if (mounted.current && id === requestId.current) {
        setData(result);
      }
    } catch (err) {
      if (mounted.current && id === requestId.current) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      if (mounted.current && id === requestId.current) {
        setLoading(false);
      }
    }
  }, [loader]);

  useEffect(() => {
    // Fetching on mount is the point of this hook: the effect synchronises
    // React state with an external system (the API). The rule can't tell that
    // apart from a render-cascading setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
  }, [run]);

  return {
    data,
    loading,
    error,
    reload: run,
    set: useCallback((value: T) => setData(value), []),
  };
}
