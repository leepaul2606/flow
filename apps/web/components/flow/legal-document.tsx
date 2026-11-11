import { BackButton, Screen } from "@/components/ui/screen";

interface Section {
  heading: string;
  body: string;
}

/** Shared reader layout for the terms and privacy documents. */
export function LegalDocument({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile/legal" />
      </div>

      <h1 className="mt-6 font-display text-[38px] leading-tight text-ink">
        {title}
      </h1>
      <p className="mt-2.5 text-[14px] text-ink-faint">Last updated {updated}</p>

      <div className="mt-8 space-y-7">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[16px] font-semibold text-ink">
              {section.heading}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </Screen>
  );
}
