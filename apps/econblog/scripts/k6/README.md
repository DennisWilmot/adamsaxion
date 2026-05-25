# Price War k6 load tests

Baseline scripts for Phase 5 load gates (see execution plan §16.11).

## Install k6

```bash
brew install k6
```

## Smoke (unauthenticated — metrics only)

```bash
k6 run apps/econblog/scripts/k6/pricewar-vs-bot.js \
  -e BASE_URL=http://localhost:3000 \
  -e VUS=5 -e DURATION=10s
```

Or: `pnpm -F @adamsaxion/econblog load:pricewar`

## Authenticated vs-bot load (P5-L1)

1. Sign in locally, copy Supabase session JWT from cookies.
2. Run:

```bash
k6 run apps/econblog/scripts/k6/pricewar-vs-bot.js \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_ACCESS_TOKEN=<your-jwt> \
  -e VUS=50 -e DURATION=2m
```

Scale `VUS` toward 100 for full P5-L1.

## P5-L2 — Blitz matchmaking queue

500 concurrent enqueue; pairs should form or bot-fallback within 90s.

```bash
k6 run apps/econblog/scripts/k6/pricewar-queue.js \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_ACCESS_TOKEN=<jwt> \
  -e VUS=500 -e DURATION=5m
```

Or: `pnpm -F @adamsaxion/econblog load:pricewar:queue` (requires token env var).

Use paid-tier JWTs (carol/dan test accounts) for human matchmaking.

## P5-L3 — SSE connections

```bash
# 1. Start a match and copy matchId
# 2. Run:
k6 run apps/econblog/scripts/k6/pricewar-sse.js \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_ACCESS_TOKEN=<jwt> \
  -e MATCH_ID=<uuid> \
  -e VUS=50 -e DURATION=2m
```

Or: `pnpm -F @adamsaxion/econblog load:pricewar:sse` (requires `MATCH_ID` + token env vars).

## P5-L4 — Submit spike

Sustained 100 req/sec submit traffic across active matches.

```bash
k6 run apps/econblog/scripts/k6/pricewar-submit-spike.js \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_ACCESS_TOKEN=<jwt> \
  -e RATE=100 -e DURATION=5m
```

Or: `pnpm -F @adamsaxion/econblog load:pricewar:submit-spike`

## Pass criteria (execution plan §16.11)

| Gate | Target |
|---|---|
| P5-L1 p95 submit/view | < 500 ms |
| P5-L2 enqueue | All matched or bot-fallback within 90s; zero crashes |
| P5-L3 SSE | Connection drops < 1% |
| P5-L4 p99 submit | < 1000 ms |
| HTTP 5xx rate | < 5% |
| Match resolution failures | 0 |

See also [`PRICE_WAR_RUNBOOK.md`](../../PRICE_WAR_RUNBOOK.md).
