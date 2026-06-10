import { describe, expect, it } from "vitest";
import { fetchWithRetry } from "@/lib/network";

const runIntegration = process.env.RUN_INTEGRATION === "1";

describe.skipIf(!runIntegration)("Royal Clouds live data source", () => {
  it("can reach the public Royal Clouds homepage", async () => {
    const response = await fetchWithRetry("https://royalclouds.net", { timeoutMs: 8000, retries: 2 });
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toContain("Royal Clouds");
  });
});
