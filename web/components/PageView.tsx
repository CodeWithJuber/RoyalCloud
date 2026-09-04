import Link from "next/link";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Prose } from "@/components/Prose";
import { buildJsonLd } from "@/lib/seo";
import type { PageContent } from "@/lib/content";
import { withSectionIds } from "@/lib/section-ids";
import { buildSubnav } from "@/lib/subnav";
import { ProductSubnav } from "@/components/site/ProductSubnav";
import { FinderDrawer } from "@/components/site/FinderDrawer";
import { FinderJump } from "@/components/site/FinderJump";
import { finderMarks } from "@/components/FinderMarks";

export function PageView({ page }: { page: PageContent }) {
  const jsonLd = buildJsonLd(page);
  const sections = withSectionIds(page.sections);
  /* Product pages (pricing + comparison) get a sticky sub-nav right under the hero. */
  const subnav = buildSubnav(sections);
  const heroIndex = Math.max(0, sections.findIndex((section) => section.type === "hero"));
  /* The page's own deck pre-answers the finder; pages that embed the finder
     inline (home) scroll to it instead of opening the drawer. */
  const pricing = sections.find((section) => section.type === "pricing");
  const planId = typeof pricing?.plan === "string" ? pricing.plan : undefined;
  const hasInlineFinder = sections.some((section) => section.type === "planfinder");

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
        <SectionRenderer
          sections={sections}
          after={
            subnav
              ? { index: heroIndex, node: <ProductSubnav {...subnav} planId={planId} /> }
              : undefined
          }
        />
        {page.body && <Prose markdown={page.body} />}
      </main>
      {hasInlineFinder ? <FinderJump /> : <FinderDrawer planId={planId} marks={finderMarks()} />}
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
