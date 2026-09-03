#!/usr/bin/env node
/**
 * verify-cms.mjs — keeps the three section contracts in lockstep:
 *
 *   1. web/lib/content.ts              (zod schema: what the build accepts)
 *   2. web/components/sections/SectionRenderer.tsx (what actually renders)
 *   3. web/public/admin/config.yml     (what Decap CMS lets editors touch)
 *
 * Decap silently DELETES any block type or field it doesn't know about when
 * an editor saves a page, so every section type — and every field — used in
 * content/{pages,landing}/*.md must be declared in config.yml.
 *
 * Exits 1 with a report on any drift.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";

const read = (p) => readFileSync(p, "utf8");
const problems = [];

/* ---- 1. schema types ---- */
const schemaSrc = read("lib/content.ts");
const schemaTypes = new Set(
  [...schemaSrc.matchAll(/z\.literal\("([a-z]+)"\)/g)].map((m) => m[1]),
);

/* ---- 2. renderer registry (case "type":) ---- */
const rendererSrc = read("components/sections/SectionRenderer.tsx");
const rendererTypes = new Set(
  [...rendererSrc.matchAll(/^\s*case "([a-z]+)":/gm)].map((m) => m[1]),
);

/* ---- 3. CMS config: types + declared fields per type ---- */
const cms = loadYaml(read("public/admin/config.yml"));
const pagesCollection = cms.collections.find((c) => c.name === "pages");
const sectionsField = pagesCollection.fields.find((f) => f.name === "sections");
const cmsTypes = new Map(); // type -> Set(fieldPaths)
for (const t of sectionsField.types) {
  const declared = new Set();
  for (const f of t.fields ?? []) {
    declared.add(f.name);
    for (const sub of f.fields ?? []) declared.add(`${f.name}[].${sub.name}`);
  }
  cmsTypes.set(t.name, declared);
}

/* ---- 4. usage in content ---- */
const usedFields = new Map(); // type -> Set(fieldPaths)
for (const dir of ["content/pages", "content/landing"]) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const fm = read(join(dir, file)).match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    let data;
    try {
      data = loadYaml(fm);
    } catch (e) {
      problems.push(`${dir}/${file}: frontmatter does not parse (${e.message})`);
      continue;
    }
    for (const s of data?.sections ?? []) {
      const t = s.type;
      const u = usedFields.get(t) ?? new Set();
      for (const [k, v] of Object.entries(s)) {
        if (k === "type") continue;
        u.add(k);
        if (Array.isArray(v))
          for (const item of v)
            if (item && typeof item === "object")
              for (const ik of Object.keys(item)) u.add(`${k}[].${ik}`);
      }
      usedFields.set(t, u);
    }
  }
}

/* ---- checks ---- */
for (const t of schemaTypes)
  if (!rendererTypes.has(t))
    problems.push(`type "${t}" is in lib/content.ts but not in SectionRenderer`);
for (const t of rendererTypes)
  if (!schemaTypes.has(t))
    problems.push(`type "${t}" is in SectionRenderer but not in lib/content.ts`);

for (const [t, fields] of usedFields) {
  if (!schemaTypes.has(t)) {
    problems.push(`type "${t}" is used in content but missing from lib/content.ts`);
    continue;
  }
  const declared = cmsTypes.get(t);
  if (!declared) {
    problems.push(
      `type "${t}" is used in content but has NO block def in public/admin/config.yml — Decap will DELETE these blocks on save`,
    );
    continue;
  }
  for (const f of fields)
    if (!declared.has(f) && !declared.has(f.split("[].")[0]))
      problems.push(
        `type "${t}": field "${f}" is used in content but not declared in config.yml — Decap will DELETE it on save`,
      );
}

if (problems.length) {
  console.error(`verify-cms: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(
  `verify-cms: OK — ${schemaTypes.size} schema types, ${cmsTypes.size} CMS block defs, ${usedFields.size} types in use, no drift.`,
);
