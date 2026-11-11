import Image from "next/image";

import { getCardDesign, type CardDesignId } from "@flow/core";

import { cardArtworkUrl } from "@/lib/card-artwork";
import { cn } from "@/lib/cn";
import { formatUsd, maskValue } from "@flow/core";
import type { PaymentCard } from "@flow/core";

/**
 * The Flow card face.
 *
 * The artwork carries everything fixed — the Flow wordmark, the VISA mark, the
 * tier label, and any chip or contactless detail. The only thing drawn on top
 * is live data: the card number or balance, which differ per card and must
 * stay real, selectable, screen-readable text.
 *
 * Artwork goes through next/image so the 2–3 MB source PNGs are served as
 * resized WebP/AVIF; shipping the originals would cost ~15 MB on the design
 * screen alone.
 */
export function CardFace({
  card,
  /** Overrides the card's stored design — used for previews and pickers. */
  design: designOverride,
  /** Shows "Card Balance" and the amount, as on Home. */
  showBalance = false,
  balanceHidden = false,
  /** "thumb" renders artwork only, for the design grid. */
  variant = "full",
  /** Set on the first card painted on a screen, for LCP. */
  priority = false,
  className,
}: {
  card: PaymentCard;
  design?: CardDesignId;
  showBalance?: boolean;
  balanceHidden?: boolean;
  variant?: "full" | "thumb";
  priority?: boolean;
  className?: string;
}) {
  const design = getCardDesign(designOverride ?? card.design);
  const frozen = card.status === "frozen";
  const thumb = variant === "thumb";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        thumb
          ? "aspect-[1.586/1] rounded-xl"
          : "aspect-[1.586/1] rounded-[var(--radius-card)] shadow-lg",
        className,
      )}
      style={{ backgroundColor: design.fallback }}
    >
      <Image
        src={cardArtworkUrl(design)}
        alt=""
        fill
        priority={priority}
        sizes={thumb ? "160px" : "(max-width: 512px) 100vw, 512px"}
        className="object-cover"
      />

      {/* Thumbnails show the artwork alone — live data would be illegible */}
      {!thumb ? (
        <>
          {/* Veil so gold ink stays readable over the lower-left artwork */}
          <div
            className="absolute inset-0"
            style={{ background: design.scrim }}
            aria-hidden="true"
          />

          {/* The artwork carries the wordmark, VISA mark and tier label.
              The only thing drawn here is live data. */}
          <div className="relative flex size-full flex-col justify-end p-6">
            <div className="min-w-0">
              {showBalance ? (
                <>
                  <p className="text-[13px]" style={{ color: design.ink.muted }}>
                    Card Balance
                  </p>
                  <p
                    className="mt-1 font-display text-[30px] leading-none tabular"
                    style={{ color: design.ink.primary }}
                  >
                    {maskValue(formatUsd(card.availableToSpend), balanceHidden)}
                  </p>
                </>
              ) : (
                <p
                  className="text-[17px] tracking-[0.12em] tabular"
                  style={{ color: design.ink.primary }}
                >
                  <span className="mr-2 align-middle text-[10px]">••••</span>
                  {card.last4}
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}

      {frozen && !thumb ? (
        <div className="absolute inset-0 grid place-items-center bg-ink/55 backdrop-blur-[2px]">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-ink">
            Frozen
          </span>
        </div>
      ) : null}
    </div>
  );
}

