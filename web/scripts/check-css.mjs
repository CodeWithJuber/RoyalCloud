#!/usr/bin/env node
/**
 * check-css.mjs — guards the stylesheet against the specific mistakes this
 * codebase has actually made, each one of which shipped silently once.
 *
 * Run: node scripts/check-css.mjs (part of `npm run check`).
 */
import { readFile } from "node:fs/promises";

const FILE = "app/site.css";
const src = await readFile(FILE, "utf8");
const lines = src.split("\n");

/* Everything inside :root is a token declaration and is allowed raw values —
   that is the point of a token. Track the brace depth of the :root block. */
const rootRanges = [];
{
  let depth = 0;
  let start = -1;
  lines.forEach((line, i) => {
    if (start === -1 && /^:root\b[^{]*\{/.test(line)) {
      start = i;
      depth = 0;
    }
    if (start !== -1) {
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (depth <= 0) {
        rootRanges.push([start, i]);
        start = -1;
      }
    }
  });
}
const inRoot = (i) => rootRanges.some(([a, b]) => i >= a && i <= b);

const RULES = [
  {
    id: "nested-minmax",
    // minmax() is not a valid track-breadth, so the whole declaration is
    // dropped by the browser. This shipped once and nobody noticed for a week.
    test: (line) => /minmax\([^)]*minmax\(/.test(line),
    why: "minmax() cannot nest — the browser drops the whole declaration. Use minmax(min(100%, N), 1fr).",
  },
  {
    id: "bare-1fr-column",
    /* A bare `1fr` track keeps min-width: auto, so an unshrinkable child
       pushes the whole grid past its container — the 320px overflow this
       repo shipped at 12 sites. Only multi-track column lists are flagged:
       a lone `1fr` has no sibling to squeeze it, and gating those would
       churn nine idiomatic single-column rules for no measurable gain. */
    test: (line) => {
      const m = line.match(/grid-template-columns:\s*([^;]+);/);
      if (!m) return false;
      const tracks = m[1].trim();
      if (!/(^|[\s)])1fr([\s(]|$)/.test(` ${tracks} `)) return false;
      // Count top-level tracks: split on whitespace outside parentheses.
      let depth = 0;
      let count = 1;
      let prevWasSpace = true;
      for (const ch of tracks) {
        if (ch === "(") depth += 1;
        else if (ch === ")") depth -= 1;
        else if (/\s/.test(ch) && depth === 0) {
          if (!prevWasSpace) count += 1;
          prevWasSpace = true;
          continue;
        }
        prevWasSpace = false;
      }
      return count > 1;
    },
    why: "a bare 1fr beside other tracks cannot shrink below its content; use minmax(0, 1fr).",
  },
  {
    id: "raw-font-size",
    test: (line, i) => !inRoot(i) && /font-size:\s*(\d|\.)/.test(line) && !/var\(/.test(line),
    why: "font-size must come from a token (--font-size-*, --text-*-size); raw values reintroduce the two type scales.",
  },
  {
    id: "will-change",
    test: (line) => /will-change:/.test(line),
    why: "will-change promotes a layer for the life of the element; use it only with a measurement that says it helps.",
  },
  {
    id: "raw-surface-radius",
    // Allowed raw pixel radii: 2px and 4px are focus-ring rounding, 999px is
    // the pill. Every surface radius comes from a role token.
    test: (line, i) => {
      if (inRoot(i)) return false;
      const m = line.match(/border-radius:\s*([^;]+);/);
      if (!m) return false;
      const values = m[1].match(/\d+px/g);
      if (!values) return false;
      return values.some((v) => !["2px", "4px", "999px"].includes(v));
    },
    why: "surface radii come from --rc-radius-card / --rc-radius-tile / 999px / 50%; only 2px and 4px focus rings are raw.",
  },
];

const failures = [];
lines.forEach((line, i) => {
  if (line.trim().startsWith("/*") || line.trim().startsWith("*")) return;
  for (const rule of RULES) {
    if (rule.skip) continue;
    if (rule.test(line, i)) {
      failures.push({ rule: rule.id, line: i + 1, text: line.trim().slice(0, 96), why: rule.why });
    }
  }
});

/* A card family must not carry its own column count — that is what
   --card-min replaced. */
const FAMILIES = /^\.(grid-[234]|product-grid|steps-grid|split-list|stats-row|sec-stats|plan-rail)\b/;
let selector = "";
lines.forEach((line, i) => {
  if (line.includes("{")) selector = line.split("{")[0].trim();
  if (!FAMILIES.test(selector)) return;
  if (/grid-template-columns:\s*repeat\(\s*\d/.test(line)) {
    failures.push({
      rule: "hardcoded-card-columns",
      line: i + 1,
      text: line.trim().slice(0, 96),
      why: `${selector} is driven by --card-min; a fixed column count brings the per-family breakpoints back.`,
    });
  }
});

if (failures.length > 0) {
  console.error(`check-css: ${failures.length} problem(s) in ${FILE}\n`);
  for (const f of failures) {
    console.error(`  ${FILE}:${f.line}  [${f.rule}]`);
    console.error(`    ${f.text}`);
    console.error(`    ${f.why}\n`);
  }
  process.exit(1);
}
console.log(`check-css: OK — ${lines.length} lines, ${RULES.filter((r) => !r.skip).length + 1} rules.`);
