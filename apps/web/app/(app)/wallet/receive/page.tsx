"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { AssetLogo } from "@/components/flow/asset-logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { formatAsset } from "@flow/core";
import { networkLabel } from "@flow/core";
import type { ChainNetwork, StableSymbol } from "@flow/core";

export default function ReceivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen-safe bg-ground" />}>
      <ReceiveView />
    </Suspense>
  );
}

function ReceiveView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requested = searchParams.get("asset")?.toUpperCase();
  const [symbol, setSymbol] = useState<StableSymbol>(
    requested === "USDT" ? "USDT" : "USDC",
  );
  // The chosen network is stored with the asset it belongs to, so switching
  // asset implicitly falls back to that asset's default network instead of
  // carrying over a selection the new asset may not support.
  const [choice, setChoice] = useState<{
    symbol: StableSymbol;
    network: ChainNetwork;
  } | null>(null);
  const [assetSheetOpen, setAssetSheetOpen] = useState(false);
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const details = useResource(
    useCallback(() => api.getReceiveDetails(symbol), [symbol]),
  );

  const options = details.data ?? [];
  const selectedNetwork = choice?.symbol === symbol ? choice.network : null;
  const active =
    options.find((option) => option.network === selectedNetwork) ?? options[0];

  const handleCopy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address stays selectable on screen
    }
  };

  const handleShare = async () => {
    if (!active || !navigator.share) return;
    try {
      await navigator.share({
        title: `My ${symbol} address`,
        text: active.address,
      });
    } catch {
      // User dismissed the share sheet
    }
  };

  return (
    <Screen>
      <div className="flex items-center justify-between pt-4">
        <BackButton href={`/wallet/${symbol.toLowerCase()}`} />
      </div>

      <h1 className="mt-7 font-display text-[40px] leading-none text-ink">
        Receive {symbol}
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Send only {symbol} on {active ? networkLabel(active.network) : "this network"} to this address.
      </p>

      <Panel className="mt-6">
        <p className="text-[14px] text-ink-muted">Asset</p>
        <button
          type="button"
          onClick={() => setAssetSheetOpen(true)}
          className="mt-2.5 flex w-full items-center gap-3"
        >
          <AssetLogo symbol={symbol} size={30} />
          <span className="flex-1 text-left text-[17px] font-medium text-ink">
            {symbol}
          </span>
          <span className="text-ink-faint">
            <Icon name="chevron-right" size={20} />
          </span>
        </button>
      </Panel>

      <Panel className="mt-3.5">
        <p className="text-[14px] text-ink-muted">Network</p>
        <button
          type="button"
          onClick={() => setNetworkSheetOpen(true)}
          disabled={options.length < 2}
          className="mt-2.5 flex w-full items-center gap-3 disabled:opacity-60"
        >
          <span className="flex-1 text-left text-[17px] font-medium text-ink">
            {active ? networkLabel(active.network) : "None available"}
          </span>
          {options.length > 1 ? (
            <span className="text-ink-faint">
              <Icon name="chevron-right" size={20} />
            </span>
          ) : null}
        </button>
      </Panel>

      <div className="mt-6 flex flex-col items-center">
        {details.loading ? (
          <div className="size-[220px] animate-pulse rounded-[var(--radius-panel)] bg-hairline/60" />
        ) : active ? (
          <QrCode value={active.address} />
        ) : (
          <p className="text-[15px] text-ink-muted">
            {details.error ?? "No deposit address available"}
          </p>
        )}
      </div>

      {active ? (
        <>
          <Panel className="mt-6">
            <p className="text-[14px] text-ink-muted">
              Your {symbol} address
            </p>
            <p className="mt-2 break-all text-[16px] leading-relaxed text-ink">
              {active.address}
            </p>
          </Panel>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleCopy}>
              <Icon name={copied ? "check" : "copy"} size={20} />
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Icon name="share" size={20} />
              Share
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-panel)] bg-warning-wash px-4 py-3.5">
            <span className="mt-0.5 shrink-0 text-warning">
              <Icon name="alert" size={20} />
            </span>
            <p className="text-[14px] leading-relaxed text-ink">
              Sending any other asset, or using a different network, will
              permanently lose your funds.
              {active.minimumDeposit ? (
                <>
                  {" "}
                  Minimum deposit is{" "}
                  <span className="font-medium tabular">
                    {formatAsset({
                      amount: active.minimumDeposit,
                      decimals: 6,
                      symbol,
                    })}{" "}
                    {symbol}
                  </span>
                  .
                </>
              ) : null}
            </p>
          </div>
        </>
      ) : null}

      <Sheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        title="Choose asset"
      >
        <h2 className="mb-4 text-[19px] font-semibold text-ink">Choose asset</h2>
        <div className="space-y-2">
          {(["USDC", "USDT"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSymbol(option);
                setAssetSheetOpen(false);
              }}
              className="flex w-full items-center gap-3.5 rounded-[var(--radius-field)] bg-surface p-4 active:bg-hairline/40"
            >
              <AssetLogo symbol={option} size={40} />
              <span className="flex-1 text-left text-[16px] font-semibold text-ink">
                {option}
              </span>
              {option === symbol ? (
                <span className="text-gold">
                  <Icon name="check" size={20} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={networkSheetOpen}
        onClose={() => setNetworkSheetOpen(false)}
        title="Choose network"
      >
        <h2 className="mb-2 text-[19px] font-semibold text-ink">
          Choose network
        </h2>
        <p className="mb-4 text-[14px] text-ink-muted">
          The sender must use the same network you pick here.
        </p>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.network}
              type="button"
              onClick={() => {
                setChoice({ symbol, network: option.network });
                setNetworkSheetOpen(false);
              }}
              className="flex w-full items-center gap-3.5 rounded-[var(--radius-field)] bg-surface p-4 active:bg-hairline/40"
            >
              <span className="flex-1 text-left text-[16px] font-medium text-ink">
                {networkLabel(option.network)}
              </span>
              {option.network === active?.network ? (
                <span className="text-gold">
                  <Icon name="check" size={20} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>

      <button
        type="button"
        onClick={() => router.push("/wallet")}
        className="mt-8 w-full py-2 text-[15px] font-medium text-gold"
      >
        Done
      </button>
    </Screen>
  );
}

/** Renders the address as a QR code, generated in the browser. */
function QrCode({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Loaded lazily so the QR library stays out of the initial bundle
    void import("qrcode").then(async (QRCode) => {
      const url = await QRCode.toDataURL(value, {
        width: 440,
        margin: 1,
        color: { dark: "#0f0f0f", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      if (!cancelled) setDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    return (
      <div className="size-[220px] animate-pulse rounded-[var(--radius-panel)] bg-hairline/60" />
    );
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-hairline/70 bg-white p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="QR code for your deposit address"
        width={220}
        height={220}
        className="size-[220px]"
      />
    </div>
  );
}
