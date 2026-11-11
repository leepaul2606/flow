"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthScreen } from "@/components/flow/auth-screen";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { BackButton } from "@/components/ui/screen";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { useApp } from "@/lib/store/app-provider";

export default function VerifyMobilePage() {
  const router = useRouter();
  const { markPhoneVerified } = useApp();

  const expiry = useCountdown(295); // 04:55, matching the mock
  const resend = useCountdown(45);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const verify = async (value: string) => {
    if (value.length < 6) {
      setError("Enter the 6-digit code");
      return;
    }
    if (expiry.finished) {
      setError("That code has expired. Request a new one.");
      return;
    }

    setVerifying(true);
    setError(null);
    // TODO: verify against the real OTP endpoint. Any 6 digits pass for now.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVerifying(false);

    markPhoneVerified();
    router.push("/create-passcode");
  };

  return (
    <>
      <div className="px-5 pt-safe">
        <div className="pt-4">
          <BackButton href="/verify-email" />
        </div>
      </div>

      <AuthScreen
        icon="phone"
        title="Enter verification code"
        subtitle="We've sent a 6-digit code to your mobile number."
        actions={
          <>
            <Button onClick={() => verify(code)} loading={verifying}>
              Verify Code
            </Button>

            <Button
              variant="secondary"
              disabled={!resend.finished}
              onClick={() => {
                resend.restart(45);
                expiry.restart(295);
                setCode("");
                setError(null);
              }}
            >
              {resend.finished
                ? "Resend code"
                : `Resend code (${resend.formatted})`}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/login?mode=signup")}
              className="w-full py-2 text-[15px] font-medium text-gold"
            >
              Change mobile number
            </button>
          </>
        }
      >
        <CodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            setError(null);
          }}
          onComplete={verify}
          invalid={Boolean(error)}
          label="Mobile verification code"
        />

        <p className="mt-6 text-[15px] text-ink-muted">
          {expiry.finished ? (
            <span className="text-negative">Code expired</span>
          ) : (
            <>
              Code expires in{" "}
              <span className="font-medium text-gold tabular">
                {expiry.formatted}
              </span>
            </>
          )}
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-[14px] text-negative">
            {error}
          </p>
        ) : null}
      </AuthScreen>
    </>
  );
}
