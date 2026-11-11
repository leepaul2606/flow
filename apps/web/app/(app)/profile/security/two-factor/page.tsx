"use client";

import { useCallback, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { Toggle } from "@/components/ui/toggle";
import { api, ApiError } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";

export default function TwoFactorPage() {
  const user = useResource(useCallback(() => api.getUser(), []));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = user.data?.security.twoFactorEnabled ?? false;

  const handleToggle = async (next: boolean) => {
    if (!user.data) return;

    setBusy(true);
    setError(null);

    try {
      const security = await api.setTwoFactorEnabled(next);
      user.set({ ...user.data, security });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update two-factor",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile/security" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Two-Factor Authentication
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Require a second step when signing in from a new device.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="shield"
          title="Two-factor authentication"
          subtitle={
            enabled ? "A code is sent to your mobile" : "Currently switched off"
          }
          showChevron={false}
          trailing={
            <Toggle
              label="Two-factor authentication"
              checked={enabled}
              disabled={busy || user.loading}
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
            <Icon name="phone" size={22} />
          </span>
          <div>
            <p className="text-[15px] font-medium text-ink">
              Codes go to your mobile
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
              We send a 6-digit code to the number on your account. Keep it
              up to date in Personal Information so you don&rsquo;t get locked
              out.
            </p>
          </div>
        </div>
      </Panel>
    </Screen>
  );
}
