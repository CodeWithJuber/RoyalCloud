"use client";

import { useSyncExternalStore } from "react";

/**
 * The finder's last recommendation, shared with the plan cards on the page
 * so the matching card can announce "Recommended for you" and take focus.
 * Same shape as billing-store: a module value + useSyncExternalStore, with a
 * null server snapshot so hydration never differs from the static HTML.
 */
export interface Recommendation {
  deck: string;
  tier: string;
}

let current: Recommendation | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => current;
const getServerSnapshot = () => null;

export function setRecommended(next: Recommendation | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

export const useRecommended = (): Recommendation | null =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/** DOM id of a plan card, shared by PlanCards (render) and the drawer (scroll). */
export const planCardId = (deck: string, tier: string) =>
  `plan-${deck}-${tier.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
