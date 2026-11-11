"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { KycBadge } from "@/components/flow/kyc-badge";
import { Button } from "@/components/ui/button";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Screen, ScreenTitle } from "@/components/ui/screen";
import { api } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";
import { useApp } from "@/lib/store/app-provider";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useApp();
  const user = useResource(useCallback(() => api.getUser(), []));

  const person = user.data?.personalInfo;
  const initials = person
    ? `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`
    : "";

  return (
    <Screen>
      <ScreenTitle className="pt-6" title="Profile" />

      <section className="mt-6 flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-[24px] text-ink">
          {initials}
        </span>

        <div className="min-w-0">
          {user.loading ? (
            <>
              <div className="h-5 w-40 animate-pulse rounded bg-hairline/70" />
              <div className="mt-2 h-4 w-52 animate-pulse rounded bg-hairline/50" />
            </>
          ) : person ? (
            <>
              <p className="truncate text-[19px] font-semibold text-ink">
                {person.firstName} {person.lastName}
              </p>
              <p className="mt-0.5 truncate text-[15px] text-ink-muted">
                {person.email}
              </p>
            </>
          ) : (
            <p className="text-[15px] text-ink-muted">
              {user.error ?? "Couldn't load your profile"}
            </p>
          )}
        </div>
      </section>

      <ListGroup className="mt-8">
        <ListRow
          icon="user"
          title="Personal Information"
          subtitle="Name, address and contact details"
          href="/profile/personal"
        />
        <ListRow
          icon="shield"
          title="Security"
          subtitle="Passcode, biometrics and devices"
          href="/profile/security"
        />
        <ListRow
          icon="document"
          title="KYC Status"
          subtitle="Identity verification"
          href="/profile/kyc"
          trailing={
            user.data ? <KycBadge status={user.data.kyc.status} /> : undefined
          }
        />
      </ListGroup>

      <ListGroup className="mt-5">
        <ListRow
          icon="help"
          title="Help & Support"
          subtitle="We're here if you need us"
          href="/profile/help"
        />
        <ListRow
          icon="scale"
          title="Legal"
          subtitle="Terms and privacy policy"
          href="/profile/legal"
        />
      </ListGroup>

      <Button
        variant="danger"
        className="mt-8"
        onClick={() => {
          signOut();
          router.replace("/welcome");
        }}
      >
        Log out
      </Button>

      <p className="mt-6 text-center text-[13px] text-ink-faint">
        Flow V1
      </p>
    </Screen>
  );
}
