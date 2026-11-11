"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthScreen, SecurityNote } from "@/components/flow/auth-screen";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { BackButton } from "@/components/ui/screen";
import { useApp } from "@/lib/store/app-provider";

/**
 * Two-phase passcode creation: choose, then confirm.
 *
 * The mock shows a single entry step. Confirmation is added deliberately —
 * without it a mistyped passcode locks the user out of their own card with no
 * recovery path in V1.
 */
type Phase = "create" | "confirm";

const WEAK_PASSCODES = new Set([
  "000000",
  "111111",
  "123456",
  "654321",
  "121212",
  "112233",
]);

export default function CreatePasscodePage() {
  const router = useRouter();
  const { setPasscode } = useApp();

  const [phase, setPhase] = useState<Phase>("create");
  const [first, setFirst] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const value = phase === "create" ? first : confirm;
  const setValue = phase === "create" ? setFirst : setConfirm;

  const handleContinue = async (candidate: string) => {
    setError(null);

    if (candidate.length < 6) {
      setError("Enter all 6 digits");
      return;
    }

    if (phase === "create") {
      if (WEAK_PASSCODES.has(candidate)) {
        setError("Choose a passcode that's harder to guess");
        setFirst("");
        return;
      }
      setPhase("confirm");
      return;
    }

    if (candidate !== first) {
      setError("Those passcodes don't match");
      setConfirm("");
      return;
    }

    setSaving(true);
    await setPasscode(candidate);
    router.push("/biometrics");
  };

  return (
    <>
      <div className="px-5 pt-safe">
        <div className="pt-4">
          <BackButton
            href="/verify-mobile"
            onClick={
              phase === "confirm"
                ? () => {
                    // Step back to re-choose rather than leaving the flow
                    setPhase("create");
                    setConfirm("");
                    setError(null);
                  }
                : undefined
            }
          />
        </div>
      </div>

      <AuthScreen
        icon="lock"
        title={phase === "create" ? "Create your passcode" : "Confirm your passcode"}
        subtitle={
          phase === "create"
            ? "Create a 6-digit passcode to secure your account."
            : "Enter it once more so we know it's right."
        }
        actions={
          <Button onClick={() => handleContinue(value)} loading={saving}>
            Continue
          </Button>
        }
        footnote={
          <SecurityNote>
            Your passcode is encrypted and never stored on our servers.
          </SecurityNote>
        }
      >
        <CodeInput
          key={phase}
          value={value}
          onChange={(next) => {
            setValue(next);
            setError(null);
          }}
          onComplete={handleContinue}
          secure
          invalid={Boolean(error)}
          label={phase === "create" ? "New passcode" : "Confirm passcode"}
        />

        <p className="mt-6 min-h-[1.25rem] text-[15px] text-ink-muted">
          {error ? (
            <span role="alert" className="text-negative">
              {error}
            </span>
          ) : (
            "Use a passcode you can't easily guess."
          )}
        </p>
      </AuthScreen>
    </>
  );
}
