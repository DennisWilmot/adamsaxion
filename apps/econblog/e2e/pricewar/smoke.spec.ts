import { test, expect } from "@playwright/test";

/**
 * Story 1 scaffold — requires seeded test users and PLAYWRIGHT_BASE_URL.
 * Skip in CI until staging credentials are wired.
 */
test.describe("Price War smoke", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("lobby loads for signed-in user", async ({ page }) => {
    await page.goto("/play");
    await expect(page.getByRole("heading", { name: /price war/i })).toBeVisible();
  });
});
