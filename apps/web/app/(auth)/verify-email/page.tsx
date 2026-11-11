"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthScreen } from "@/components/flow/auth-screen";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/screen";
import { useApp } from "@/lib/store/app-provider";
import { useCountdown } from "@/lib/hooks/use-countdown";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { session, markEmailVerified } = useApp();
  const resend = useCountdown(45);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // TODO: call the real resend endpoint
    await new Promise((resolve) => setTimeout(resolve, 400));
    setResending(false);
    resend.restart(45);
  };

  const handleContinue = () => {
    // TODO: verification is confirmed by the emailed link in production.
    // The prototype advances directly so the flow stays walkable.
    markEmailVerified();
    router.push("/verify-mobile");
  };

  return (
    <>
      <div className="px-5 pt-safe">
        <div className="pt-4">
          <BackButton href="/login" />
        </div>
      </div>

      <AuthScreen
        icon="mail"
        title="Verify your email"
        subtitle={
          <>
            We&rsquo;ve sent a verification link to{" "}
            <span className="font-medium text-ink">
              {session.email ?? "your email address"}
            </span>
            .
          </>
        }
        actions={
          <>
            <Button onClick={handleContinue}>Open Email App</Button>

            <Button
              variant="secondary"
              onClick={handleResend}
              loading={resending}
              disabled={!resend.finished}
            >
              {resend.finished
                ? "Resend Email"
                : `Resend Email (${resend.formatted})`}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/login?mode=signup")}
              className="w-full py-2 text-[15px] font-medium text-gold"
            >
              Change Email
            </button>
          </>
        }
      />
    </>
  );
}
