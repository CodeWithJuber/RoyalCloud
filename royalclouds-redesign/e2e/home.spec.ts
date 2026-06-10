import { expect, test } from "@playwright/test";

test("home page supports plan discovery and domain validation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /hosting that feels like a control room/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /choose by momentum/i })).toBeVisible();
  await page.getByLabel("Domain name").fill("bad/name");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("status")).toContainText("Use letters, numbers, or hyphens only");
});
