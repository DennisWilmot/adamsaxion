import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("Price War tutorial", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("tutorial shows narration on round 1", async ({ page }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "alice+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestAlice123!";

    await loginAs(page, email, password);
    await page.goto("/play/price-war/tutorial");
    await page.waitForURL(/\/play\/price-war\/match\/[^/]+\/decide/);

    await expect(page.getByText("Welcome to The Price War")).toBeVisible();
    await expect(page.getByText("Tutorial")).toBeVisible();
    await expect(page.getByRole("button", { name: /Review & lock/i })).toBeVisible();
  });
});
