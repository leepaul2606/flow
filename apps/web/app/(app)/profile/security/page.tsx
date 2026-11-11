"use client";

import { useCallback } from "react";

import { ListGroup, ListRow } from "@/components/ui/list-row";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { useApp } from "@/lib/store/app-provider";

export default function SecurityPage() {
  const { session } = useApp();
  const user = useResource(useCallback(() => api.getUser(), []));
  const devices = useResource(useCallback(() => api.getTrustedDevices(), []));

  const twoFactorEnabled = user.data?.security.twoFactorEnabled ?? false;

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Security
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        How you sign in and protect your account.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="lock"
          title="Passcode"
          subtitle="Change your 6-digit passcode"
          href="/profile/security/passcode"
        />
        <ListRow
          icon="face-id"
          title="Biometrics"
          subtitle={
            session.biometricsEnabled
              ? "Face ID is on"
              : "Use Face ID or fingerprint"
          }
          href="/profile/security/biometrics"
          trailing={
            session.biometricsEnabled ? (
              <span className="text-[14px] font-medium text-positive">On</span>
            ) : (
              <span className="text-[14px] text-ink-muted">Off</span>
            )
          }
        />
        <ListRow
          icon="devices"
          title="Trusted Devices"
          subtitle="Review where you're signed in"
          href="/profile/security/devices"
          trailing={
            devices.data ? (
              <span className="text-[14px] text-ink-muted tabular">
                {devices.data.length}
              </span>
            ) : undefined
          }
        />
        <ListRow
          icon="shield"
          title="Two-Factor Authentication"
          subtitle="An extra step when signing in"
          href="/profile/security/two-factor"
          trailing={
            <span
              className={
                twoFactorEnabled
                  ? "text-[14px] font-medium text-positive"
                  : "text-[14px] text-ink-muted"
              }
            >
              {twoFactorEnabled ? "On" : "Off"}
            </span>
          }
        />
      </ListGroup>
    </Screen>
  );
}
