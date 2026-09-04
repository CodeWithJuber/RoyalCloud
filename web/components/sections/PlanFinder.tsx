"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { isIntentId } from "@/lib/intents";
import type { Build } from "@/lib/plan-finder";
import { useFinderIntent } from "@/lib/finder-intent-store";
import { FinderFlow } from "./FinderFlow";

/**
 * PlanFinder — the home-page "Help me choose" card. `?for=<intent>` from the
 * URL pre-answers the build so hero chips and product pages land straight on
 * step two. The flow itself lives in FinderFlow (shared with the drawer).
 */

/* The URL intent as an external store: the server snapshot is null, so
   hydration matches the static HTML and the prefill applies on the client's
   first post-hydration render — no effect has to write state. */
const noopSubscribe = () => () => {};
const readUrlIntent = (): Build | null => {
  try {
    const value = new URLSearchParams(window.location.search).get("for");
    return isIntentId(value) ? value : null;
  } catch {
    return null;
  }
};
const useUrlIntent = (): Build | null =>
  useSyncExternalStore(noopSubscribe, readUrlIntent, () => null);

export function PlanFinder({ marks }: { marks?: Record<string, ReactNode> }) {
  const urlBuild = useUrlIntent();
  /* A chip picked on this page (FinderJump) wins over the URL and restarts
     the flow — the key remounts it so a touched finder resets too. */
  const picked = useFinderIntent();
  const initialBuild = picked ? picked.intent : urlBuild;
  return (
    <div className="plan-finder" data-reveal>
      <FinderFlow
        key={picked?.session ?? 0}
        initialBuild={initialBuild}
        variant="inline"
        marks={marks}
      />
    </div>
  );
}
