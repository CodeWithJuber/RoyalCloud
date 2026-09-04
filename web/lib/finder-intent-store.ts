"use client";

import { useSyncExternalStore } from "react";
import type { IntentId } from "@/lib/intents";

/**
 * The intent a visitor picked on the page that embeds the finder inline
 * (home): hero chips write it, the finder reads it and restarts from step
 * two. `session` bumps on every pick so a re-pick resets a touched flow.
 * Null server snapshot keeps hydration identical to the static HTML.
 */
export interface FinderIntent {
  intent: IntentId | null;
  session: number;
}

let current: FinderIntent | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function setFinderIntent(intent: IntentId | null) {
  current = { intent, session: (current?.session ?? 0) + 1 };
  listeners.forEach((listener) => listener());
}

export const useFinderIntent = (): FinderIntent | null =>
  useSyncExternalStore(subscribe, () => current, () => null);
