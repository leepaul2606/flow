import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["{app,components,lib}/**/*.test.{ts,tsx}"],
    // The money and fee suites live in @flow/core now. This config stays for
    // web-specific tests; until there are some, an empty run is not a failure.
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
