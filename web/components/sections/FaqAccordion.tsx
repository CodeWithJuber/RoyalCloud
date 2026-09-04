import faqsData from "@/data/faqs.json";
import { Icon } from "../Icon";
import { sectionName, sectionTitleId } from "@/lib/section-name";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** "inline" renders the page's own questions; anything else uses data/faqs.json. */
  source?: "global" | "inline";
  items?: FaqItem[];
  /** Emit FAQPage structured data (default true). */
  jsonld?: boolean;
}

/* Native <details>: zero JS, accessible by default. The shared `name` makes
   the group an exclusive accordion in current browsers (one open at a time);
   the open/close motion is CSS-only progressive enhancement. */
export function FaqAccordion({
  id,
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  subtitle,
  source,
  items,
  jsonld = true,
}: FaqAccordionProps) {
  const faqs: FaqItem[] = source === "inline" && items && items.length > 0 ? items : faqsData.general;
  if (faqs.length === 0) return null;
  const group = `faq-${id ?? "list"}`;

  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section className="section section-tint faq-section" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={sectionTitleId(id)}>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details key={faq.q} className="faq-item" name={group} open={i === 0} data-reveal>
              <summary>
                <span className="faq-q">{faq.q}</span>
                <span className="faq-toggle" aria-hidden="true">
                  <Icon name="chevronDown" size={16} />
                </span>
              </summary>
              <p className="faq-answer">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
      {jsonld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </section>
  );
}
