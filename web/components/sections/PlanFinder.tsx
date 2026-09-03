"use client";

import { useMemo, useState } from "react";
import { Stepper, Step } from "@astryxdesign/core/Stepper";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { PLAN_FILES } from "@/lib/plans";

/**
 * PlanFinder — "Help me choose" interactive onboarding. Three answers map onto
 * the real plan catalog (PLAN_FILES) — every recommendation is an actual
 * sellable plan with its real price and its real WHMCS checkout link.
 */

interface Option {
  id: string;
  icon: string;
  title: string;
  text: string;
}

const STEPS: { question: string; hint: string; options: Option[] }[] = [
  {
    question: "What are you building?",
    hint: "Pick the closest match — you can change later.",
    options: [
      { id: "shared", icon: "globe", title: "A website or blog", text: "Company site, portfolio, or blog on cPanel" },
      { id: "wordpress", icon: "wordpress", title: "A WordPress site", text: "WordPress with updates and caching handled" },
      { id: "vps", icon: "terminal", title: "An app or custom stack", text: "Root access, your own OS and services" },
      { id: "dedicated", icon: "server", title: "High-traffic or enterprise", text: "Single-tenant hardware, maximum resources" },
    ],
  },
  {
    question: "How hands-on do you want to be?",
    hint: "Managed means we handle updates, security and backups.",
    options: [
      { id: "managed", icon: "shield", title: "Manage it for me", text: "We patch, secure, monitor and back up" },
      { id: "handson", icon: "settings", title: "I'll run it myself", text: "Full control, we keep the lights on" },
    ],
  },
  {
    question: "How big is the workload?",
    hint: "Rough guesses are fine — plans scale up any time.",
    options: [
      { id: "low", icon: "rocket", title: "Just starting out", text: "A first site, a test project, light traffic" },
      { id: "mid", icon: "gauge", title: "Growing steadily", text: "Regular visitors, a store, several sites" },
      { id: "high", icon: "scale", title: "Heavy or critical", text: "High traffic, production apps, many sites" },
    ],
  },
];

/* Map (product, control, size) → a real plan tier from the catalog.
   Deck indexes: shared 0-4, wordpress 0-2, vps 0-5, dedicated 0-3. */
function recommend(product: string, size: string): { plan: string; tier: number } {
  const tierFor = (deck: number[], size: string) =>
    size === "low" ? deck[0] : size === "mid" ? deck[1] : deck[2];
  switch (product) {
    case "shared":
      return { plan: "shared", tier: tierFor([0, 2, 3], size) }; // Starter / Deluxe / Ultimate
    case "wordpress":
      return { plan: "wordpress", tier: tierFor([0, 1, 2], size) }; // Managed I/II/III
    case "vps":
      return { plan: "vps", tier: tierFor([1, 2, 4], size) }; // KVM 2 / 3 / 5
    default:
      return { plan: "dedicated", tier: size === "high" ? 3 : 1 }; // Xeon E3-1230v5 / Dual E5
  }
}

export function PlanFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = step >= STEPS.length;

  const result = useMemo(() => {
    if (!done) return null;
    const [product, , size] = answers;
    const { plan, tier } = recommend(product, size);
    const file = PLAN_FILES[plan];
    const t = file.tiers[Math.min(tier, file.tiers.length - 1)];
    return { file, tier: t };
  }, [answers, done]);

  function choose(optionId: string) {
    const next = [...answers.slice(0, step), optionId];
    setAnswers(next);
    setStep(step + 1);
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  return (
    <div className="plan-finder" data-reveal>
      <Stepper activeStep={Math.min(step, STEPS.length - 1)} label="Plan finder progress" density="compact">
        {STEPS.map((s, i) => (
          <Step key={s.question} step={i} label={`Step ${i + 1}`} />
        ))}
      </Stepper>

      {!done ? (
        <div className="finder-body" key={step}>
          <h3 className="finder-question">{STEPS[step].question}</h3>
          <p className="finder-hint">{STEPS[step].hint}</p>
          <div className="finder-options" role="list">
            {STEPS[step].options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="finder-option"
                onClick={() => choose(option.id)}
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
          {step > 0 && (
            <button type="button" className="finder-back" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
        </div>
      ) : (
        result && (
          <div className="finder-body finder-result" aria-live="polite">
            <p className="finder-kicker">Our recommendation</p>
            <h3 className="finder-question">
              {result.file.name} — {result.tier.name}
            </h3>
            <p className="finder-hint">{result.tier.summary}</p>
            <div className="finder-price">
              <Price value={result.tier.price} />
              <span className="finder-per">{result.tier.period ?? "/mo"}</span>
              <span className="finder-ledger">billed monthly · renews at the same rate</span>
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
              <a className="btn btn-primary" href={result.tier.ctaUrl} target="_blank" rel="noopener noreferrer">
                Get {result.tier.name}
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
              <button type="button" className="btn btn-secondary" onClick={restart}>
                Start over
              </button>
            </div>
            <p className="finder-note">
              Every option is a real plan — prices and checkout are the live catalog.
            </p>
          </div>
        )
      )}
    </div>
  );
}
