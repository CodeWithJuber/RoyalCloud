import { readFile } from "node:fs/promises";

const manifestUrl = new URL("../docs/research/live-site/routes-and-content.json", import.meta.url);
const sourceUrl = new URL("../src/lib/routes.ts", import.meta.url);

try {
  const [manifestText, sourceText] = await Promise.all([
    readFile(manifestUrl, "utf8"),
    readFile(sourceUrl, "utf8")
  ]);
  const manifest = JSON.parse(manifestText);
  const auditedRoutes = new Set((manifest.pages ?? []).map((page) => page?.route).filter(Boolean));
  const missing = [...auditedRoutes].filter((route) => !sourceText.includes(`"${route}"`));

  if (auditedRoutes.size !== 58 || missing.length > 0) {
    console.error(JSON.stringify({ audited: auditedRoutes.size, missing }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Route audit passed: ${auditedRoutes.size} content routes are represented.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
