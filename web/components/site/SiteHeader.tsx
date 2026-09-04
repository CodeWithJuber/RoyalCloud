"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteSettings } from "@/lib/settings";
import {
  HEADER_GROUPS,
  HEADER_LINKS,
  isExternal,
  primaryAction,
  signInAction,
  type NavLink,
} from "@/lib/navigation";
import { Icon } from "../Icon";
import { CurrencySwitch } from "./CurrencySwitch";

/* One row of the mega menu and the drawer: icon + name + one-line description. */
function NavItem({ link, onClick }: { link: NavLink; onClick?: () => void }) {
  const body = (
    <>
      {link.icon && (
        <span className="nav-item-icon" aria-hidden="true">
          <Icon name={link.icon} size={18} />
        </span>
      )}
      <span className="nav-item-copy">
        <b>{link.text}</b>
        {link.description && <small>{link.description}</small>}
      </span>
    </>
  );
  return isExternal(link.href) ? (
    <a className="nav-item" href={link.href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {body}
    </a>
  ) : (
    <Link className="nav-item" href={link.href} onClick={onClick}>
      {body}
    </Link>
  );
}

function PlainLink({ link, className, onClick }: { link: NavLink; className: string; onClick?: () => void }) {
  return isExternal(link.href) ? (
    <a className={className} href={link.href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {link.text}
    </a>
  ) : (
    <Link className={className} href={link.href} onClick={onClick}>
      {link.text}
    </Link>
  );
}

export function SiteHeader() {
  const { announcement, logoDark } = siteSettings;
  const signIn = signInAction();
  const primary = primaryAction();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [announceVisible, setAnnounceVisible] = useState(true);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    /* The sheet starts flush under the bar wherever the bar currently is: at
       the top of the page that is below the announcement, once scrolled the
       announcement is gone and the bar is at 0. The page cannot scroll while
       the sheet is open, so reading it once on open stays accurate. */
    if (mobileOpen && barRef.current) {
      const bottom = Math.max(0, Math.round(barRef.current.getBoundingClientRect().bottom));
      document.documentElement.style.setProperty("--site-header-bottom", `${bottom}px`);
    }
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

  /* Publish the *sticky* bar's height as --site-header-h. Only .header-bar
     sticks — the announcement scrolls away — so sub-nav offsets and anchor
     scroll-padding must clear the bar alone, not the dismissed-or-not
     announcement above it. The bar shrinks on phones, so it is measured. */
  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--site-header-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--site-header-h");
    };
  }, []);

  const closeAll = () => {
    setOpenGroup(null);
    setMobileOpen(false);
  };

  /* The announcement sits OUTSIDE .site-header on purpose: a sticky element is
     confined to its parent's box, so keeping it in the wrapper would let the
     bar scroll away with it. As a sibling it scrolls off, the wrapper stays
     pinned, and the bar keeps ~40px of every screen it used to hold. */
  return (
    <>
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

      <div className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <header className="header-bar" ref={barRef}>
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Royal Clouds home" onClick={closeAll}>
            {/* Intrinsic size, not the rendered size: CSS sizes it by height,
                so a wrong ratio here reserves the wrong width and the sticky
                header reflows once the file loads. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDark}
              width={970}
              height={207}
              alt="Royal Clouds"
              fetchPriority="high"
            />
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {HEADER_GROUPS.map((group) => (
              <div
                key={group.text}
                className={`nav-group ${openGroup === group.text ? "open" : ""}`}
                onMouseEnter={() => setOpenGroup(group.text)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  className="nav-trigger"
                  aria-expanded={openGroup === group.text}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(openGroup === group.text ? null : group.text)}
                >
                  <span>{group.text}</span>
                  <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true" focusable="false">
                    <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="nav-panel" data-cols={group.links.length > 4 ? "2" : "1"}>
                  {group.links.map((link) => (
                    <NavItem key={link.href} link={link} onClick={() => setOpenGroup(null)} />
                  ))}
                </div>
              </div>
            ))}
            {HEADER_LINKS.map((link) => (
              <PlainLink key={link.href} link={link} className="nav-link" />
            ))}
          </nav>

          <div className="header-actions">
            <CurrencySwitch />
            <a className="login-link" href={signIn.href}>
              {signIn.text}
            </a>
            <a className="btn btn-primary header-cta" href={primary.href} target="_blank" rel="noopener noreferrer">
              {primary.text}
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className={`mobile-toggle ${mobileOpen ? "open" : ""}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer: sits under the (still visible) header bar, full shell width,
          product groups with icons, quick links and the two account actions. */}
      <div id="mobile-menu" className={`mobile-panel ${mobileOpen ? "open" : ""}`} inert={!mobileOpen}>
        <nav className="mobile-nav" aria-label="Mobile">
          <div className="mobile-groups">
            {HEADER_GROUPS.map((group) => (
              <section key={group.text} className="mobile-group">
                <h2>{group.text}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <NavItem link={link} onClick={closeAll} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <section className="mobile-group mobile-more">
            <h2>More</h2>
            <ul className="mobile-chips">
              {HEADER_LINKS.map((link) => (
                <li key={link.href}>
                  <PlainLink link={link} className="mobile-chip" onClick={closeAll} />
                </li>
              ))}
            </ul>
          </section>
          <div className="mobile-actions">
            <a className="btn btn-secondary" href={signIn.href}>
              {signIn.text}
            </a>
            <a className="btn btn-primary" href={primary.href} target="_blank" rel="noopener noreferrer">
              {primary.text}
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
      </div>
      </div>
    </>
  );
}
