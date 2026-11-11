import type { ReactNode } from "react";

/** Onboarding and unlock screens: no tab bar, centred column. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-lg">{children}</div>;
}
