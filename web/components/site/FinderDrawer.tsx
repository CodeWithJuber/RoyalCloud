"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { FinderFlow } from "../sections/FinderFlow";
import { isIntentId, type IntentId } from "@/lib/intents";
import { planCardId, setRecommended } from "@/lib/recommend-store";

/**
 * Site-wide "Help me choose" drawer — a native <dialog> (focus trap, Escape,
 * inert page for free) that slides in from the edge: a side panel on wide
 * screens, a bottom sheet on phones. Any `[data-finder]` link opens it with
 * that product pre-answered; without JS the links still lead to the home
 * finder. A recommendation for this page's own deck can jump to and mark the
 * matching plan card.
 */
export function FinderDrawer({
  planId,
  marks,
}: {
  planId?: string;
  marks?: Record<string, ReactNode>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /* Cleared when the flow hands focus to a plan card instead of the trigger. */
  const restoreFocus = useRef(true);
  const [session, setSession] = useState(0);
  const [build, setBuild] = useState<IntentId | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-finder]");
      if (!trigger) return;
      const dialog = dialogRef.current;
      if (!dialog || typeof dialog.showModal !== "function") return;
      event.preventDefault();
      triggerRef.current = trigger;
      const value = trigger.dataset.finder ?? "";
      setBuild(isIntentId(value) ? value : null);
      setSession((n) => n + 1);
      setOpen(true);
      dialog.showModal();
      dialog.querySelector<HTMLElement>("#finder-drawer-title")?.focus({ preventScroll: true });
    };
    /* Capture phase: this runs before next/link's own handler, which then
       sees defaultPrevented and skips the client navigation. */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  const onClose = () => {
    setOpen(false);
    if (restoreFocus.current) triggerRef.current?.focus({ preventScroll: true });
    restoreFocus.current = true;
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  const showOnPage = useCallback(
    (deck: string, tier: string) => {
      setRecommended({ deck, tier });
      const card = document.getElementById(planCardId(deck, tier));
      restoreFocus.current = card === null;
      close();
      if (!card) return;
      /* The dialog's close event is queued as a task; focus the card after it
         so the trigger restore above cannot win the race. */
      window.setTimeout(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        card.focus({ preventScroll: true });
      }, 0);
    },
    [close],
  );

  return (
    <dialog
      ref={dialogRef}
      className="finder-drawer"
      aria-labelledby="finder-drawer-title"
      onClose={onClose}
      onClick={onBackdrop}
    >
      <div className="finder-drawer-inner">
        <div className="finder-drawer-head">
          <div>
            <p className="eyebrow">Help me choose</p>
            <h2 id="finder-drawer-title" tabIndex={-1}>
              The right plan in four answers
            </h2>
          </div>
          <button
            type="button"
            className="finder-drawer-close"
            onClick={close}
            aria-label="Close plan finder"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {open && (
          <FinderFlow
            key={session}
            initialBuild={build}
            variant="drawer"
            currentDeck={planId}
            marks={marks}
            onShowOnPage={showOnPage}
          />
        )}
      </div>
    </dialog>
  );
}
