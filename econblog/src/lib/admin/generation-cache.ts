import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { generationCache } from "@/db/schema";

const CACHE_FAILURE_PREFIX = "[generation-cache]";

function stableSerialize(input: unknown): string {
  if (input === null || typeof input !== "object") {
    return JSON.stringify(input);
  }

  if (Array.isArray(input)) {
    return `[${input.map((value) => stableSerialize(value)).join(",")}]`;
  }

  const entries = Object.entries(input as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${JSON.stringify(key)}:${stableSerialize(value)}`);

  return `{${entries.join(",")}}`;
}

export function hashCacheInput(input: unknown): string {
  return createHash("sha256").update(stableSerialize(input)).digest("hex");
}

function buildCacheKey(kind: string, version: string, input: unknown): string {
  return `${kind}:${version}:${hashCacheInput(input)}`;
}

async function readCacheEntry<T>(kind: string, cacheKey: string): Promise<T | null> {
  try {
    const [entry] = await db
      .select({ value: generationCache.value })
      .from(generationCache)
      .where(
        and(
          eq(generationCache.kind, kind),
          eq(generationCache.cacheKey, cacheKey),
          gt(generationCache.expiresAt, new Date())
        )
      )
      .limit(1);

    return (entry?.value as T | undefined) ?? null;
  } catch (error) {
    console.warn(`${CACHE_FAILURE_PREFIX} Cache read failed for ${kind}. Continuing without cache.`, error);
    return null;
  }
}

async function writeCacheEntry<T>(
  kind: string,
  cacheKey: string,
  value: T,
  ttlMs: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);

    await db
      .insert(generationCache)
      .values({
        kind,
        cacheKey,
        value,
        expiresAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: generationCache.cacheKey,
        set: {
          value,
          expiresAt,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.warn(`${CACHE_FAILURE_PREFIX} Cache write failed for ${kind}. Continuing without cache.`, error);
  }
}

interface GetOrComputeCacheOptions<T> {
  kind: string;
  version: string;
  input: unknown;
  ttlMs: number;
  compute: () => Promise<T>;
}

export async function getOrComputeCachedValue<T>({
  kind,
  version,
  input,
  ttlMs,
  compute,
}: GetOrComputeCacheOptions<T>): Promise<T> {
  const cacheKey = buildCacheKey(kind, version, input);
  const cached = await readCacheEntry<T>(kind, cacheKey);
  if (cached !== null) {
    return cached;
  }

  const value = await compute();
  await writeCacheEntry(kind, cacheKey, value, ttlMs);
  return value;
}
