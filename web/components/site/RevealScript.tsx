"use client";

import { useEffect } from "react";

/**
 * Marks html[data-js="true"] and reveals [data-reveal] blocks on scroll.
 * Content is never hidden by default — CSS only animates transform/opacity,
 * and reduced-motion marks everything visible instantly.
 */
export function RevealScript() {
  useEffect(() => {
    document.documentElement.dataset.js = "true";

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reveals.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => (el.dataset.visible = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
