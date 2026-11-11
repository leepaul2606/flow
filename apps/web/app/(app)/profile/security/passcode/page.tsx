"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Icon } from "@/components/ui/icon";
import { BackButton, Screen } from "@/components/ui/screen";
import { useApp } from "@/lib/store/app-provider";

type Phase = "current" | "next" | "confirm";

const COPY: Record<Phase, { title: string; prompt: string }> = {
  current: {
    title: "Change Passcode",
    prompt: "Enter your current passcode to continue.",
  },
  next: { title: "New passcode", prompt: "Choose a new 6-digit passcode." },
  confirm: {
    title: "Confirm passcode",
    prompt: "Enter your new passcode once more.",
  },
};

export default function ChangePasscodePage() {
  const router = useRouter();
  const { verifyPasscode, setPasscode } = useApp();

  const [phase, setPhase] = useState<Phase>("current");
  const [value, setValue] = useState("");
  const [nextPasscode, setNextPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const advance = async (candidate: string) => {
    if (candidate.length < 6) return;
    setError(null);
    setBusy(true);

    try {
      if (phase === "current") {
        const matched = await verifyPasscode(candidate);
        if (!matched) {
          setError("That's not your current passcode");
          setValue("");
          return;
        }
        setPhase("next");
        setValue("");
        return;
      }

      if (phase === "next") {
        // Reject reusing the passcode they already have
        if (await verifyPasscode(candidate)) {
          setError("Choose a passcode you haven't used before");
          setValue("");
          return;
        }
        setNextPasscode(candidate);
        setPhase("confirm");
        setValue("");
        return;
      }

      if (candidate !== nextPasscode) {
        setError("Those passcodes don't match");
        setValue("");
        return;
      }

      await setPasscode(candidate);
      setDone(true);
      setTimeout(() => router.push("/profile/security"), 1200);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <div className="mt-24 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-full bg-positive-wash text-positive">
            <Icon name="check" size={36} strokeWidth={2.2} />
          </span>
          <h1 className="mt-6 text-[22px] font-semibold text-ink">
            Passcode updated
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">
            Use your new passcode next time you unlock Flow.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="pt-4">
        <BackButton
          href="/profile/security"
          onClick={
            phase !== "current"
              ? () => {
                  setPhase(phase === "confirm" ? "next" : "current");
                  setValue("");
                  setError(null);
                }
              : undefined
          }
        />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        {COPY[phase].title}
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">{COPY[phase].prompt}</p>

      <div className="mt-10">
        <CodeInput
          key={phase}
          value={value}
          onChange={(next) => {
            setValue(next);
            setError(null);
          }}
          onComplete={advance}
          secure
          invalid={Boolean(error)}
          label={COPY[phase].title}
        />

        {error ? (
          <p role="alert" className="mt-5 text-[15px] text-negative">
            {error}
          </p>
        ) : null}

        <Button
          className="mt-8"
          loading={busy}
          disabled={value.length < 6}
          onClick={() => advance(value)}
        >
          Continue
        </Button>
      </div>
    </Screen>
  );
}
