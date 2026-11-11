/**
 * Flow service worker.
 *
 * Caching policy is deliberately conservative for a financial app:
 *
 *   /api/*        never cached. A stale balance presented as current is worse
 *                 than no balance, and a cached card-secrets response would
 *                 leave a PAN in Cache Storage long after the screen closed.
 *   navigations   network-first, falling back to the cached shell offline.
 *   static assets cache-first — they're content-hashed by Next, so a hit is
 *                 always the right file.
 */

const VERSION = "flow-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

const OFFLINE_URL = "/offline";

/** Minimum shell needed to render something useful offline. */
const SHELL_URLS = ["/", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // Individual failures shouldn't abort the whole install
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Account data: always network, never stored.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first so the user sees live data when online.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, response.clone());
          return response;
        } catch {
          // Prefer this exact page if we have it, then the dedicated offline
          // page, then the app shell. The bare Response is a last resort for
          // a cold cache — it should almost never be reached.
          const cached =
            (await caches.match(request)) ??
            (await caches.match(OFFLINE_URL)) ??
            (await caches.match("/"));

          return (
            cached ??
            new Response("You're offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Build output and icons: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
  }
});
