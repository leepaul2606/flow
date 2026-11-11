"use client";

import { useCallback } from "react";

import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { formatUsd } from "@flow/core";

export default function SpendingLimitsPage() {
  const cards = useResource(useCallback(() => api.getCards(), []));
  const card = cards.data?.find((c) => c.kind === "physical");

  const daily = card?.limits?.dailySpend;
  const monthly = card?.limits?.monthlySpend;

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/card" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Spending Limits
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Caps applied to your physical card.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="sliders"
          title="Daily limit"
          subtitle="Resets at midnight UTC"
          trailing={
            <span className="text-[15px] font-semibold text-ink tabular">
              {daily ? formatUsd(daily, { showCents: false }) : "No limit"}
            </span>
          }
          showChevron={false}
        />
        <ListRow
          icon="activity"
          title="Monthly limit"
          subtitle="Resets on the 1st"
          trailing={
            <span className="text-[15px] font-semibold text-ink tabular">
              {monthly ? formatUsd(monthly, { showCents: false }) : "No limit"}
            </span>
          }
          showChevron={false}
        />
      </ListGroup>

      <Panel className="mt-5">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Limits are set by your card programme and can&rsquo;t be changed in
          the app yet. Contact support if you need them adjusted.
        </p>
      </Panel>
    </Screen>
  );
}
