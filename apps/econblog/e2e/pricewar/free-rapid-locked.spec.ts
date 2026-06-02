import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 3 — free users default to Rapid; Blitz is paid-only in the shell picker.
 */
test.describe("Price War free Rapid / paid Blitz", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("shell defaults to Rapid and locks Blitz for free accounts", async ({ page }) => {
    const email = process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!";

    await loginAs(page, email, password);
    await page.goto("/play/price-war");

    await expect(page.getByRole("button", { name: /Rapid 15\+0/i })).toBeVisible();

    await page.getByRole("button", { name: /Rapid 15\+0/i }).click();
    const blitzOption = page.getByRole("button", { name: /Blitz 5\+0/i });
    await expect(blitzOption).toBeDisabled();
    await expect(blitzOption).toContainText(/locked/i);
  });

  test("API rejects free user joining Blitz queue", async ({ page, request }) => {
    const email = process.env.PRICEWAR_E2E_ALICE_EMAIL ?? "alice+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_ALICE_PASSWORD ?? "TestAlice123!";

    await loginAs(page, email, password);

    const res = await request.post("/api/pricewar/matchmaking/queue", {
      data: { scenarioId: "coffee-shop", playModeId: "blitz" },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.message).toMatch(/paid/i);
  });
});
