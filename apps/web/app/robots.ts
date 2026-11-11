import type { MetadataRoute } from "next";

/**
 * Keep the demo out of search results.
 *
 * The link is deliberately open so the team can share it freely, but a
 * convincing-looking banking app turning up in search results is a different
 * problem from a teammate opening a URL. Remove this when Flow is a real
 * product with real auth.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
