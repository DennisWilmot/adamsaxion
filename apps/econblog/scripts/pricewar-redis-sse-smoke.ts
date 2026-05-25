/**
 * Smoke test: Redis pub/sub delivers match events across independent subscribers.
 *
 * Usage (requires Redis):
 *   REDIS_URL=redis://127.0.0.1:6379 tsx scripts/pricewar-redis-sse-smoke.ts
 */
import { randomUUID } from "node:crypto";
import { emitMatchEvent, subscribeMatchEvents } from "../src/server/pricewar/sse";
import { isRedisSSEEnabled } from "../src/server/pricewar/sse-channels";

async function main() {
  if (!isRedisSSEEnabled()) {
    console.error("Set REDIS_URL to run this smoke test.");
    process.exit(1);
  }

  const matchId = randomUUID();
  const received: string[] = [];

  const unsubA = await subscribeMatchEvents(matchId, (event) => {
    received.push(`A:${event.type}`);
  });
  const unsubB = await subscribeMatchEvents(matchId, (event) => {
    received.push(`B:${event.type}`);
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  emitMatchEvent(matchId, { type: "opponent_locked", round: 1 });
  await new Promise((resolve) => setTimeout(resolve, 200));

  unsubA();
  unsubB();

  const lockedEvents = received.filter((r) => r.endsWith(":opponent_locked"));
  if (lockedEvents.length < 2) {
    console.error("Expected both subscribers to receive opponent_locked, got:", received);
    process.exit(1);
  }

  console.log("Redis SSE smoke OK:", received);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
