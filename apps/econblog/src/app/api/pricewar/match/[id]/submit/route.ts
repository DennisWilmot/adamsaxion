import type { MatchId, SubmittedMove } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError, jsonOk } from "@/server/pricewar/http";
import { consumeRateLimit } from "@/server/pricewar/rate-limit";
import { submitTurn } from "@/server/pricewar/resolver";

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

  return jsonOk(result);
}
