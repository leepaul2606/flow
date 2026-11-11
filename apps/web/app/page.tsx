import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { DesignCarousel } from "@/components/flow/design-carousel";
import { FlowLogo } from "@/components/flow/flow-logo";
import { Reveal } from "@/components/flow/reveal";
import { TiltCard } from "@/components/flow/tilt-card";
import { Icon } from "@/components/ui/icon";
import { CARD_DESIGNS } from "@flow/core";
import { cardArtworkUrl } from "@/lib/card-artwork";

export const metadata: Metadata = {
  title: "Flow. The private card for limitless freedom",
  description:
    "Hold your stablecoins, load your Visa card in seconds, and spend anywhere. Private, secure and built for you.",
};

/**
 * Store listings.
 *
 * Empty until the apps are published — the buttons then render as a
 * "coming soon" state rather than as links that go nowhere. Fill these in and
 * they become live links with no other change.
 */
const APP_STORE_URL = "";
const PLAY_STORE_URL = "";

const PILLARS = [
  {
    kicker: "The card",
    title: "Spend anywhere",
    body: "A physical Visa card accepted worldwide, funded straight from your balance. No limits imposed on you. Set your own, freeze it in a tap, or issue a virtual card for subscriptions.",
  },
  {
    kicker: "The balance",
    title: "Hold what you choose",
    body: "Your stablecoins in one place, on the networks you already use. Send and receive without leaving the app.",
  },
  {
    kicker: "The lock",
    title: "Yours alone",
    body: "Face ID on open, a passcode on every card reveal, and balances you can hide with one tap. Nobody sees your money but you.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Transfer in",
    body: "Send GBP, EUR or USD by bank transfer to your own account details.",
  },
  {
    n: "02",
    title: "Converted for you",
    body: "Funds arrive as stablecoin and land in your Flow balance.",
  },
  {
    n: "03",
    title: "Load and spend",
    body: "Move what you want onto the card. Spend it anywhere Visa works.",
  },
];

/** Staggered entrance for the hero, reusing the app's own rise keyframe. */
function rise(delayMs: number): React.CSSProperties {
  return {
    animation: `flow-rise 700ms cubic-bezier(0.32,0.02,0.18,1) ${delayMs}ms both`,
  };
}

/** Apple and Google both publish official badge artwork — swap these for it. */
function StoreButtons({
  align = "start",
  onDark = false,
}: {
  align?: "start" | "center";
  onDark?: boolean;
}) {
  const live = APP_STORE_URL !== "" || PLAY_STORE_URL !== "";

  const stores = [
    { name: "App Store", sub: "Download on the", href: APP_STORE_URL },
    { name: "Google Play", sub: "Get it on", href: PLAY_STORE_URL },
  ];

  return (
    <div>
      <div
        className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        {stores.map((s) =>
          s.href ? (
            <a
              key={s.name}
              href={s.href}
              className={`flex items-center gap-3 rounded-[var(--radius-field)] px-6 py-3.5 transition-opacity active:opacity-90 ${
                onDark ? "bg-white text-ink" : "bg-ink text-white"
              }`}
            >
              <Icon name="arrow-down" size={22} />
              <span className="text-left leading-tight">
                <span className="block text-[11px] opacity-70">{s.sub}</span>
                <span className="block text-[16px] font-semibold">{s.name}</span>
              </span>
            </a>
          ) : (
            <span
              key={s.name}
              className={`flex items-center gap-3 rounded-[var(--radius-field)] border px-6 py-3.5 ${
                onDark
                  ? "border-white/20 text-white/45"
                  : "border-hairline bg-surface text-ink-faint"
              }`}
            >
              <Icon name="arrow-down" size={22} />
              <span className="text-left leading-tight">
                <span className="block text-[11px]">Coming soon to</span>
                <span
                  className={`block text-[16px] font-semibold ${onDark ? "text-white/80" : "text-ink-muted"}`}
                >
                  {s.name}
                </span>
              </span>
            </span>
          ),
        )}
      </div>

      {!live ? (
        <p
          className={`mt-4 text-[14px] ${align === "center" ? "text-center" : ""} ${
            onDark ? "text-white/45" : "text-ink-faint"
          }`}
        >
          Launching on iOS and Android soon.
        </p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  const hero = CARD_DESIGNS.obsidian_gold;

  return (
    <main className="page-ground min-h-screen-safe overflow-x-clip">
      {/* Header ------------------------------------------------------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-safe">
        <div className="py-6">
          <FlowLogo width={96} priority />
        </div>
        <a
          href="#get-the-app"
          className="rounded-full border border-gold/45 px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors active:bg-gold-wash/60"
        >
          Get the app
        </a>
      </header>

      {/* Hero --------------------------------------------------------- */}
      <section className="hero-enter mx-auto max-w-6xl px-6 pb-24 pt-8 md:pb-32 md:pt-12">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
          <div>
            <p
              className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold"
              style={rise(80)}
            >
              <span className="h-px w-8 bg-gold/50" aria-hidden="true" />
              Stablecoin wallet &amp; Visa card
            </p>

            {/* Playfair has tall ascenders and a high dot on the i, so the
                leading needs headroom — any tighter and the i in "limitless"
                collides with the descenders on the line above */}
            {/* Poppins sets larger than the face it replaced, so the scale
                steps up later and tops out lower than it otherwise would */}
            <h1
              className="mt-6 text-balance font-display text-[38px] leading-[1.1] tracking-[-0.02em] text-ink md:text-[50px] md:leading-[1.06] lg:text-[60px]"
              style={rise(180)}
            >
              The private card for{" "}
              <em className="not-italic text-gold-deep">limitless</em> freedom.
            </h1>

            <p
              className="mt-6 max-w-[30rem] text-[16px] leading-relaxed text-ink-muted"
              style={rise(320)}
            >
              Spend globally. Your money, your way. Hold your stablecoins, load
              your card in seconds, and pay wherever Visa works.
            </p>

            <div className="mt-10" style={rise(440)}>
              <StoreButtons />
            </div>
          </div>

          {/* The card, tilted out of the grid so it reads as an object
              rather than an illustration slotted into a column */}
          <div className="relative md:translate-x-6">
            <div
              className="absolute -inset-8 rounded-full bg-gold-wash/70 blur-3xl"
              style={{ animation: "flow-fade 900ms ease-out 240ms both" }}
              aria-hidden="true"
            />
            <TiltCard>
              <div
                className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[var(--radius-card)] shadow-[0_40px_70px_-20px_rgba(0,0,0,0.45)]"
                style={{
                  // The resting tilt lives in a variable so the keyframe can
                  // land on it rather than duplicating the value
                  ["--card-rest" as string]: "-4deg",
                  animation:
                    "flow-card-in 1100ms cubic-bezier(0.22,0.68,0,1) 120ms both",
                }}
              >
                <Image
                  src={cardArtworkUrl(hero)}
                  alt="The Flow card, in Obsidian Gold"
                  width={1578}
                  height={996}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Pillars — hairline columns, no badges ------------------------ */}
      <Reveal>
        <section className="border-t border-hairline">
          <div className="mx-auto grid max-w-6xl px-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className={`py-12 md:py-16 ${
                  i > 0
                    ? "border-t border-hairline md:border-l md:border-t-0 md:pl-10"
                    : "md:pr-10"
                } ${i === 1 ? "md:pr-10" : ""}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {p.kicker}
                </p>
                <h2 className="mt-3 font-display text-[23px] leading-tight text-ink">
                  {p.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Designs — a strip you can push through ----------------------- */}
      <Reveal>
        <section className="border-t border-hairline py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-[34rem]">
              <h2 className="font-display text-[30px] leading-tight text-ink md:text-[38px]">
                Six ways to carry it
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
                Choose the face of your card, and change it whenever you like.
                The look changes. Your balance, limits and details stay exactly
                where they are.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <DesignCarousel />
          </div>
        </section>
      </Reveal>

      {/* How it works — dark band, echoing the card -------------------- */}
      <Reveal>
        <section className="bg-card-face text-white">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-bright">
              <span className="h-px w-8 bg-gold-bright/50" aria-hidden="true" />
              How it works
            </p>

            <h2 className="mt-6 max-w-[19rem] text-balance font-display text-[30px] leading-tight md:text-[42px]">
              How money reaches your card
            </h2>

            {/* Numbered because this genuinely is a sequence — each step
                depends on the one before it */}
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-10">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="font-display text-[34px] leading-none text-gold-bright">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[18px] font-semibold">{s.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-white/60">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* Download ----------------------------------------------------- */}
      <Reveal>
        <section
          id="get-the-app"
          className="mx-auto max-w-6xl scroll-mt-10 px-6 py-20 text-center md:py-28"
        >
          <h2 className="mx-auto max-w-[20rem] text-balance font-display text-[32px] leading-tight text-ink md:text-[42px]">
            Carry it with you.
          </h2>
          <p className="mx-auto mt-5 max-w-[28rem] text-[16px] leading-relaxed text-ink-muted">
            Flow lives on your phone. Your balance, your card and every control,
            wherever you are.
          </p>
          <div className="mt-10">
            <StoreButtons align="center" />
          </div>
        </section>
      </Reveal>

      {/* Footer ------------------------------------------------------- */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-[14px] text-ink-faint md:flex-row md:items-center md:justify-between">
          <p>Flow</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="mailto:hello@yourflowcard.com"
              className="hover:text-ink-muted"
            >
              hello@yourflowcard.com
            </a>
            <Link href="/legal/terms" className="hover:text-ink-muted">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-ink-muted">
              Privacy
            </Link>
          </div>
        </div>
        {/* An issuer statement belongs here before this page is published.
            The provider normally prescribes the exact wording and it is
            usually contractual, so ask them for it rather than drafting one. */}
      </footer>
    </main>
  );
}
