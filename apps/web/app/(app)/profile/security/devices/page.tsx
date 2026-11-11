"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { BackButton, Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { api, ApiError } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import type { TrustedDevice } from "@flow/core";

export default function TrustedDevicesPage() {
  const devices = useResource(useCallback(() => api.getTrustedDevices(), []));

  const [pending, setPending] = useState<TrustedDevice | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revoke = async () => {
    if (!pending) return;

    setRevoking(true);
    setError(null);

    try {
      await api.revokeDevice(pending.id);
      devices.set((devices.data ?? []).filter((d) => d.id !== pending.id));
      setPending(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't remove that device",
      );
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile/security" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Trusted Devices
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Devices signed in to your account. Remove any you don&rsquo;t recognise.
      </p>

      {devices.loading ? (
        <div className="mt-7 h-56 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
      ) : (
        <ListGroup className="mt-7">
          {(devices.data ?? []).map((device) => (
            <ListRow
              key={device.id}
              icon="devices"
              title={
                <span className="flex items-center gap-2">
                  {device.name}
                  {device.isCurrent ? (
                    <span className="rounded-full bg-positive-wash px-2 py-0.5 text-[11px] font-medium text-positive">
                      This device
                    </span>
                  ) : null}
                </span>
              }
              subtitle={`${device.platform} · ${formatLastActive(device.lastActiveAt)}${
                device.location ? ` · ${device.location}` : ""
              }`}
              showChevron={false}
              trailing={
                device.isCurrent ? undefined : (
                  <button
                    type="button"
                    onClick={() => setPending(device)}
                    aria-label={`Remove ${device.name}`}
                    className="text-negative active:opacity-70"
                  >
                    <Icon name="trash" size={20} />
                  </button>
                )
              }
            />
          ))}
        </ListGroup>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-negative">
          {error}
        </p>
      ) : null}

      <Sheet
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Remove device"
      >
        <h2 className="text-[22px] font-semibold text-ink">Remove device?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {pending?.name} will be signed out immediately and will need your
          passcode to sign back in.
        </p>

        <div className="mt-6 space-y-3">
          <Button variant="danger" loading={revoking} onClick={revoke}>
            Remove device
          </Button>
          <Button
            variant="secondary"
            disabled={revoking}
            onClick={() => setPending(null)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

function formatLastActive(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 2) return "Active now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
