import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { REDIRECTS } from "./lib/routes";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // This app lives in web/ inside the RoyalCloud repo, which has its own
  // lockfile and a legacy Astro src/middleware.ts one level up. Pin the
  // Turbopack/workspace root so nothing above web/ is ever scanned.
  turbopack: {
    root: appDir,
  },
  outputFileTracingRoot: appDir,

  // The seven approved redirects from the legacy site (WHMCS hand-offs and
  // retired .php URLs). Source of truth: lib/routes.ts REDIRECTS.
  async redirects() {
    return REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      statusCode: r.statusCode,
    }));
  },
};

export default nextConfig;
