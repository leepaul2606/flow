/**
 * Card face designs.
 *
 * Each design is a designer-exported artwork plus the tokens needed to render
 * live data legibly on top of it.
 *
 * The artwork contains everything fixed — the Flow wordmark, the VISA mark,
 * the tier label and any chip detail — so the app must not draw those again.
 * The only thing drawn on top is the card number/balance, which is real data
 * that differs per card and has to stay selectable and screen-readable.
 */

export type CardDesignId =
  | "obsidian_gold"
  | "arctic_white"
  | "forest_green"
  | "midnight_blue"
  | "crimson"
  | "ultraviolet";

export interface CardDesign {
  id: CardDesignId;
  name: string;
  /**
   * Artwork filename only. Each platform resolves it its own way — the web
   * app serves it from /cards, the native app maps it to a bundled asset —
   * so this stays free of any path or bundler assumption.
   */
  artworkFile: string;
  /** Flat colour painted under the artwork while it loads. */
  fallback: string;
  /**
   * Gold ink for the card number and balance, toned per background.
   * The artwork's own wordmark and VISA mark are untouched by this.
   */
  ink: { primary: string; muted: string };
  /**
   * Soft veil behind the number in the lower-left, where every artwork has
   * movement. Without it, gold on a gold swirl is unreadable.
   */
  scrim: string;
}

const DARK_SCRIM =
  "linear-gradient(to top right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 26%, rgba(0,0,0,0) 54%)";
const LIGHT_SCRIM =
  "linear-gradient(to top right, rgba(255,252,246,0.9) 0%, rgba(255,252,246,0.5) 26%, rgba(255,252,246,0) 54%)";

const GOLD_ON_DARK = { primary: "#e8cd96", muted: "rgba(232,205,150,0.75)" };
const GOLD_ON_LIGHT = { primary: "#8a6520", muted: "rgba(138,101,32,0.75)" };

export const CARD_DESIGNS: Record<CardDesignId, CardDesign> = {
  obsidian_gold: {
    id: "obsidian_gold",
    name: "Obsidian Gold",
    artworkFile: "obsidian-gold.png",
    fallback: "#0a0a0a",
    ink: GOLD_ON_DARK,
    scrim: DARK_SCRIM,
  },

  arctic_white: {
    id: "arctic_white",
    name: "Arctic White",
    artworkFile: "arctic-white.png",
    fallback: "#efece5",
    // A pale gold disappears on a light face
    ink: GOLD_ON_LIGHT,
    scrim: LIGHT_SCRIM,
  },

  forest_green: {
    id: "forest_green",
    name: "Forest Green",
    artworkFile: "forest-green.png",
    fallback: "#0f1a13",
    ink: GOLD_ON_DARK,
    scrim: DARK_SCRIM,
  },

  midnight_blue: {
    id: "midnight_blue",
    name: "Midnight Blue",
    artworkFile: "midnight-blue.png",
    fallback: "#0b1526",
    ink: GOLD_ON_DARK,
    scrim: DARK_SCRIM,
  },

  crimson: {
    id: "crimson",
    name: "Crimson",
    artworkFile: "crimson-red.png",
    fallback: "#2a0d12",
    ink: GOLD_ON_DARK,
    scrim: DARK_SCRIM,
  },

  ultraviolet: {
    id: "ultraviolet",
    name: "Ultraviolet",
    artworkFile: "ultraviolet.png",
    fallback: "#1a0b2e",
    ink: GOLD_ON_DARK,
    scrim: DARK_SCRIM,
  },
};

/** Display order in the picker. */
export const CARD_DESIGN_ORDER: CardDesignId[] = [
  "obsidian_gold",
  "arctic_white",
  "forest_green",
  "midnight_blue",
  "crimson",
  "ultraviolet",
];

export const DEFAULT_CARD_DESIGN: CardDesignId = "obsidian_gold";

export function isCardDesignId(value: unknown): value is CardDesignId {
  return typeof value === "string" && value in CARD_DESIGNS;
}

export function getCardDesign(id: CardDesignId | undefined): CardDesign {
  return CARD_DESIGNS[id ?? DEFAULT_CARD_DESIGN];
}
