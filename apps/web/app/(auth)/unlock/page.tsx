"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthScreen } from "@/components/flow/auth-screen";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { useApp } from "@/lib/store/app-provider";

/** Passcode lock shown when returning to an already-onboarded session. */
export default function UnlockPage() {
  const router = useRouter();
  const { verifyPasscode, signOut } = useApp();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const submit = async (value: string) => {
    if (value.length < 6) {
      setError("Enter all 6 digits");
      return;
    }

    setChecking(true);
    const matched = await verifyPasscode(value);
    setChecking(false);

    if (matched) {
      router.replace("/home");
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    setCode("");
    setError(
      next >= 3
        ? "Incorrect passcode. Log out and sign in again if you've forgotten it."
        : "Incorrect passcode. Try again.",
    );
  };

  return (
    <AuthScreen
      className="pt-safe"
      icon="lock"
      title="Enter your passcode"
      subtitle="Welcome back. Enter your 6-digit passcode to continue."
      actions={
        <>
          <Button onClick={() => submit(code)} loading={checking}>
            Unlock
          </Button>

          {attempts >= 3 ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/welcome");
              }}
              className="w-full py-2 text-[15px] font-medium text-gold"
            >
              Log out
            </button>
          ) : null}
        </>
      }
    >
      <CodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setError(null);
        }}
        onComplete={submit}
        secure
        invalid={Boolean(error)}
        label="Passcode"
      />

      {error ? (
        <p role="alert" className="mt-6 text-[15px] text-negative">
          {error}
        </p>
      ) : null}
    </AuthScreen>
  );
}
