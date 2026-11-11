"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes Flow installable and lets the shell
 * open offline. Skipped in development, where a worker mostly serves stale
 * builds and confuses debugging.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("[pwa] service worker registration failed", error);
      });
    };

    // Wait for load so registration never competes with first paint
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
