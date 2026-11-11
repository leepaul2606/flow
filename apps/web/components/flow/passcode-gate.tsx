"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { useApp } from "@/lib/store/app-provider";

/**
 * Step-up authentication for revealing sensitive card data.
 *
 * Renders `children` only after the passcode is re-entered, and re-locks
 * automatically after `autoHideMs` so credentials don't sit on a screen that
 * gets put down. Callers should also clear any fetched secrets on lock, which
 * is what `onLock` is for.
 */
export function PasscodeGate({
  prompt,
  actionLabel,
  onUnlock,
  onLock,
  autoHideMs = 60_000,
  children,
}: {
  prompt: string;
  actionLabel: string;
  /** Runs after a correct passcode — fetch the secrets here. */
  onUnlock: () => Promise<void>;
  onLock?: () => void;
  autoHideMs?: number;
  children: (lock: () => void) => ReactNode;
}) {
  const { verifyPasscode } = useApp();

  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = () => {
    setUnlocked(false);
    setPasscode("");
    setError(null);
    onLock?.();
  };

  useEffect(() => {
    if (!unlocked || autoHideMs <= 0) return;
    const timer = setTimeout(lock, autoHideMs);
    return () => clearTimeout(timer);
    // `lock` is stable enough for this purpose; re-arming on each unlock is
    // the intended behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, autoHideMs]);

  const attempt = async (candidate: string) => {
    if (candidate.length < 6) return;

    setChecking(true);
    setError(null);

    const matched = await verifyPasscode(candidate);
    if (!matched) {
      setChecking(false);
      setPasscode("");
      setError("Incorrect passcode");
      return;
    }

    try {
      await onUnlock();
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) return <>{children(lock)}</>;

  return (
    <div className="mt-8">
      <p className="mb-6 text-[15px] text-ink-muted">{prompt}</p>

      <CodeInput
        value={passcode}
        onChange={(value) => {
          setPasscode(value);
          setError(null);
        }}
        onComplete={attempt}
        secure
        invalid={Boolean(error)}
        label="Passcode"
      />

      {error ? (
        <p role="alert" className="mt-5 text-[15px] text-negative">
          {error}
        </p>
      ) : null}

      <Button
        className="mt-7"
        loading={checking}
        disabled={passcode.length < 6}
        onClick={() => attempt(passcode)}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
