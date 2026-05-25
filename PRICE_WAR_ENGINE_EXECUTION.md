# Price War — Engine-to-Product Execution Runbook

> **Purpose:** Step-by-step checklist from `@adamsaxion/pricewar-engine` through full UI wiring.  
> **Execute top to bottom.** Do not re-ask product questions — locked decisions are in §2.  
> **Last updated:** 2026-05-25

---

## 0. How to use this doc

1. Find the first step marked **TODO**.
2. Do the work in the listed files only (minimal diff).
3. Run the **Verify** command; all checks must pass before marking **DONE**.
4. Mark the step **DONE** in this file (or in `PRICE_WAR_BUILD_PROGRESS.md`).
5. Move to the next step. **Do not skip verify gates.**

If a step fails, fix it before continuing. Do not open new design questions — follow §2 and the linked specs.

---

## 1. Document map (read once)

| Doc | Use for |
|-----|---------|
| [`PRICE_WAR_GAME_SPEC.md`](PRICE_WAR_GAME_SPEC.md) | Behavior contract (flow, disclosure, 46 actions) |
| [`packages/pricewar-engine/ENGINE_ARCHITECTURE.md`](packages/pricewar-engine/ENGINE_ARCHITECTURE.md) | Engine internals, pipeline, handlers |
| [`apps/econblog/price-war reference files/price_war_engine_spec (1).xlsx`](apps/econblog/price-war%20reference%20files/price_war_engine_spec%20(1).xlsx) | Numbers, conflicts, events, report templates (source of truth) |
| [`PRICE_WAR_EXECUTION_PLAN.md`](PRICE_WAR_EXECUTION_PLAN.md) | Original infra/DB/API plan (Phases 0–5) |
| [`PRICE_WAR_MANUAL_STEPS.md`](PRICE_WAR_MANUAL_STEPS.md) | Owner-only Supabase/Sentry/seed steps |
| [`PRICE_WAR_RUNBOOK.md`](PRICE_WAR_RUNBOOK.md) | Ops, env vars, local dev |

---

## 2. Locked decisions (never re-ask)

| Topic | Decision |
|-------|----------|
| Action catalog | All **46** spreadsheet actions in v1 |
| Action IDs | `sales.s01`, `hr.h07`, etc. — **no** legacy IDs |
| Starting cash | **$500** (spreadsheet as-is, no runtime scale) |
| Max moves / round | **3** per player |
| Domains per round | **Unrestricted** (`maxActionsPerDomain: null`) |
| Report timing | Resolve → **`phase: report`** → Continue → **`phase: decide`** |
| Round numbers | `currentRound` = deciding round; `lastResolvedRound` = report round |
| Coach | Prof. Aldo; mid-match references **last private report** |
| Card UX | Collapsed card + tooltip: **mechanic / strong when / risky when** |
| Engine boundary | Pure `resolveTurn()` in package; host owns DB/SSE/LLM |
| Production stubs | **`allowStubbedMoves: false`** on Coffee Shop |
| Raw events | **`adminTrace` only** — never send to client |

---

## 3. Repo layout (where code lives)

```
packages/
  pricewar-types/          Shared MatchState, MoveDefinition, RoundReport
  pricewar-engine/         Pure simulator (resolveTurn, handlers, reports)
apps/econblog/
  src/server/pricewar/     DB, resolver, matchmaker, SSE, coach
  src/app/api/pricewar/    HTTP routes
  src/components/pricewar/ UI screens
  e2e/pricewar/            Playwright specs
```

---

## 4. Baseline (already DONE — do not redo)

| Area | Status |
|------|--------|
| Monorepo packages `pricewar-engine`, `pricewar-types` | DONE |
| 12-step pipeline + 46 handlers | DONE |
| `advanceFromReportToDecide`, round semantics | DONE |
| `reviewForecastForDraft` + forecast API + Review UI panel | DONE |
| Report template engine (starter RPT-01…08) | DONE |
| Data-driven conflicts (12 rules) | DONE |
| `normalizeMatchState` on `loadMatch` | DONE |
| `POST …/continue`, `POST …/forecast` | DONE |
| Bot personas + tutorial script | DONE |
| E2E suite (16 specs) + k6 scripts + CI | DONE |
| Engine tests (29 pass) | DONE |

---

## 5. Execution steps

### Phase A — Engine verification (do first)

#### A1 — Engine test gate
- **Status:** DONE
- **Work:** None if green.
- **Verify:**
  ```bash
  cd packages/pricewar-engine && npm test
  ```
- **Done when:** 29/29 tests pass.

#### A2 — Handler coverage gate
- **Status:** DONE
- **Verify:** `test/handlers.test.ts` asserts all 46 catalog IDs have handlers.
- **Done when:** `hasActionHandler(id)` true for every row in `catalog-data.ts`.

#### A3 — Golden fixtures (expand over time)
- **Status:** DONE
- **Work:** 24 action golden cases in `test/golden-actions.test.ts` (all 6 domains). Each asserts state fields + `move_resolved` in adminTrace. Helpers: `patchSim`, `resolveA`, `expectMoveResolved`.
- **Verify:** `npm test` in `packages/pricewar-engine`.
- **Done when:** ≥20 golden cases or all 46 (stretch).

#### A4 — Spreadsheet tuning pass
- **Status:** TODO
- **Work:** For each action row in xlsx Actions Catalog, compare `immediateEffect` / costs to handler in `all-handlers.ts`. Adjust numbers in `simulation/player-sim.ts` `COSTS` and handler logic until golden tests match intent.
- **Files:** `all-handlers.ts`, `player-sim.ts`, `simulation/config.ts`, `golden-actions.test.ts`
- **Verify:** Golden tests + manual one-round replay via `scripts/pricewar-replay.ts` if present.
- **Done when:** No handler contradicts xlsx column "Immediate Effect" for Coffee Shop.

#### A5 — Import full conflict table
- **Status:** TODO
- **Work:** Copy 25 hard + 10 soft conflicts from xlsx into `simulation/conflicts.ts`. Add test in `test/conflicts.test.ts` that each hard pair fails `validateMoves`.
- **Verify:** `npm test`
- **Done when:** Conflict count matches spreadsheet; hire+fire, upgrade+downgrade, etc. fail validation.

#### A6 — Stochastic events from xlsx
- **Status:** TODO
- **Work:** Replace weather-only stub in `engine/pipeline/steps/events.ts` with table-driven draw from `simulation/events.ts` (create file from Stochastic Events sheet). Insurance (`finance.f05`) mitigates financial half of negative events **next round onward** unless tagged emergency.
- **Files:** `simulation/events.ts`, `steps/events.ts`, `reports/build.ts`
- **Verify:** Determinism test still passes; `event_applied` in adminTrace.
- **Done when:** ≥5 downtown coffee events can fire with named labels on report.

#### A7 — Report templates from xlsx
- **Status:** DONE
- **Work:** 30 template rows in `reports/templates.ts` (RPT-P01–P06 public, RPT-02–RPT-25 private). Condition evaluation in `reports/evaluate.ts`; `reports/build.ts` uses `collectTemplateLines` for public commentary + private narrative (max 4 lines).
- **Verify:** `test/reports.test.ts` — template count, overtime condition, resolve narrative, profit-down/customers-up chain.
- **Done when:** Report private summary uses template chains for profit-up/down, overtime, bankruptcy risk.

#### A8 — Perf regression gate
- **Status:** DONE
- **Verify:** `test/pipeline.perf.test.ts` — 2000 resolves < 1500ms.
- **Done when:** Green after any pipeline change.

---

### Phase B — Host ↔ engine contract

#### B1 — Resolver uses engine correctly
- **Status:** DONE
- **Files:** `apps/econblog/src/server/pricewar/resolver.ts`
- **Check:** `resolveTurn` → `adminTrace` saved to `roundReports.eventsSlice`; `saveMatch(nextState)`; SSE `round_resolved`.

#### B2 — Load path normalizes state
- **Status:** DONE
- **Files:** `repository.ts` → `normalizeMatchState` on every `loadMatch`.

#### B3 — Continue advances round
- **Status:** DONE
- **Files:** `app/api/pricewar/match/[id]/continue/route.ts`, `advanceFromReportToDecide`, `beginRoundClocks`.
- **Manual test:** Resolve round → report → Continue → `phase=decide`, `currentRound` incremented.

#### B4 — Submit validates via engine
- **Status:** DONE
- **Files:** `resolver.ts` → `validateMoves(state, slot, moves, COFFEE_SHOP_SCENARIO)`.

#### B5 — Slot-filtered round report API
- **Status:** DONE
- **Files:** `app/api/pricewar/match/[id]/report/[round]/route.ts` → `loadRoundReport({ slot })` returns **private slice for requesting player only**.
- **Todo check:** Confirm DB loader strips opponent private fields — if not, fix in `repository.loadRoundReport`.

#### B6 — Legal moves API (optional but spec-aligned)
- **Status:** TODO
- **Work:** Add `GET /api/pricewar/match/[id]/legal-moves` returning per-move `{ id, available, reason?, costRange? }` using engine `validateMoves` + catalog prerequisites.
- **Files:** New route; call from Decide screen to grey out locked cards.
- **Done when:** Prerequisite failures show on card ("Need morale ≥ 30 for overtime").

#### B7 — Redis SSE for multi-instance (pre-launch)
- **Status:** DONE
- **Work:** `redis-sse.ts` + `sse-channels.ts`; `emitMatchEvent` publishes to Redis when `REDIS_URL` is set; SSE route uses `subscribeMatchEvents`. In-memory `EventEmitter` fallback when Redis is unset or errors.
- **Verify:** `pnpm -F @adamsaxion/econblog test:pricewar-server`; with Redis: `REDIS_URL=... pnpm -F @adamsaxion/econblog smoke:pricewar-redis-sse`.
- **Done when:** Two Next.js instances both deliver `round_resolved` to subscribed clients.

---

### Phase C — Phase routing (client navigation)

#### C1 — Report phase redirect from decide
- **Status:** DONE
- **Files:** `decide/page.tsx` → if `phase === "report"`, redirect to `report/[lastResolvedRound]`.

#### C2 — Match routing helper
- **Status:** TODO
- **Work:** Update `client/pricewar/match-routing.ts`:
  - Add `getMatchPhasePath(view)`:
    - `waiting_for_opponent` → lobby/waiting
    - `briefing` → briefing (round 1)
    - `decide` → decide
    - `report` → report(`lastResolvedRound ?? currentRound`)
    - `completed` → postmatch / bankruptcy / abandoned
  - Use in `MatchLiveProvider`, `useMatchView` polling, and layout guards.
- **Verify:** E2E smoke: full round decide → review → lock → report → continue → decide.
- **Done when:** User never lands on decide while `phase === "report"`.

#### C3 — SSE pushes to report
- **Status:** PARTIAL
- **Work:** In `MatchLiveProvider.onRoundResolved`, navigate to report from **any** match route (not only `/waiting`):
  ```ts
  router.push(priceWarPaths.match.report(matchId, round));
  ```
- **Files:** `MatchLiveProvider.tsx`
- **Done when:** Locking on review/waiting/decide all auto-open report when opponent also locked.

#### C4 — Waiting page flow
- **Status:** DONE (verify)
- **Check:** After submit without resolve, user on waiting; on SSE, go to report.

---

### Phase D — Decide UI wiring

#### D1 — All 46 cards from catalog
- **Status:** DONE
- **Check:** `DecideScreen` uses `COFFEE_SHOP_MOVES` filtered by domain tab.

#### D2 — Catalog tooltips on cards
- **Status:** TODO
- **Work:** In `InlineMoveCard` (or tooltip subcomponent), import `getActionCatalogEntry(move.id)` from engine. Show on hover/Details:
  - **Mechanic** → `entry.mechanic`
  - **Strong when** → `entry.strongWhen`
  - **Risky when** → `entry.riskyWhen`
- **Files:** `InlineMoveCard.tsx`, optionally `MoveCard.tsx`
- **Done when:** Every card matches spec §10.2; no hardcoded move copy in UI.

#### D3 — Visibility pills
- **Status:** PARTIAL
- **Work:** Show `PUBLIC` / `HIDDEN` from `move.visibility` on card (already partially on InlineMoveCard).

#### D4 — Prerequisites / cooldown UI
- **Status:** TODO
- **Depends:** B6 legal-moves API OR client-side rules mirror from catalog `prerequisite` strings.
- **Done when:** Locked cards show reason; cannot add to draft.

#### D5 — Draft → Review → Lock flow
- **Status:** DONE
- **Check:** sessionStorage draft, Review screen, submit API.

#### D6 — Lock forecast panel
- **Status:** DONE
- **Check:** `useLockForecast` + `LockForecastPanel`; block lock on `risk` lines.

#### D7 — Move cost estimates
- **Status:** PARTIAL
- **Work:** Align `move-input.ts` `estimateMoveCost` with engine `COSTS` (consider exporting shared helper from engine or duplicate table once in spec).
- **Done when:** Review "Spend this round" within ±10% of actual post-resolve cash delta for fixed-cost moves.

#### D8 — Coach bubble (mid-match)
- **Status:** TODO
- **Work:**
  1. Store last round private summary on client after report (sessionStorage or from API).
  2. Replace generic `buildCoachLine` in `DecideScreen` with template that quotes last report private line.
  3. Optional: `GET /api/pricewar/match/[id]/coach-hint` using `extractFacts` + last report (no LLM).
- **Files:** `DecideScreen.tsx`, new thin API or report page handoff.
- **Done when:** Coach references prior round outcome per spec §3.4.

---

### Phase E — Report UI wiring

#### E1 — Public vs private panels
- **Status:** PARTIAL
- **Work:** Split `RoundReportScreen`:
  - **Public strip:** `report.publicSummary`, `report.publicEvents`, opponent public actions, both players' customer counts/prices.
  - **Private panel:** Slot-filtered P&L from `report.privateSummary[slot]` + `report.deltas[slot]`.
- **Files:** `RoundReportScreen.tsx`, `report/[round]/page.tsx`
- **Done when:** Matches wireframe v3 report layout (public top, private bottom).

#### E2 — Event pills with tooltips
- **Status:** TODO
- **Work:** Render `publicEvents` as pills; tooltip = event description (not probability).
- **Files:** `WeatherChip.tsx` → generalize to `EventPill.tsx`

#### E3 — Continue calls API
- **Status:** DONE
- **Check:** Report page `handleContinue` → `POST …/continue` before navigate.

#### E4 — Post-match coach
- **Status:** DONE
- **Check:** `GET …/coach` on postmatch; template + optional LLM.

---

### Phase F — Types & persistence

#### F1 — PlayerView includes report fields
- **Status:** TODO
- **Work:** If UI needs `lastResolvedRound`, ensure `toPlayerView` passes `market.lastResolvedRound` (already on `PublicMarketState`).
- **Verify:** Typecheck econblog.

#### F2 — Simulation fields persist in JSONB
- **Status:** DONE (fields written on `playersPrivate` via handlers)
- **Check:** After resolve, reload match — `getSim(loadMatch)` returns same supplier tier, debt, etc.

#### F3 — Engine/scenario version on match
- **Status:** DONE
- **Check:** `MatchState.engineVersion`, `scenarioVersion`, `actionCatalogVersion` set in `createInitialMatchState`.

---

### Phase G — Testing & CI

#### G1 — Engine CI
- **Status:** DONE
- **Check:** `.github/workflows/pricewar-ci.yml` runs `packages/pricewar-engine` tests.

#### G2 — E2E against new flow
- **Status:** TODO
- **Work:** Update specs for:
  - Report → Continue → decide (round increment)
  - Forecast blocks invalid lock
  - `phase: report` routing
- **Files:** `e2e/pricewar/smoke.spec.ts`, `race-condition.spec.ts`
- **Verify:**
  ```bash
  cd apps/econblog && PRICEWAR_E2E_ENABLED=1 pnpm test:e2e:pricewar
  ```

#### G3 — Determinism E2E
- **Status:** DONE (verify after handler changes)
- **Check:** `e2e/pricewar/determinism.spec.ts`

#### G4 — Full monorepo typecheck
- **Status:** TODO each phase
- **Verify:**
  ```bash
  pnpm typecheck
  ```

---

### Phase H — Launch (owner manual)

Execute [`PRICE_WAR_MANUAL_STEPS.md`](PRICE_WAR_MANUAL_STEPS.md) in order:

1. PostgREST exclude `pricewar` schema  
2. `pnpm seed:pricewar` + `ADMIN_EMAILS`  
3. Sentry DSN  
4. k6 L1–L4 on staging  
5. `ENABLE_PRICEWAR=true` after alpha  

---

## 6. Standard verify block (run after every phase)

```bash
# Engine
cd packages/pricewar-engine && npm test

# App
cd apps/econblog && pnpm typecheck

# Optional local E2E (needs env + seed)
cd apps/econblog && PRICEWAR_E2E_ENABLED=1 pnpm test:e2e:pricewar --grep smoke
```

---

## 7. Definition of done (v1 shippable)

- [ ] All steps A1–A8, B5–B7, C2–C3, D2–D4, D7–D8, E1–E2, G2 marked DONE  
- [ ] Player can complete 8-round match: lobby → decide → review → lock → report → continue ×8 → postmatch  
- [ ] All 46 actions visible with catalog tooltips  
- [ ] Lock forecast + conflict validation prevent illegal hands  
- [ ] Coach references last private report on decide (round 2+)  
- [ ] No raw `adminTrace` exposed to client  
- [ ] Engine 29+ tests green; E2E smoke green  
- [ ] Manual launch steps H complete  

---

## 8. Quick reference — key engine APIs

```ts
import {
  resolveTurn,
  validateMoves,
  advanceFromReportToDecide,
  reviewForecastForDraft,
  toPlayerView,
  createInitialMatchState,
  COFFEE_SHOP_SCENARIO,
  COFFEE_SHOP_MOVES,
  getActionCatalogEntry,
} from "@adamsaxion/pricewar-engine";
```

| Call | When |
|------|------|
| `validateMoves(state, slot, moves, scenario)` | Before submit (host) |
| `resolveTurn({ state, submittedA, submittedB, scenario })` | Both locked |
| `advanceFromReportToDecide(state)` | User taps Continue on report |
| `reviewForecastForDraft(state, slot, moves, scenario)` | Review screen forecast |
| `toPlayerView(state, slot)` | Every client poll/SSE |

---

## 9. If you are an AI agent

1. Read §2 — do not ask the user to choose between options listed there.  
2. Start at the first **TODO** in §5.  
3. One step per commit-sized change; run §6 verify after each step.  
4. Update step **Status** to DONE in this file when verify passes.  
5. Only escalate to the user for: missing secrets, staging access, or ambiguous spreadsheet rows not in xlsx.

---

## 10. Step index (at a glance)

| Step | Summary | Status |
|------|---------|--------|
| A1 | Engine tests | DONE |
| A2 | 46 handlers | DONE |
| A3 | Golden fixtures | DONE (24 actions) |
| A4 | Spreadsheet tuning | DONE |
| A5 | Full conflicts | DONE (25 hard, 10 soft) |
| A6 | Stochastic events | DONE (15 downtown events) |
| A7 | Report templates | DONE (30 templates + evaluate.ts) |
| A8 | Perf gate | DONE |
| B1–B5 | Host resolver contract | DONE |
| B6 | Legal moves API | DONE |
| B7 | Redis SSE | DONE |
| C1 | Report redirect | DONE |
| C2 | Phase routing helper | DONE |
| C3 | SSE → report everywhere | DONE |
| C4 | Waiting flow | DONE |
| D1 | 46 cards | DONE |
| D2 | Catalog tooltips | DONE |
| D3 | Visibility pills | DONE |
| D4 | Prerequisites UI | DONE |
| D5–D6 | Review + forecast | DONE |
| D7 | Cost estimates | PARTIAL |
| D8 | Coach from last report | DONE |
| E1 | Public/private report | DONE |
| E2 | Event pills | DONE |
| E3–E4 | Continue + postmatch coach | DONE |
| F1–F3 | Types/persistence | MOSTLY DONE |
| G2 | E2E report flow | DONE (`report-flow.spec.ts`) |
| H | Launch manual | TODO (owner) |
