import { after } from "next/server";
import type { MatchId, SubmittedMove } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { consumeRateLimit } from "@/server/pricewar/rate-limit";
import { resolveRoundIfReady, submitTurn } from "@/server/pricewar/resolver";
import { buildPlayerView } from "@/server/pricewar/player-view";
import { loadMatch } from "@/server/pricewar/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const limited = await consumeRateLimit({
    userId: auth.user.id,
    bucket: "match:submit",
  });
  if (!limited.ok) return jsonError(limited.error, { retryAfter: limited.retryAfterSec });

  const { id } = await context.params;
  const matchId = id as MatchId;

  let body: { moves?: SubmittedMove[] };
  try {
    body = await request.json();
  } catch {
    return jsonError({
      code: "INVALID_SUBMIT",
      message: "Invalid request body.",
    });
  }

  const moves = body.moves ?? [];
  const result = await submitTurn({
    matchId,
    userId: auth.user.id,
    moves,
  });

  if (result === null) {
    return jsonError({
      code: "MATCH_NOT_FOUND",
      message: "Match not found.",
    });
  }

  if ("error" in result) {
    return jsonError(result.error);
  }

  if (result.pendingResolution) {
    after(async () => {
      try {
        await resolveRoundIfReady({
          matchId,
          round: result.round,
          slot: result.slot,
          mySubmission: moves,
        });
      } catch (err) {
        console.error("[pricewar] deferred round resolution failed", {
          matchId,
          round: result.round,
          err,
        });
      }
    });
  }

  // The submission is already recorded (and resolution is scheduled above), so a
  // hiccup while building the optimistic view must NOT turn this into a non-OK
  // response — the client would roll back a move that actually went through and
  // the round would visibly flicker back into the decide phase.
  let view = null;
  try {
    const state = await loadMatch(matchId);
    view = state ? await buildPlayerView(matchId, result.slot, state) : null;
  } catch (err) {
    console.error("[pricewar] submit view build failed (non-fatal)", {
      matchId,
      round: result.round,
      err,
    });
  }

  return jsonOk({ ...result, view });
}
