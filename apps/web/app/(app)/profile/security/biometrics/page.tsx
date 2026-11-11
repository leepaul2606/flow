"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { Toggle } from "@/components/ui/toggle";
import { enrolBiometrics, isBiometricsAvailable } from "@/lib/biometrics";
import { useApp } from "@/lib/store/app-provider";

export default function BiometricsSettingsPage() {
  const { session, setBiometricsEnabled } = useApp();

  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isBiometricsAvailable().then(setAvailable);
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setError(null);

    if (!enabled) {
      setBiometricsEnabled(false);
      return;
    }

    setBusy(true);
    const result = await enrolBiometrics(
      session.email ?? "flow-user",
      session.email ?? "Flow user",
    );
    setBusy(false);

    if (!result.ok) {
      setError(result.reason ?? "Couldn't enable biometrics");
      return;
    }
    setBiometricsEnabled(true);
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile/security" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Biometrics
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Unlock Flow with Face ID, Touch ID or your device biometrics.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="face-id"
          title="Unlock with biometrics"
          subtitle={
            available === false
              ? "Not available on this device"
              : "Replaces your passcode when unlocking"
          }
          showChevron={false}
          trailing={
            <Toggle
              label="Unlock with biometrics"
              checked={session.biometricsEnabled}
              disabled={available === false || busy}
              onChange={handleToggle}
            />
          }
        />
      </ListGroup>

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-negative">
          {error}
        </p>
      ) : null}

      <Panel className="mt-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-gold">
            <Icon name="shield" size={22} />
          </span>
          <p className="text-[14px] leading-relaxed text-ink-muted">
            Your biometric data never leaves your device. Flow only ever
            receives a yes or no from the operating system, and your passcode
            remains available as a fallback.
          </p>
        </div>
      </Panel>
    </Screen>
  );
}
