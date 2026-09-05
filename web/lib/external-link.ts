import type { CtaLink } from "@/components/sections/Hero";

/**
 * Does this CTA leave the site? An authored link is external when it says so
 * or when it carries an absolute http(s) href.
 *
 * One definition, because two components had their own copy and the
 * "(opens in a new tab)" hint has to be attached to exactly the links that
 * actually open one — a hint on an internal link is worse than none.
 */
export const isExternalCta = (cta?: CtaLink): boolean =>
  Boolean(cta?.external) || /^https?:\/\//.test(cta?.href ?? "");

/** `target`/`rel` for a CTA, empty for an in-site link. */
export const targetProps = (cta?: CtaLink) =>
  isExternalCta(cta) ? { target: "_blank", rel: "noopener noreferrer" } : {};
