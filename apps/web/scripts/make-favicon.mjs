import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

/**
 * Crops the app icon down to the mark for use as a favicon.
 *
 * The home-screen icon carries generous margin on purpose — launchers crop
 * maskable icons to a circle, so the mark has to sit inside a safe zone. That
 * same margin is wrong at 16–32px: the mark ends up a few pixels wide on a
 * pale field and reads as a grey smudge.
 *
 * This finds the mark by saturation (the gold is the only saturated thing on
 * a near-neutral ground), then crops to a square around it so the mark fills
 * most of the frame.
 *
 *   node scripts/make-favicon.mjs <input.png> <output.png>
 */

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("usage: node scripts/make-favicon.mjs <input.png> <output.png>");
  process.exit(1);
}

/** Fraction of the cropped frame the mark should fill. */
const TARGET_COVERAGE = 0.76;
/** Channel spread above which a pixel counts as the coloured mark. */
const SATURATION_FLOOR = 45;

const src = PNG.sync.read(readFileSync(inputPath));

let minX = src.width;
let minY = src.height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < src.width; x++) {
    const i = (src.width * y + x) << 2;
    const r = src.data[i];
    const g = src.data[i + 1];
    const b = src.data[i + 2];
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    if (saturation > SATURATION_FLOOR) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX <= minX || maxY <= minY) {
  console.error("no mark found — is the source a coloured mark on a neutral ground?");
  process.exit(1);
}

const markWidth = maxX - minX + 1;
const markHeight = maxY - minY + 1;

// Square frame sized so the mark's longest side fills TARGET_COVERAGE of it
const side = Math.round(Math.max(markWidth, markHeight) / TARGET_COVERAGE);
const centreX = Math.round((minX + maxX) / 2);
const centreY = Math.round((minY + maxY) / 2);

// Clamp so the crop stays inside the source
const left = Math.max(0, Math.min(src.width - side, centreX - Math.round(side / 2)));
const top = Math.max(0, Math.min(src.height - side, centreY - Math.round(side / 2)));

const out = new PNG({ width: side, height: side });

for (let y = 0; y < side; y++) {
  for (let x = 0; x < side; x++) {
    const from = (src.width * (top + y) + (left + x)) << 2;
    const to = (side * y + x) << 2;
    out.data[to] = src.data[from];
    out.data[to + 1] = src.data[from + 1];
    out.data[to + 2] = src.data[from + 2];
    out.data[to + 3] = src.data[from + 3];
  }
}

writeFileSync(outputPath, PNG.sync.write(out));

console.log(`wrote ${outputPath}`);
console.log(`  source mark: ${markWidth}x${markHeight} within ${src.width}x${src.height}`);
console.log(`  cropped to:  ${side}x${side} at (${left}, ${top})`);
console.log(
  `  mark now fills ${Math.round((Math.max(markWidth, markHeight) / side) * 100)}% of the frame`,
);
