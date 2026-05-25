import { test, expect } from "@playwright/test";
import { loginAs, startVsBotMatch, forfeitMatch } from "./helpers/auth";

/**
 * Story 13 — post-match coach recommends lessons that resolve to real routes.
 */
test.describe("Price War recommended lessons", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 to run");

  test("coach report includes lesson slugs that load", async ({ page, request }) => {
    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";

    await loginAs(page, email, password);
    const matchId = await startVsBotMatch(page);
    await forfeitMatch(request, matchId);

    let completed = false;
    for (let i = 0; i < 20; i++) {
      const viewRes = await request.get(`/api/pricewar/match/${matchId}/view`);
      if (viewRes.ok()) {
        const view = await viewRes.json();
        if (view.phase === "completed") {
          completed = true;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    expect(completed).toBe(true);

    const coachRes = await request.get(`/api/pricewar/match/${matchId}/coach`);
    expect(coachRes.ok()).toBe(true);
    const coach = await coachRes.json();
    expect(coach.report?.recommendedLessonSlugs?.length).toBeGreaterThan(0);

    const slug = coach.report.recommendedLessonSlugs[0] as string;
    await page.goto(`/lessons/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/lessons/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    await expect(page.locator("body")).not.toContainText("Lesson not found");
  });
});
