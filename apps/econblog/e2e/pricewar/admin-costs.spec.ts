import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

/**
 * Story 10 — admin LLM cost dashboard.
 */
test.describe("Price War admin costs", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("admin costs dashboard loads spend summary", async ({ page }) => {
    const adminEmail =
      process.env.PRICEWAR_E2E_ADMIN_EMAIL ?? "admin+test@adamsaxion.dev";
    const adminPassword =
      process.env.PRICEWAR_E2E_ADMIN_PASSWORD ?? "TestAdmin123!";

    await loginAs(page, adminEmail, adminPassword, "/admin/pricewar/costs");
    await expect(page.getByRole("heading", { name: "LLM spend" })).toBeVisible();
    await expect(page.getByText("Today (UTC)")).toBeVisible();
    await expect(page.getByText("Last 7 days")).toBeVisible();
  });
});
