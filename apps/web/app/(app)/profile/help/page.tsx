"use client";

import { Icon } from "@/components/ui/icon";
import { ListGroup, ListRow } from "@/components/ui/list-row";
import { Panel } from "@/components/ui/panel";
import { BackButton, Screen } from "@/components/ui/screen";

const SUPPORT_EMAIL = "support@flow.app";

const FAQS = [
  {
    question: "How long does a card load take?",
    answer:
      "Loads from your Flow wallet are instant. Bank transfers are converted by our card provider and settle within 2 hours when received before 3pm Cyprus time; later requests move to the next window.",
  },
  {
    question: "Which networks can I use?",
    answer:
      "The receive screen lists every asset and network we support, and shows the right address for each. Always match the network to the one shown there. Sending on a different network loses the funds.",
  },
  {
    question: "What happens if I freeze my card?",
    answer:
      "New payments are declined immediately. Existing subscriptions will fail until you unfreeze. Your balance is untouched.",
  },
];

export default function HelpPage() {
  return (
    <Screen>
      <div className="pt-4">
        <BackButton href="/profile" />
      </div>

      <h1 className="mt-6 font-display text-[40px] leading-none text-ink">
        Help & Support
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        We&rsquo;re here if you need us.
      </p>

      <ListGroup className="mt-7">
        <ListRow
          icon="mail"
          title="Email support"
          subtitle={SUPPORT_EMAIL}
          href={`mailto:${SUPPORT_EMAIL}`}
        />
      </ListGroup>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-ink">
          Common questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[var(--radius-panel)] border border-hairline/70 bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{faq.question}</span>
                <span className="shrink-0 text-ink-faint transition-transform group-open:rotate-90">
                  <Icon name="chevron-right" size={18} />
                </span>
              </summary>
              <p className="px-5 pb-5 text-[14px] leading-relaxed text-ink-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <Panel className="mt-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-gold">
            <Icon name="shield" size={22} />
          </span>
          <p className="text-[14px] leading-relaxed text-ink-muted">
            Flow will never ask for your passcode, PIN or full card number.
            Anyone who does is not from Flow.
          </p>
        </div>
      </Panel>
    </Screen>
  );
}
