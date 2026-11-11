import { Icon } from "@/components/ui/icon";

export const metadata = { title: "Offline · Flow" };

/** Fallback served by the service worker when a navigation fails offline. */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen-safe max-w-lg flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-gold-wash text-gold">
        <Icon name="alert" size={30} />
      </span>

      <h1 className="mt-6 font-display text-[32px] leading-tight text-ink">
        You&rsquo;re offline
      </h1>
      <p className="mt-3 max-w-[20rem] text-[15px] leading-relaxed text-ink-muted">
        Flow needs a connection to show your balances and card. Reconnect and
        this page will pick up where you left off.
      </p>
    </div>
  );
}
