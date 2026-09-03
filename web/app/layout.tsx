import type { Metadata } from "next";
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
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: "Royal Clouds | SSD Hosting, KVM VPS and Managed Cloud",
  description:
    "Choose SSD web hosting, KVM VPS, managed WordPress, and dedicated infrastructure with clear plans and human support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-astryx-theme="royal"
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
