import { EventEmitter } from "node:events";
import type { PlayerView, RoundReport } from "@adamsaxion/pricewar-types";
import { isRedisSSEEnabled } from "./sse-channels";
import { publishMatchEventJson, subscribeMatchEventJson } from "./redis-sse";

export type ServerSentMatchEvent =
  | { type: "opponent_locked"; round: number }
  | {
      type: "round_resolved";
      round: number;
      view: PlayerView;
      report: RoundReport;
    }
  | { type: "clock_warning"; remainingMs: number }
  | { type: "match_started"; view: PlayerView }
  | { type: "match_ended"; outcome: unknown; finalView: PlayerView }
  | { type: "opponent_disconnected"; gracePeriodEndsAt: string };

const matchEvents = new Map<string, EventEmitter>();

export function getMatchEmitter(matchId: string): EventEmitter {
  let emitter = matchEvents.get(matchId);
  if (!emitter) {
    emitter = new EventEmitter();
    emitter.setMaxListeners(8);
    matchEvents.set(matchId, emitter);
  }
  return emitter;
}

function emitLocalMatchEvent(matchId: string, event: ServerSentMatchEvent): void {
  getMatchEmitter(matchId).emit("event", event);
}

export function emitMatchEvent(matchId: string, event: ServerSentMatchEvent): void {
  if (!isRedisSSEEnabled()) {
    emitLocalMatchEvent(matchId, event);
    return;
  }

  const payload = JSON.stringify(event);
  void publishMatchEventJson(matchId, payload).catch((err) => {
    console.error("[pricewar sse] redis publish failed; falling back to local emitter", err);
    emitLocalMatchEvent(matchId, event);
  });
}

function subscribeLocalMatchEvents(
  matchId: string,
  handler: (event: ServerSentMatchEvent) => void
): () => void {
  const emitter = getMatchEmitter(matchId);
  const localHandler = (event: unknown) => handler(event as ServerSentMatchEvent);
  emitter.on("event", localHandler);
  return () => emitter.off("event", localHandler);
}

export async function subscribeMatchEvents(
  matchId: string,
  handler: (event: ServerSentMatchEvent) => void
): Promise<() => void> {
  if (!isRedisSSEEnabled()) {
    return subscribeLocalMatchEvents(matchId, handler);
  }

  try {
    return await subscribeMatchEventJson(matchId, (payload) => {
      try {
        handler(JSON.parse(payload) as ServerSentMatchEvent);
      } catch {
        console.warn("[pricewar sse] ignored malformed redis event payload");
      }
    });
  } catch (err) {
    console.error("[pricewar sse] redis subscribe failed; falling back to local emitter", err);
    return subscribeLocalMatchEvents(matchId, handler);
  }
}

export function filterEventForSlot(
  event: ServerSentMatchEvent,
  slot: "A" | "B"
): ServerSentMatchEvent | null {
  if (event.type === "round_resolved" || event.type === "match_ended") {
    return event;
  }
  return event;
}
