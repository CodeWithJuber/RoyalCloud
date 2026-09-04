import type { Metadata } from "next";
import Link from "next/link";

/* A 404 that search engines index is a 404 that shows up in results. */
export const metadata: Metadata = {
  title: "Page not found | Royal Clouds",
  description: "This path no longer reaches a Royal Clouds page.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content" className="not-found section-dark">
      <div className="site-shell">
        <p className="eyebrow">404 · route not found</p>
        <h1>This path no longer reaches a cloud.</h1>
        <p className="lede">
          Check the address, explore the hosting catalog, or use the client area
          for an existing service.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/">
            Return home
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="btn btn-secondary" href="/shared-hosting">
            Explore hosting
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
