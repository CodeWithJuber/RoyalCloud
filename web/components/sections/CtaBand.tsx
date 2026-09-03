import type { CtaLink } from "./Hero";

interface CtaBandProps {
  title: string; // may contain <em> accents — trusted local content
  subtitle?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
}

const targetProps = (cta?: CtaLink) =>
  cta?.external || /^https?:\/\//.test(cta?.href ?? "")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

export function CtaBand({
  title,
  subtitle,
  primaryCta = {
    text: "Get Started Now",
    href: "https://my.royalclouds.net/cart.php",
    external: true,
  },
  secondaryCta,
}: CtaBandProps) {
  return (
    <section className="section-royal cta-band">
      <div className="site-shell cta-inner" data-reveal>
        <h2 dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p className="cta-lede">{subtitle}</p>}
        {(primaryCta || secondaryCta) && (
          <div className="cta-actions">
            {primaryCta && (
              <a className="btn btn-primary" href={primaryCta.href} {...targetProps(primaryCta)}>
                {primaryCta.text}
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            )}
            {secondaryCta && (
              <a className="btn btn-secondary" href={secondaryCta.href} {...targetProps(secondaryCta)}>
                {secondaryCta.text}
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
