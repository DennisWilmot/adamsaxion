import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { match, matchmakingQueue } from "@/db/schema/pricewar";

export async function collectPriceWarMetrics(): Promise<string> {
  const [inProgressRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(match)
    .where(
      inArray(match.phase, ["waiting_for_opponent", "briefing", "decide", "resolving", "report"])
    );

  const [queuedRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(matchmakingQueue);

  const [completedTodayRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(match)
    .where(
      sql`${match.completedAt} is not null and ${match.completedAt} > now() - interval '24 hours'`
    );

  const [llmSpendRow] = await db.execute<{ total: string }>(sql`
    SELECT COALESCE(SUM(CAST(cost_usd AS numeric)), 0)::text AS total
    FROM pricewar.llm_spend_ledger
    WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
  `);

  const inProgress = inProgressRow?.count ?? 0;
  const queued = queuedRow?.count ?? 0;
  const completed24h = completedTodayRow?.count ?? 0;
  const llmSpendTodayUsd = Number(
    (llmSpendRow as { total?: string } | undefined)?.total ?? 0
  );

  return [
    "# HELP pricewar_matches_in_progress Active matches not yet completed.",
    "# TYPE pricewar_matches_in_progress gauge",
    `pricewar_matches_in_progress ${inProgress}`,
    "# HELP pricewar_matchmaking_queue_depth Users waiting for an opponent.",
    "# TYPE pricewar_matchmaking_queue_depth gauge",
    `pricewar_matchmaking_queue_depth ${queued}`,
    "# HELP pricewar_matches_completed_24h Matches completed in the last 24 hours.",
    "# TYPE pricewar_matches_completed_24h counter",
    `pricewar_matches_completed_24h ${completed24h}`,
    "# HELP pricewar_llm_spend_today_usd LLM spend today (UTC) in USD.",
    "# TYPE pricewar_llm_spend_today_usd gauge",
    `pricewar_llm_spend_today_usd ${llmSpendTodayUsd.toFixed(6)}`,
    "",
  ].join("\n");
}
