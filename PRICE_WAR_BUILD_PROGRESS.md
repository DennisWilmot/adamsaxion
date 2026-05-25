# Price War — Build Progress

> **Engine → product runbook:** [`PRICE_WAR_ENGINE_EXECUTION.md`](PRICE_WAR_ENGINE_EXECUTION.md) — step-by-step from engine to full UI wiring (execute without re-asking).  
> **Manual steps:** [`PRICE_WAR_MANUAL_STEPS.md`](PRICE_WAR_MANUAL_STEPS.md) · **Runbook:** [`PRICE_WAR_RUNBOOK.md`](PRICE_WAR_RUNBOOK.md)  
> Last updated: 2026-05-25 (engine execution doc added)

## Phase status

| Phase | Status |
|---|---|
| 0–4 | **Done** |
| 5 | **Done (code)** — E2E suite, k6 L1–L4, Sentry scaffold, CI, observability |

**Owner-only before launch:** PostgREST exclusion, seed users, Sentry DSN, k6 at VUS=100 on staging, 48h alpha.

## Session 13 — parallel subagent deliverables

### E2E (16/16 specs present)

| Story | Spec |
|---|---|
| 1 | `free-blitz-vs-human.spec.ts` |
| 2 | `paid-rapid-vs-human.spec.ts` |
| 3 | `free-rapid-locked.spec.ts` |
| 4 | `free-concurrent-cap.spec.ts` |
| 5 | `vs-bot.spec.ts` |
| 6 | `tutorial.spec.ts` |
| 7 | `clock-out.spec.ts` |
| 8 | `cheat-attempts.spec.ts` |
| 9 | `admin-debug.spec.ts` |
| 10 | `admin-costs.spec.ts` |
| 11 | `abandonment.spec.ts` (+ `force-abandon` E2E API) |
| 12 | `race-condition.spec.ts` |
| 13 | `recommended-lessons.spec.ts` |
| 14 | `rate-limit.spec.ts` |
| 15 | `determinism.spec.ts` |
| 16 | `bot-transparency.spec.ts` |
| P5-CH4 | `feature-flag.spec.ts` |

### Phase B — host contract
- [x] **B7 Redis SSE** — `REDIS_URL` pub/sub for multi-instance; in-memory fallback for local dev
- [x] k6: `pricewar-vs-bot`, `pricewar-sse`, `pricewar-queue`, `pricewar-submit-spike`
- [x] Optional Sentry (`@sentry/nextjs`, DSN-gated instrumentation)
- [x] Admin costs global-cap exceeded banner
- [x] Metrics `pricewar_llm_spend_today_usd`
- [x] GitHub Actions `.github/workflows/pricewar-ci.yml` (typecheck + engine tests)
- [x] Post-match recommended lessons UI

## Gates

| Check | Result |
|---|---|
| `pnpm typecheck` | **pass** |
| `pnpm test` (engine) | **81/81 pass** |
| `pnpm -F @adamsaxion/econblog test:pricewar-server` | **3/3 pass** |
| `pnpm build` | **pass** (Sentry OTel peer warnings only) |
| E2E | `PRICEWAR_E2E_ENABLED=1 pnpm -F @adamsaxion/econblog test:e2e:pricewar` |

## Launch checklist (owner)

1. ⬜ PostgREST — exclude `pricewar` schema
2. ⬜ `pnpm seed:pricewar` + `ADMIN_EMAILS`
3. ⬜ Sentry DSN in production
4. ⬜ k6 P5-L1/L2/L3 on staging
5. ⬜ Flip `ENABLE_PRICEWAR=true` after alpha
6. ⬜ Commit monorepo when ready
