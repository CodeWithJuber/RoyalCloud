"use client";

import { useEffect, useMemo, useRef } from "react";
import { Price } from "../Price";
import { useScrollspy } from "@/lib/use-scrollspy";
import type { Subnav } from "@/lib/subnav";

/**
 * Sticky "On this page" pills under the site header on product pages, with a
 * "From $X/mo" anchor to the plans (Bluehost's "Start for $X/mo" pattern).
 * Hidden on phones — MobileCtaBar covers them. Publishes its own height as
 * --subnav-h so sticky table headers and anchor padding clear it.
 */
export function ProductSubnav({ links, cta }: Subnav) {
  const ref = useRef<HTMLElement>(null);
  const ids = useMemo(() => links.map((link) => link.href.slice(1)), [links]);

  /* Runs before the scrollspy effect below (declaration order) so the
     observer's band already accounts for this bar's height. */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--subnav-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--subnav-h");
    };
  }, []);

  const active = useScrollspy(ids);

  return (
    <nav className="product-subnav" aria-label="On this page" ref={ref}>
      <div className="site-shell product-subnav-inner">
        <ul className="subnav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                className="subnav-link"
                href={link.href}
                aria-current={active === link.href.slice(1) ? "location" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta && (
          <a className="btn btn-primary subnav-cta" href={cta.href}>
            From <Price value={cta.price} />
            {cta.period}
            <small>billed monthly</small>
          </a>
        )}
      </div>
    </nav>
  );
}
