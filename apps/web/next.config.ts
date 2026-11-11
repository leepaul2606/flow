import type { NextConfig } from "next";

/**
 * Applied to every response.
 *
 * `frame-ancestors 'none'` plus X-Frame-Options is the load-bearing pair: a
 * banking UI that can be iframed is a clickjacking target, where an attacker
 * overlays their own page on top of a real Send or Load screen.
 *
 * A full script CSP is deliberately not set here. Next.js injects inline
 * bootstrap scripts, so a strict policy needs per-request nonces and careful
 * testing — worth doing before launch, but a half-strict policy that silently
 * breaks hydration is worse than none.
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Nothing in Flow needs these; denying them limits what injected script
    // could reach for
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // Only meaningful over HTTPS; ignored on localhost
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // @flow/core ships as TypeScript source with no build step, so Next has to
  // compile it alongside the app
  transpilePackages: ["@flow/core"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Account data must never be cached by a browser or intermediary
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        // The service worker must not be cached, or clients get stuck on an
        // old worker and stop receiving updates
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
