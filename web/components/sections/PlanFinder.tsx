"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Stepper, Step } from "@astryxdesign/core/Stepper";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { PLAN_FILES } from "@/lib/plans";
import { isIntentId } from "@/lib/intents";
import { savePct, termLabel } from "@/lib/billing-store";
import {
  BUILD_OPTIONS,
  SIZE_OPTIONS,
  STACK_OPTIONS,
  STACKS_FOR,
  budgetBands,
  deckFor,
  recommend,
  type Build,
  type Size,
  type Stack,
} from "@/lib/plan-finder";

/**
 * PlanFinder — "Help me choose" in four answers: build → stack → size →
 * budget. Every recommendation is a real tier of a real deck with its live
 * WHMCS checkout link (lib/plan-finder.ts is pure and unit-tested). Budget
 * bands come from the deck's actual prices. `?for=<intent>` pre-answers the
 * build so hero chips and product pages land straight on step two.
 */

type StepKey = "build" | "stack" | "size" | "budget";
const STEP_ORDER: StepKey[] = ["build", "stack", "size", "budget"];
const STEP_LABELS: Record<StepKey, string> = {
  build: "Build",
  stack: "Stack",
  size: "Size",
  budget: "Budget",
};

interface Answers {
  build?: Build;
  stack?: Stack;
  size?: Size;
  budget?: string;
}

interface OptionView {
  id: string;
  icon: string;
  title: ReactNode;
  text: string;
}

interface StepView {
  key: StepKey;
  question: string;
  hint: string;
  options: OptionView[];
}

/* Decks with a single sensible stack skip the stack question. */
const autoStack = (build: Build): Stack | undefined =>
  STACKS_FOR[build].length === 1 ? STACKS_FOR[build][0] : undefined;

/* `?for=<intent>` from the URL as an external store: the server snapshot is
   null, so hydration matches the static HTML and the prefill applies on the
   client's first post-hydration render — no effect has to write state. */
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

export function PlanFinder() {
  const urlBuild = useUrlIntent();
  const [touched, setTouched] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const headingRef = useRef<HTMLHeadingElement>(null);

  /* The deep link pre-answers the build until the visitor touches the finder;
     it is derived, never copied into state. */
  const prefill: Answers | null =
    !touched && urlBuild ? { build: urlBuild, stack: autoStack(urlBuild) } : null;
  const view: Answers = prefill ?? answers;
  const at = prefill ? (prefill.stack ? 2 : 1) : step;
  const done = at >= STEP_ORDER.length;

  /* After an answer, keyboard and screen-reader users land on the next question. */
  useEffect(() => {
    if (touched) headingRef.current?.focus({ preventScroll: true });
  }, [at, touched]);

  const bands = useMemo(
    () => (view.build && view.stack ? budgetBands(deckFor(view.build, view.stack)) : []),
    [view.build, view.stack],
  );

  const current: StepView | null = useMemo(() => {
    if (done) return null;
    const key = STEP_ORDER[at];
    switch (key) {
      case "build":
        return {
          key,
          question: "What are you building?",
          hint: "Pick the closest match — you can change it later.",
          options: BUILD_OPTIONS,
        };
      case "stack": {
        const allowed = view.build ? STACKS_FOR[view.build] : [];
        return {
          key,
          question: "How do you want to run it?",
          hint: "A control panel, a tuned stack, or fully managed.",
          options: STACK_OPTIONS.filter((option) => allowed.includes(option.id)),
        };
      }
      case "size":
        return {
          key,
          question: "How big is the workload?",
          hint: "Rough guesses are fine — plans scale up any time.",
          options: SIZE_OPTIONS,
        };
      case "budget":
        return {
          key,
          question: "What's your monthly budget?",
          hint: "These bands come from the real plan prices — pick the closest.",
          options: bands.map((band) => ({
            id: band.id,
            icon: "billing",
            title:
              band.max === null ? (
                band.label
              ) : (
                <>
                  Up to <Price value={String(band.max)} />
                  /mo
                </>
              ),
            text: band.max === null ? "Show the best fit for the workload" : "Plans at or under this price",
          })),
        };
    }
  }, [done, at, view.build, bands]);

  const result = useMemo(() => {
    if (!done || !view.build || !view.stack || !view.size) return null;
    const band = bands.find((b) => b.id === view.budget);
    const rec = recommend(view.build, view.stack, view.size, band?.max ?? null);
    const file = PLAN_FILES[rec.deckId];
    return { file, tier: file.tiers[rec.tierIndex], clamped: rec.clamped };
  }, [done, view.build, view.stack, view.size, view.budget, bands]);

  function commit(next: Answers, nextStep: number, direction: "forward" | "back") {
    setTouched(true);
    setDir(direction);
    setAnswers(next);
    setStep(nextStep);
  }

  function choose(key: StepKey, id: string) {
    if (key === "build") {
      const build = id as Build;
      const stack = autoStack(build);
      commit({ build, stack }, stack ? 2 : 1, "forward");
      return;
    }
    if (key === "stack") {
      commit({ ...view, stack: id as Stack, size: undefined, budget: undefined }, 2, "forward");
      return;
    }
    if (key === "size") {
      commit({ ...view, size: id as Size, budget: undefined }, 3, "forward");
      return;
    }
    commit({ ...view, budget: id }, 4, "forward");
  }

  function back() {
    const skippedStack = view.build ? autoStack(view.build) !== undefined : false;
    commit(view, at === 2 && skippedStack ? 0 : Math.max(0, at - 1), "back");
  }

  function restart() {
    commit({}, 0, "back");
  }

  return (
    <div className="plan-finder" data-reveal>
      <Stepper
        activeStep={Math.min(at, STEP_ORDER.length - 1)}
        label="Plan finder progress"
        density="compact"
      >
        {STEP_ORDER.map((key, i) => (
          <Step key={key} step={i} label={STEP_LABELS[key]} />
        ))}
      </Stepper>

      {current ? (
        <div className="finder-body" key={at} data-dir={dir}>
          <h3 className="finder-question" ref={headingRef} tabIndex={-1}>
            {current.question}
          </h3>
          <p className="finder-hint">{current.hint}</p>
          <div className={`finder-options${current.key === "budget" ? " finder-budget" : ""}`}>
            {current.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="finder-option"
                onClick={() => choose(current.key, option.id)}
              >
                <span className="finder-option-icon">
                  <Icon name={option.icon} size={22} />
                </span>
                <span className="finder-option-copy">
                  <strong>{option.title}</strong>
                  <span>{option.text}</span>
                </span>
                <span className="finder-option-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
          {at > 0 && (
            <button type="button" className="finder-back" onClick={back}>
              ← Back
            </button>
          )}
        </div>
      ) : (
        result && (
          <div className="finder-body finder-result" key="result" data-dir={dir} aria-live="polite">
            <p className="finder-kicker">
              {result.clamped ? "Closest match within your budget" : "Our recommendation"}
            </p>
            <h3 className="finder-question" ref={headingRef} tabIndex={-1}>
              {result.file.name} — {result.tier.name}
            </h3>
            {result.tier.summary && <p className="finder-hint">{result.tier.summary}</p>}
            <div className="finder-price">
              <Price value={result.tier.price} />
              <span className="finder-per">{result.tier.period ?? "/mo"}</span>
              <span className="finder-ledger">{termLabel("monthly")}</span>
              {savePct(result.tier) > 0 && result.tier.priceAnnual && (
                <span className="finder-alt">
                  or <Price value={result.tier.priceAnnual} />
                  {result.tier.period ?? "/mo"} {termLabel("annual")} · save {savePct(result.tier)}%
                </span>
              )}
            </div>
            <ul className="finder-features">
              {result.tier.features.slice(0, 4).map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={14} color="success" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="finder-actions">
              <a
                className="btn btn-primary"
                href={result.tier.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get {result.tier.name}
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
              <Link className="btn btn-secondary" href={`/${result.file.slug}#compare`}>
                Compare all {result.file.name} tiers
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
            <button type="button" className="finder-back" onClick={restart}>
              Start over
            </button>
            <p className="finder-note">
              Every option is a real plan — prices and checkout are the live catalog.
            </p>
          </div>
        )
      )}
    </div>
  );
}
