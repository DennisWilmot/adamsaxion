import { EventEmitter } from "node:events";
import type { PlayerView } from "@adamsaxion/pricewar-types";
import type { RoundReport } from "@adamsaxion/pricewar-types";

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

export function emitMatchEvent(matchId: string, event: ServerSentMatchEvent) {
  getMatchEmitter(matchId).emit("event", event);
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
