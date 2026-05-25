/** Redis channel for match-scoped SSE fan-out (one channel per match). */
export function matchEventChannel(matchId: string): string {
  return `pricewar:match:${matchId}:events`;
}

export function isRedisSSEEnabled(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}
