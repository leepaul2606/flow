"use client";

import Image from "next/image";

/**
 * The Flow wordmark drawn on launch.
 *
 * A clip expands left to right to reveal the mark, a blurred light head rides
 * the stroke on the same clock, one shimmer sweeps across, then the whole
 * thing settles into place.
 *
 * The keyframe geometry is authored against a 192x78 wordmark, so the visual
 * size is set by scaling an outer wrapper rather than by changing the
 * dimensions — that keeps the head's path aligned to the letterforms at any
 * size. The settle animation lives on the inner element so the two transforms
 * compose instead of fighting.
 */

/** Native size the animation is authored against. */
const BASE_WIDTH = 192;
const BASE_HEIGHT = 78;

const DRAW_MS = 1500;
const SETTLE_MS = 600;
const EASE = "cubic-bezier(0.32, 0.02, 0.18, 1)";
const DRAW_EASE = "cubic-bezier(0.42, 0.02, 0.2, 1)";

export function AnimatedWordmark({
  width = 236,
  className,
}: {
  width?: number;
  className?: string;
}) {
  const scale = width / BASE_WIDTH;

  return (
    <div
      className={className}
      style={{ width, height: BASE_HEIGHT * scale }}
      role="img"
      aria-label="Flow"
    >
      <div
        className="flow-intro origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            willChange: "transform",
            animation: `flow-settle ${SETTLE_MS}ms ${EASE} ${Math.round(DRAW_MS * 0.98)}ms both`,
          }}
        >
          <div className="relative" style={{ width: BASE_WIDTH, height: BASE_HEIGHT }}>
            {/* The reveal: width grows, so the mark is uncovered stroke by stroke */}
            <div
              className="absolute left-0 top-0 overflow-hidden"
              style={{
                height: BASE_HEIGHT,
                willChange: "width",
                animation: `flow-clip ${DRAW_MS}ms ${DRAW_EASE} 0ms both`,
              }}
            >
              <Image
                src="/flow-logo.png"
                alt=""
                width={1754}
                height={896}
                priority
                style={{ width: BASE_WIDTH, height: BASE_HEIGHT }}
                className="block max-w-none"
              />
              {/* Softens the leading edge so the reveal reads as a stream
                  rather than a hard wipe */}
              <div
                className="pointer-events-none absolute right-0"
                style={{
                  top: -6,
                  bottom: -6,
                  width: 18,
                  background:
                    "linear-gradient(90deg, rgba(244,242,238,0) 0%, #f4f2ee 78%)",
                }}
              />
            </div>

            {/* One shimmer, masked to the letterforms */}
            <div
              className="pointer-events-none absolute"
              style={{
                inset: -6,
                background:
                  "linear-gradient(104deg, rgba(255,255,255,0) 38%, rgba(255,251,240,0.9) 50%, rgba(255,255,255,0) 62%)",
                WebkitMaskImage: "url(/flow-logo.png)",
                maskImage: "url(/flow-logo.png)",
                WebkitMaskSize: `${BASE_WIDTH}px ${BASE_HEIGHT}px`,
                maskSize: `${BASE_WIDTH}px ${BASE_HEIGHT}px`,
                WebkitMaskPosition: "6px 6px",
                maskPosition: "6px 6px",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                mixBlendMode: "screen",
                opacity: 0.95,
                animation: `flow-shimmer 620ms cubic-bezier(0.4,0,0.3,1) ${DRAW_MS - 140}ms forwards`,
              }}
            />

            {/* The light riding the stroke */}
            <div
              className="pointer-events-none absolute left-0 top-0 rounded-full"
              style={{
                width: 26,
                height: 26,
                margin: "-13px 0 0 -13px",
                background:
                  "radial-gradient(circle, rgba(255,247,228,0.95) 0%, rgba(226,190,120,0.55) 42%, rgba(195,154,78,0) 72%)",
                filter: "blur(2px)",
                animation: `flow-head ${DRAW_MS}ms ${DRAW_EASE} 0ms forwards`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rise-in animation for the copy and actions that follow the wordmark. */
export function riseIn(delayMs: number): React.CSSProperties {
  return { animation: `flow-rise 620ms ${EASE} ${delayMs}ms both` };
}

export function fadeIn(delayMs: number): React.CSSProperties {
  return { animation: `flow-fade 340ms ${EASE} ${delayMs}ms both` };
}
