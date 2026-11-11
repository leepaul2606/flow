"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BottomNav } from "@/components/flow/bottom-nav";
import { Splash } from "@/components/flow/splash";
import { useApp } from "@/lib/store/app-provider";

/**
 * Gate for the authenticated app.
 *
 * Two conditions must hold: a signed-in session, and — if the user has set a
 * passcode — an unlocked app session. Anything else bounces to the relevant
 * screen.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { hydrating, session, unlocked } = useApp();

  const needsSignIn = !hydrating && !session.signedIn;
  const needsUnlock =
    !hydrating && session.signedIn && Boolean(session.passcodeHash) && !unlocked;

  useEffect(() => {
    if (needsSignIn) router.replace("/welcome");
    else if (needsUnlock) router.replace("/unlock");
  }, [needsSignIn, needsUnlock, router]);

  // Show the boot screen while resolving so there is no flash of app content
  if (hydrating || needsSignIn || needsUnlock) {
    return <Splash />;
  }

  return (
    <div className="mx-auto max-w-lg">
      {children}
      <BottomNav />
    </div>
  );
}
