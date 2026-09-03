"use client";

import { useEffect, useState } from "react";
import { siteSettings } from "@/lib/settings";

/**
 * Sticky mobile action bar — keeps the primary conversion action in the thumb
 * zone on phones. Appears after 400px of scroll, hides when the footer is in
 * view so it never covers it. Mobile only.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => setFooterVisible(e.isIntersecting)),
      { threshold: 0.02 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!visible || footerVisible) return null;

  return (
    <div className="mobile-cta" role="region" aria-label="Quick actions">
      <a className="btn btn-secondary" href="#pricing">
        View plans
      </a>
      <a
        className="btn btn-primary"
        href={`${siteSettings.whmcsUrl}/cart.php`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get started
        <span className="btn-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
