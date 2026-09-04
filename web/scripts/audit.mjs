#!/usr/bin/env node
/**
 * audit.mjs — the UI/UX verification loop: horizontal overflow, axe-core
 * (WCAG 2.2 AA) and Lighthouse, across the viewport matrix.
 *
 * Needs a server on :3000 (`npm run start` after `npm run build`).
 *
 *   node scripts/audit.mjs                 # loop matrix, all pages, overflow + axe
 *   node scripts/audit.mjs --full          # the whole 320..3840 matrix + landscape + 200% zoom
 *   node scripts/audit.mjs --lighthouse    # add Lighthouse on the sample pages
 *   PAGES="home:/,vps:/kvm-vps-hosting" node scripts/audit.mjs
 *
 * Exit codes: 0 all gates pass · 1 a gate failed · 2 the run itself broke.
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const { default: AxeBuilder } = await import("@axe-core/playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "shots/audit";

/* Every content route, so a fix is proven site-wide and not just on the
   pages that happened to be looked at. */
const DEFAULT_PAGES = [
  ["home", "/"],
  ["shared", "/shared-hosting"],
  ["cpanel", "/cpanel-hosting"],
  ["vps", "/kvm-vps-hosting"],
  ["cyberpanel", "/cyberpanel-vps-hosting"],
  ["wordpress", "/managed-wordpress-hosting"],
  ["cloud", "/cloud-ssd-hosting"],
  ["dedicated", "/dedicated-servers"],
  ["reseller", "/reseller-hosting"],
  /* /domains is one of the seven approved redirects (straight to WHMCS), not
     a page — navigating it leaves the app. */
  ["contact", "/contact"],
  ["about", "/about"],
  ["support", "/support"],
  ["testimonials", "/testimonials"],
  ["affiliate", "/affiliate"],
  ["partners", "/partners"],
  ["speed", "/speed"],
  ["uptime", "/uptime"],
  ["datacenter", "/datacenter"],
  ["compare", "/compare-royalclouds-vps-plans"],
  ["landing-vps", "/cheap-vps-hosting"],
  ["landing-shared", "/cheap-ssd-hosting"],
  ["landing-distro", "/ubuntu-vps"],
  ["legal-terms", "/terms-of-service"],
  ["legal-privacy", "/privacy-policy"],
  ["404", "/definitely-not-a-page"],
];

/* Per-step loop; --full adds the rest of the master matrix. */
const LOOP_WIDTHS = [320, 390, 412, 768, 917, 1024, 1280, 1920];
const FULL_WIDTHS = [
  320, 360, 375, 390, 412, 430, 540, 600, 768, 820, 834, 1024, 1180, 1280, 1366,
  1440, 1536, 1728, 1920, 2560, 3840,
];
/* axe on a phone and a desktop width — the DOM is the same, but layout-driven
   rules (target size, reflow) differ. */
const AXE_WIDTHS = [390, 1280];
const LIGHTHOUSE_PAGES = ["home", "wordpress", "vps", "speed", "about", "legal-privacy"];

const args = new Set(process.argv.slice(2));
const full = args.has("--full");
const withLighthouse = args.has("--lighthouse");
const pages = (process.env.PAGES ?? "")
  .split(",")
  .filter(Boolean)
  .map((entry) => entry.split(":").map((s) => s.trim()));
const PAGES = pages.length > 0 ? pages : DEFAULT_PAGES;
const WIDTHS = full ? FULL_WIDTHS : LOOP_WIDTHS;

/**
 * The master prompt's detector, run in page context: an element overflows when
 * its right edge or its own scrollWidth passes the document's client width.
 *
 * Two exclusions keep the signal honest. Fixed/sticky chrome is positioned
 * against the viewport and cannot scroll the page. And an element inside a
 * container that clips or scrolls on the x axis (the comparison table's
 * `.compare-scroll`, the chip rails) is contained by design — only elements
 * whose every ancestor is `overflow-x: visible` can actually widen the page.
 */
const OVERFLOW_PROBE = () => {
  const doc = document.documentElement;
  const limit = doc.clientWidth + 1;
  const bad = [];
  const contained = (el) => {
    for (let node = el.parentElement; node && node !== doc; node = node.parentElement) {
      const overflowX = getComputedStyle(node).overflowX;
      if (overflowX !== "visible") return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.position === "sticky") continue;
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (contained(el)) continue;
    /* A box that sticks out always counts. Content wider than the page counts
       only when the element itself does not scroll or clip it — otherwise a
       working local scroller would read as a page-level defect. */
    const scrollsItself = style.overflowX !== "visible";
    if (rect.right > limit || (!scrollsItself && el.scrollWidth > limit)) {
      const cls = typeof el.className === "string" ? el.className : (el.className?.baseVal ?? "");
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: cls.split(" ").filter(Boolean).slice(0, 3).join("."),
        right: Math.round(rect.right),
        scrollW: el.scrollWidth,
      });
    }
  }
  return { docScroll: doc.scrollWidth, docClient: doc.clientWidth, bad: bad.slice(0, 12) };
};

/** One retry: a dropped connection mid-sweep should not void a 26-page run. */
async function goto(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  } catch (error) {
    console.log(`retry ${url} after ${String(error).split("\n")[0]}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  }
}

const rows = [];
const axeRows = [];
let overflowFailures = 0;
let axeFailures = 0;
const consoleErrors = [];

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_BIN || undefined,
  });

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      /* Touch profile on phone widths so hover/pointer media queries resolve
         the way a real phone resolves them. */
      hasTouch: width <= 640,
      isMobile: width <= 640,
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`${width}px ${msg.text().slice(0, 160)}`);
    });
    page.on("pageerror", (err) => consoleErrors.push(`${width}px pageerror: ${err.message.slice(0, 160)}`));

    for (const [name, path] of PAGES) {
      await goto(page, BASE + path);
      const result = await page.evaluate(OVERFLOW_PROBE);
      const scrolls = result.docScroll > result.docClient + 1;
      if (scrolls || result.bad.length > 0) {
        overflowFailures += 1;
        rows.push({ page: name, width, ...result });
        console.log(
          `FAIL overflow ${name}@${width} doc ${result.docScroll}>${result.docClient} ::`,
          result.bad.map((b) => `${b.tag}.${b.cls}@${b.right}`).join(" "),
        );
      }

      if (AXE_WIDTHS.includes(width)) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        for (const violation of axe.violations) {
          const blocking = violation.impact === "critical" || violation.impact === "serious";
          if (blocking) axeFailures += 1;
          axeRows.push({
            page: name,
            width,
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.length,
            help: violation.help,
            sample: violation.nodes[0]?.target?.join(" ")?.slice(0, 80) ?? "",
          });
          console.log(
            `${blocking ? "FAIL" : "warn"} axe ${name}@${width} ${violation.id} (${violation.impact}, ${violation.nodes.length})`,
          );
        }
      }
    }
    await context.close();
    console.log(`— width ${width} done`);
  }

  /* Landscape phone and the WCAG reflow check (200% zoom ≈ 640 CSS px). */
  if (full) {
    for (const [label, viewport] of [
      ["landscape", { width: 844, height: 390 }],
      ["zoom200", { width: 640, height: 512 }],
    ]) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
      const page = await context.newPage();
      for (const [name, path] of PAGES) {
        await goto(page, BASE + path);
        const result = await page.evaluate(OVERFLOW_PROBE);
        if (result.docScroll > result.docClient + 1 || result.bad.length > 0) {
          overflowFailures += 1;
          rows.push({ page: name, width: label, ...result });
          console.log(`FAIL overflow ${name}@${label} ::`, result.bad.map((b) => `${b.tag}.${b.cls}`).join(" "));
        }
      }
      await context.close();
      console.log(`— ${label} done`);
    }
  }

  await browser.close();

  let lhRows = [];
  if (withLighthouse) lhRows = await runLighthouse();

  const report = [
    `# UI audit — ${new Date().toISOString()}`,
    "",
    `Pages: ${PAGES.length} · widths: ${WIDTHS.join(", ")}${full ? " + landscape + 200% zoom" : ""}`,
    "",
    "## Horizontal overflow",
    overflowFailures === 0
      ? `PASS — 0 offenders across ${PAGES.length * WIDTHS.length} page/width combinations.`
      : `FAIL — ${overflowFailures} page/width combinations overflow.`,
    "",
    ...(rows.length > 0
      ? [
          "| Page | Width | doc scroll/client | Offenders |",
          "| --- | --- | --- | --- |",
          ...rows.map(
            (r) =>
              `| ${r.page} | ${r.width} | ${r.docScroll}/${r.docClient} | ${r.bad
                .map((b) => `\`${b.tag}.${b.cls}\` →${b.right}`)
                .join("<br>")} |`,
          ),
          "",
        ]
      : []),
    "## axe-core (WCAG 2.2 AA)",
    axeFailures === 0
      ? "PASS — 0 critical or serious violations."
      : `FAIL — ${axeFailures} critical/serious violations.`,
    "",
    ...(axeRows.length > 0
      ? [
          "| Page | Width | Rule | Impact | Nodes | Sample |",
          "| --- | --- | --- | --- | --- | --- |",
          ...axeRows.map(
            (r) => `| ${r.page} | ${r.width} | ${r.id} | ${r.impact} | ${r.nodes} | \`${r.sample}\` |`,
          ),
          "",
        ]
      : []),
    ...(lhRows.length > 0
      ? [
          "## Lighthouse (mobile)",
          "| Page | LCP | CLS | TBT | Perf | A11y |",
          "| --- | --- | --- | --- | --- | --- |",
          ...lhRows.map(
            (r) => `| ${r.page} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.perf} | ${r.a11y} |`,
          ),
          "",
        ]
      : []),
    ...(consoleErrors.length > 0
      ? ["## Console errors", ...consoleErrors.slice(0, 20).map((e) => `- ${e}`), ""]
      : ["## Console errors", "None.", ""]),
  ].join("\n");

  await writeFile(`${OUT}/report.md`, report);
  console.log(`\n${report.split("\n").slice(0, 12).join("\n")}\n…full report: ${OUT}/report.md`);

  const lhFail = lhRows.filter((r) => r.fail).length;
  if (overflowFailures > 0 || axeFailures > 0 || lhFail > 0) process.exit(1);
}

async function runLighthouse() {
  const lighthouse = (await import("lighthouse")).default;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_BIN || undefined,
    args: ["--remote-debugging-port=9222"],
  });
  const out = [];
  try {
    for (const name of LIGHTHOUSE_PAGES) {
      const entry = PAGES.find(([n]) => n === name);
      if (!entry) continue;
      const result = await lighthouse(
        BASE + entry[1],
        { port: 9222, output: "json", logLevel: "error" },
        undefined,
      );
      const a = result.lhr.audits;
      const lcp = a["largest-contentful-paint"].numericValue / 1000;
      const cls = a["cumulative-layout-shift"].numericValue;
      const tbt = a["total-blocking-time"].numericValue;
      const perf = Math.round(result.lhr.categories.performance.score * 100);
      const a11y = Math.round(result.lhr.categories.accessibility.score * 100);
      const fail = lcp > 2.5 || cls > 0.1 || a11y < 95;
      out.push({
        page: name,
        lcp: `${lcp.toFixed(2)}s${lcp > 2.5 ? " ✗" : ""}`,
        cls: `${cls.toFixed(3)}${cls > 0.1 ? " ✗" : ""}`,
        tbt: `${Math.round(tbt)}ms`,
        perf,
        a11y: `${a11y}${a11y < 95 ? " ✗" : ""}`,
        fail,
      });
      console.log(`lighthouse ${name}: LCP ${lcp.toFixed(2)}s CLS ${cls.toFixed(3)} a11y ${a11y}`);
    }
  } finally {
    await browser.close();
  }
  return out;
}

run().catch((error) => {
  console.error(error);
  process.exit(2);
});
