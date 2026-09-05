import { ImageResponse } from "next/og";
import { siteSettings } from "@/lib/settings";

/* Every share of this site rendered a blank card: no OG image existed, so
   Slack, WhatsApp, LinkedIn and X all fell back to a grey placeholder.
   Generated rather than shipped as a file so the wordmark, the palette and
   the claim stay in one place and cannot drift from the theme. */
export const alt = "Royal Clouds — premium SSD hosting with 24/7 human support";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#2f1c6a";
const VIOLET = "#7d59d9";
const GOLD = "#ffc94b";
const LAVENDER = "#faf7ff";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: NIGHT,
          backgroundImage: `radial-gradient(900px 520px at 78% -12%, ${VIOLET}cc, transparent 62%)`,
          color: LAVENDER,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: GOLD,
              color: NIGHT,
              fontSize: 30,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Royal Clouds</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 18px",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            <span>Premium SSD hosting with</span>
            <span style={{ color: GOLD }}>24/7 human support</span>
          </div>
          <div style={{ fontSize: 30, color: "#c5bfd5", lineHeight: 1.35 }}>
            SSD RAID-10 with LiteSpeed · free migration · free SSL on every plan
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#c5bfd5" }}>
          {["99.99% uptime SLA", "30-day money-back", siteSettings.siteUrl.replace("https://", "")].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "1px solid #faf7ff2e",
                  background: "#ffffff0d",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
