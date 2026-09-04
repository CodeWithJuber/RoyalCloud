/**
 * "(opens in a new tab)" for assistive tech, on every link that leaves the
 * site. A link that opens a new tab with no warning takes the back button
 * away without saying so (WCAG 2.2 G201); the ↗ glyph says it to people who
 * can see it, this says it to everyone else.
 *
 * Plain JSX so server and client components can both use it.
 */
export function NewTabHint() {
  return <span className="visually-hidden"> (opens in a new tab)</span>;
}
