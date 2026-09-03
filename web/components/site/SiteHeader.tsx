"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteSettings } from "@/lib/settings";
import { CurrencySwitch } from "./CurrencySwitch";

export function SiteHeader() {
  const { announcement, navigation, whmcsUrl, logoDark } = siteSettings;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [announceVisible, setAnnounceVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`site-header ${scrolled ? "is-scrolled" : ""}`} ref={headerRef}>
      {announcement && announceVisible && (
        <aside className="announcement" aria-label="Announcement">
          <p>
            <span>{announcement.message}</span>
            {announcement.action && (
              <Link href={announcement.action.href}>
                {announcement.action.label}
                <span aria-hidden="true"> ↗</span>
              </Link>
            )}
          </p>
          <button
            type="button"
            className="announcement-close"
            aria-label="Dismiss announcement"
            onClick={() => setAnnounceVisible(false)}
          >
            <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true" focusable="false">
              <path d="M1 1l12 12M13 1L1 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </aside>
      )}

      <header className="header-bar">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Royal Clouds home" onClick={() => setMobileOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDark} width={176} height={46} alt="Royal Clouds" />
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {navigation.map((group) => (
              <div
                key={group.label}
                className={`nav-group ${openGroup === group.label ? "open" : ""}`}
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  className="nav-trigger"
                  aria-expanded={openGroup === group.label}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                >
                  <span>{group.label}</span>
                  <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true" focusable="false">
                    <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="nav-panel">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpenGroup(null)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <CurrencySwitch />
            <a className="login-link" href={`${whmcsUrl}/login`}>Sign in</a>
            <a className="btn btn-primary header-cta" href={whmcsUrl}>
              Open console
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className={`mobile-toggle ${mobileOpen ? "open" : ""}`}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-panel ${mobileOpen ? "open" : ""}`} inert={!mobileOpen}>
        <nav aria-label="Mobile">
          {navigation.map((group) => (
            <section key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </section>
          ))}
          <section>
            <h2>Account</h2>
            <a href={`${whmcsUrl}/login`}>Sign in</a>
            <a href={whmcsUrl}>Open console</a>
          </section>
        </nav>
      </div>
    </div>
  );
}
