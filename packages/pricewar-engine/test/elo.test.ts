import { describe, expect, it } from "vitest";
import { applyRatingDelta, computeRatingDelta } from "../src/rating/elo";

describe("elo", () => {
  it("awards expected delta for equal ratings win", () => {
    const delta = computeRatingDelta({
      rating: 1200,
      opponentRating: 1200,
      gamesPlayed: 10,
      score: 1,
    });
    expect(delta).toBe(20);
  });

  it("applies rating floor at 100", () => {
    expect(applyRatingDelta(105, -20)).toBe(100);
  });
});
