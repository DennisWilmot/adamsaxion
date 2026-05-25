# Price War — Operations Runbook

> Quick reference for on-call and admin. Manual infra steps: [`PRICE_WAR_MANUAL_STEPS.md`](PRICE_WAR_MANUAL_STEPS.md).

## Feature flag

| Env | Effect |
|---|---|
| `ENABLE_PRICEWAR=true` (default) | Game + APIs live |
| `ENABLE_PRICEWAR=false` | `/play/*` redirects to lessons; `/api/pricewar/*` returns 503 (except `/api/pricewar/metrics`) |

Soft launch: set `ENABLE_PRICEWAR=false` in production, enable for alpha group via separate deploy or flip when ready.

## Void a broken match

1. Admin → **Price War** → match → **Void match**
2. Or: `POST /api/pricewar/admin/matches/[id]/void` (admin session)
3. Ratings are reverted automatically when the match was rated.

## Re-resolve (determinism check)

1. Admin trace page → **Re-resolve**
2. Compare diff JSON to stored state; investigate if non-empty.

CLI replay:

```bash
pnpm pricewar:replay <matchId>
```

## Flush stuck matchmaking queue

```sql
-- Supabase SQL editor (pricewar schema)
DELETE FROM pricewar.matchmaking_queue WHERE enqueued_at < now() - interval '10 minutes';
```

Or per-user: `POST /api/pricewar/matchmaking/cancel` as that user.

## Reduce LLM coach spend

| Env | Default | Action |
|---|---|---|
| `PRICEWAR_COACH_USER_DAILY_USD` | 5 | Lower to cap per-user spend |
| `PRICEWAR_COACH_GLOBAL_DAILY_USD` | 200 | Lower for global circuit-breaker |
| `OPENROUTER_API_KEY` | — | Unset → template coach only |

Admin dashboard: `/admin/pricewar` → LLM costs panel.

## Metrics

```bash
curl -H "Authorization: Bearer $PRICEWAR_METRICS_TOKEN" \
  https://<host>/api/pricewar/metrics
```

Gauges: `pricewar_matches_in_progress`, `pricewar_matchmaking_queue_depth`, `pricewar_matches_completed_24h`, `pricewar_llm_spend_today_usd`.

Alert when `pricewar_llm_spend_today_usd` exceeds `PRICEWAR_COACH_GLOBAL_DAILY_USD` (default 200).

## Rate limits (per user)

| Bucket | Limit |
|---|---|
| `match:create` | 10 / hour |
| `matchmaking:queue` | 30 / hour |
| `match:submit` | 1 / second |

429 responses include `Retry-After`. Tune in `apps/econblog/src/server/pricewar/rate-limit.ts`.

## Common incidents

**SSE disconnects / opponent forfeit disputes**  
Check `match_players.abandoned_at`, submission rows, admin trace. Abandonment grace = 60s after clock hits 0.

**Clock desync complaints**  
Clocks advance on `GET /view`, submit, and SSE heartbeat (30s). Ask client to refresh; verify `timerMeta` in canonical state via admin trace.

**PostgREST direct writes**  
`pricewar` schema must NOT be exposed in Supabase API settings (see manual steps).

## E2E / staging helpers

| Env | Purpose |
|---|---|
| `PRICEWAR_E2E_ENABLED=1` | Enables `/api/pricewar/e2e/*` clock helpers |
| `PRICEWAR_E2E_PLAY_MODES=1` | Exposes `blitz-e2e` (5s clock) in play-modes API |

```bash
PRICEWAR_E2E_ENABLED=1 PRICEWAR_E2E_PLAY_MODES=1 \
  pnpm -F @adamsaxion/econblog exec playwright test e2e/pricewar/clock-out.spec.ts
```

## Load testing (Phase 5 gate)

Scripts: [`apps/econblog/scripts/k6/`](apps/econblog/scripts/k6/README.md)

```bash
# Smoke (metrics only, no auth)
pnpm -F @adamsaxion/econblog load:pricewar

# Full P5-L1 — vs-bot create + view (requires JWT)
k6 run apps/econblog/scripts/k6/pricewar-vs-bot.js \
  -e BASE_URL=https://staging.example.com \
  -e SUPABASE_ACCESS_TOKEN=<jwt> \
  -e VUS=100 -e DURATION=15m
```

Target gates from execution plan §16.11:

| Gate | Target |
|---|---|
| P5-L1 | 100 concurrent vs-bot Blitz — p95 view/submit < 500 ms, < 5% 5xx |
| P5-L2 | 500 concurrent queue enqueue — matched or bot-fallback within 90s |
| P5-L3 | 1000 concurrent SSE connections |
| P5-L4 | 100 req/sec submit spike — p99 < 1000 ms |
| P5-L5 | 24h soak, memory stable |

**Scripts:** `pricewar-vs-bot.js` (P5-L1), `pricewar-queue.js` (P5-L2), `pricewar-sse.js` (P5-L3), `pricewar-submit-spike.js` (P5-L4)

```bash
# P5-L2 — queue (500 VUs, paid JWT recommended)
pnpm -F @adamsaxion/econblog load:pricewar:queue

# P5-L3 — SSE (create a match first, pass MATCH_ID)
k6 run apps/econblog/scripts/k6/pricewar-sse.js \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_ACCESS_TOKEN=<jwt> \
  -e MATCH_ID=<uuid> \
  -e VUS=100 -e DURATION=10m

# P5-L4 — submit spike (100 req/sec)
pnpm -F @adamsaxion/econblog load:pricewar:submit-spike
```

### Feature flag verification (P5-CH4)

With dev server running `ENABLE_PRICEWAR=false`:

```bash
ENABLE_PRICEWAR=false pnpm -F @adamsaxion/econblog exec playwright test e2e/pricewar/feature-flag.spec.ts
```

Expect `/api/pricewar/match/vs-bot` → 503; `/api/pricewar/metrics` stays 200.

Profile resolution path first if submit p95 > 500 ms.
