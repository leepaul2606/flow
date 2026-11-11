"use client";

import { ListGroup, ListRow } from "@/components/ui/list-row";
import { BackButton, Screen } from "@/components/ui/screen";

export default function LegalPage() {
  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Legal
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        The documents that govern your Flow account.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="document"
          title="Terms of Service"
          subtitle="Your agreement with Flow"
          href="/legal/terms"
        />
        <ListRow
          icon="shield"
          title="Privacy Policy"
          subtitle="How we handle your data"
          href="/legal/privacy"
        />
      </ListGroup>

      <p className="mt-8 text-center text-[13px] text-ink-faint">
        Flow V1 · © {new Date().getFullYear()}
      </p>
    </Screen>
  );
}
