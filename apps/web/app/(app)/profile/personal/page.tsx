"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";
import { api, ApiError } from "@flow/core";
import { useResource } from "@/lib/hooks/use-resource";

export default function PersonalInfoPage() {
  const user = useResource(useCallback(() => api.getUser(), []));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const person = user.data?.personalInfo;

  /**
   * Edits are held as a sparse overlay on top of the fetched profile rather
   * than copied into state when it loads. That avoids mirroring server data
   * into local state — the form shows live values until the user touches a
   * field, and only touched fields count as changes.
   */
  const [draft, setDraft] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  const firstName = draft.firstName ?? person?.firstName ?? "";
  const lastName = draft.lastName ?? person?.lastName ?? "";
  const phone = draft.phone ?? person?.phone ?? "";

  const dirty =
    person !== undefined &&
    (firstName !== person.firstName ||
      lastName !== person.lastName ||
      phone !== person.phone);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await api.updatePersonalInfo({
        firstName,
        lastName,
        phone,
      });
      user.set(updated);
      // Drop the overlay so the form reflects what the server now holds
      setDraft({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Personal Information
      </h1>

      {user.loading ? (
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[62px] animate-pulse rounded-[var(--radius-field)] bg-hairline/50"
            />
          ))}
        </div>
      ) : person ? (
        <>
          <div className="mt-8 space-y-5">
            <Field
              label="First name"
              value={firstName}
              autoComplete="given-name"
              onChange={(e) =>
                setDraft({ ...draft, firstName: e.target.value })
              }
            />
            <Field
              label="Last name"
              value={lastName}
              autoComplete="family-name"
              onChange={(e) =>
                setDraft({ ...draft, lastName: e.target.value })
              }
            />
            <Field
              label="Mobile number"
              value={phone}
              type="tel"
              autoComplete="tel"
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </div>

          <Panel className="mt-6">
            <p className="text-[14px] text-ink-muted">Email address</p>
            <p className="mt-1 text-[16px] text-ink">{person.email}</p>
            <p className="mt-3 text-[13px] text-ink-faint">
              Contact support to change the email on your account.
            </p>
          </Panel>

          <Panel className="mt-3.5">
            <p className="text-[14px] text-ink-muted">Date of birth</p>
            <p className="mt-1 text-[16px] text-ink">
              {new Date(person.dateOfBirth).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </Panel>

          <Panel className="mt-3.5">
            <p className="text-[14px] text-ink-muted">Residential address</p>
            <p className="mt-1 text-[16px] leading-relaxed text-ink">
              {person.address.line1}
              {person.address.line2 ? <>, {person.address.line2}</> : null}
              <br />
              {person.address.city}, {person.address.country}
            </p>
            <p className="mt-3 text-[13px] text-ink-faint">
              Changing your address requires re-verification.
            </p>
          </Panel>

          {error ? (
            <p role="alert" className="mt-5 text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          <Button
            className="mt-7"
            disabled={!dirty}
            loading={saving}
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save changes"}
          </Button>
        </>
      ) : (
        <p className="mt-8 text-[15px] text-ink-muted">
          {user.error ?? "Couldn't load your details"}
        </p>
      )}
    </Screen>
  );
}
