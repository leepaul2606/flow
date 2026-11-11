import tokens from "./tokens.json";

/**
 * Flow design tokens — the single source of truth for the palette.
 *
 * Stored as JSON rather than TypeScript because `tailwind.config.js` in the
 * native app is executed by plain Node and cannot require a `.ts` file. This
 * module gives TypeScript consumers types over the same data.
 *
 * The web app declares the same values as CSS custom properties in
 * `globals.css`; the two Tailwind majors can't share a config, so if you
 * change a colour here, change it there too.
 */

export const colors = tokens.colors;
export const radii = tokens.radii;

/**
 * Stops for the gold gradient on primary actions — CSS gradient on web,
 * expo-linear-gradient on native.
 */
export const goldGradient = tokens.goldGradient;

export type ColorToken = keyof typeof tokens.colors;
