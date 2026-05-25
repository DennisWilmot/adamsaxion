import { describe, expect, it } from "vitest";
import type { MatchId } from "@adamsaxion/pricewar-types";
import { getBotPersona } from "../src/bots/registry";
import { createRng } from "../src/rng/seeded";
import {
  getTutorialBotMoves,
  getTutorialBotScriptRounds,
  TUTORIAL_BOT_SCRIPT,
} from "../src/bots/tutorial-script";
import { createInitialMatchState } from "../src/scenarios/coffee-shop";
import { toPlayerView } from "../src/visibility/to-player-view";

describe("tutorial bot", () => {
  it("exposes a scripted move for each of 8 rounds", () => {
    expect(getTutorialBotScriptRounds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const round of getTutorialBotScriptRounds()) {
      expect(getTutorialBotMoves(round).length).toBeGreaterThan(0);
    }
  });

  it("chooseMoves follows the script exactly", () => {
    const persona = getBotPersona("bot.tutorial")!;
    const state = createInitialMatchState({
      matchId: "tut" as MatchId,
      playModeId: "tutorial",
      rngSeed: "seed",
      playerAName: "You",
      playerBName: "Guide",
      playerBIsBot: true,
    });
    state.phase = "decide";

    for (const round of getTutorialBotScriptRounds()) {
      state.market.currentRound = round;
      const view = toPlayerView(state, "B");
      const moves = persona.chooseMoves(view, createRng("test"));
      expect(moves).toEqual(TUTORIAL_BOT_SCRIPT[round]);
    }
  });
});
