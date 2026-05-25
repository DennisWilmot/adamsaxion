import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema/pricewar";
import type { GameError } from "@adamsaxion/pricewar-types";

type BucketConfig = {
  maxTokens: number;
  refillMs: number;
};

const BUCKETS: Record<string, BucketConfig> = {
  "match:create": { maxTokens: 10, refillMs: 60 * 60 * 1000 },
  "matchmaking:queue": { maxTokens: 30, refillMs: 60 * 60 * 1000 },
  "match:submit": { maxTokens: 1, refillMs: 1000 },
};

export async function consumeRateLimit(args: {
  userId: string;
  bucket: keyof typeof BUCKETS | string;
  cost?: number;
}): Promise<{ ok: true } | { ok: false; error: GameError; retryAfterSec: number }> {
  const config = BUCKETS[args.bucket];
  if (!config) return { ok: true };

  const cost = args.cost ?? 1;
  const now = Date.now();

  const [row] = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.userId, args.userId), eq(rateLimits.bucket, args.bucket)))
    .limit(1);

  if (!row) {
    await db.insert(rateLimits).values({
      userId: args.userId,
      bucket: args.bucket,
      tokensRemaining: config.maxTokens - cost,
      lastRefill: new Date(now),
    });
    return cost <= config.maxTokens ? { ok: true } : rateLimited(config);
  }

  const elapsed = now - row.lastRefill.getTime();
  const refills = Math.floor(elapsed / config.refillMs);
  let tokens = row.tokensRemaining;
  let lastRefill = row.lastRefill.getTime();

  if (refills > 0) {
    tokens = Math.min(config.maxTokens, tokens + refills * config.maxTokens);
    lastRefill = lastRefill + refills * config.refillMs;
  }

  if (tokens < cost) {
    const retryAfterSec = Math.ceil((config.refillMs - (now - lastRefill)) / 1000);
    return {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: `Slow down — try again in ${Math.max(1, retryAfterSec)} seconds.`,
      },
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  await db
    .update(rateLimits)
    .set({
      tokensRemaining: tokens - cost,
      lastRefill: new Date(lastRefill),
    })
    .where(and(eq(rateLimits.userId, args.userId), eq(rateLimits.bucket, args.bucket)));

  return { ok: true };
}

function rateLimited(config: BucketConfig) {
  return {
    ok: false as const,
    error: {
      code: "RATE_LIMITED" as const,
      message: "Slow down — try again later.",
    },
    retryAfterSec: Math.ceil(config.refillMs / 1000),
  };
}
