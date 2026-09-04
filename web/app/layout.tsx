import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileCtaBar } from "@/components/site/MobileCtaBar";
import { RevealScript } from "@/components/site/RevealScript";
import { siteSettings } from "@/lib/settings";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

/* Mono is only the numerals in benchmark bars, step numbers and stat tiles —
   all below the fold on every page, so it must not compete with DM Sans for
   the preload budget. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: "Royal Clouds | SSD Hosting, KVM VPS and Managed Cloud",
  description:
    "Choose SSD web hosting, KVM VPS, managed WordPress, and dedicated infrastructure with clear plans and human support.",
};

/* viewport-fit=cover is what makes env(safe-area-inset-*) resolve to a real
   value — without it the mobile CTA bar's inset is always 0 and the bar sits
   under the iPhone home indicator. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-astryx-theme="royal"
      /* The theme ships a dark half that the app never renders (Providers pins
         mode="light"). Without this, a dark-preference OS paints the body with
         the dark token behind light-mode text until hydration repairs it. */
      data-theme="light"
      data-currency="USD"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
          <MobileCtaBar />
          <RevealScript />
        </Providers>
      </body>
    </html>
  );
}
