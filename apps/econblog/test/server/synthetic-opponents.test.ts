import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SYNTHETIC_OPPONENTS,
  getSyntheticOpponent,
  pickSyntheticOpponent,
} from "../../src/lib/pricewar/synthetic-opponents";

describe("synthetic opponents pool", () => {
  it("has at least 50 opponents with unique ids and display names", () => {
    assert.ok(SYNTHETIC_OPPONENTS.length >= 50);
    const ids = new Set(SYNTHETIC_OPPONENTS.map((o) => o.id));
    const names = new Set(SYNTHETIC_OPPONENTS.map((o) => o.displayName));
    assert.equal(ids.size, SYNTHETIC_OPPONENTS.length);
    assert.equal(names.size, SYNTHETIC_OPPONENTS.length);
  });

  it("assigns ratings and avatar urls", () => {
    for (const opponent of SYNTHETIC_OPPONENTS) {
      assert.ok(opponent.rating > 900);
      assert.ok(opponent.rating < 1700);
      assert.match(opponent.avatarUrl, /^\/pricewar\/synthetic-avatars\/syn-\d{3}\.svg$/);
      assert.equal(getSyntheticOpponent(opponent.id)?.displayName, opponent.displayName);
    }
  });

  it("picks near player rating when rated", () => {
    const picked = pickSyntheticOpponent({ playerRating: 1200 });
    assert.ok(Math.abs(picked.rating - 1200) <= 200);
  });
});
