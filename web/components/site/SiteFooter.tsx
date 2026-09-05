import { siteSettings } from "@/lib/settings";
import { Icon } from "../Icon";
import { NewTabHint } from "../NewTabHint";

export function SiteFooter() {
  const groups = [...siteSettings.footerGroups, { label: "Support", items: siteSettings.support }];
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer section-deep">
      <div className="site-shell">
        <div className="footer-contact">
          <a href="mailto:support@royalclouds.net">
            <Icon name="mail" size={16} />
            support@royalclouds.net
          </a>
          <a href={`${siteSettings.whmcsUrl}/submitticket.php`} target="_blank" rel="noopener noreferrer">
            <Icon name="report" size={16} />
            Open a support ticket
            <NewTabHint />
          </a>
          <a href={siteSettings.whmcsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" size={16} />
            24/7 live chat
            <NewTabHint />
          </a>
        </div>
      </div>
      <div className="site-shell footer-grid">
        <section className="footer-brand">
          {/* Intrinsic size (see SiteHeader) — CSS caps the rendered height. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteSettings.logoLight}
            width={1434}
            height={490}
            alt={siteSettings.organizationName}
            loading="lazy"
          />
          <p className="footer-note">
            SSD hosting, KVM virtual servers, managed WordPress, and dedicated infrastructure —
            with a direct path to a human.
          </p>
          {siteSettings.socials.length > 0 && (
            <ul className="footer-socials">
              {siteSettings.socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} rel="noreferrer" target="_blank">
                    {social.label}
                    <NewTabHint />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {groups.map((group) => (
          <nav key={group.label} aria-label={group.label} className="footer-group">
            <h2>{group.label}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {item.label}
                    {item.external && <NewTabHint />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-shell footer-bottom">
        <p>© {year} {siteSettings.organizationName}. All rights reserved.</p>
        <p className="footer-fine">
          Prices in USD unless noted · 30-day money-back guarantee on hosting plans
        </p>
      </div>
    </footer>
  );
}
