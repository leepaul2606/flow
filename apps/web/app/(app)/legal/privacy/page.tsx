import { LegalDocument } from "@/components/flow/legal-document";

export const metadata = { title: "Privacy Policy · Flow" };

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="19 May 2026"
      sections={[
        {
          heading: "1. What we collect",
          body: "Identity details you provide during verification, transaction records, and device information needed to keep your account secure. Placeholder copy. Replace before launch.",
        },
        {
          heading: "2. Why we collect it",
          body: "To issue and service your card, meet anti-money-laundering obligations, and detect fraud.",
        },
        {
          heading: "3. Who we share it with",
          body: "Our card provider and banking partner, and regulators where legally required. We do not sell your data.",
        },
        {
          heading: "4. Biometrics",
          body: "Face ID and fingerprint data never leave your device. Flow receives only a confirmation from your operating system.",
        },
        {
          heading: "5. Retention",
          body: "Account and transaction records are retained for the period required by financial regulation, then deleted.",
        },
        {
          heading: "6. Your rights",
          body: "You can request a copy of your data or ask us to correct it by contacting support.",
        },
      ]}
    />
  );
}
