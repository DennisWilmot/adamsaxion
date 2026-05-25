import type { MatchId } from "@adamsaxion/pricewar-types";
import { requireAuthedUser } from "@/server/pricewar/auth";
import { jsonError } from "@/server/pricewar/http";
import { syncMatchClocks, ensureMatchLifecycle, markPlayerDisconnected } from "@/server/pricewar/clock";
import { getPlayerSlot, loadMatch } from "@/server/pricewar/repository";
import { filterEventForSlot, subscribeMatchEvents } from "@/server/pricewar/sse";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthedUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;
  const matchId = id as MatchId;

  const state = await loadMatch(matchId);
  if (!state) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  const slot = await getPlayerSlot(matchId, auth.user.id);
  if (!slot) {
    return jsonError({ code: "MATCH_NOT_FOUND", message: "Match not found." });
  }

  void ensureMatchLifecycle(matchId, auth.user.id);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let unsubscribe = () => {};

      try {
        unsubscribe = await subscribeMatchEvents(matchId, (event) => {
          const filtered = filterEventForSlot(event, slot);
          if (filtered) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(filtered)}\n\n`));
          }
        });
      } catch (err) {
        console.error("[pricewar sse] failed to subscribe", err);
        controller.error(err);
        return;
      }

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
        void syncMatchClocks(matchId);
        void ensureMatchLifecycle(matchId);
      }, 30_000);

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeat);
        void markPlayerDisconnected({ matchId, userId: auth.user.id });
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
