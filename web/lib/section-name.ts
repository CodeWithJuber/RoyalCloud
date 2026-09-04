/**
 * Landmark naming for a content section.
 *
 * A `<section>` is only exposed as a region — the thing a screen-reader user
 * can jump between — once it has an accessible name, so an unnamed band is
 * invisible to that navigation. Point at the visible heading when the section
 * carries a stable anchor id (the name then matches the text on screen
 * exactly); fall back to the title as a label when it does not, rather than
 * inventing an id that could collide with another band on the same page.
 */
export function sectionName(
  id: string | undefined,
  title: string | undefined,
): { "aria-labelledby"?: string; "aria-label"?: string } {
  if (!title) return {};
  return id ? { "aria-labelledby": `${id}-title` } : { "aria-label": title };
}

/** The heading id `sectionName` points at, or undefined when it uses a label. */
export const sectionTitleId = (id: string | undefined): string | undefined =>
  id ? `${id}-title` : undefined;
