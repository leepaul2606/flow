"use client";

import { useCallback } from "react";

import { KycBadge } from "@/components/flow/kyc-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";

export default function KycPage() {
  const user = useResource(useCallback(() => api.getUser(), []));
  const kyc = user.data?.kyc;

  const outstanding =
    kyc !== undefined &&
    kyc.status !== "approved" &&
    kyc.status !== "in_review";

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        KYC Status
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Identity verification for your card account.
      </p>

      {user.loading ? (
        <div className="mt-7 h-40 animate-pulse rounded-[var(--radius-panel)] bg-hairline/50" />
      ) : kyc ? (
        <>
          <Panel className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[15px] text-ink-muted">Current status</p>
                <p className="mt-1.5 text-[20px] font-semibold text-ink">
                  {kyc.status === "approved"
                    ? "Verified"
                    : kyc.status === "in_review"
                      ? "Under review"
                      : kyc.status === "rejected"
                        ? "Not approved"
                        : "Incomplete"}
                </p>
              </div>
              <KycBadge status={kyc.status} />
            </div>

            <p className="mt-4 text-[13px] text-ink-faint">
              Last updated{" "}
              {new Date(kyc.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </Panel>

          {kyc.rejectionReason ? (
            <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-panel)] bg-negative/8 px-4 py-3.5">
              <span className="mt-0.5 shrink-0 text-negative">
                <Icon name="alert" size={20} />
              </span>
              <p className="text-[14px] leading-relaxed text-ink">
                {kyc.rejectionReason}
              </p>
            </div>
          ) : null}

          <ListGroup className="mt-5">
            <ListRow
              icon="user"
              title="Personal Information"
              subtitle={
                kyc.personalInfoComplete ? "Complete" : "Needs your details"
              }
              href="/profile/personal"
              trailing={<StepMark done={kyc.personalInfoComplete} />}
            />
            <ListRow
              icon="document"
              title="Identity Document"
              subtitle={
                kyc.documentComplete
                  ? "Complete"
                  : "Upload a passport or ID card"
              }
              showChevron={!kyc.documentComplete}
              trailing={<StepMark done={kyc.documentComplete} />}
            />
          </ListGroup>

          {outstanding ? (
            <Button className="mt-7">Continue verification</Button>
          ) : null}

          <Panel className="mt-6">
            <p className="text-[14px] leading-relaxed text-ink-muted">
              Verification is handled by our card provider and is required by
              regulation before your card can be issued or funded.
            </p>
          </Panel>
        </>
      ) : (
        <p className="mt-8 text-[15px] text-ink-muted">
          {user.error ?? "Couldn't load your verification status"}
        </p>
      )}
    </Screen>
  );
}

function StepMark({ done }: { done: boolean }) {
  return done ? (
    <span className="grid size-7 place-items-center rounded-full bg-positive-wash text-positive">
      <Icon name="check" size={16} strokeWidth={2.4} />
    </span>
  ) : (
    <span className="grid size-7 place-items-center rounded-full bg-warning-wash text-warning">
      <Icon name="alert" size={15} strokeWidth={2} />
    </span>
  );
}
