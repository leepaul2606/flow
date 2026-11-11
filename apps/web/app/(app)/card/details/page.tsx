"use client";

import { useCallback, useState } from "react";

import { CardFace } from "@/components/flow/card-face";
import { PasscodeGate } from "@/components/flow/passcode-gate";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import type { CardSecrets } from "@flow/core";

/**
 * Card credentials, gated behind passcode re-entry.
 * Secrets live in component state only — never storage, never a cache.
 */
export default function CardDetailsPage() {
  const cards = useResource(useCallback(() => api.getCards(), []));

  const [secrets, setSecrets] = useState<CardSecrets | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const card = cards.data?.find((c) => c.kind === "physical");

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable — the value stays visible and selectable
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/card" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Card Details
      </h1>

      <section className="mt-6">
        {card ? (
          <CardFace card={card} />
        ) : (
          <div className="aspect-[1.586/1] w-full animate-pulse rounded-[var(--radius-card)] bg-hairline/60" />
        )}
      </section>

      <PasscodeGate
        prompt="Enter your passcode to reveal your card details."
        actionLabel="Reveal details"
        onUnlock={async () => {
          if (!card) throw new Error("No card available");
          setSecrets(await api.getCardSecrets(card.id));
        }}
        onLock={() => setSecrets(null)}
      >
        {(lock) =>
          secrets ? (
            <>
              <p className="mt-8 text-[15px] text-ink-muted">
                These details hide again after a minute.
              </p>

              <ListGroup className="mt-4">
                <SecretRow
                  label="Card number"
                  value={secrets.pan}
                  copied={copied === "Card number"}
                  onCopy={() => copy("Card number", secrets.pan)}
                />
                <SecretRow
                  label="Expiry"
                  value={secrets.expiry}
                  copied={copied === "Expiry"}
                  onCopy={() => copy("Expiry", secrets.expiry)}
                />
                <SecretRow
                  label="CVV"
                  value={secrets.cvv}
                  copied={copied === "CVV"}
                  onCopy={() => copy("CVV", secrets.cvv)}
                />
              </ListGroup>

              <Button variant="secondary" className="mt-6" onClick={lock}>
                <Icon name="eye-off" size={20} />
                Hide details
              </Button>
            </>
          ) : null
        }
      </PasscodeGate>
    </Screen>
  );
}

function SecretRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <ListRow
      title={label}
      subtitle={<span className="text-[17px] text-ink tabular">{value}</span>}
      showChevron={false}
      trailing={
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className="text-gold active:opacity-70"
        >
          <Icon name={copied ? "check" : "copy"} size={20} />
        </button>
      }
    />
  );
}
