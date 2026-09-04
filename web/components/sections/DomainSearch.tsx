import { siteSettings } from "@/lib/settings";
import { Price } from "@/components/Price";

const TLDS = [
  { tld: ".com", usd: "9.99", note: "most popular" },
  { tld: ".in", usd: "7.99", note: "India" },
  { tld: ".net", usd: "11.49", note: "technical" },
  { tld: ".org", usd: "10.99", note: "non-profit" },
  { tld: ".dev", usd: "12.99", note: "developers" },
];

interface DomainSearchProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function DomainSearch({
  id,
  eyebrow,
  title = "Find the perfect domain name",
  subtitle,
}: DomainSearchProps) {
  /* GET form → WHMCS domain checker (my.royalclouds.net). Query params the
     action URL carries must travel as hidden fields — GET replaces them. */
  const action = new URL(siteSettings.whmcsUrl + "/cart.php?a=add&domain=register");
  const hidden = [...action.searchParams.entries()];
  const formAction = `${action.origin}${action.pathname}`;

  return (
    <section className="section section-dark domain-search" id={id} aria-labelledby="domain-search-title">
      <div className="site-shell domain-shell" data-reveal>
        <header className="section-header center">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id="domain-search-title">{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>

        <div className="domain-card">
          <form method="get" action={formAction} target="_blank" rel="noopener noreferrer">
            {hidden.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <label htmlFor="domain-query">Domain name</label>
            <div className="domain-row">
              <input
                id="domain-query"
                name="query"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="your-next-idea.com"
                aria-describedby="domain-search-help"
                required
              />
              <button className="btn btn-primary" type="submit">
                Search domains
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </button>
            </div>
            <p id="domain-search-help" className="domain-help">
              Enter a complete name including its extension — registration continues securely in your client area.
            </p>
          </form>

          <ul className="domain-tlds" aria-label="Popular domain extensions">
            {TLDS.map((tld) => (
              <li key={tld.tld}>
                <span className="tld-name">{tld.tld}</span>
                <span className="tld-price">
                  <Price value={tld.usd} />
                </span>
                <span className="tld-note">{tld.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
