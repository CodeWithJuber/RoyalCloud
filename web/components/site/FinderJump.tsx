"use client";

import { useEffect } from "react";
import { isIntentId } from "@/lib/intents";
import { setFinderIntent } from "@/lib/finder-intent-store";

/**
 * On the page that embeds the finder inline, a `[data-finder]` link becomes
 * an in-page jump: the intent goes to the store, the finder scrolls into
 * view already on step two, and the URL keeps the shareable `?for=` form.
 * Without JS the same links still land on `/#planfinder`.
 */
export function FinderJump() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-finder]");
      if (!trigger) return;
      const target = document.getElementById("planfinder");
      if (!target) return;
      event.preventDefault();
      const value = trigger.dataset.finder ?? "";
      const intent = isIntentId(value) ? value : null;
      setFinderIntent(intent);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      try {
        window.history.replaceState(null, "", intent ? `/?for=${intent}#planfinder` : "/#planfinder");
      } catch {
        /* history can be unavailable in sandboxed frames; the scroll already happened */
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
