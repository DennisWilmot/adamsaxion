import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 7 — voluntary forfeit and match chrome.
 * Requires seeded test user (see seed-pricewar.ts).
 */
test.describe("Price War forfeit", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("player can forfeit a vs-bot match", async ({ page }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    await startVsBotMatch(page);

    await expect(page.getByRole("button", { name: "Forfeit" })).toBeVisible();
    await page.getByRole("button", { name: "Forfeit" }).click();
    await page.getByRole("button", { name: "Forfeit match" }).click();
    await page.waitForURL(/\/play\/price-war\/match\/[^/]+\/postmatch/);
  });
});
