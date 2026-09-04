import Link from "next/link";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Prose } from "@/components/Prose";
import { buildJsonLd } from "@/lib/seo";
import type { PageContent } from "@/lib/content";
import { withSectionIds } from "@/lib/section-ids";

export function PageView({ page }: { page: PageContent }) {
  const jsonLd = buildJsonLd(page);
  const sections = withSectionIds(page.sections);

  return (
    <>
      {page.breadcrumb.length > 0 && (
        <nav className="breadcrumbs site-shell" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            {page.breadcrumb.map((item, index) => (
              <li key={item.href}>
                {index === page.breadcrumb.length - 1 ? (
                  <span aria-current="page">{item.text}</span>
                ) : (
                  <Link href={item.href}>{item.text}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <main id="main-content">
        <SectionRenderer sections={sections} />
        {page.body && <Prose markdown={page.body} />}
      </main>
      {jsonLd.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
