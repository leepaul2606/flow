"use client";

import { useCallback, useState } from "react";

import { PasscodeGate } from "@/components/flow/passcode-gate";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import type { CardSecrets } from "@flow/core";

export default function CardPinPage() {
  const cards = useResource(useCallback(() => api.getCards(), []));
  const [secrets, setSecrets] = useState<CardSecrets | null>(null);

  const card = cards.data?.find((c) => c.kind === "physical");

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/card" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        View PIN
      </h1>

      <PasscodeGate
        prompt="Enter your passcode to see the PIN for your card."
        actionLabel="Reveal PIN"
        autoHideMs={30_000}
        onUnlock={async () => {
          if (!card) throw new Error("No card available");
          setSecrets(await api.getCardSecrets(card.id));
        }}
        onLock={() => setSecrets(null)}
      >
        {(lock) =>
          secrets ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <p className="text-[15px] text-ink-muted">
                PIN for card ending {card?.last4}
              </p>

              <div className="mt-6 flex gap-3">
                {secrets.pin.split("").map((digit, index) => (
                  <span
                    key={index}
                    className="grid size-[64px] place-items-center rounded-[var(--radius-field)] border border-hairline bg-surface font-display text-[30px] text-ink tabular"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              <p className="mt-6 max-w-[19rem] text-[14px] leading-relaxed text-ink-muted">
                Never share your PIN. Flow will never ask you for it. This hides
                automatically in 30 seconds.
              </p>

              <Button variant="secondary" className="mt-8" onClick={lock}>
                <Icon name="eye-off" size={20} />
                Hide PIN
              </Button>
            </div>
          ) : null
        }
      </PasscodeGate>
    </Screen>
  );
}
