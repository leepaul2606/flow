# Flow

PWA for the Flow card programme — a stablecoin wallet with a Visa card, built to the V1 screen flow.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
npm test        # vitest — money and fee maths
```

## Where the boundary sits

The **provider** supplies the licence, the cards and the banking rails. Flow is
the programme operating on top of them, and owns this repository.

That split matters for security: the provider's licence covers their regulatory
standing, not this application. Authentication, authorisation, session
management, credential custody and everything logged here are Flow's
responsibility and Flow's liability.

## Why Next.js

Provider credentials cannot live in a client bundle — anyone can read a PWA's
JavaScript. Next.js route handlers act as a backend-for-frontend: the browser
only ever talks to this origin, and provider secrets stay server-side.

```
browser  →  /api/*  →  CardProvider  →  provider
           (own origin)  (server only)
```

## Layout

```
app/
  (auth)/          welcome, login, verify-email, verify-mobile,
                   create-passcode, biometrics, unlock
  (app)/           home, wallet, card, activity, profile + subscreens
  api/             route handlers — the BFF
  manifest.ts      PWA manifest
  icons/[name]/    generated PWA icons
components/
  ui/              primitives: button, field, panel, list-row, sheet,
                   code-input, toggle, icon
  flow/            domain: card-face, asset-logo, transaction-row,
                   passcode-gate, kyc-badge
lib/
  types.ts         domain models
  money.ts         minor-unit maths and formatting
  providers/       CardProvider interface + in-memory mock
  api-client.ts    typed client for /api
  store/           session and preferences
public/sw.js       service worker
```

## Swapping in the real provider

Everything the app needs from the provider sits behind one interface,
`lib/providers/types.ts`.

1. Write a `CardProvider` implementation for them.
2. Register it in `lib/providers/index.ts`.
3. Set `CARD_PROVIDER` to its key, plus the provider credentials.

No screen code changes. `lib/providers/mock-provider.ts` is the reference
implementation and models real behaviour — balances move, fees are charged, frozen
cards reject reads.

**Open questions for the provider**, all blocking:

- API documentation and sandbox credentials
- Webhook events and signing scheme (card authorisations arrive asynchronously;
  without them balances drift from their ledger)
- Is there a **hosted card-details element**, so the PAN never touches our
  infrastructure and stays out of our PCI scope?
- Virtual IBANs per client, or payment references, for attributing inbound fiat?
- Real-time notification when funds land, or manual checks? The 2-hour SLA
  depends on the answer.
- Their security requirements for integrators — expect a pen test and secure
  coding conditions to be contractual
- Is the card BIN enabled for Apple Pay manual provisioning, and do they support
  in-app push provisioning?

## Card designs

Six colourways in `lib/card-designs.ts` — Obsidian Gold, Arctic White, Forest
Green, Midnight Blue, Crimson, Ultraviolet. Each pairs designer artwork in
`public/cards/` with the tokens needed to render live data on top of it.

Design is stored per card, so the physical card and each virtual card can
differ. Chosen at `/card/design?card=<id>`, or when creating a virtual card.

**The artwork contains everything fixed** — the Flow wordmark, the VISA mark,
the tier label and any chip detail — so `CardFace` does not draw any of it.
The only thing overlaid is the card number or balance, which is live data and
must stay real, selectable, screen-readable text.

Both the Virtual Cards screen and the design preview use the scroll-snap
`Carousel` in `components/ui/carousel.tsx` — native overflow scrolling rather
than a drag library, so momentum and rubber-banding behave correctly on iOS.

Because every artwork has movement in the lower-left where the number sits,
each design declares a `scrim` — a soft veil that keeps gold ink readable.
Gold ink is toned per background (`#e8cd96` on the dark faces, `#8a6520` on
Arctic White, which a pale gold would disappear against).

Artwork is served through `next/image`, which resizes and re-encodes to
WebP/AVIF — the source PNGs are 2–3 MB each and shipping them raw would cost
~15 MB on the design screen alone. A 640px render comes out around 83 KB.

Adding a design: drop the artwork in `public/cards/`, add an entry to
`CARD_DESIGNS` and its id to `CARD_DESIGN_ORDER`. Nothing else changes.

Design is presentational only and must never affect balance, limits or
credentials — `setCardDesign` on the provider is deliberately narrow.

**Why the choice is stored in a cookie.** The mock provider keeps state in
module memory, which does not survive serverless: each request can land on a
different instance and instances are recycled freely, so a saved design
appeared to revert to the fixture default on its own.
`lib/card-design-store.ts` persists the choice in a cookie and overlays it on
whatever the provider returns. Every entry is validated on read, so a
hand-edited cookie cannot inject an unknown design id. Delete this file once
the real provider owns the setting.

> The same limitation still applies to **other** mock mutations — card loads,
> sends and newly created virtual cards can reset when an instance recycles.
> That is inherent to fixture data with no database behind it, and disappears
> with the real provider integration.

> A **physical** card's plastic is printed at manufacture. Changing its design
> here changes how it looks in the app only; the printed card follows on
> reissue. The info sheet on `/card/design` says as much to the user.

## Money handling

All amounts are **integers in minor units** (USD cents, 6dp for USDC/USDT). Floats are
never used for balances — `0.1 + 0.2 !== 0.3`, and card balances must reconcile exactly
against the provider's ledger. `parseToMinorUnits` rejects input with more precision
than the asset supports rather than silently truncating.

Network fees are recomputed server-side in `send`, never taken from the client.

## Security headers

Set globally in `next.config.ts`. The load-bearing pair is
`X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'`
— a banking UI that can be iframed is a clickjacking target, where an attacker
overlays their own page on a real Send or Load screen.

**A full script CSP is deliberately not set yet.** Next.js injects inline
bootstrap scripts, so a strict policy needs per-request nonces and careful
testing. A half-strict policy that silently breaks hydration is worse than
none — this is a launch task, not a quick win.

## Caching policy

Deliberately conservative for a financial app:

| What | Policy | Why |
|---|---|---|
| `/api/*` | never cached (`no-store` + service-worker `NetworkOnly`) | A stale balance shown as current is worse than none. Cached card secrets would leave a PAN in Cache Storage. |
| navigations | network-first, cached shell offline | Live data when online, app still opens offline |
| `/_next/static`, `/icons` | cache-first | Content-hashed, so a hit is always correct |

## Known gaps before production

These are prototype-scope shortcuts, each marked `TODO` in the code:

- **Session** (`lib/session.ts`) returns a fixed user id. Needs an httpOnly, Secure,
  SameSite session cookie with a server-side store. Onboarding state currently sits in
  `localStorage` — fine for the flow, not an auth boundary.
- **Passcode** is hashed (SHA-256 + salt) locally and gates the UI only. It is not a
  security control until verified server-side.
- **Biometrics** (`lib/biometrics.ts`) uses WebAuthn with a client-generated challenge
  and does not register the credential with a server, so it proves the device prompt
  was satisfied — it is not yet an auth factor.
- **Card secrets** (`/api/cards/[cardId]/secrets`) needs step-up auth and server-side
  rate limiting. A session cookie alone should not be enough to read a PAN.
- **Login** accepts any well-formed credentials; sign-up and sign-in share a path.
- **PWA icons** are generated placeholders. Replace with designer exports in
  `/public/icons` and repoint the manifest.
- **Legal copy** in `/legal/*` is placeholder text pending counsel.

## Notes on the source mocks

- The Wallet mock's headline "Total Balance" reads **$28,425.12** while its own asset
  list (USDC $18,562.41 + USDT $7,842.71) sums to **$26,405.12** — a $2,020 gap. The
  app derives the total from the assets so the two can never disagree.
- **Passcode creation** is two-phase (choose, then confirm). The mock shows one step;
  without confirmation a mistyped passcode locks the user out with no V1 recovery path.
- The Send mock renders the **Max** link in blue against an otherwise all-gold palette.
  Rendered in gold here for consistency — worth confirming which was intended.
- The **Card Design** mock's carousel shows **five dots but names only four designs**.
  Four are implemented; check whether a fifth exists.
- That mock also says the design applies "to your virtual card only". Design is
  per-card here, including the physical card, at the client's request.
