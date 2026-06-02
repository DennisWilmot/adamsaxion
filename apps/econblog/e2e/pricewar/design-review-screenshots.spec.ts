import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { priceWarPaths } from "../../src/lib/games/routes";
import {
  beginMatchDecide,
  findActiveMatch,
  forceAbandon,
  joinQueue,
  loginAs,
  waitForMatchPhase,
} from "./helpers/auth";

const OUT_DIR = path.join(__dirname, "../../design-review/screenshots");

async function snap(page: Page, name: string) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: true,
  });
}

function seedDraft(page: Page, matchId: string, round: number) {
  const payload = JSON.stringify({
    round,
    savedAt: new Date().toISOString(),
    payload: [
      {
        moveId: "sales.s01",
        input: { newPrice: 420 },
        draftedAt: new Date().toISOString(),
      },
    ],
  });
  return page.evaluate(
    ({ key, value }) => sessionStorage.setItem(key, value),
    { key: `pricewar:draft:${matchId}`, value: payload }
  );
}

/**
 * Authenticates as the seeded E2E user and saves full-page PNGs for design review.
 *
 * Requires:
 *   PRICEWAR_E2E_ENABLED=1 on the dev server
 *   Seeded user (default carol+test@adamsaxion.dev / TestCarol123!)
 *
 * Run:  pnpm screenshots:margin
 */
test.describe("Margin design review screenshots", () => {
  test.skip(!process.env.PRICEWAR_E2E_ENABLED, "Set PRICEWAR_E2E_ENABLED=1 on dev server");

  test("capture shell + match states", async ({ page, browser }) => {
    test.setTimeout(300_000);
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const email = process.env.PRICEWAR_E2E_EMAIL ?? "carol+test@adamsaxion.dev";
    const password = process.env.PRICEWAR_E2E_PASSWORD ?? "TestCarol123!";
    const danEmail = process.env.PRICEWAR_E2E_DAN_EMAIL ?? "dan+test@adamsaxion.dev";
    const danPassword = process.env.PRICEWAR_E2E_DAN_PASSWORD ?? "TestDan123!";

    await page.setViewportSize({ width: 1440, height: 900 });

    await loginAs(page, email, password, priceWarPaths.lobby);

    const historyRes = await page.request.get("/api/pricewar/history");
    if (historyRes.ok()) {
      const { matches } = (await historyRes.json()) as {
        matches: { matchId: string; phase: string; outcomeKind: string }[];
      };
      for (const m of matches) {
        if (m.outcomeKind === "in_progress" || m.phase !== "completed") {
          await page.request.post(`/api/pricewar/match/${m.matchId}/forfeit`);
        }
      }
    }

    await snap(page, "01-shell-home");

    await page.goto(priceWarPaths.queue("blitz"));
    await snap(page, "02-queue-searching");

    await page.goto(priceWarPaths.history);
    await snap(page, "03-history");

    await page.goto(priceWarPaths.leaderboard);
    await snap(page, "04-leaderboard");

    const createRes = await page.request.post("/api/pricewar/match/vs-bot", {
      data: {
        scenarioId: "coffee-shop",
        playModeId: "blitz",
        botPersonalityId: "bot.budget",
      },
    });
    expect(createRes.ok(), `vs-bot failed: ${await createRes.text()}`).toBeTruthy();
    const { matchId } = (await createRes.json()) as { matchId: string };

    await page.goto(priceWarPaths.match.briefing(matchId));
    await snap(page, "05-match-briefing");

    await beginMatchDecide(page.request, matchId);
    await page.goto(priceWarPaths.match.decide(matchId));
    await snap(page, "06-match-decide");

    await seedDraft(page, matchId, 1);
    await page.goto(priceWarPaths.match.review(matchId));
    await snap(page, "07-match-review");

    const submitRes = await page.request.post(`/api/pricewar/match/${matchId}/submit`, {
      data: {
        moves: [
          {
            moveId: "sales.s01",
            input: { newPrice: 420 },
            draftedAt: new Date().toISOString(),
          },
        ],
      },
    });
    expect(submitRes.ok()).toBeTruthy();

    await waitForMatchPhase(page.request, matchId, "report");
    await page.goto(priceWarPaths.match.report(matchId, 1));
    await snap(page, "08-match-report");

    await page.request.post(`/api/pricewar/match/${matchId}/forfeit`);
    await page.goto(priceWarPaths.match.postmatch(matchId));
    await page.waitForURL(/\/postmatch/, { timeout: 15_000 }).catch(() => undefined);
    await snap(page, "09-terminal-postmatch");

    // Waiting + abandoned — needs two humans matched in queue
    try {
      const carolCtx = await browser.newContext();
      const danCtx = await browser.newContext();
      const carolPage = await carolCtx.newPage();
      const danPage = await danCtx.newPage();
      await carolPage.setViewportSize({ width: 1440, height: 900 });

      await loginAs(carolPage, email, password);
      await loginAs(danPage, danEmail, danPassword);

      await joinQueue(carolPage, "coffee-shop", "blitz");
      await joinQueue(danPage, "coffee-shop", "blitz");

      const pvpMatchId = await findActiveMatch(carolCtx.request, 40);

      await beginMatchDecide(carolCtx.request, pvpMatchId);
      await beginMatchDecide(danCtx.request, pvpMatchId);

      await carolCtx.request.post(`/api/pricewar/match/${pvpMatchId}/submit`, {
        data: {
          moves: [
            {
              moveId: "sales.s01",
              input: { newPrice: 420 },
              draftedAt: new Date().toISOString(),
            },
          ],
        },
      });

      await carolPage.goto(priceWarPaths.match.waiting(pvpMatchId));
      await snap(carolPage, "10-match-waiting");

      await forceAbandon(danCtx.request, pvpMatchId);
      await carolPage.goto(priceWarPaths.match.abandoned(pvpMatchId));
      await waitForMatchPhase(carolCtx.request, pvpMatchId, "completed");
      await snap(carolPage, "11-terminal-abandoned-win");

      await carolCtx.close();
      await danCtx.close();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Skipped PvP screenshots (waiting / abandoned):", err);
    }

    // eslint-disable-next-line no-console
    console.log(`Screenshots saved to ${OUT_DIR}`);
  });
});
