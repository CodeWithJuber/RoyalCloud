import type { ReactNode } from "react";

/**
 * Band — a page-level section: the `<section>` landmark (id, aria-labelledby)
 * plus the capped `.site-shell` column. Astryx's Section is a plain div with
 * padding that stops at 40px, so bands (night / tint / royal fields with
 * `--section-y` rhythm) stay native and everything inside them composes
 * Astryx Grid / Stack / Card. `tone` maps to the brand field classes.
 */
export type BandTone = "light" | "dark" | "deep" | "tint" | "royal";

export interface BandProps {
  id?: string;
  /** Vertical rhythm: `section` (--section-y) or `section-sm` (--section-y-sm). */
  rhythm?: "section" | "section-sm" | "none";
  tone?: BandTone;
  className?: string;
  /** id of the heading that names this landmark. */
  labelledBy?: string;
  /** Skip the .site-shell wrapper (full-bleed content that adds its own). */
  bleed?: boolean;
  children: ReactNode;
  [dataAttribute: `data-${string}`]: string | undefined;
}

const TONE_CLASS: Record<BandTone, string> = {
  light: "",
  dark: "section-dark",
  deep: "section-deep",
  tint: "section-tint",
  royal: "section-royal",
};

export function Band({
  id,
  rhythm = "section",
  tone = "light",
  className,
  labelledBy,
  bleed = false,
  children,
  ...rest
}: BandProps) {
  const classes = [rhythm === "none" ? "" : rhythm, TONE_CLASS[tone], className]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={classes} id={id} aria-labelledby={labelledBy} {...rest}>
      {bleed ? children : <div className="site-shell">{children}</div>}
    </section>
  );
}
