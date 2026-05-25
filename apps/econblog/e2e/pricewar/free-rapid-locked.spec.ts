import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 3 — free user cannot start Rapid (paid-only mode).
 */
test.describe("Price War free Rapid locked", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("rapid mode shows paid badge and blocks vs-bot", async ({ page }) => {
    const email = process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!";

    await loginAs(page, email, password);
    await page.goto("/play");

    const rapidCard = page.locator("div").filter({ hasText: /^Rapid 15\+0/ }).first();
    await expect(rapidCard.getByText("Paid")).toBeVisible();
    await expect(rapidCard.getByRole("button", { name: "Play vs bot" })).toBeDisabled();
    await expect(rapidCard.getByRole("link", { name: "Subscribe" })).toBeVisible();
  });
});
