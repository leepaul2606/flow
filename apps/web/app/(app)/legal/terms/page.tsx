import { LegalDocument } from "@/components/flow/legal-document";

export const metadata = { title: "Terms of Service · Flow" };

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="19 May 2026"
      sections={[
        {
          heading: "1. About these terms",
          body: "These terms govern your use of the Flow app and the Flow card. By opening an account you agree to them. Placeholder copy. Replace with the executed terms before launch.",
        },
        {
          heading: "2. Eligibility",
          body: "You must be at least 18 years old and complete identity verification before your card can be issued or funded.",
        },
        {
          heading: "3. Your account",
          body: "You are responsible for keeping your passcode, PIN and device secure. Flow will never ask you for them.",
        },
        {
          heading: "4. Funding and settlement",
          body: "Fiat received is converted to stablecoin by our card provider before being credited to your card account. Conversion rates and timing are set by the provider.",
        },
        {
          heading: "5. Transfers",
          body: "On-chain transfers are irreversible. You are responsible for confirming the recipient address and network before sending.",
        },
        {
          heading: "6. Liability",
          body: "Placeholder. Legal counsel must supply the final liability, indemnity and dispute-resolution provisions.",
        },
      ]}
    />
  );
}
