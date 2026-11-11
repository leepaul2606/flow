const { colors, radii } = require("@flow/core/tokens.json");

/**
 * NativeWind uses Tailwind 3, while the web app is on Tailwind 4 — the two
 * can't share a config file, so both read the same token module instead.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ground: colors.ground,
        surface: colors.surface,
        "surface-raised": colors.surfaceRaised,
        hairline: colors.hairline,
        ink: {
          DEFAULT: colors.ink,
          muted: colors.inkMuted,
          faint: colors.inkFaint,
        },
        gold: {
          DEFAULT: colors.gold,
          bright: colors.goldBright,
          deep: colors.goldDeep,
          wash: colors.goldWash,
        },
        "card-black": colors.cardBlack,
        positive: {
          DEFAULT: colors.positive,
          wash: colors.positiveWash,
        },
        negative: colors.negative,
        warning: {
          DEFAULT: colors.warning,
          wash: colors.warningWash,
        },
      },
      borderRadius: {
        field: `${radii.field}px`,
        panel: `${radii.panel}px`,
        card: `${radii.card}px`,
      },
      fontFamily: {
        // Loaded in the root layout via expo-font
        display: ["PlayfairDisplay_500Medium"],
        sans: ["PlusJakartaSans_400Regular"],
        "sans-medium": ["PlusJakartaSans_500Medium"],
        "sans-semibold": ["PlusJakartaSans_600SemiBold"],
      },
    },
  },
  plugins: [],
};
