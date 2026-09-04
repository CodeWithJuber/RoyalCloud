import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/* `@/` mirrors tsconfig `paths` so tests can import modules that load the
   plan catalog (`@/data/plans/*.json`) — vitest does not read tsconfig paths. */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
