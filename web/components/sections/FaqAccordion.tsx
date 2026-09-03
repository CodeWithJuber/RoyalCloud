import faqsData from "@/data/faqs.json";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function FaqAccordion({
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  subtitle,
}: FaqAccordionProps) {
  const faqs: FaqItem[] = faqsData.general;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section className="section section-tint faq-section">
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details key={faq.q} className="faq-item" open={i === 0} data-reveal>
              <summary>
                <span className="faq-q">{faq.q}</span>
                <span className="faq-toggle" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="13" height="13" focusable="false">
                    <path
                      d="M8 3v10M3 8h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="faq-answer">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}
