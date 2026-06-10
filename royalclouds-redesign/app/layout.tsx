import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://royalclouds.net"),
  title: "Royal Clouds — Premium SSD Hosting Reimagined",
  description: "A custom Royal Clouds hosting redesign with SSD hosting, KVM VPS, managed WordPress, dedicated servers, domain search, and 24/7 support.",
  openGraph: {
    title: "Royal Clouds — Premium SSD Hosting Reimagined",
    description: "Speed-optimized hosting, cloud VPS, managed WordPress, and dedicated servers with Royal Clouds branding.",
    url: "https://royalclouds.net",
    siteName: "Royal Clouds",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630, alt: "Royal Clouds hosting" }],
    type: "website"
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09274c"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
