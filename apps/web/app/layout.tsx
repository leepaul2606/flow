import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import { AppProvider } from "@/lib/store/app-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Poppins has no variable font on Google Fonts, so the weights the design
// uses are requested explicitly
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flow",
  description: "The private card for limitless freedom.",
  manifest: "/manifest.webmanifest",
  icons: {
    // Tight crop: at 16-32px the full icon's safe-zone margin leaves the mark
    // a few pixels wide on a pale ground, which reads as a grey smudge
    icon: "/icons/favicon-mark.png",
    // iOS ignores the manifest for home-screen icons and uses this. It keeps
    // the full square, where the margin is wanted.
    apple: "/icons/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Flow",
    statusBarStyle: "default",
  },
  // Phone-number auto-detection mangles balances and card digits on iOS
  formatDetection: { telephone: false },
  // Demo build — see app/robots.ts
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Lets the app paint under the notch and home indicator
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PwaRegister />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
