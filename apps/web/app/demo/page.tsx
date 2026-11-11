"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Splash } from "@/components/flow/splash";
import { useApp } from "@/lib/store/app-provider";

/**
 * Direct entry for demonstrations.
 *
 * Seeds a completed onboarding state and drops straight into Home, so showing
 * someone the app doesn't mean walking them through sign-up, two verification
 * steps and a passcode first.
 *
 * The normal flow is untouched — logging out from Profile returns to Welcome
 * and onboarding behaves exactly as before. All data is fixture data, so this
 * exposes nothing that the rest of the prototype doesn't.
 */
export default function DemoPage() {
  const router = useRouter();
  const { hydrating, startDemoSession } = useApp();

  useEffect(() => {
    // Wait for the stored session to load, or this write gets overwritten
    // by hydration a moment later
    if (hydrating) return;

    startDemoSession();
    router.replace("/home");
  }, [hydrating, startDemoSession, router]);

  return <Splash label="Opening Flow" />;
}
