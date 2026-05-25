import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch } from "./helpers/auth";

/**
 * Story 9 — admin match trace and filtered player views.
 * Requires admin+test in ADMIN_EMAILS and at least one match in DB.
 */
test.describe("Price War admin debug", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("admin sees engine trace and both player views", async ({ page }) => {
    const adminEmail =
      process.env.PRICEWAR_E2E_ADMIN_EMAIL ?? "admin+test@adamsaxion.dev";
    const adminPassword =
      process.env.PRICEWAR_E2E_ADMIN_PASSWORD ?? "TestAdmin123!";

    const playerEmail = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const playerPassword = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, playerEmail, playerPassword);
    const matchId = await startVsBotMatch(page);

    await loginAs(page, adminEmail, adminPassword, "/admin/pricewar");
    await expect(page.getByRole("heading", { name: "Price War Admin" })).toBeVisible();

    await page.goto(`/admin/pricewar/matches/${matchId}`);
    await expect(page.getByRole("heading", { name: "Match trace" })).toBeVisible();
    await expect(page.getByText(/Outcome:/)).toBeVisible();

    await page.getByRole("tab", { name: /Player views/i }).click();
    await expect(page.getByText("View A")).toBeVisible();
    await expect(page.getByText("View B")).toBeVisible();
    await expect(page.locator("pre").first()).toContainText("slot");
  });
});
