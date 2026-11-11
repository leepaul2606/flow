import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

/**
 * Rebuilds the Flow wordmark with a real alpha channel.
 *
 * The supplied logo was exported with its transparency flattened — the design
 * tool's checkerboard became actual pixels in the 247–255 range. That is too
 * light to notice in isolation but reads as a faint grey rectangle against the
 * cream app background, and no blend mode fixes it cleanly.
 *
 * The mark is a dark gold shape over a near-white ground, so coverage can be
 * recovered per pixel: the further a pixel is from white, the more of it is
 * ink. Deriving alpha that way preserves the anti-aliased edges instead of
 * producing the hard, jagged cutout a plain threshold would give.
 *
 * This is a stopgap. A properly exported transparent SVG or PNG from the
 * designer is still the right long-term asset.
 *
 *   node scripts/make-transparent-logo.mjs <input.png> <output.png>
 */

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error(
    "usage: node scripts/make-transparent-logo.mjs <input.png> <output.png>",
  );
  process.exit(1);
}

const png = PNG.sync.read(readFileSync(inputPath));

/** Anything at or above this on every channel is treated as background. */
const WHITE_POINT = 252;
/** Full opacity is reached once a channel drops this far below white. */
const INK_DEPTH = 120;
/** Coverage below this is snapped to fully transparent, killing the haze. */
const MIN_COVERAGE = 0.06;

let cleared = 0;
let kept = 0;

for (let i = 0; i < png.data.length; i += 4) {
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];

  // The darkest channel carries the most signal: gold is low in blue, so a
  // gold pixel reads as clearly non-background even where it is pale
  const darkest = Math.min(r, g, b);
  let coverage = (WHITE_POINT - darkest) / INK_DEPTH;

  if (coverage < MIN_COVERAGE) coverage = 0;
  if (coverage > 1) coverage = 1;

  png.data[i + 3] = Math.round(coverage * 255);

  if (coverage === 0) cleared++;
  else kept++;
}

writeFileSync(outputPath, PNG.sync.write(png));

const total = cleared + kept;
console.log(`wrote ${outputPath}`);
console.log(`  ${png.width}x${png.height}`);
console.log(`  transparent: ${((cleared / total) * 100).toFixed(1)}%`);
console.log(`  visible:     ${((kept / total) * 100).toFixed(1)}%`);
