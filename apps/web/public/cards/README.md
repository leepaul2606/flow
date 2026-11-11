# Card face artwork

Drop designer-exported card artwork here, then point the design's `background`
at it in `lib/card-designs.ts`:

```ts
background: "url(/cards/obsidian-gold.webp) center / cover no-repeat",
```

That is the only change needed — `CardFace` picks it up everywhere.

## Filenames

One file per design, named after its id:

| File | Design |
|---|---|
| `obsidian-gold` | Obsidian Gold |
| `arctic-white` | Arctic White |
| `forest-green` | Forest Green |
| `midnight-blue` | Midnight Blue |

## Export spec

- **Aspect ratio 1.586 : 1** — ISO/IEC 7810 ID-1, the standard card shape the
  layout already uses. Anything else will crop.
- **SVG** if the source is vector (the guilloché pattern probably is) — scales
  perfectly, smallest file.
- Otherwise **WebP, 1512 × 954** (3× for retina), quality ~85.
- No transparency needed; the artwork fills the whole face.

## Artwork only — no text

Leave these out. They are live DOM elements rendered on top:

- the FLOW wordmark
- the chip and contactless glyph
- the VISA mark and tier label
- the card number

The number is real data and changes per card, and baked-in text can't be read
by a screen reader or re-rendered when the balance updates.

**Do** include: the colourway/gradient, the material texture, and the sweeping
arc.

## Ink colours

Overlaid text — card number, balance, tier label — is **gold on every design**,
toned per background so it stays readable:

- Obsidian Gold, Forest Green, Midnight Blue → `#e2c489`
- Arctic White → `#8a6520` (a pale gold disappears on a light face)

The **VISA mark is deliberately not gold**. It uses its own `visa` token —
white on the dark faces, near-black on Arctic White — because Visa's brand
rules govern how their mark may be reproduced. Confirm the permitted treatment
with the card provider before changing it.

Keep the artwork clear enough behind the lower-left corner (card number) and
lower-right (VISA/tier) that gold text stays legible against it.
