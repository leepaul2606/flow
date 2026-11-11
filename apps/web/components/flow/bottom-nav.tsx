"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

interface Tab {
  href: string;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/wallet", label: "Wallet", icon: "wallet" },
  { href: "/card", label: "Card", icon: "card" },
  { href: "/activity", label: "Activity", icon: "activity" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-hairline/60 bg-surface/95 backdrop-blur-xl",
        "pb-safe",
      )}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-3 pt-2.5 pb-1.5">
        {TABS.map((tab) => {
          // Sub-routes keep their parent tab lit, e.g. /wallet/usdc -> Wallet
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-1"
              >
                <span className={active ? "text-ink" : "text-ink-muted"}>
                  <Icon
                    name={tab.icon}
                    size={24}
                    filled={active}
                    strokeWidth={active ? 1.5 : 1.75}
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-none",
                    active
                      ? "font-semibold text-ink"
                      : "font-medium text-ink-muted",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
