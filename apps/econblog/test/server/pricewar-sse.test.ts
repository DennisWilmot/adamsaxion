import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EventEmitter } from "node:events";
import { matchEventChannel, isRedisSSEEnabled } from "../../src/server/pricewar/sse-channels";
import {
  emitMatchEvent,
  getMatchEmitter,
  subscribeMatchEvents,
  type ServerSentMatchEvent,
} from "../../src/server/pricewar/sse";

describe("matchEventChannel", () => {
  it("namespaces events by match id", () => {
    assert.equal(matchEventChannel("abc-123"), "pricewar:match:abc-123:events");
  });
});

describe("in-memory SSE fallback", () => {
  it("delivers round_resolved to subscribers on the same instance", async () => {
    const prev = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    assert.equal(isRedisSSEEnabled(), false);

    const matchId = "sse-local-test";
    const received: ServerSentMatchEvent[] = [];
    const unsubscribe = await subscribeMatchEvents(matchId, (event) => {
      received.push(event);
    });

    emitMatchEvent(matchId, { type: "opponent_locked", round: 2 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    unsubscribe();
    if (prev) process.env.REDIS_URL = prev;

    assert.equal(received.length, 1);
    assert.equal(received[0]?.type, "opponent_locked");
    assert.equal((received[0] as { round: number }).round, 2);
  });

  it("getMatchEmitter returns a stable emitter per match", () => {
    const a = getMatchEmitter("match-a");
    const b = getMatchEmitter("match-a");
    const c = getMatchEmitter("match-b");
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.ok(a instanceof EventEmitter);
  });
});
