"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import { AssetLogo } from "@/components/flow/asset-logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { BackButton, RoundIconButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import { estimateNetworkFee } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import {
  ASSET_DECIMALS,
  formatAsset,
  formatUsd,
  parseToMinorUnits,
} from "@flow/core";
import { networkLabel, truncateAddress } from "@flow/core";
import type { Asset, ChainNetwork, StableSymbol } from "@flow/core";

export default function SendPage() {
  return (
    <Suspense fallback={<div className="min-h-screen-safe bg-ground" />}>
      <SendForm />
    </Suspense>
  );
}

function SendForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const portfolio = useResource(useCallback(() => api.getPortfolio(), []));
  const assets = portfolio.data?.assets ?? [];

  const requested = searchParams.get("asset")?.toUpperCase();
  const [symbol, setSymbol] = useState<StableSymbol>(
    requested === "USDT" ? "USDT" : "USDC",
  );
  const asset: Asset | undefined = assets.find((a) => a.symbol === symbol);

  const [network, setNetwork] = useState<ChainNetwork>("ethereum");
  const [address, setAddress] = useState("");
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");

  const [assetSheetOpen, setAssetSheetOpen] = useState(false);
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decimals = ASSET_DECIMALS[symbol];
  const amount = parseToMinorUnits(amountText, decimals);
  const fee = useMemo(
    () => estimateNetworkFee(network, symbol),
    [network, symbol],
  );

  const balance = asset?.balance.amount ?? 0;
  const total = amount === null ? null : amount + fee.amount;
  const exceedsBalance = total !== null && total > balance;

  const canSubmit =
    address.trim().length > 0 &&
    amount !== null &&
    amount > 0 &&
    !exceedsBalance &&
    !portfolio.loading;

  // Leave room for the fee so "Max" never produces an unsendable amount
  const maxSendable = Math.max(0, balance - fee.amount);

  const handleMax = () => {
    setAmountText((maxSendable / 10 ** decimals).toFixed(2));
    setError(null);
  };

  const handleSend = async () => {
    if (amount === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const transaction = await api.send({
        assetSymbol: symbol,
        network,
        toAddress: address.trim(),
        amount,
      });
      router.replace(`/activity/${transaction.id}?sent=1`);
    } catch (err) {
      setConfirmOpen(false);
      setError(
        err instanceof ApiError ? err.message : "Couldn't send this transfer",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const availableNetworks = asset?.networks ?? ["ethereum"];

  return (
    <Screen>
      <div className="flex items-center justify-between pt-4">
        <BackButton href={`/wallet/${symbol.toLowerCase()}`} />
        <RoundIconButton icon="help" label="Help with sending" />
      </div>

      <h1 className="mt-7 font-display text-[40px] leading-none text-ink">
        Send {symbol}
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Send {symbol} to any wallet address.
      </p>

      {/* Recipient ------------------------------------------------------- */}
      <Panel className="mt-6">
        <label
          htmlFor="recipient"
          className="block text-[14px] text-ink-muted"
        >
          Recipient Address
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="recipient"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
            }}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[19px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            aria-label="Scan a QR code"
            className="text-ink active:text-gold"
          >
            <Icon name="scan" size={24} />
          </button>
          <button
            type="button"
            aria-label="Choose from saved recipients"
            className="text-ink active:text-gold"
          >
            <Icon name="user" size={24} />
          </button>
        </div>
      </Panel>

      {/* Network --------------------------------------------------------- */}
      <Panel className="mt-3.5">
        <p className="text-[14px] text-ink-muted">Network</p>
        <button
          type="button"
          onClick={() => setNetworkSheetOpen(true)}
          className="mt-2.5 flex w-full items-center gap-3"
        >
          <AssetLogo symbol={symbol} size={30} />
          <span className="flex-1 text-left text-[17px] font-medium text-ink">
            {networkLabel(network)}
          </span>
          <span className="text-ink-faint">
            <Icon name="chevron-right" size={20} />
          </span>
        </button>
      </Panel>

      {/* Amount ---------------------------------------------------------- */}
      <Panel className="mt-3.5">
        <label htmlFor="amount" className="block text-[14px] text-ink-muted">
          Amount
        </label>

        <div className="mt-1.5 flex items-center gap-3">
          <input
            id="amount"
            value={amountText}
            onChange={(e) => {
              setAmountText(e.target.value);
              setError(null);
            }}
            inputMode="decimal"
            placeholder="0"
            className="min-w-0 flex-1 bg-transparent font-display text-[38px] leading-none text-ink outline-none tabular placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={() => setAssetSheetOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-hairline/60 px-4 py-2.5 text-[16px] font-semibold text-ink"
          >
            {symbol}
            <span className="rotate-90 text-ink-muted">
              <Icon name="chevron-right" size={16} />
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[14px]">
          <span className="text-ink-muted tabular">
            {amount !== null
              ? formatUsd(Math.round((amount / 10 ** decimals) * 100))
              : formatUsd(0)}{" "}
            USD
          </span>

          <span className="flex items-center gap-2.5">
            <span className="text-ink-muted tabular">
              Balance:{" "}
              {asset
                ? formatAsset(asset.balance, { withSymbol: true })
                : "Loading"}
            </span>
            <button
              type="button"
              onClick={handleMax}
              className="font-semibold text-gold"
            >
              Max
            </button>
          </span>
        </div>
      </Panel>

      {/* Note ------------------------------------------------------------ */}
      <Panel className="mt-3.5">
        <label htmlFor="note" className="block text-[14px] text-ink-muted">
          Add a note (optional)
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="note"
            value={note}
            maxLength={60}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this for?"
            className="min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-faint"
          />
          <span className="shrink-0 text-[14px] text-ink-faint tabular">
            {note.length}/60
          </span>
        </div>
      </Panel>

      {/* Review ---------------------------------------------------------- */}
      <Panel className="mt-3.5">
        <h2 className="text-[17px] font-semibold text-ink">Review Transfer</h2>

        <dl className="mt-4 space-y-3.5">
          <ReviewLine
            label="You send"
            value={`${amount !== null ? formatAsset({ amount, decimals, symbol }) : "0.00"} ${symbol}`}
            sub={formatUsd(
              amount !== null ? Math.round((amount / 10 ** decimals) * 100) : 0,
            )}
          />
          <ReviewLine label="Network" value={networkLabel(network)} />
          <ReviewLine
            label="Network fee"
            labelIcon
            value={`${formatAsset(fee)} ${symbol}`}
            sub={formatUsd(Math.round((fee.amount / 10 ** decimals) * 100))}
          />
        </dl>

        <div className="mt-4 border-t border-hairline pt-4">
          <ReviewLine
            label="Total"
            emphasise
            value={`${total !== null ? formatAsset({ amount: total, decimals, symbol }) : formatAsset(fee)} ${symbol}`}
            sub={formatUsd(
              Math.round(((total ?? fee.amount) / 10 ** decimals) * 100),
            )}
          />
        </div>
      </Panel>

      {exceedsBalance ? (
        <p role="alert" className="mt-4 text-[14px] text-negative">
          That&rsquo;s more than your {symbol} balance once the network fee is
          included.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-negative">
          {error}
        </p>
      ) : null}

      <Button
        className="mt-6"
        disabled={!canSubmit}
        onClick={() => setConfirmOpen(true)}
      >
        <Icon name="arrow-up-right" size={20} />
        Review &amp; Send
      </Button>

      {/* Sheets ---------------------------------------------------------- */}
      <Sheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        title="Choose asset"
      >
        <h2 className="mb-4 text-[19px] font-semibold text-ink">Choose asset</h2>
        <div className="space-y-2">
          {assets.map((option) => (
            <button
              key={option.symbol}
              type="button"
              onClick={() => {
                setSymbol(option.symbol);
                // Reset the network if the new asset doesn't support it
                if (!option.networks.includes(network)) {
                  setNetwork(option.networks[0]);
                }
                setAssetSheetOpen(false);
              }}
              className="flex w-full items-center gap-3.5 rounded-[var(--radius-field)] bg-surface p-4 active:bg-hairline/40"
            >
              <AssetLogo symbol={option.symbol} size={40} />
              <span className="flex-1 text-left">
                <span className="block text-[16px] font-semibold text-ink">
                  {option.symbol}
                </span>
                <span className="text-[14px] text-ink-muted">
                  {formatAsset(option.balance, { withSymbol: true })}
                </span>
              </span>
              {option.symbol === symbol ? (
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
          Sending on the wrong network can permanently lose your funds.
        </p>
        <div className="space-y-2">
          {availableNetworks.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setNetwork(option);
                setNetworkSheetOpen(false);
              }}
              className="flex w-full items-center gap-3.5 rounded-[var(--radius-field)] bg-surface p-4 active:bg-hairline/40"
            >
              <span className="flex-1 text-left">
                <span className="block text-[16px] font-medium text-ink">
                  {networkLabel(option)}
                </span>
                <span className="text-[14px] text-ink-muted tabular">
                  Fee ≈ {formatAsset(estimateNetworkFee(option, symbol))}{" "}
                  {symbol}
                </span>
              </span>
              {option === network ? (
                <span className="text-gold">
                  <Icon name="check" size={20} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm transfer"
      >
        <h2 className="text-[22px] font-semibold text-ink">Confirm transfer</h2>
        <p className="mt-2 text-[15px] text-ink-muted">
          On-chain transfers can&rsquo;t be reversed. Check the address before
          you send.
        </p>

        <Panel className="mt-5">
          <dl className="space-y-3.5">
            <ReviewLine
              label="Sending"
              value={`${amount !== null ? formatAsset({ amount, decimals, symbol }) : "0.00"} ${symbol}`}
            />
            <ReviewLine label="To" value={truncateAddress(address)} />
            <ReviewLine label="Network" value={networkLabel(network)} />
          </dl>
        </Panel>

        <div className="mt-5 space-y-3">
          <Button loading={submitting} onClick={handleSend}>
            Confirm &amp; Send
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

function ReviewLine({
  label,
  value,
  sub,
  emphasise = false,
  labelIcon = false,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasise?: boolean;
  labelIcon?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-[15px] text-ink-muted">
        {label}
        {labelIcon ? (
          <span className="text-ink-faint">
            <Icon name="help" size={15} />
          </span>
        ) : null}
      </dt>
      <dd className="text-right">
        <span
          className={`block tabular ${
            emphasise
              ? "text-[17px] font-semibold text-ink"
              : "text-[15px] font-medium text-ink"
          }`}
        >
          {value}
        </span>
        {sub ? (
          <span className="mt-0.5 block text-[14px] text-ink-muted tabular">
            {sub}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
