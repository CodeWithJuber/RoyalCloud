// Normalized accessor for the CMS-editable integrations config
// (src/data/integrations.json, edited at /admin → "Integrations & Tracking").
//
// Everything is optional and defaults to empty, so the renderer components
// (HeadIntegrations / BodyIntegrations / LiveChat) emit nothing until an editor
// fills a value in, keeping the site byte-identical to today out of the box.
import data from "~/data/integrations.json";

/** Trim a value to a clean string (anything non-string → ""). */
const s = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Decap's `code` widget normally stores a plain string, but some versions store
 * `{ code, lang }`. Normalize either shape to the raw HTML string. We do NOT
 * trim here, leading/trailing whitespace in pasted snippets is harmless.
 */
function asHtml(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const c = (v as { code?: unknown }).code;
    if (typeof c === "string") return c;
  }
  return "";
}

export const integrations = {
  ga4Id: s(data.analytics?.ga4Id),
  gtmId: s(data.analytics?.gtmId),
  verifyGoogle: s(data.verification?.google),
  verifyBing: s(data.verification?.bing),
  facebookPixelId: s(data.pixels?.facebookPixelId),
  chat: {
    provider: s(data.chat?.provider) || "none",
    tawkPropertyId: s(data.chat?.tawkPropertyId),
    tawkWidgetId: s(data.chat?.tawkWidgetId) || "default",
    customEmbed: asHtml(data.chat?.customEmbed),
  },
  customHeadHtml: asHtml(data.customHeadHtml),
  customBodyHtml: asHtml(data.customBodyHtml),
};

export type Integrations = typeof integrations;
