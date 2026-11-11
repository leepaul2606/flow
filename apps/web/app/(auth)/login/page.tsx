"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";
import { BackButton } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store/app-provider";

type Mode = "login" | "signup";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen-safe bg-ground" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useApp();

  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    // TODO: replace with a real credential exchange that sets an httpOnly
    // session cookie. Sign-up and sign-in currently follow the same path.
    await new Promise((resolve) => setTimeout(resolve, 450));

    signIn(email);
    router.push(mode === "signup" ? "/verify-email" : "/verify-mobile");
  };

  return (
    <div className="flex min-h-screen-safe flex-col px-5 pt-safe pb-10">
      <div className="pt-4">
        <BackButton href="/welcome" />
      </div>

      <h1 className="mt-10 font-display text-[44px] leading-none text-ink">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">
        {mode === "login"
          ? "Log in to your account or create a new one."
          : "A few details and your card is on its way."}
      </p>

      <div
        className="mt-9 flex border-b border-hairline"
        role="group"
        aria-label="Authentication mode"
      >
        {(["login", "signup"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
            }}
            className={cn(
              "flex-1 pb-3.5 text-[17px] transition-colors",
              "-mb-px border-b-2",
              mode === value
                ? "border-gold font-semibold text-ink"
                : "border-transparent font-medium text-ink-muted",
            )}
          >
            {value === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-1 flex-col">
        <Field
          label="Email address"
          icon="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          label="Password"
          className="mt-6"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={
            mode === "signup" ? "At least 8 characters." : undefined
          }
        />

        {mode === "login" ? (
          <button
            type="button"
            className="mt-5 self-start text-[15px] font-medium text-gold"
          >
            Forgot password?
          </button>
        ) : null}

        {error ? (
          <p role="alert" className="mt-5 text-[14px] text-negative">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={submitting} className="mt-8">
          {mode === "login" ? "Log In" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
