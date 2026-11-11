"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen, SecurityNote } from "@/components/flow/auth-screen";
import { Button } from "@/components/ui/button";
import { enrolBiometrics, isBiometricsAvailable } from "@/lib/biometrics";
import { useApp } from "@/lib/store/app-provider";

export default function BiometricsPage() {
  const router = useRouter();
  const { session, setBiometricsEnabled } = useApp();

  const [available, setAvailable] = useState<boolean | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isBiometricsAvailable().then(setAvailable);
  }, []);

  const handleEnable = async () => {
    setWorking(true);
    setError(null);

    const result = await enrolBiometrics(
      session.email ?? "flow-user",
      session.email ?? "Flow user",
    );

    setWorking(false);

    if (!result.ok) {
      setError(result.reason ?? "Couldn't enable biometrics");
      return;
    }

    setBiometricsEnabled(true);
    router.push("/home");
  };

  return (
    <AuthScreen
      className="pt-safe"
      icon="face-id"
      title="Enable Face ID"
      subtitle="Unlock Flow instantly and approve payments without typing your passcode."
      actions={
        <>
          <Button
            onClick={handleEnable}
            loading={working}
            disabled={available === false}
          >
            Continue
          </Button>

          <button
            type="button"
            onClick={() => router.push("/home")}
            className="w-full py-2 text-[15px] font-medium text-gold"
          >
            Skip for now
          </button>
        </>
      }
      footnote={
        <SecurityNote>
          {available === false
            ? "This device doesn't offer biometric unlock. You can enable it later from Security."
            : "Your biometric data never leaves your device. Flow only receives a yes or no."}
        </SecurityNote>
      }
    >
      {error ? (
        <p role="alert" className="text-center text-[14px] text-negative">
          {error}
        </p>
      ) : null}
    </AuthScreen>
  );
}
