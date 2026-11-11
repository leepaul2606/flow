/**
 * Shared domain layer for Flow.
 *
 * Everything here is platform-neutral — no DOM, no React Native, no bundler
 * assumptions — so the web app and the native app compute money, fees and
 * network rules identically. A balance that disagrees between the two
 * surfaces is worse than a bug in either one, which is why this is shared
 * rather than copied.
 *
 * Ships as TypeScript source; each app's bundler transpiles it. No build step.
 */

export * from "./tokens";
export * from "./types";
export * from "./money";
export * from "./fees";
export * from "./networks";
export * from "./card-designs";
export * from "./api-client";
