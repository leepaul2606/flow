import type { CardDesign } from "@flow/core";

/**
 * Resolves a card design's artwork to a web URL.
 *
 * The shared core stores only the filename, because the native app resolves
 * the same artwork to a bundled asset rather than a path. This is the web
 * half of that split.
 */
export function cardArtworkUrl(design: CardDesign): string {
  return `/cards/${design.artworkFile}`;
}
