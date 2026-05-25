# The Price War — Execution Plan

> **Companion to:** `PRICE_WAR_ARCHITECTURE_AUDIT.md`
> **Status:** Locked. All 8 architectural decisions confirmed by product owner.
> **Audience:** Coding agents and engineers executing the build. Assume the reader is junior-to-mid and has not read the audit. Be explicit. Quote file paths. Never leave the "why" implicit.
> **Source of truth:** This document. If something contradicts the audit, this document wins.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Locked Architectural Decisions](#2-locked-architectural-decisions)
3. [Repo Restructure](#3-repo-restructure)
4. [Types Package](#4-types-package)
5. [Engine Architecture](#5-engine-architecture)
6. [Server Architecture](#6-server-architecture)
7. [Database Schema](#7-database-schema)
8. [UI Architecture](#8-ui-architecture)
9. [Configuration Surface](#9-configuration-surface)
10. [Scaling Plan: 10k → 100k Users](#10-scaling-plan-10k--100k-users)
11. [Future-Proofing: Adding New Modes, Scenarios, Games](#11-future-proofing-adding-new-modes-scenarios-games)
12. [Agent Skills](#12-agent-skills)
13. [User Stories and Test Cases](#13-user-stories-and-test-cases)
14. [Parallel Execution Plan](#14-parallel-execution-plan)
15. [Phased Build Plan](#15-phased-build-plan)
16. [Phase Test Gates](#16-phase-test-gates)
17. [Appendix A: Existing Code You Must Not Touch](#appendix-a-existing-code-you-must-not-touch)
18. [Appendix B: Glossary](#appendix-b-glossary)

---

## 1. Executive Summary

### What we are building

A turn-based, two-player, hidden-information, server-authoritative economics strategy game called **The Price War**, integrated as a new play surface on the existing Adam's Axioms learning platform (`econblog/`). v1 ships the **Coffee Shop** scenario with three play modes (Blitz, Rapid, Tutorial), bot opponents, and an LLM-powered post-match coach for paid users.

### Why this document exists

The audit identified that the repo has **zero game code** and several structural risks if we just start adding `Decide` screens to the existing `econblog/src/components/` folder. This document is the precise, opinionated, ordered playbook to:

1. Restructure the repo into a proper pnpm monorepo with engine isolation.
2. Build the engine, server, and UI in parallel where dependencies allow.
3. Reuse the existing Tailwind-based design system instead of inventing new tokens.
4. Ship a v1 that is correct, debuggable, secure, and reasonably scalable.
5. Establish patterns for adding *future* scenarios and entire other games (e.g. "Wordle for economics") without re-architecting.

### What is in v1

- **One scenario:** Coffee Shop (single-shop, single-market, head-to-head).
- **Three play modes:** Blitz (5 min/player chess clock), Rapid (15 min/player, paid), Tutorial (no clock, scripted).
- **Opponent types:** Human matchmaking (Blitz only for free, Blitz + Rapid for paid), 7 bot personalities, scripted Tutorial bot.
- **Progression:** Two ratings (Blitz, Rapid) separate from existing XP/Level. New XP source: completed matches grant XP.
- **Coach:** Paid-only LLM narrative + recommended lessons. Free users see deterministic template fallback.
- **Admin:** Match deep-dive viewer, move catalog analytics, player debug view, LLM cost dashboard, CLI replay tool.

### What is NOT in v1 (explicitly out of scope)

- Casual / Async play mode (24h/round) — **v1.1, gated on push notification infra.**
- Additional scenarios beyond Coffee Shop — **v1.2+.**
- Public match replay viewer for players — **v1.2.**
- Automated cheat detection / ML flagging — **post-launch when data exists.**
- Tournament/event mode — **post-launch.**
- Mobile native app — **post-launch.**

### Timeline estimate

Eleven phases (see [§15](#15-phased-build-plan)). With parallel execution by 3–5 capable agents/engineers: **6–9 weeks to launch.** Solo: 14–18 weeks.

### Reading this doc

Sections 1–9 are reference. Sections 13–15 are the actionable plan. If you only have time for one section, read §15 (Phased Build Plan).

---

## 2. Locked Architectural Decisions

These are non-negotiable for v1. Re-opening any of them requires explicit product-owner approval. Each links to the section that operationalizes it.

| # | Decision | Locked outcome | Operationalized in |
|---|---|---|---|
| 1 | Repo topology | **pnpm monorepo, single Railway service v1.** Two packages: `packages/pricewar-engine`, `packages/pricewar-types`. Engine lives in a package so future games can share the workspace. Server lives inside the Next.js app for v1; refactor to `packages/pricewar-server` deferred until a real reason emerges. | §3, §6 |
| 2 | Engine boundary | **Pure TypeScript, zero runtime deps on Next/React/Drizzle/Supabase.** Engine takes inputs, returns outputs. No I/O. | §5 |
| 3 | Packages in v1 | `packages/pricewar-engine` + `packages/pricewar-types`. Future Adams Axioms games get their own packages when they exist. No premature `@adamsaxion/shared-game-core`. | §3, §4, §5 |
| 4 | Bot intelligence | **7 heuristic personas + 1 scripted tutorial bot. No LLM/MCTS bots in v1.** Bots present as humans by default (toggleable via `NEXT_PUBLIC_BOT_TRANSPARENT=true`). | §6.5 |
| 5 | LLM coaching | **Engine produces deterministic facts; coach is a separate server module** calling a cheap model (e.g. GPT-4o-mini via OpenRouter). Cached in `pricewar.match_coach_reports`. Paid-only narrative; free users see templated deterministic fallback. Cost-bounded. | §6.6 |
| 6 | Play modes & timers | **Blitz (5+0 chess clock), Rapid (15+0 chess clock, paid), Tutorial (no clock). Casual deferred to v1.1.** First mid-match clock-out auto-passes that round with current draft; second clock-out ends match (reduced-K Elo loss). 3 zero-move submissions in same match also = forfeit. Match-start no-show grace: 60s Blitz / 2 min Rapid. | §9 |
| 7 | Live update transport | **SSE for live modes**, no Supabase Realtime for game data. In-memory `EventEmitter` per Next.js instance v1; documented swap to Postgres `LISTEN/NOTIFY` when horizontal scaling. Casual (v1.1) polls + push notifications. | §6.4 |
| 8 | Anti-cheat & admin | Server-authoritative engine, rate limiting, submit idempotency, generic error envelope, ESLint rule against cross-schema queries, full match audit trail. Admin debug pages, move catalog analytics, LLM cost dashboard, CLI replay tool. No automated cheat-detection ML in v1. **Move catalog read-only in admin (PR + semver bump to rebalance). Admin = env-var allowlist (`ADMIN_EMAILS`).** | §6.7, §8.7 |

### Two ratings, three progression numbers

The user-facing progression model has **three distinct numbers** that must not be conflated. This is a frequent point of confusion and the cause of many bugs in similar systems. Memorize this:

| Number | Source | Direction | Visibility | Resets? |
|---|---|---|---|---|
| **XP** | Lessons (existing) + completed matches (new) | Monotonically up | Public (leaderboard) | No |
| **Level** | Derived from XP via `levelForXp(xp)` | Monotonically up | Public | No |
| **Rating** | Per `(scenario, playMode)` Elo from competitive matches | Up or down based on results | Public for paid, hidden for free | No (but K-factor decreases over time) |

**Free tier does not have a Rating.** Free matches are unranked. Free users are matchmade randomly. Paid users get rated matchmaking with separate Blitz Rating and Rapid Rating per scenario. See §7 for schema.

---

## 3. Repo Restructure

### Why restructure first

Phase 0 of the build plan is **repo restructure**, before any game code. The reasons:

1. **`pnpm-workspace.yaml` is currently broken.** Both `/pnpm-workspace.yaml` and `econblog/pnpm-workspace.yaml` contain only `allowBuilds:` keys with no `packages:` declarations. They are effectively no-ops. Without a working workspace, we cannot have a `packages/pricewar-engine` that the `econblog/` app imports.
2. **Path aliases need to resolve cross-package.** The Next.js app must `import { resolveTurn } from "@adamsaxion/pricewar-engine"` and have TypeScript, Next, and Vitest all agree on the resolution. This needs `tsconfig` and `package.json` discipline.
3. **Engine tests need to run in isolation** without spinning up Next. Engine package gets its own `vitest.config.ts`.
4. **Future games (Wordle-for-econ, etc.) need a sane home** — `packages/` is that home.

### Target shape

```
/Users/denniswilmot/adamsaxion/
├── pnpm-workspace.yaml             # FIXED: actually declares packages
├── pnpm-lock.yaml                  # root lockfile
├── package.json                    # root, with shared scripts
├── tsconfig.base.json              # NEW: shared TS config inherited by every package
├── .eslintrc.json                  # NEW: monorepo-wide ESLint with cross-package rules
├── PRICE_WAR_ARCHITECTURE_AUDIT.md
├── PRICE_WAR_EXECUTION_PLAN.md     # ← you are reading this
├── README.md                       # updated to describe monorepo
│
├── apps/
│   └── econblog/                   # MOVED from /econblog (Next.js app)
│       ├── package.json            # declares deps on @adamsaxion/pricewar-* via "workspace:*"
│       ├── next.config.ts
│       ├── tsconfig.json           # extends ../../tsconfig.base.json
│       ├── tailwind.config.js
│       ├── drizzle.config.ts
│       ├── .env.example
│       ├── .impeccable.md
│       └── src/
│           ├── app/
│           │   ├── (marketing)/    # NEW: route group — existing landing/lessons live here
│           │   ├── (game)/         # NEW: route group — all game pages
│           │   ├── admin/
│           │   ├── api/
│           │   │   ├── pricewar/   # NEW: game-specific API routes
│           │   │   └── ...         # existing routes untouched
│           │   └── ...
│           ├── components/
│           │   ├── pricewar/       # NEW: game UI components (shell, screens, move-cards, etc.)
│           │   └── ui/             # EXISTING: reused as-is
│           ├── server/
│           │   └── pricewar/       # NEW: server-only glue: repository, matchmaker, coach
│           ├── db/
│           │   ├── index.ts        # extended to point at both schemas
│           │   └── schema/
│           │       ├── content.ts  # MOVED: existing content tables
│           │       └── pricewar.ts # NEW: game tables (under pg schema 'pricewar')
│           ├── lib/                # existing — untouched
│           └── middleware.ts       # extended with GAME_ROUTES and PRICEWAR_API_ROUTES
│
├── packages/
│   ├── pricewar-types/             # NEW
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts            # barrel — sole external surface
│   │   │   ├── match.ts            # MatchState, MatchPhase, MatchOutcome
│   │   │   ├── round.ts            # RoundState, RoundReport
│   │   │   ├── move.ts             # MoveId, MoveDefinition, SubmittedMove, MoveInputSpec
│   │   │   ├── domain.ts           # Domain enum (sales, procurement, ops, hr, marketing, finance)
│   │   │   ├── visibility.ts       # Visibility tag enum
│   │   │   ├── views.ts            # PublicMatchView, PlayerView (filtered)
│   │   │   ├── events.ts           # EngineEvent union (the trace items)
│   │   │   ├── scenario.ts         # ScenarioConfig, ScenarioId
│   │   │   ├── play-mode.ts        # PlayModeConfig, ClockModel
│   │   │   ├── rating.ts           # Rating, RatingDelta
│   │   │   └── errors.ts           # GameError union
│   │   └── README.md
│   │
│   └── pricewar-engine/            # NEW
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── index.ts            # barrel — sole external surface
│       │   ├── engine/
│       │   │   ├── resolve-turn.ts # the resolution pipeline (top-level)
│       │   │   ├── validate.ts
│       │   │   ├── apply-policies.ts
│       │   │   ├── apply-events.ts
│       │   │   ├── product.ts
│       │   │   ├── people.ts
│       │   │   ├── demand.ts
│       │   │   ├── allocate.ts
│       │   │   ├── finance.ts
│       │   │   ├── reputation.ts
│       │   │   ├── triggers.ts
│       │   │   └── build-reports.ts
│       │   ├── moves/
│       │   │   ├── catalog.ts      # ALL moves as data
│       │   │   ├── handlers/       # one file per move, pure functions
│       │   │   └── validate-input.ts
│       │   ├── scenarios/
│       │   │   └── coffee-shop/
│       │   │       ├── index.ts
│       │   │       ├── balancing.ts
│       │   │       └── seed-data.ts
│       │   ├── play-modes/
│       │   │   ├── registry.ts     # PlayModeConfig[]
│       │   │   └── autopass.ts     # clock-out behavior
│       │   ├── visibility/
│       │   │   ├── to-player-view.ts
│       │   │   └── property-tests.ts
│       │   ├── rng/
│       │   │   └── seeded.ts       # mulberry32 PRNG
│       │   ├── rating/
│       │   │   ├── elo.ts          # standard Elo math
│       │   │   └── k-factor.ts     # K-factor table by games-played
│       │   ├── bots/
│       │   │   ├── registry.ts     # BotPersonality[]
│       │   │   ├── personas/       # one file per persona
│       │   │   └── choose-moves.ts
│       │   ├── coach/
│       │   │   ├── extract-facts.ts # turns match events into structured facts
│       │   │   └── render-template.ts # deterministic fallback narrative
│       │   ├── replay/
│       │   │   └── cli.ts          # pnpm pricewar:replay <matchId>
│       │   └── version.ts          # engine semver (sync to package.json)
│       ├── test/
│       │   ├── golden/             # canonical match fixtures
│       │   ├── visibility.test.ts
│       │   ├── resolve-turn.test.ts
│       │   ├── moves.test.ts
│       │   ├── elo.test.ts
│       │   └── replay.test.ts
│       └── README.md
│
└── tooling/                        # NEW: shared dev configs
    ├── eslint-config-pricewar/     # custom ESLint rules
    └── tsconfig/                   # tsconfig presets
```

### Step-by-step migration

Each step is a discrete commit, runnable on its own. Subagents executing this should NOT proceed to step N+1 if step N fails CI.

#### Step 3.1 — Fix `pnpm-workspace.yaml` at repo root

```yaml
# /pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"

# Keep existing allowBuild entries
```

Delete `econblog/pnpm-workspace.yaml` entirely (it was a no-op anyway).

#### Step 3.2 — Move `econblog/` to `apps/econblog/`

```bash
mkdir -p apps
git mv econblog apps/econblog
```

Then update:
- `apps/econblog/package.json` — rename to `"name": "@adamsaxion/econblog"`.
- `apps/econblog/next.config.ts` — Turbopack root needs to point at workspace root: `turbopack: { root: path.resolve(__dirname, "..", "..") }`.
- Root `package.json` — add scripts `pnpm dev`, `pnpm build`, `pnpm test` that delegate via `pnpm -F` to the workspace.
- Update any references in `README.md`, `.gitignore`, CI workflows.

**Test:** `pnpm install` succeeds; `pnpm -F @adamsaxion/econblog dev` boots the existing app unchanged.

#### Step 3.3 — Create `tsconfig.base.json`

```json
// /tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "incremental": true,
    "composite": false
  }
}
```

Update `apps/econblog/tsconfig.json` to `"extends": "../../tsconfig.base.json"`.

#### Step 3.4 — Create `packages/pricewar-types`

```json
// packages/pricewar-types/package.json
{
  "name": "@adamsaxion/pricewar-types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  }
}
```

```json
// packages/pricewar-types/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"]
}
```

Empty `src/index.ts` for now; types ship in §4.

#### Step 3.5 — Create `packages/pricewar-engine`

```json
// packages/pricewar-engine/package.json
{
  "name": "@adamsaxion/pricewar-engine",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./bots": "./src/bots/index.ts",
    "./coach": "./src/coach/index.ts",
    "./replay-cli": "./src/replay/cli.ts"
  },
  "dependencies": {
    "@adamsaxion/pricewar-types": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  }
}
```

#### Step 3.6 — Wire engine into the Next.js app

```json
// apps/econblog/package.json (excerpt)
{
  "dependencies": {
    "@adamsaxion/pricewar-engine": "workspace:*",
    "@adamsaxion/pricewar-types": "workspace:*"
  }
}
```

Update `apps/econblog/next.config.ts` to transpile the workspace packages so Next can bundle them without prebuild:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@adamsaxion/pricewar-engine", "@adamsaxion/pricewar-types"],
  // ... existing config preserved
};
```

#### Step 3.7 — ESLint cross-package rules

In `/tooling/eslint-config-pricewar/index.js`, codify the import rules:

- `@adamsaxion/pricewar-engine/**` must NOT import from `next/*`, `react`, `react-dom`, `@/db`, `@/lib/supabase/*`.
- `apps/econblog/src/components/**/*` must NOT import directly from `@adamsaxion/pricewar-engine/engine/*` (only from `@adamsaxion/pricewar-engine` barrel and only types).
- `apps/econblog/src/**/*` outside `apps/econblog/src/server/pricewar/**` must NOT import `@/db/schema/pricewar.ts` directly. Game DB access must go through `apps/econblog/src/server/pricewar/repository.ts`.

These are codified as `no-restricted-imports` rules and a custom rule for the schema gate.

#### Step 3.8 — Add Vitest at workspace level

```json
// root package.json scripts
{
  "scripts": {
    "test": "pnpm -r --filter='./packages/*' test",
    "test:engine": "pnpm -F @adamsaxion/pricewar-engine test"
  }
}
```

#### Step 3.9 — Sanity CI run

GitHub Actions: matrix over `pnpm install`, `pnpm test`, `pnpm -F @adamsaxion/econblog build`. Must be green before any further work.

### Acceptance criteria for Phase 0

- [ ] `pnpm install` from repo root works.
- [ ] `pnpm -F @adamsaxion/econblog dev` boots the existing app with no behavioral regressions.
- [ ] `pnpm -F @adamsaxion/econblog build` succeeds.
- [ ] `pnpm test` exists and runs (will be near-empty until §5 lands).
- [ ] ESLint runs and the cross-package rules trigger when violated (verify with a known-bad test import).
- [ ] Existing `/lessons`, `/profile`, `/admin`, Stripe routes all still work in local dev.

---

## 4. Types Package

### Purpose

`packages/pricewar-types` is the **single source of truth for game shapes** shared between engine, server, and UI. Zero runtime code. No I/O. No React types. No Next types. No DB types. Only the domain.

### File-by-file contents

#### `src/domain.ts`

```ts
export type Domain =
  | "sales"
  | "procurement"
  | "operations"
  | "hr"
  | "marketing"
  | "finance";

export const DOMAINS: readonly Domain[] = [
  "sales", "procurement", "operations", "hr", "marketing", "finance",
] as const;
```

#### `src/visibility.ts`

```ts
export type Visibility =
  | "public"                   // both players see now
  | "private"                  // only the actor sees, never revealed
  | "inferable"                // derivable from public events
  | "conditional"              // visible if a condition holds (e.g. scout active)
  | "revealedAfterResolution"; // hidden during decide, shown in next round's report
```

#### `src/move.ts`

```ts
import type { Domain } from "./domain";
import type { Visibility } from "./visibility";
import type { ScenarioId } from "./scenario";

export type MoveId = string & { readonly __brand: "MoveId" };

export type MoveInputSpec =
  | { kind: "none" }
  | { kind: "slider"; min: number; max: number; step: number; unit?: string; default?: number }
  | { kind: "stepper"; min: number; max: number; step: number; default?: number }
  | { kind: "singleChoice"; options: { id: string; label: string; hint?: string }[] }
  | { kind: "toggle"; default?: boolean }
  | { kind: "amount"; min: number; max: number; currency?: string }
  | { kind: "target"; targets: { id: string; label: string }[] }
  | { kind: "mode"; modes: { id: string; label: string; description?: string }[] };

export type MoveKind = "oneShot" | "persistentPolicy" | "conditionalPolicy";

export type MoveTag =
  | "public"
  | "private"
  | "cost"
  | "locked"
  | "conditional"
  | "policy"
  | "oneShot";

export interface MoveDefinition {
  id: MoveId;
  domain: Domain;
  scenarios: ScenarioId[];
  name: string;                              // player-facing label
  description: string;                       // plain-English description (always visible)
  detailedDescription?: string;              // detail panel; reveals on click
  kind: MoveKind;
  input: MoveInputSpec;
  visibility: Visibility;
  durationRounds?: number;
  timing: "preEvents" | "postEvents";
  prerequisites?: MoveId[];
  conflictsWith?: MoveId[];
  warnings?: string[];
  tags?: MoveTag[];
  modifies: ReadonlyArray<string>;            // state keys it can write
}

export interface SubmittedMove {
  moveId: MoveId;
  input: unknown;                             // validated against MoveDefinition.input later
  draftedAt: string;                          // ISO timestamp for telemetry
}
```

#### `src/match.ts`

```ts
import type { ScenarioId } from "./scenario";
import type { Domain } from "./domain";

export type MatchId = string & { readonly __brand: "MatchId" };
export type PlayerSlot = "A" | "B";

export type MatchPhase =
  | "waiting_for_opponent"
  | "briefing"
  | "decide"
  | "resolving"
  | "report"
  | "completed";

export type MatchOutcome =
  | { kind: "in_progress" }
  | { kind: "win"; winner: PlayerSlot; reason: "victory_points" | "bankruptcy" | "forfeit_on_timeout" | "forfeit_on_abandonment" }
  | { kind: "draw" };

export interface PlayerPublicState {
  slot: PlayerSlot;
  displayName: string;
  currentPrice: number;                       // always visible to opponent (price war = price visibility)
  brandTier: number;                          // 1-5 visible badge
  isBot: boolean;                             // suppressed in UI if NEXT_PUBLIC_BOT_TRANSPARENT not set
}

export interface PlayerPrivateState {
  cash: number;
  inventory: number;
  staffCount: number;
  reputation: number;
  morale: number;
  activePolicies: Array<{ moveId: string; expiresAtRound: number }>;
  activeConditions: Array<{ kind: string; payload: unknown }>;
}

export interface PublicMarketState {
  currentRound: number;
  totalRounds: number;
  marketDemandIndex: number;                  // public scalar 0-100
  weatherIndex: number;                       // public scalar -50 to +50
  eventLog: Array<{ round: number; description: string; severity: "info" | "warning" | "critical" }>;
}

export interface MatchState {
  matchId: MatchId;
  scenarioId: ScenarioId;
  scenarioVersion: string;
  engineVersion: string;
  playModeId: string;
  rngSeed: string;
  phase: MatchPhase;
  outcome: MatchOutcome;
  market: PublicMarketState;
  playersPublic: Record<PlayerSlot, PlayerPublicState>;
  playersPrivate: Record<PlayerSlot, PlayerPrivateState>;
  clocks: Record<PlayerSlot, { remainingMs: number; tickingSince: string | null }>;
  createdAt: string;
  updatedAt: string;
}
```

#### `src/views.ts`

```ts
import type { MatchState, PlayerPublicState, PlayerPrivateState, PublicMarketState, PlayerSlot } from "./match";

export interface PlayerView {
  matchId: string;
  scenarioId: string;
  playModeId: string;
  phase: MatchState["phase"];
  outcome: MatchState["outcome"];
  market: PublicMarketState;
  me: PlayerPublicState & PlayerPrivateState & { slot: PlayerSlot };
  opponent: PlayerPublicState;                      // NO PlayerPrivateState — this is the entire hidden-info guarantee
  myClockMs: number;
  opponentClockMs: number;
  opponentHasLocked: boolean;
}
```

#### `src/round.ts`

```ts
export interface RoundReport {
  round: number;
  publicSummary: string;
  publicEvents: Array<{ description: string; impact: "neutral" | "positive" | "negative" }>;
  privateSummary: {
    A: string;                                // each player gets their own narrative
    B: string;
  };
  deltas: {
    A: { cashDelta: number; demandSatisfied: number; reputationDelta: number; moraleDelta: number };
    B: { cashDelta: number; demandSatisfied: number; reputationDelta: number; moraleDelta: number };
  };
}
```

#### `src/events.ts` — the engine trace

```ts
import type { PlayerSlot } from "./match";

export type EngineEvent =
  | { t: number; type: "round_started"; round: number }
  | { t: number; type: "move_submitted"; player: PlayerSlot; moves: ReadonlyArray<{ moveId: string; input: unknown }> }
  | { t: number; type: "policy_applied"; player: PlayerSlot; policyId: string }
  | { t: number; type: "event_applied"; eventId: string; severity: string }
  | { t: number; type: "move_resolved"; player: PlayerSlot; moveId: string; deltas: Record<string, number> }
  | { t: number; type: "demand_calculated"; total: number; allocated: Record<PlayerSlot, number> }
  | { t: number; type: "finance_settled"; player: PlayerSlot; cashAfter: number }
  | { t: number; type: "trigger_fired"; kind: string; payload: unknown }
  | { t: number; type: "round_resolved"; round: number };
```

#### `src/scenario.ts`

```ts
import type { Domain } from "./domain";
import type { MoveId } from "./move";

export type ScenarioId = string & { readonly __brand: "ScenarioId" };

export interface ScenarioConfig {
  id: ScenarioId;
  version: string;
  label: string;
  shortDescription: string;
  totalRounds: number;
  startingStateFn: string;                    // identifier; engine looks up function from registry
  availableDomains: ReadonlyArray<Domain>;
  moveCatalog: ReadonlyArray<MoveId>;
  victoryConditions: Array<{
    kind: "highest_cash" | "first_bankruptcy" | "highest_brand_at_end";
    weight?: number;
  }>;
  balancing: Record<string, number>;          // tuning constants
}
```

#### `src/play-mode.ts`

```ts
export type ClockModel =
  | { kind: "chess"; perPlayerMs: number; incrementMs?: number }
  | { kind: "wallclock"; perRoundMs: number; decideLockMs: number };

export interface PlayModeConfig {
  id: string;                                 // "blitz" | "rapid" | "casual" | "tutorial"
  label: string;
  shortLabel: string;
  clock: ClockModel | null;                   // null = no clock (tutorial)
  affectsRating: boolean;
  availableToTiers: ReadonlyArray<"free" | "paid">;
  inactivityForfeitAfterRounds: number;
  inactivityForfeitOnZeroMoves: number;
  matchStartGraceMs: number;                  // no-show forfeit threshold
  reducedKOnTimeoutForfeit: boolean;
  scriptedOpponent?: boolean;
}
```

#### `src/rating.ts`

```ts
export interface Rating {
  userId: string;
  scenarioId: string;
  playModeId: string;
  rating: number;                             // current Elo
  ratingDeviation: number;                    // optional Glicko-style RD; if not Glicko, stays at 0
  gamesPlayed: number;
  highestRating: number;
  lastMatchAt: string | null;
}

export interface RatingDelta {
  before: number;
  after: number;
  delta: number;
  kFactor: number;
  opponentRatingBefore: number;
  reason: "win" | "loss" | "draw" | "timeout_forfeit" | "abandonment_forfeit";
}
```

#### `src/errors.ts`

```ts
export type GameErrorCode =
  | "INVALID_SUBMIT"
  | "MATCH_NOT_FOUND"
  | "NOT_YOUR_TURN"
  | "CLOCK_EXPIRED"
  | "ALREADY_SUBMITTED"
  | "MOVE_NOT_ALLOWED"
  | "INSUFFICIENT_RESOURCES"
  | "MATCH_COMPLETED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "INTERNAL";

export interface GameError {
  code: GameErrorCode;
  message: string;                            // always generic; never leaks opponent state
}
```

#### `src/index.ts` (barrel)

```ts
export * from "./domain";
export * from "./visibility";
export * from "./move";
export * from "./match";
export * from "./views";
export * from "./round";
export * from "./events";
export * from "./scenario";
export * from "./play-mode";
export * from "./rating";
export * from "./errors";
```

### Acceptance criteria for §4

- [ ] `packages/pricewar-types` builds standalone with `pnpm -F @adamsaxion/pricewar-types typecheck`.
- [ ] `import { MatchState } from "@adamsaxion/pricewar-types"` works from both `@adamsaxion/pricewar-engine` and `@adamsaxion/econblog`.
- [ ] No file in this package imports anything outside this package (no `react`, no `next`, no `drizzle-orm`).
- [ ] All types are exported via the barrel.

---

## 5. Engine Architecture

### Engine contract

The engine is one function, plus support code:

```ts
import type { MatchState, EngineEvent, RoundReport } from "@adamsaxion/pricewar-types";

export interface ResolveTurnInput {
  state: MatchState;
  submittedA: SubmittedMove[];
  submittedB: SubmittedMove[];
  scenario: ScenarioConfig;
}

export interface ResolveTurnOutput {
  nextState: MatchState;
  events: EngineEvent[];
  report: RoundReport;
}

export function resolveTurn(input: ResolveTurnInput): ResolveTurnOutput;
```

**Properties the engine must satisfy:**

1. **Pure.** Given identical input → identical output. No `Date.now()`, no `Math.random()`, no I/O. Time and randomness enter only through `state.rngSeed` and `state.updatedAt`.
2. **No external dependencies at runtime.** Only `@adamsaxion/pricewar-types`. No `next`, no `react`, no `@supabase/*`, no `drizzle-orm`. Verified via `package.json` and ESLint.
3. **Deterministic across engine versions for a given `engineVersion`.** When we bump the engine, we increment `engine/version.ts`. Replays use the engine version pinned in the match row to guarantee historical reproducibility.
4. **Visibility-safe by construction.** The engine outputs `nextState` (canonical) and the server calls `toPlayerView(nextState, slot)` separately. The engine itself never produces a per-player view.

### Pipeline (the `resolveTurn` orchestration)

The full pipeline is a fixed sequence. **Order matters and is locked.** Each step is a separate file under `packages/pricewar-engine/src/engine/`.

```
resolveTurn(input)
├── 1. validate(state, submittedA, submittedB, scenario)
│     ↳ Each move legal? Resources sufficient? Conflicts checked?
│     ↳ On failure, return GameError before touching state.
├── 2. applyPolicies(state, scenario)
│     ↳ Persistent policies that were active going into this round (e.g. loyalty program ongoing).
│     ↳ Conditional policies evaluated.
├── 3. applyEvents(state, scenario, rng)
│     ↳ Stochastic market events (weather, supply shock, news). Seeded.
├── 4. product(state, submittedA, submittedB)
│     ↳ Production / inventory effects of submitted moves.
├── 5. people(state, submittedA, submittedB)
│     ↳ Hiring/firing/training/morale.
├── 6. demand(state, scenario, rng)
│     ↳ Compute customer demand for the round. Function of price differential, brand, weather, events.
├── 7. allocate(state, demand)
│     ↳ Split demand between players by demand model (price + brand + capacity weights).
├── 8. finance(state, allocated, scenario)
│     ↳ Revenue = price * units sold. Costs = staff + COGS + ongoing policy fees + one-shot move costs.
│     ↳ Cash after = cash before + revenue - costs.
├── 9. reputation(state, allocated, scenario)
│     ↳ Brand tier deltas, morale shifts, reputation changes.
├── 10. triggers(state)
│     ↳ Win/lose conditions evaluated: bankruptcy, end-of-match cash compare, etc.
├── 11. buildReports(state, events)
│     ↳ Produces public + per-player private RoundReport.
└── return { nextState, events, report }
```

Every step is a **pure function** of `(stateAtStartOfStep, inputs) → stateAtEndOfStep`. Every step appends to the `events: EngineEvent[]` accumulator. The accumulator is the **engine trace** that lands in `match.events_jsonb` for admin debugging.

### Deterministic RNG

`packages/pricewar-engine/src/rng/seeded.ts`:

```ts
// mulberry32 — fast, deterministic, 2^32 state space
export function createRng(seed: string): { next: () => number; pick: <T>(arr: readonly T[]) => T } {
  let a = stringToSeed(seed);
  const next = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)]!;
  return { next, pick };
}

function stringToSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}
```

The `state.rngSeed` is `matchId + ":" + roundIndex`. This means: re-resolving round 3 of match `abc-123` with the same scenario and inputs **always** produces the same outputs, even if the JS process is different, even years later.

### Move system

#### Catalog as data

`packages/pricewar-engine/src/moves/catalog.ts`:

```ts
import type { MoveDefinition, MoveId } from "@adamsaxion/pricewar-types";

const id = (s: string) => s as MoveId;

export const COFFEE_SHOP_MOVES: MoveDefinition[] = [
  {
    id: id("sales.set_price"),
    domain: "sales",
    scenarios: ["coffee-shop"] as any,
    name: "Set price",
    description: "Update your menu price for the next round.",
    kind: "oneShot",
    input: { kind: "slider", min: 100, max: 800, step: 25, unit: "¢" },
    visibility: "public",
    timing: "preEvents",
    modifies: ["currentPrice"],
  },
  {
    id: id("marketing.run_ad_campaign"),
    domain: "marketing",
    scenarios: ["coffee-shop"] as any,
    name: "Run ad campaign",
    description: "Boost brand awareness and reputation. Visible to opponent.",
    kind: "oneShot",
    input: { kind: "amount", min: 50, max: 500, currency: "$" },
    visibility: "public",
    timing: "preEvents",
    modifies: ["reputation", "cash"],
  },
  // ... ~25–30 moves total for v1 Coffee Shop
];

export const MOVE_BY_ID: Map<MoveId, MoveDefinition> = new Map(
  COFFEE_SHOP_MOVES.map(m => [m.id, m])
);
```

The full catalog is data. **No game logic lives in the catalog file.** Each move's *handler* (the function that mutates state) lives in `packages/pricewar-engine/src/moves/handlers/sales.set-price.ts` — a separate pure function per move:

```ts
// packages/pricewar-engine/src/moves/handlers/sales.set-price.ts
import type { MatchState, PlayerSlot, EngineEvent } from "@adamsaxion/pricewar-types";

export function applySetPrice(
  state: MatchState,
  slot: PlayerSlot,
  input: { newPrice: number },
  events: EngineEvent[],
): MatchState {
  const next = { ...state };
  next.playersPublic = { ...state.playersPublic };
  next.playersPublic[slot] = { ...state.playersPublic[slot], currentPrice: input.newPrice };
  events.push({
    t: events.length,
    type: "move_resolved",
    player: slot,
    moveId: "sales.set_price",
    deltas: { currentPrice: input.newPrice - state.playersPublic[slot].currentPrice },
  });
  return next;
}
```

Each handler is unit-testable on its own with a fixture state. This is the pattern that scales to 30+ moves without making any single file huge.

#### Move-handler registry

```ts
// packages/pricewar-engine/src/moves/handlers/index.ts
import { applySetPrice } from "./sales.set-price";
// ... imports for every handler

export const MOVE_HANDLERS: Record<string, MoveHandler> = {
  "sales.set_price": applySetPrice,
  // ... one entry per move
};

export type MoveHandler = (
  state: MatchState,
  slot: PlayerSlot,
  input: unknown,
  events: EngineEvent[],
) => MatchState;
```

**Adding a move** = add catalog entry + add handler file + add registry entry + add test. ~20 minutes of work, no engine modification. See [§11.3](#113-adding-a-new-move-to-an-existing-scenario).

### Visibility filter

`packages/pricewar-engine/src/visibility/to-player-view.ts`:

```ts
import type { MatchState, PlayerView, PlayerSlot } from "@adamsaxion/pricewar-types";

export function toPlayerView(state: MatchState, slot: PlayerSlot): PlayerView {
  const other: PlayerSlot = slot === "A" ? "B" : "A";

  return {
    matchId: state.matchId,
    scenarioId: state.scenarioId,
    playModeId: state.playModeId,
    phase: state.phase,
    outcome: state.outcome,
    market: state.market,
    me: { ...state.playersPublic[slot], ...state.playersPrivate[slot], slot },
    // CRITICAL: only the public portion of opponent. Never spread playersPrivate[other].
    opponent: state.playersPublic[other],
    myClockMs: state.clocks[slot].remainingMs,
    opponentClockMs: state.clocks[other].remainingMs,
    opponentHasLocked: false, // server overrides based on submission state
  };
}
```

**This is the single most security-critical function in the codebase.** It is the only place that produces what the client sees. The matching property test in `packages/pricewar-engine/src/visibility/property-tests.ts` proves no opponent private field can leak:

```ts
import { it } from "vitest";
import fc from "fast-check";
import { toPlayerView } from "./to-player-view";

it("never includes opponent private state in player view", () => {
  fc.assert(
    fc.property(arbitraryMatchState(), (state) => {
      const viewA = toPlayerView(state, "A");
      const viewB = toPlayerView(state, "B");

      const privateA = state.playersPrivate.A;
      const privateB = state.playersPrivate.B;

      // viewA must not contain B's private secrets
      expect(JSON.stringify(viewA)).not.toContain(JSON.stringify(privateB.cash));
      expect(JSON.stringify(viewA)).not.toContain(JSON.stringify(privateB.morale));
      expect(JSON.stringify(viewA)).not.toContain(JSON.stringify(privateB.inventory));

      // Conversely for viewB
      expect(JSON.stringify(viewB)).not.toContain(JSON.stringify(privateA.cash));
      // ... etc
    }),
    { numRuns: 1000 }
  );
});
```

Note: stringified-includes is a coarse check. It produces false positives if A and B happen to share a value (e.g. both at starting cash). The real test combines stringified-includes with structural assertions that `viewA.opponent` has only `PlayerPublicState` keys.

### Bot system

`packages/pricewar-engine/src/bots/personas/` — one file per persona. Each persona implements:

```ts
import type { PlayerView, SubmittedMove } from "@adamsaxion/pricewar-types";
import type { Rng } from "../../rng/seeded";

export interface BotPersonality {
  id: string;
  label: string;                              // player-facing name (e.g. "Maya Chen" — humanized)
  difficultyTier: 1 | 2 | 3 | 4 | 5;
  description: string;                        // internal docs
  chooseMoves: (view: PlayerView, rng: Rng) => SubmittedMove[];
}
```

The 7 personas (v1):

| ID | Label (UI) | Tier | Strategy summary |
|---|---|---|---|
| `bot.random` | "Sam" | 1 | Picks 1–3 random legal moves. Tutorial-grade. |
| `bot.budget` | "Riley" | 2 | Cash-conservative. Cuts price when ahead, holds when behind. |
| `bot.aggressive` | "Devon" | 3 | Heavy marketing + frequent price cuts. High variance. |
| `bot.premium` | "Jordan" | 3 | Holds high price, invests in brand/training. |
| `bot.efficient` | "Casey" | 4 | Balanced; rough heuristic of demand model. |
| `bot.adaptive` | "Alex" | 4 | Reacts to opponent's last 2 rounds. Mirror-leaning. |
| `bot.savant` | "Morgan" | 5 | Best heuristic; lookahead 1 round of demand simulation. |

Internal-only `chooseMoves` is pure: takes a `PlayerView` (so bots only see what humans see — no peeking) and an `Rng`. **Bots cannot cheat by reading the canonical state**, which is enforced by the function signature.

Bot selection in matchmaking is deterministic but seeded: see §6.5.

### Coach module

The coach is two-staged:

**Stage 1 (deterministic, in engine):** `packages/pricewar-engine/src/coach/extract-facts.ts`

Given the full event log of a completed match, produce a structured `MatchFacts` object:

```ts
export interface MatchFacts {
  matchId: string;
  outcome: { winner: PlayerSlot | "draw"; reason: string };
  finalCash: Record<PlayerSlot, number>;
  turningPoints: Array<{
    round: number;
    description: string;                      // deterministic English (e.g. "Round 3: A undercut B by 30%, captured 65% of demand")
    impactScore: number;                      // -100 to +100 from perspective of winner
  }>;
  bestMoves: Record<PlayerSlot, { round: number; moveId: string; reasonScore: number } | null>;
  worstMoves: Record<PlayerSlot, { round: number; moveId: string; reasonScore: number } | null>;
  domainBreakdown: Record<PlayerSlot, Record<Domain, number>>;  // moves per domain
}
```

**Stage 2 (LLM, in server, paid-only):** `apps/econblog/src/server/pricewar/coach.ts`

Given `MatchFacts`, call OpenRouter (`gpt-4o-mini`-class model) with a strict system prompt to produce a personalized narrative + recommended lesson slugs. Cached. Cost-tracked. See [§6.6](#66-coach-pipeline-server-side).

**Free users** see Stage 1 facts rendered into a template (no LLM call). They still get a useful post-match report; they just don't get personalized prose.

### Engine versioning

`packages/pricewar-engine/src/version.ts`:

```ts
export const ENGINE_VERSION = "0.1.0";  // synced to package.json on every release
```

When a match is created, `matchState.engineVersion` is set. When we re-resolve via the replay CLI for debugging, we use the matched engine version — which means we keep historical engine versions importable from a `legacy/` folder if/when we make breaking changes. **For v1 we don't expect breaking changes; we expect additive ones.** Document the bump policy:

- **Patch** (0.1.x): bug fixes, balance tweaks that don't change replay semantics.
- **Minor** (0.x.0): new moves, new scenarios, new bots. Old matches still replayable.
- **Major** (1.0.0+): pipeline order change, breaking move shape change. Old matches must be replayed against the old engine.

### Acceptance criteria for §5

- [ ] `pnpm -F @adamsaxion/pricewar-engine test` runs and passes for resolve-turn happy path, visibility property tests, RNG determinism, Elo math.
- [ ] No `next`, `react`, `drizzle-orm`, `@supabase/*` in `packages/pricewar-engine/package.json` dependencies.
- [ ] `toPlayerView` property test runs 1000+ iterations without producing a leak.
- [ ] `resolveTurn` produces identical output across 100 invocations with the same input (determinism test).
- [ ] Golden fixture tests for at least 5 representative match scenarios.
- [ ] All 7 bot personas pass a "produces 1–3 legal moves" smoke test.
- [ ] CLI replay tool runs against a stored match and produces matching output.

---

## 6. Server Architecture

The server lives inside the Next.js app at `apps/econblog/src/server/pricewar/` and `apps/econblog/src/app/api/pricewar/`. There is no separate Node service in v1 (decision Q1).

### 6.1 Repository layer

`apps/econblog/src/server/pricewar/repository.ts` is the **only** place that touches `pricewar.*` DB tables. All API routes go through it. ESLint forbids direct `db.select().from(pricewarTables.match)` calls outside this file.

```ts
import { db } from "@/db";
import { match, matchPlayers, turnSubmissions, roundReports, ratings } from "@/db/schema/pricewar";
import type { MatchState, MatchId, PlayerSlot } from "@adamsaxion/pricewar-types";

export async function loadMatch(id: MatchId): Promise<MatchState | null> { /* ... */ }

export async function saveMatch(state: MatchState): Promise<void> { /* ... */ }

export async function recordSubmission(args: {
  matchId: MatchId;
  round: number;
  slot: PlayerSlot;
  moves: SubmittedMove[];
}): Promise<{ idempotent: boolean }> { /* ... */ }

export async function loadRating(userId: string, scenarioId: string, playModeId: string): Promise<Rating> { /* ... */ }

// ... etc — see §7 for the full schema this wraps
```

### 6.2 API routes

All under `apps/econblog/src/app/api/pricewar/`. RESTful, JSON, JWT-auth via Supabase cookie (existing middleware).

| Route | Method | Purpose |
|---|---|---|
| `/api/pricewar/match` | POST | Create a match (matchmaking entry point or vs-bot creation). |
| `/api/pricewar/match/[id]/view` | GET | Returns `PlayerView` for the authenticated player. |
| `/api/pricewar/match/[id]/submit` | POST | Submit moves for current round. Idempotent. Returns `{ submitted: true, opponentLocked: boolean }`. |
| `/api/pricewar/match/[id]/events` | GET (SSE) | Server-sent events stream for live updates. |
| `/api/pricewar/match/[id]/report/[round]` | GET | Returns `RoundReport` filtered to player perspective. |
| `/api/pricewar/match/[id]/coach` | GET | Returns coach narrative (paid) or template fallback (free). |
| `/api/pricewar/match/[id]/forfeit` | POST | Voluntary forfeit. |
| `/api/pricewar/matchmaking/queue` | POST | Enter matchmaking queue with `{ scenarioId, playModeId }`. |
| `/api/pricewar/matchmaking/cancel` | POST | Leave queue. |
| `/api/pricewar/matchmaking/vs-bot` | POST | Start match against a bot persona. |
| `/api/pricewar/history` | GET | Paginated match history for current user. |
| `/api/pricewar/rating/[scenarioId]` | GET | Returns user's ratings for all play modes in this scenario. |
| `/api/pricewar/leaderboard` | GET | Leaderboard query (`?scenario=&mode=&limit=&offset=`). |
| `/api/pricewar/admin/...` | GET/POST | Admin-only endpoints — gated by `ADMIN_EMAILS` env match. |

### 6.3 Submit pipeline (the hot path)

```
POST /api/pricewar/match/[id]/submit
  ↓
1. Auth: extract userId from Supabase session
2. Load match (repository.loadMatch)
3. Verify userId is slot A or B
4. Verify match.phase === "decide"
5. Verify clock not expired (server-side time)
6. Validate input shape against MoveDefinition.input
7. Engine.validateMoves(state, slot, moves, scenario) — legal/resource checks
8. repository.recordSubmission() — INSERT into turn_submissions
   ↓ ON CONFLICT (matchId, round, slot) DO NOTHING — idempotent
9. Check: does opponent also have a submission for this round?
   ↓ YES:
       Engine.resolveTurn(state, A.submitted, B.submitted, scenario)
       repository.saveMatch(nextState)
       repository.saveRoundReport(report)
       Emit `round_resolved` event to both players' SSE streams
       If match ends: update ratings, write coach extract-facts
   ↓ NO:
       Emit `opponent_locked` event to opponent's SSE stream (if opponent has SSE open)
10. Return { submitted: true, opponentLocked: <bool> }
```

**Concurrency consideration:** Step 9 has a check-then-act race. If both players submit within milliseconds, we could try to resolve twice. Defense:

- Wrap steps 8–9 in a Postgres transaction with `SELECT ... FOR UPDATE` on the `match` row.
- Resolution is keyed by `(matchId, round)` with a unique constraint on `round_reports`. Second attempt to insert fails harmlessly.
- The losing transaction returns success to the client because the round resolved correctly; the client's SSE stream catches the resolved event.

### 6.4 SSE infrastructure

`apps/econblog/src/server/pricewar/sse.ts`:

```ts
import { EventEmitter } from "node:events";

const matchEvents = new Map<string, EventEmitter>();  // matchId → emitter

export function getMatchEmitter(matchId: string): EventEmitter {
  let em = matchEvents.get(matchId);
  if (!em) {
    em = new EventEmitter();
    em.setMaxListeners(4);  // up to 2 players + admin observers
    matchEvents.set(matchId, em);
  }
  return em;
}

export function emitMatchEvent(matchId: string, event: ServerSentMatchEvent): void {
  getMatchEmitter(matchId).emit("event", event);
}

// Optional cleanup: when match completes, drop the emitter after 60s of no listeners
```

`apps/econblog/src/app/api/pricewar/match/[id]/events/route.ts`:

```ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const match = await repo.loadMatch(params.id as MatchId);
  if (!match) return new Response("Not found", { status: 404 });

  const slot = matchPlayerSlot(match, user.id);
  if (!slot) return new Response("Forbidden", { status: 403 });

  const stream = new ReadableStream({
    start(controller) {
      const emitter = getMatchEmitter(params.id);
      const handler = (event: ServerSentMatchEvent) => {
        const filtered = filterEventForSlot(event, slot);  // toPlayerView-style filter for events
        if (filtered) {
          controller.enqueue(`data: ${JSON.stringify(filtered)}\n\n`);
        }
      };
      emitter.on("event", handler);

      // Heartbeat every 30s to keep proxies happy
      const heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);

      req.signal.addEventListener("abort", () => {
        emitter.off("event", handler);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",  // disable nginx buffering if proxied
    },
  });
}
```

**SSE events the server emits:**

```ts
type ServerSentMatchEvent =
  | { type: "opponent_locked"; round: number }
  | { type: "round_resolved"; round: number; view: PlayerView; report: RoundReport }
  | { type: "clock_warning"; remainingMs: number }
  | { type: "match_ended"; outcome: MatchOutcome; finalView: PlayerView }
  | { type: "opponent_disconnected"; gracePeriodEndsAt: string };
```

`filterEventForSlot` ensures each player gets their own filtered `view` and only their half of the `report`.

**When we scale (decision Q7 documented swap):** replace the in-memory `EventEmitter` with Postgres `LISTEN/NOTIFY`. Submit handler does `pg.query("NOTIFY match_" + matchId, payload)`. SSE handlers do `pg.query("LISTEN match_" + matchId)` and forward to the client. No code outside this file changes.

### 6.5 Matchmaking

`apps/econblog/src/server/pricewar/matchmaker.ts`:

```ts
export async function enqueue(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
}): Promise<{ matchId: string | null; queuedAt: string }>;

export async function tryMatch(scenarioId: string, playModeId: string): Promise<{ created: MatchId } | null>;

export async function createVsBot(args: {
  userId: string;
  scenarioId: string;
  playModeId: string;
  botPersonalityId: string;
}): Promise<{ matchId: MatchId }>;
```

**Queue mechanics for v1:**

1. User enqueues → row in `pricewar.matchmaking_queue` with `(userId, scenarioId, playModeId, enqueuedAt, ratingAtEnqueue)`.
2. Server checks the queue for a match within a Rating window.
   - **Paid + rated:** look for opponents within ±100 Rating, widening every 10s up to ±400, then fall back to any opponent or bot.
   - **Free + unrated:** match with anyone in the same `(scenarioId, playModeId)` queue. No rating filter.
3. On match: server picks the lowest queue position, creates a `match` row with both players, sets `phase = "briefing"`, deletes both from queue, emits SSE `match_found` if their queue page is subscribed (separate non-match SSE channel).
4. After 60s in queue with no human match found: fall back to **vs-bot** automatically (with a player-visible prompt: "No humans available in 60s — play a bot instead?"). User confirms or extends queue.

**Bot persona selection:** when matched to a bot (either by choice or fallback), the server selects a persona based on user Rating (Free user → uniformly random across tiers 1–3; Paid user → tier matching their Rating: <1200 → tiers 1–2, 1200–1499 → tiers 2–3, 1500–1799 → 3–4, ≥1800 → tiers 4–5).

### 6.6 Coach pipeline (server-side)

`apps/econblog/src/server/pricewar/coach.ts`:

```ts
export async function generateCoachReport(args: {
  matchId: string;
  userId: string;
}): Promise<CoachReport> {
  // 1. Load match + events from DB
  const { state, events } = await repo.loadMatchWithEvents(args.matchId);

  // 2. Deterministic fact extraction (engine)
  const facts = extractFacts(state, events);

  // 3. Cache check
  const cached = await repo.loadCoachReport(args.matchId, args.userId);
  if (cached) return cached;

  // 4. Tier check
  const tier = await getUserTier(args.userId);
  if (tier === "free") {
    const templated = renderTemplate(facts, args.userId);
    await repo.saveCoachReport({ ...templated, generatedBy: "template", costUsd: 0 });
    return templated;
  }

  // 5. LLM call (paid only)
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(facts, args.userId);
  const { content, costUsd } = await callOpenRouter({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    user: userPrompt,
    maxTokens: 800,
  });

  const parsed = parseCoachOutput(content);  // validates structure; falls back to template on parse fail

  // 6. Cost check + persist
  await repo.saveCoachReport({ ...parsed, generatedBy: "llm", costUsd });
  await repo.recordLlmSpend({ userId: args.userId, feature: "coach", costUsd });

  return parsed;
}
```

**Daily cost guardrails** (enforced in `recordLlmSpend`):

- Per-user daily cap: $5/day for paid users (refuses calls beyond, returns templated fallback with notice).
- Global daily cap: $200/day for v1 launch (admin alert at 80%).
- Both caps configurable via env (`PRICEWAR_COACH_USER_DAILY_USD`, `PRICEWAR_COACH_GLOBAL_DAILY_USD`).

**LLM output schema** (we strict-parse this; LLM gets JSON-mode prompt):

```ts
interface CoachLlmOutput {
  oneLinerVerdict: string;                    // 80–120 char summary
  turningPoint: { round: number; explanation: string };
  whatYouDidWell: string[];                   // 1–3 items
  whatToImprove: string[];                    // 1–3 items
  recommendedLessonSlugs: string[];           // must exist in lessons table; validated
}
```

### 6.7 Anti-cheat enforcement (server)

#### Rate limiting

`apps/econblog/src/server/pricewar/rate-limit.ts` — token-bucket per user, backed by Postgres (a simple `rate_limits` table with `(userId, bucket, lastReset, tokensRemaining)`).

| Endpoint | Limit |
|---|---|
| `POST /api/pricewar/match/[id]/submit` | 1/sec per match-player |
| `POST /api/pricewar/match` | 10/hour per user |
| `POST /api/pricewar/matchmaking/queue` | 30/hour per user |
| Other reads | 60/min per user |

Rate-limit exceeded → 429 `{ code: "RATE_LIMITED", message: "Slow down — try again in N seconds." }`.

#### Submit idempotency

`pricewar.turn_submissions` has a unique constraint on `(matchId, round, playerSlot)`. Second submit returns 409 mapped to `{ code: "ALREADY_SUBMITTED" }`. No leakage about opponent state.

#### Generic error envelope

Every game error returns the same JSON shape. The `code` is enumerable; the `message` is generic. **No error path branches on opponent state or move content in ways that affect the error message.** Reviewed in PR template.

#### Concurrent match cap

Free tier: 1 in-progress match max. Paid tier: 5 in-progress matches max. Enforced atomically at match-creation time via a Postgres CTE that counts and inserts in one statement. Returns `{ code: "FORBIDDEN", message: "You already have a match in progress. Upgrade to play multiple matches concurrently." }` — note: this error message is intentionally specific because it's about the *user's own* state, not the opponent's.

### 6.8 Admin endpoints

`apps/econblog/src/app/api/pricewar/admin/*` — gated by `ADMIN_EMAILS` env match (same pattern as existing admin pages).

| Route | Purpose |
|---|---|
| `GET /api/pricewar/admin/matches` | Paginated list, filterable. |
| `GET /api/pricewar/admin/matches/[id]/trace` | Full engine event log + canonical state + both filtered views. |
| `GET /api/pricewar/admin/move-catalog` | Move analytics (pick rate, win rate). |
| `GET /api/pricewar/admin/players/[id]` | Match history, rating timeline, flag history. |
| `POST /api/pricewar/admin/matches/[id]/void` | Voids match (no rating impact, refunds XP). |
| `POST /api/pricewar/admin/matches/[id]/re-resolve` | Re-runs engine against current code; reports diff. |
| `POST /api/pricewar/admin/players/[id]/flag` | Flag for manual review. |
| `GET /api/pricewar/admin/costs` | LLM spend dashboard data. |

### Acceptance criteria for §6

- [ ] Submit pipeline passes the concurrent-submit race test (10 simultaneous calls, exactly one round resolved).
- [ ] SSE stream receives `round_resolved` within 200ms of second submit in local test.
- [ ] Rate limit blocks 11th match creation per hour.
- [ ] Coach pipeline produces both LLM (paid) and template (free) outputs in tests; LLM call mocked.
- [ ] Generic error envelope verified across all 4xx paths.
- [ ] Repository pattern enforced: ESLint catches `db.select().from(pricewarTables.*)` outside `repository.ts`.

---

## 7. Database Schema

### Schema isolation

The `pricewar` schema is a **separate Postgres schema** in the same Supabase project. This means:

- `pricewar.match`, `pricewar.turn_submissions`, etc. live in a logically isolated namespace.
- PostgREST exposure is **disabled** for `pricewar.*` via Supabase dashboard config (the option is "Exposed schemas"). Only the `public` schema (existing content tables) is PostgREST-accessible. **This is the single biggest hidden-info defense.** Direct REST calls from a malicious client cannot read game state.
- Drizzle schema file references this via `pgSchema("pricewar")`.
- Foreign keys *can* cross schemas to reference `public.profiles(id)` for user identity.

### Drizzle schema file

`apps/econblog/src/db/schema/pricewar.ts`:

```ts
import {
  pgSchema, uuid, text, integer, boolean, timestamp, jsonb, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./content";

export const pricewar = pgSchema("pricewar");

// 7.1 Matches
export const match = pricewar.table(
  "match",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scenarioId: text("scenario_id").notNull(),
    scenarioVersion: text("scenario_version").notNull(),
    engineVersion: text("engine_version").notNull(),
    playModeId: text("play_mode_id").notNull(),
    playModeOverride: jsonb("play_mode_override"),  // ClockModel | null
    rngSeed: text("rng_seed").notNull(),
    phase: text("phase").notNull(),                  // MatchPhase
    outcomeKind: text("outcome_kind").notNull().default("in_progress"),
    outcomeWinnerSlot: text("outcome_winner_slot"),  // "A" | "B" | null
    outcomeReason: text("outcome_reason"),
    state: jsonb("state").notNull(),                 // canonical MatchState (server only)
    eventsCount: integer("events_count").default(0).notNull(),  // for cheap pagination
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("match_phase_idx").on(table.phase),
    index("match_completed_at_idx").on(table.completedAt),
  ],
);

// 7.2 Match players (the user→slot binding)
export const matchPlayers = pricewar.table(
  "match_players",
  {
    matchId: uuid("match_id").references(() => match.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    botPersonalityId: text("bot_personality_id"),  // null if human
    slot: text("slot").notNull(),                  // "A" | "B"
    isBot: boolean("is_bot").notNull(),
    ratingAtStart: integer("rating_at_start"),     // null for free unrated
    ratingAfter: integer("rating_after"),
    ratingDelta: integer("rating_delta"),
    abandonedAt: timestamp("abandoned_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("match_players_match_slot_idx").on(table.matchId, table.slot),
    index("match_players_user_idx").on(table.userId),
  ],
);

// 7.3 Per-round submissions (the canonical record of what each player chose)
export const turnSubmissions = pricewar.table(
  "turn_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id").references(() => match.id, { onDelete: "cascade" }).notNull(),
    round: integer("round").notNull(),
    slot: text("slot").notNull(),
    moves: jsonb("moves").notNull(),                // SubmittedMove[]
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    submittedByEngineAutopass: boolean("by_autopass").default(false).notNull(),
    clockAtSubmitMs: integer("clock_at_submit_ms"),
  },
  (table) => [
    uniqueIndex("turn_submissions_match_round_slot_idx").on(table.matchId, table.round, table.slot),
  ],
);

// 7.4 Round reports
export const roundReports = pricewar.table(
  "round_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id").references(() => match.id, { onDelete: "cascade" }).notNull(),
    round: integer("round").notNull(),
    publicReport: jsonb("public_report").notNull(),
    privateReportA: jsonb("private_report_a").notNull(),
    privateReportB: jsonb("private_report_b").notNull(),
    eventsSlice: jsonb("events_slice").notNull(),  // EngineEvent[] for this round
    resolvedAt: timestamp("resolved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("round_reports_match_round_idx").on(table.matchId, table.round),
  ],
);

// 7.5 Ratings (per user per (scenario, mode))
export const ratings = pricewar.table(
  "ratings",
  {
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    scenarioId: text("scenario_id").notNull(),
    playModeId: text("play_mode_id").notNull(),
    rating: integer("rating").notNull().default(1200),
    ratingDeviation: integer("rating_deviation").notNull().default(0),
    gamesPlayed: integer("games_played").notNull().default(0),
    highestRating: integer("highest_rating").notNull().default(1200),
    lastMatchAt: timestamp("last_match_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("ratings_user_scenario_mode_idx").on(table.userId, table.scenarioId, table.playModeId),
    index("ratings_leaderboard_idx").on(table.scenarioId, table.playModeId, table.rating),
  ],
);

// 7.6 Matchmaking queue
export const matchmakingQueue = pricewar.table(
  "matchmaking_queue",
  {
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).primaryKey(),
    scenarioId: text("scenario_id").notNull(),
    playModeId: text("play_mode_id").notNull(),
    ratingAtEnqueue: integer("rating_at_enqueue"),
    enqueuedAt: timestamp("enqueued_at", { withTimezone: true }).defaultNow().notNull(),
    botFallbackAfterSec: integer("bot_fallback_after_sec").notNull().default(60),
  },
  (table) => [
    index("matchmaking_scenario_mode_enqueued_idx").on(table.scenarioId, table.playModeId, table.enqueuedAt),
  ],
);

// 7.7 Coach reports
export const matchCoachReports = pricewar.table(
  "match_coach_reports",
  {
    matchId: uuid("match_id").references(() => match.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    generatedBy: text("generated_by").notNull(),    // "llm" | "template"
    payload: jsonb("payload").notNull(),
    costUsd: text("cost_usd").notNull().default("0"),  // text to avoid float drift
    model: text("model"),
    promptHash: text("prompt_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("match_coach_reports_match_user_idx").on(table.matchId, table.userId),
  ],
);

// 7.8 LLM spend ledger (also used for non-coach features)
export const llmSpendLedger = pricewar.table(
  "llm_spend_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),             // "coach" | "..." (future)
    matchId: uuid("match_id"),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    costUsd: text("cost_usd").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("llm_spend_user_day_idx").on(table.userId, table.createdAt),
    index("llm_spend_feature_day_idx").on(table.feature, table.createdAt),
  ],
);

// 7.9 Admin flags (for player review)
export const playerFlags = pricewar.table(
  "player_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    reason: text("reason").notNull(),
    severity: text("severity").notNull(),            // "info" | "warn" | "block"
    notes: text("notes"),
    flaggedByAdminEmail: text("flagged_by_admin_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("player_flags_user_idx").on(table.userId),
  ],
);

// 7.10 Rate-limit token buckets
export const rateLimits = pricewar.table(
  "rate_limits",
  {
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    bucket: text("bucket").notNull(),
    tokensRemaining: integer("tokens_remaining").notNull(),
    lastRefill: timestamp("last_refill", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rate_limits_user_bucket_idx").on(table.userId, table.bucket),
  ],
);
```

### Migrations

Use `drizzle-kit generate` for migrations. Migration files land in `apps/econblog/drizzle/`. Each migration is a numbered `.sql` file. **Do not edit migrations after they have shipped to a Supabase project; add a new migration to amend.**

Initial migration sequence:

1. `0001_create_pricewar_schema.sql` — `CREATE SCHEMA pricewar;`
2. `0002_create_pricewar_tables.sql` — all 10 tables above.
3. `0003_seed_play_modes.sql` — insert play-mode rows if you choose DB-backed (we are NOT; play modes are a TS registry in the engine package; skip).
4. `0004_disable_postgrest_pricewar.sql` — actually a Supabase dashboard config step, but document it as a migration runbook entry: log into Supabase dashboard → Project settings → API → "Exposed schemas" → remove `pricewar`. **Critical step.** Document with a screenshot in `apps/econblog/drizzle/RUNBOOK.md`.

### Seeds

`apps/econblog/scripts/seed-pricewar.ts` — idempotent seed script that:

- Inserts test admin profile (already exists via `ADMIN_EMAILS` flow).
- Inserts 4 test player profiles with predictable IDs (see §13 for test credentials).
- Creates 1 in-progress match for visual testing.

Run via `pnpm -F @adamsaxion/econblog seed:pricewar`.

### Acceptance criteria for §7

- [ ] `pnpm db:push` runs cleanly from `apps/econblog`.
- [ ] Supabase dashboard "Exposed schemas" excludes `pricewar` — verified via REST request to `https://{project}.supabase.co/rest/v1/pricewar.match` returns 404/406.
- [ ] All foreign keys to `public.profiles` resolve.
- [ ] Unique constraints on `(matchId, round, slot)` for submissions and `(matchId, round)` for reports verified.
- [ ] Seed script idempotent (run twice, no duplicate rows, no errors).

---

## 8. UI Architecture

### Principle: reuse, don't reinvent

`apps/econblog/src/components/ui/` already has 20 Radix-based primitives styled with the project's CSS-variable design system. The Price War UI **must use these.** No new design tokens, no shadcn-default look. The existing tokens are:

| Token | Purpose | Tailwind class |
|---|---|---|
| `--color-primary` (oklch 0.50 0.16 250) | CTA buttons, key links, brand | `text-primary`, `bg-primary` |
| `--color-gold` (oklch 0.72 0.15 75) | XP/achievement/competitive ranking | `text-gold`, `bg-gold-subtle` |
| `--color-success` (oklch 0.55 0.14 155) | "Locked ✓", positive deltas | `text-success` |
| `--color-error` (oklch 0.55 0.16 25) | Negative deltas, warnings | `text-error` |
| `--color-surface-raised` | Cards (default white surface) | `bg-surface-raised` |
| `--color-surface-sunken` | Sub-panels, code blocks | `bg-surface-sunken` |
| `--color-foreground-muted` | Tertiary text | `text-foreground-muted` |
| Spacing `xs`–`5xl` | 4pt scale | `p-md`, `gap-lg`, `mt-2xl` |
| Radius `sm`–`xl` | Card/button corners | `rounded-md`, `rounded-lg` |
| Type scale | Fluid headings | `text-xl`, `text-3xl` |
| `font-display` | Source Serif 4 | for headings |
| `font-body` | Hanken Grotesk | for body |

**Existing primitives to reuse (all already in the repo):**

`Button`, `Card`, `Dialog`, `Tooltip`, `Tabs`, `Badge`, `Avatar`, `Alert`, `AlertDialog`, `Accordion`, `Dropdown`, `Input`, `Label`, `Popover`, `Progress`, `Select`, `Separator`, `Sheet`, `Table`, `Textarea`.

**Net-new game-specific components** live in `apps/econblog/src/components/pricewar/`. They compose the primitives above. Examples:

- `MoveCard` (composes `Card`, `Tooltip`, `Badge`).
- `ClockBadge` (composes `Badge`).
- `DraftSlot` (composes `Card` with empty/filled states).
- `RoundReport` (composes `Card`, `Tabs`, `Separator`).

### UX principles (applied to wireframe execution)

These are the basic UX principles the agent should apply when implementing screens. **Do not invent new conventions; apply these to the wireframe-defined layouts.**

1. **Hofstadter / progressive disclosure.** Default card view shows minimum info needed to choose (per your earlier requirement). Detailed effects live in tooltip / detail panel triggered by click or hover. This is the *core UX rule* for The Price War — *the brief explicitly calls out preserving hidden information and not over-explaining moves*.
2. **One primary action per screen.** Every game screen has exactly one big-CTA action (e.g. "Lock in 3 moves") and a few secondary navigations. Reduces cognitive load.
3. **State has 3 dimensions, always shown.** Time pressure (clock), economic state (cash/inventory), competitive state (current round and opponent's price/brand). Place these in a *persistent header strip* (`MatchHeaderStrip` component) that lives in the `(game)` route group's layout.
4. **Mistakes are reversible until commit.** Drafting moves is non-destructive; the "Review & lock" screen is the irreversible commit. Show the user what will change *before* they commit.
5. **Hidden info is loud about being hidden.** Where the player doesn't have data (e.g. opponent's cash), the UI says "Unknown — only price and brand tier are public" rather than implying zero or blanking out. Trust the player; explain the rules.
6. **Animation conveys causality, not delight.** Round reports animate sequentially (price card → demand resolved → cash settled) to teach the resolution order. Use the existing `tailwindcss-animate` plugin + custom `landing-fade-up` keyframe. No bouncy game-show animations.
7. **Failure states are first-class.** Bankruptcy, abandonment, timeout — each has its own screen (wireframes #18–#20). Do not pile these into a modal on the lobby; they are full screens.

### Screen-by-screen breakdown

The wireframes file has 23 screens. Each gets its own Next.js route and React component. Reference: `econblog/The Price War · v3 · wireframes.pdf`.

The route group is `apps/econblog/src/app/(game)/`. Its layout (`layout.tsx`) renders:

```tsx
// apps/econblog/src/app/(game)/layout.tsx
import { GameShell } from "@/components/pricewar/shell/GameShell";
import { ReactQueryProvider } from "@/client/pricewar/providers/QueryProvider";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <GameShell>{children}</GameShell>
    </ReactQueryProvider>
  );
}
```

`GameShell` provides the persistent header strip (clock + cash + round + opponent status), the navigation chrome, and the SSE connection lifecycle hook.

#### Screen 1 — Lobby / Play Hub

**Wireframe screen:** #1 (Lobby).
**Route:** `(game)/play/page.tsx`
**Purpose:** entry point. Shows: current in-progress matches, "New Match" CTA, tutorial entry, recent history snapshot.
**Components:** `Card` × N (one per in-progress match), `Button` ("New Match"), `Tabs` (My Matches / History).
**Free tier upgrade pressure:** if user has 1 in-progress match, "New Match" button is enabled. They are then shown a `Dialog` on match-creation attempt explaining "Free accounts limit 1 match at a time — finish your current match or upgrade." **Render the new-match-with-Rapid as a locked card; clicking shows upgrade prompt.**
**Empty state:** big illustration + "Start your first match" CTA. Use the same illustration style as the existing landing page (`FloatingIcons`, `BurstHighlight`).

#### Screen 2 — Match-mode picker / Briefing

**Wireframe screens:** #2 (Briefing) and #3 (Scenario select).
**Route:** `(game)/play/setup/page.tsx`
**Purpose:** pick scenario + play mode + opponent type.
**Components:** segmented control via `Tabs` for play mode (Blitz / Rapid 🔒 / Casual coming-soon / Tutorial), `Card` per scenario, `Select` for opponent type (Human / Bot / specific bot persona).
**Locked items render** as cards with a small `Badge` ("Paid") and an inline upgrade `Tooltip`.

#### Screen 3 — Matchmaking queue

**Wireframe screen:** #8 (Matchmaking).
**Route:** `(game)/play/queue/page.tsx`
**Purpose:** show queue status, time elapsed, bot-fallback timer.
**Components:** large clock indicator (custom, not in `ui/`), `Progress` bar for 60s bot-fallback countdown, `Button` to cancel queue.
**Realtime:** subscribes via fetch polling (5s interval — queue is low frequency) to `/api/pricewar/matchmaking/status`. NOT SSE — queue is not match-scoped.

#### Screen 4 — Decide screen

**Wireframe screens:** #4 (Decide), #5 (Decide expanded).
**Route:** `(game)/play/match/[id]/decide/page.tsx`
**Purpose:** the main gameplay screen. Draft up to 3 moves across 6 domains, then commit.
**Layout:** three regions:
  - **Top:** persistent `MatchHeaderStrip` (clock, round X/8, my cash, opponent's price+brand).
  - **Center:** domain tabs (`Tabs` primitive), one tab per domain (Sales, Procurement, Operations, HR, Marketing, Finance). Selected tab shows a grid of `MoveCard` × N moves available in that domain.
  - **Right rail:** "My 3 picks" `DraftSlot` × 3 — each slot either empty (CTA "Pick a move") or filled with a mini move-card.
**Move pick interaction:** click a `MoveCard` → if you have an empty draft slot, opens a `Dialog` with that move's input control (slider / amount / etc.) → confirm → fills the slot.
**Detail-on-demand:** info icon on each `MoveCard` opens a `Popover` with full effects.
**Bottom CTA:** "Review & lock 3 moves" (`Button variant="default"`, large). Disabled until 1+ moves drafted. (You CAN submit fewer than 3.)
**Opponent state:** small inline `Badge` "Opponent: deciding…" (or `Badge` "Opponent: locked ✓" if SSE event received).
**Clock animation:** the `ClockBadge` in `MatchHeaderStrip` ticks down visibly. When <30s remain, the badge pulses red and a subtle haptic-style border flash on the page draws attention. **No screen-blocking modal** — let the player keep working.

#### Screen 5 — Review & lock

**Wireframe screen:** #5 (continued, the right-side review state).
**Route:** `(game)/play/match/[id]/review/page.tsx`
**Purpose:** confirm the 3 moves before commit.
**Components:** read-only `Card` × 3 with the picked moves expanded (full effect text), one `AlertDialog` for the final "Lock in" confirmation.
**Reversibility:** "Back to edit" button is prominent. "Lock in" is the destructive-style CTA (uses `variant="default"` with primary color, but the `AlertDialog` confirmation step makes it deliberate).

#### Screen 6 — Waiting for opponent

**Wireframe screen:** #6 (Waiting / Round transition).
**Route:** `(game)/play/match/[id]/waiting/page.tsx` (the post-lock interstitial)
**Purpose:** the "we're waiting for the other player" state. Auto-progresses when round resolves.
**Components:** subtle animation (existing `landing-pulse-dot`), text "Your moves are locked. Waiting for opponent…", opponent clock visible, optional "Open match history while waiting" link.
**SSE:** subscribes; on `round_resolved` event, navigates to `/play/match/[id]/report/[round]`.
**Fallback:** if SSE drops, polls `/api/pricewar/match/[id]/view` every 5s as backup.

#### Screen 7 — Round report

**Wireframe screens:** #7 (Round report — public), #11 (Round report — drilldown).
**Route:** `(game)/play/match/[id]/report/[round]/page.tsx`
**Purpose:** show what happened. Public summary first, then per-player private deltas.
**Components:** sequenced reveal via `Accordion` (Demand → Allocation → Finance → Reputation), each section animates in over ~600ms after the previous resolves. `Table` for raw numbers if user clicks "show numbers." Continue button advances to next decide screen (or end-of-match if last round).
**Hidden info etiquette:** the report only shows the player their own privates and the public summary. Opponent's cash/morale is never shown.

#### Screen 8 — Post-match

**Wireframe screens:** #12 (Post-match victory), #13 (Post-match loss), #14 (Post-match draw).
**Route:** `(game)/play/match/[id]/postmatch/page.tsx`
**Purpose:** the end-screen with coach narrative (paid) or template (free), recommended lessons, Rating delta, rematch.
**Components:** large outcome banner (uses `--color-gold` for win, `--color-foreground-muted` for loss, neutral for draw). `Card`: coach narrative section (LLM output for paid, template for free). `Card`: recommended lessons (linked to existing `/lessons/[slug]`). `Card`: Rating change with before/after numbers. `Button` "Rematch", `Button` "Back to lobby".
**Free tier upgrade pressure:** if free user, coach narrative is replaced with template + a "Upgrade for personalized AI coaching" call-out.

#### Screen 9 — History

**Wireframe screen:** #9 (History).
**Route:** `(game)/history/page.tsx`
**Purpose:** scrollable list of completed matches. Click → view summary (no replay viewer in v1).
**Components:** `Table` or `Card` list. Filterable by mode/scenario.

#### Screen 10 — Leaderboard

**Wireframe screen:** #10 (Leaderboard).
**Route:** `(game)/leaderboard/page.tsx`
**Purpose:** Rating ranking per `(scenario, mode)`. Paid users only see themselves on the list (free Rating = N/A). Reuse existing `/leaderboard` page's table styles.

#### Screen 11 — Tutorial

**Wireframe screen:** #15 (Tutorial).
**Route:** `(game)/tutorial/page.tsx`
**Purpose:** scripted match against the tutorial bot. Has narrative voice-over text overlays explaining each step. Marked free + once-per-account.

#### Screen 12 — Notifications

**Wireframe screen:** #16 (Notifications).
**Route:** `(game)/notifications/page.tsx`
**Purpose:** match-related notifications (your turn, match ended, friend played). Defer push notifications to v1.1; v1 just lists them in-app.

#### Screens 13–17 — Edge states

**Wireframe screens:** #17 (Idle warning), #18 (Forfeit confirm), #19 (Opponent abandoned), #20 (Bankruptcy), #21 (Austerity / running low), #22 (Timer warning), #23 (Network error).
**Routes:** Some are full-screen routes (`/play/match/[id]/bankruptcy/page.tsx`, `/play/match/[id]/abandoned/page.tsx`), some are full-screen overlays triggered by SSE events (idle warning, opponent disconnected).
**Components:** mostly `AlertDialog` + custom illustration. Reuse the brushwork-style accents from `BrushUnderline.tsx` and `CircleHighlight.tsx` for visual continuity with the landing/lessons design.

### State management with React Query

`@tanstack/react-query` is already in `package.json` and unused. **Use it for all game-data fetching.** The pattern:

```ts
// apps/econblog/src/client/pricewar/hooks/useMatchView.ts
import { useQuery } from "@tanstack/react-query";

export function useMatchView(matchId: string) {
  return useQuery({
    queryKey: ["pricewar", "match", matchId, "view"],
    queryFn: () => fetch(`/api/pricewar/match/${matchId}/view`).then(r => r.json()),
    staleTime: 1_000,
  });
}
```

`useSubmitMoves` uses `useMutation` + `invalidateQueries` on success.

SSE events drive `queryClient.setQueryData` updates (no need to refetch). The SSE hook lives in `apps/econblog/src/client/pricewar/hooks/useMatchEvents.ts`.

### Making the UI feel alive

Per the original prompt request, the UI should "feel alive." Concrete techniques:

1. **Heartbeat indicators.** The opponent's status pill (`Badge`) pulses softly when they're "deciding…" and snaps to a `Badge variant="success"` checkmark when they lock in. The transition is brief (200ms ease-out).
2. **Pre-commit visualization.** When the player drafts a move on the Decide screen, the *projected delta* of that move shows briefly in the right-rail preview ("If played: cash -$200, brand +1 tier"). Disappears after 1.5s. Uses existing `--color-foreground-muted`.
3. **Resolution stagger.** On the report screen, sections fade in with `landing-fade-up` keyframe (already in tailwind config), staggered 200ms apart. Demand → Allocation → Finance → Reputation. Conveys causality.
4. **Clock urgency.** `ClockBadge` background subtly shifts toward `--color-error-subtle` as time runs low (<60s: `bg-error-subtle/30`, <30s: pulses).
5. **Reactive transitions on opponent lock.** When SSE `opponent_locked` arrives, the opponent badge animates in-place (200ms ease-out scale 1 → 1.08 → 1) to draw the eye. Don't move other things on the page.
6. **Round number persistent.** The header strip always shows `Round 4 of 8` so the player knows the match shape.
7. **Subtle motion on idle.** If the player is on the Decide screen and hasn't interacted in 30s, the largest CTA ("Review & lock") gets a once-only 1s gentle scale pulse to remind them. No infinite loops.

All animations respect the existing `@media (prefers-reduced-motion: reduce)` block in `globals.css` (no per-component opt-in needed; the global media query disables transitions).

### Acceptance criteria for §8

- [ ] All 23 wireframe screens have a route or overlay implementation.
- [ ] `MatchHeaderStrip` is identical across all in-game routes.
- [ ] Reduced-motion preference disables all keyframe animations.
- [ ] Mobile layout works (sm breakpoint and up) — wireframes are mobile-friendly.
- [ ] Locked-feature CTAs (Rapid for free) actually open an upgrade prompt linked to `/subscribe`.
- [ ] Coach Card on post-match shows template fallback for free users, LLM narrative for paid.

---

## 9. Configuration Surface

### Play mode registry

`packages/pricewar-engine/src/play-modes/registry.ts`:

```ts
import type { PlayModeConfig } from "@adamsaxion/pricewar-types";

export const PLAY_MODES: PlayModeConfig[] = [
  {
    id: "blitz",
    label: "Blitz 5+0",
    shortLabel: "5 min",
    clock: { kind: "chess", perPlayerMs: 5 * 60 * 1000 },
    affectsRating: true,
    availableToTiers: ["free", "paid"],
    inactivityForfeitAfterRounds: 2,
    inactivityForfeitOnZeroMoves: 3,
    matchStartGraceMs: 60 * 1000,
    reducedKOnTimeoutForfeit: true,
  },
  {
    id: "rapid",
    label: "Rapid 15+0",
    shortLabel: "15 min",
    clock: { kind: "chess", perPlayerMs: 15 * 60 * 1000 },
    affectsRating: true,
    availableToTiers: ["paid"],
    inactivityForfeitAfterRounds: 2,
    inactivityForfeitOnZeroMoves: 3,
    matchStartGraceMs: 2 * 60 * 1000,
    reducedKOnTimeoutForfeit: true,
  },
  {
    id: "tutorial",
    label: "Tutorial",
    shortLabel: "Tutorial",
    clock: null,
    affectsRating: false,
    availableToTiers: ["free", "paid"],
    inactivityForfeitAfterRounds: 999,
    inactivityForfeitOnZeroMoves: 999,
    matchStartGraceMs: 60 * 60 * 1000,
    reducedKOnTimeoutForfeit: false,
    scriptedOpponent: true,
  },
  // Casual mode added in v1.1
];
```

**Adding a new mode** = one entry. No engine code change. See §11.1.

### Scenario balancing constants

`packages/pricewar-engine/src/scenarios/coffee-shop/balancing.ts`:

```ts
export const COFFEE_SHOP_BALANCING = {
  startingCash: 5000,
  startingInventory: 200,
  startingStaffCount: 2,
  startingReputation: 50,
  startingMorale: 70,
  startingPrice: 350,

  basePerRoundCost: 200,                          // fixed cost regardless of moves
  staffWagePerRound: 150,
  inventoryCarryCostPerUnit: 0.5,

  marketTotalDemandBase: 400,                      // before weather/event modifiers
  marketWeatherSensitivity: 0.2,
  marketPriceElasticity: -1.5,                     // % change in demand per % change in relative price
  marketBrandWeight: 0.3,
  marketStockoutPenalty: 0.5,                      // demand lost if stockout

  bankruptcyCashThreshold: 0,
  bankruptcyConsecutiveRounds: 2,                  // 2 rounds at ≤0 = bankrupt

  victoryFinalCashWeight: 0.7,
  victoryFinalBrandWeight: 0.3,
} as const;
```

**Tuning a scenario** = edit constants, bump scenario version, ship migration. See §11.2.

### Environment variables

`apps/econblog/.env.example` additions for The Price War:

```bash
# ---- The Price War ----

# Bot transparency: if true, bots show as "Bot · {persona}" instead of human name
NEXT_PUBLIC_BOT_TRANSPARENT=false

# Coach LLM
PRICEWAR_COACH_MODEL=openai/gpt-4o-mini
PRICEWAR_COACH_USER_DAILY_USD=5
PRICEWAR_COACH_GLOBAL_DAILY_USD=200

# Bot fallback timing in matchmaking (seconds)
PRICEWAR_BOT_FALLBACK_SEC=60

# Concurrent match caps (matches per user in-progress at once)
PRICEWAR_FREE_CONCURRENT_CAP=1
PRICEWAR_PAID_CONCURRENT_CAP=5

# Admin emails (already exists)
ADMIN_EMAILS=...
```

### Feature flags (in-DB)

`pricewar.feature_flags` — a small table for runtime flags admin can toggle:

```sql
CREATE TABLE pricewar.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Initial flags:

| Key | Default | Purpose |
|---|---|---|
| `enable_pricewar` | false | Kill switch for the entire game. Useful pre-launch. |
| `enable_rapid_mode` | true | Toggle Rapid mode availability. |
| `enable_coach_llm` | true | If false, all users get template (cost circuit-breaker). |
| `enable_matchmaking_human` | true | If false, only vs-bot mode is available. |

Read once at server startup, refreshed every 60s in a singleton service (`apps/econblog/src/server/pricewar/feature-flags.ts`).

---

## 10. Scaling Plan: 10k → 100k Users

### Baseline assumption

At launch: ~100 DAU, ~10 concurrent matches. The single Railway service handles this trivially.

### The math

For Blitz mode (10 min wall clock), each user plays ~2 matches/hour at peak engagement. With 10k DAU:

- Peak concurrent matches: 10k × 0.1 (10% concurrently in-match) × 0.5 (Blitz fraction) = **500 concurrent Blitz matches**.
- SSE connections: 2 × 500 = **1000 long-lived HTTP connections**.
- Submit rate: 500 matches × 8 rounds / 10 min × 2 players = ~13 submits/sec sustained.
- Engine resolutions: 500 × 8 / (10 × 60) = ~7 resolutions/sec sustained.
- Coach LLM calls: 500 matches × (coach rate ≈ 1) × 0.4 (paid fraction) = 200 calls in 10 min = **0.33 calls/sec sustained** — well within rate limits.

At 100k DAU: 10× the above. **5000 concurrent matches, 10k SSE connections, 130 submits/sec.**

### Bottleneck order (the first thing that breaks)

1. **Railway service CPU during engine resolution at burst.** Engine math is light (microseconds per resolution), but 130 resolutions/sec with submit-handler overhead is noticeable. **Trigger to react: p95 request latency > 500ms.**
2. **Supabase Postgres connection pool exhaustion.** Default Supabase Pro is 60 direct + 200 pooler. SSE handlers should NOT hold a connection long-lived. **Mitigation: use Supabase's pgBouncer connection pooler URL (already in `.env.example` as `DIRECT_URL` vs pooler URL).**
3. **In-memory SSE EventEmitter on a single instance.** Horizontal scaling to N Railway instances means a player connected to instance 2 doesn't get events emitted on instance 1. **Mitigation: swap in Postgres `LISTEN/NOTIFY` (documented seam in §6.4).** Trigger: 2nd Railway instance comes online.
4. **OpenRouter rate limits / cost.** At 100k DAU, ~3300 coach calls/sec across the platform. **Mitigation: aggressive caching (same match never re-LLM'd), per-user daily caps, global daily caps.** If we hit cost ceilings, downgrade to template fallback for that day (feature flag).

### Scaling actions by trigger

| Trigger | Action | Estimated effort |
|---|---|---|
| p95 latency > 500ms on submit | Horizontal scale Railway to 2 instances; activate Postgres LISTEN/NOTIFY for SSE | 1 week |
| 60 DB connections in use | Switch app to pooler URL exclusively, double-check no long-lived holds | 1 day |
| LLM spend > $150/day | Lower per-user daily cap from $5 → $2 via env var | 1 hour |
| LLM spend trending toward $200/day cap | Globally flip `enable_coach_llm` off until reviewed; users get templates | 5 min via admin UI |
| Coffee Shop matchmaking queue >60s on average | Tighten bot-fallback default to 30s; widen rating bands faster | 1 day |
| 1k+ concurrent SSE connections per instance | Set Railway memory ≥ 1GB, add instance #3, monitor | 1 day |
| Match resolution slow (>200ms in engine) | Profile; likely a bot heuristic is N²; cap lookahead depth | 1–3 days |

### What does NOT need scaling action in v1

- Coffee Shop scenario state size — under 5KB JSONB per match. 5000 concurrent matches = 25MB live state. Nothing.
- Move catalog — read-once-and-cached at server boot. Static.
- Rating computation — O(1) per match.

### Splitting engine into a separate Railway service

**Original audit recommendation was to keep single service v1.** We confirmed (decision Q1) to ship as a single Next.js service for v1. The trigger to split:

- Engine resolution average > 100ms (currently expected ~10–30ms).
- *AND* engine resolution is on the request thread (which it is in our v1 architecture).
- *AND* p95 request latency for non-game routes (e.g. `/lessons/*`) is being affected.

If all three are true: create a `services/pricewar-resolver` Node service. The Next.js app sends `{ state, submittedA, submittedB }` to it; gets `{ nextState, events, report }` back. The engine package is already pure, so this split is mechanical, not architectural. Estimated effort: 1 week including deploy pipeline.

**Don't pre-optimize for this.** Build single-service v1 and instrument.

### Observability essentials

For 10k+ DAU you need:

- **Sentry** (already wired in `econblog/package.json`? — verify; if not, add). Tracks errors, slow transactions.
- **Custom metrics endpoint** at `/api/pricewar/metrics` returning Prometheus-format counters: submits/sec, resolutions/sec, SSE connections, LLM spend today. Scrape from a Railway sidecar or cron.
- **Engine trace sampling.** 1% of matches get their full event log stored beyond the standard 30 days for long-term debugging.

---

## 11. Future-Proofing: Adding New Modes, Scenarios, Games

This section is the "how does the codebase grow without you having to re-read this whole document" answer to your prompt's "rem maybe also a list of skills we should add so agents working on this codebase can do their work."

### 11.1 Adding a new play mode

E.g. "Bullet 1+0" or "Daily 7d/round."

**Files touched:** 1 (`packages/pricewar-engine/src/play-modes/registry.ts`).

```ts
// Add an entry
{
  id: "bullet",
  label: "Bullet 1+0",
  shortLabel: "1 min",
  clock: { kind: "chess", perPlayerMs: 60 * 1000 },
  affectsRating: true,
  availableToTiers: ["paid"],                    // start paid-only for testing
  inactivityForfeitAfterRounds: 1,               // strict
  inactivityForfeitOnZeroMoves: 2,
  matchStartGraceMs: 30 * 1000,
  reducedKOnTimeoutForfeit: true,
}
```

Then:

1. Add a translation entry in matchmaking UI labels.
2. Run `pnpm test` — registry consumers should keep passing.
3. Ship.

That's it. The matchmaking UI dynamically reads `PLAY_MODES`. Existing screens render the new mode automatically with the locked/unlocked pill based on user tier.

### 11.2 Adding a new scenario (e.g. "Bakery War")

A new scenario for the Price War engine — same 6 domains, same pipeline, different starting state and balancing.

**Files added:**

- `packages/pricewar-engine/src/scenarios/bakery/index.ts`
- `packages/pricewar-engine/src/scenarios/bakery/balancing.ts`
- `packages/pricewar-engine/src/scenarios/bakery/seed-data.ts`

**Catalog updates:** the bakery scenario may share moves with Coffee Shop. Re-use existing `MoveDefinition` rows by appending `"bakery"` to their `scenarios:` array. Net-new moves get net-new catalog rows.

**Effort:** ~3–5 days for scenario design + balancing + test fixtures + UI strings.

### 11.3 Adding a new move to an existing scenario

E.g. "Loyalty program."

**Files added:**

- `packages/pricewar-engine/src/moves/handlers/marketing.loyalty-program.ts` — the pure handler function.

**Files edited:**

- `packages/pricewar-engine/src/moves/catalog.ts` — add catalog entry.
- `packages/pricewar-engine/src/moves/handlers/index.ts` — add registry entry.
- `packages/pricewar-engine/test/moves.test.ts` — add test cases.

**Bump:** engine `version.ts` minor (e.g. 0.1.0 → 0.2.0).

**Effort:** 20 minutes to several hours depending on move complexity.

### 11.4 Adding an entire new game (e.g. "Wordle for Econ")

When you add a fundamentally different game (not a Price War scenario), it gets its own packages:

```
packages/
├── pricewar-types/
├── pricewar-engine/
├── econwordle-types/         # NEW
├── econwordle-engine/        # NEW
└── (shared/lib-game-core/)   # OPTIONAL — extract only when 2+ games actually share code
```

**Reuse decisions** when adding the 2nd game:

- **Rating math** — extract `packages/shared-rating/` if and only if Wordle uses Elo too (it might use simpler streak-based ranking; defer extraction).
- **Player view filter pattern** — Wordle has different hidden-info semantics; don't share.
- **UI shell (header strip, layouts)** — extract a `packages/shared-game-ui/` if and only if Wordle wants the same persistent strip (likely no — Wordle has different cadence). Defer.
- **Lesson cross-linking** — both games should link to lessons; this is just `/lessons/[slug]` URLs, no extraction needed.

**Resist the temptation to extract a shared core too early.** Build the 2nd game, see where the actual duplication is, then refactor.

The Next.js app gets a new route group: `apps/econblog/src/app/(econwordle)/`. The admin section grows a tab. The marketing landing page gains a "Games" section showcasing both. The leaderboard gains a game-picker.

### 11.5 Adding a new play surface to an existing game

E.g. "Price War Tournament Mode" (bracket-style 8-player elimination over a weekend).

This is a **layer above the engine**, not a new game or scenario. It lives in `apps/econblog/src/server/pricewar/tournaments/` and uses the standard match resolution flow. No engine changes.

**Effort:** 1–2 weeks for v1 tournament infrastructure.

### 11.6 Removing things

Code is easier to add than remove. Establish a sunset process:

- Mark `PlayModeConfig.availableToTiers = []` to hide a mode without breaking old matches that use it.
- Mark `MoveDefinition.scenarios = []` (or remove the scenario) to retire a move; old matches that used it still replay because handlers stay in the registry.
- Engine major version bump only if pipeline order changes.

---

## 12. Agent Skills

You asked specifically for "a list of skills we should add so agents working on this codebase can do their work." This section catalogs the skills to ship in `.cursor/skills/pricewar/`. Each skill follows the format in `/Users/denniswilmot/.cursor/skills-cursor/create-skill/SKILL.md`.

### Skills to create

| Skill ID | File | Trigger | What it does |
|---|---|---|---|
| `pricewar-add-move` | `.cursor/skills/pricewar/add-move/SKILL.md` | "add a new move to The Price War," "add a Coffee Shop move," "new move catalog entry" | Walks through: (1) define `MoveDefinition` in catalog.ts; (2) create handler in `handlers/<domain>.<id>.ts`; (3) register in handlers/index.ts; (4) write unit test; (5) verify with `pnpm test`. |
| `pricewar-add-scenario` | `.cursor/skills/pricewar/add-scenario/SKILL.md` | "add a new scenario to The Price War," "build a Bakery War scenario" | Walks through: (1) scaffold `scenarios/<id>/` folder; (2) write balancing.ts; (3) write seed-data.ts; (4) update move catalog with new scenario IDs; (5) write golden fixture test. |
| `pricewar-add-play-mode` | `.cursor/skills/pricewar/add-play-mode/SKILL.md` | "add a new play mode," "add Bullet mode," "register a play mode" | Walks through editing `play-modes/registry.ts`, validating the `PlayModeConfig` shape, ensuring the matchmaking UI picks it up dynamically. |
| `pricewar-add-bot-persona` | `.cursor/skills/pricewar/add-bot-persona/SKILL.md` | "add a new bot persona," "create a Price War bot" | Walks through: (1) create `bots/personas/<id>.ts` with `BotPersonality`; (2) register; (3) tune `chooseMoves`; (4) write smoke test. |
| `pricewar-debug-match` | `.cursor/skills/pricewar/debug-match/SKILL.md` | "debug Price War match," "this match looks broken," "explain what happened in match X" | Walks through: (1) open `/admin/pricewar/matches/[id]`; (2) read engine trace; (3) check filtered views for both players; (4) run CLI replay if needed; (5) write a regression test. |
| `pricewar-balance-tweak` | `.cursor/skills/pricewar/balance-tweak/SKILL.md` | "rebalance Coffee Shop," "adjust Price War economics," "the demand model feels off" | Walks through: (1) bump scenario version; (2) edit balancing.ts constants; (3) re-run golden fixtures; (4) update fixtures if intentional; (5) note migration impact on in-flight matches. |
| `pricewar-add-screen` | `.cursor/skills/pricewar/add-screen/SKILL.md` | "add a new Price War UI screen," "add a game screen for X" | Walks through: (1) decide route under `(game)/`; (2) reuse `MatchHeaderStrip`; (3) use existing primitives from `components/ui/`; (4) wire React Query hooks; (5) handle reduced-motion. |
| `pricewar-add-game` | `.cursor/skills/pricewar/add-game/SKILL.md` | "add a new Adams Axioms game," "build the Wordle for econ game," "add a second game to the platform" | Walks through: (1) create `packages/<game>-types` + `packages/<game>-engine`; (2) decide what to share with pricewar packages (default: nothing initially); (3) add route group `(game-id)`; (4) add admin tab; (5) update landing page Games section. |
| `pricewar-add-api-route` | `.cursor/skills/pricewar/add-api-route/SKILL.md` | "add a Price War API route," "expose a new endpoint" | Walks through: (1) place under `api/pricewar/`; (2) wrap with auth + rate-limit middleware; (3) use generic error envelope; (4) go through repository.ts for DB; (5) add admin variant if relevant. |
| `pricewar-write-golden-test` | `.cursor/skills/pricewar/write-golden-test/SKILL.md` | "add a golden test," "snapshot a match for regression" | Walks through writing a deterministic 8-round match fixture as a test, capturing expected output, and using it as a regression guard. |

### Skills NOT to create (anti-patterns)

- A "pricewar-modify-engine-pipeline" skill — pipeline order is locked. If you think you need to reorder, escalate, don't skill it.
- A "pricewar-skip-tests" skill — no.
- A "pricewar-add-feature-flag" skill — feature flags are a 1-line DB insert; doesn't need a skill.

### Skill file format

Each skill file follows the format in `/Users/denniswilmot/.cursor/skills-cursor/create-skill/SKILL.md`. Briefly: `description`, when-to-trigger conditions, step-by-step actions with file paths, verification commands. Reference the existing skills under `/Users/denniswilmot/.cursor/skills-cursor/` for examples.

---

## 13. User Stories and Test Cases

### Test credentials matrix

These are seeded by `apps/econblog/scripts/seed-pricewar.ts` (also referenced in §7 Seeds). The script creates accounts in Supabase with predictable IDs and known passwords for local/staging only.

| Account | Email | Password | Tier | Notes |
|---|---|---|---|---|
| Test Admin | `admin+test@adamsaxion.dev` | `TestAdmin123!` | Paid + admin (in `ADMIN_EMAILS`) | Full access. Used for admin route tests. |
| Free Alice | `alice+test@adamsaxion.dev` | `TestAlice123!` | Free | Used for free-tier gating tests. |
| Free Bob | `bob+test@adamsaxion.dev` | `TestBob123!` | Free | Free player matched against Alice for free-vs-free tests. |
| Paid Carol | `carol+test@adamsaxion.dev` | `TestCarol123!` | Paid | Used for paid-tier feature tests, Rating tests. |
| Paid Dan | `dan+test@adamsaxion.dev` | `TestDan123!` | Paid | Paid player matched against Carol for rated matches. |

**For production tests:** use a separate Supabase project (`adams-axiom-staging`) with the same seeded accounts. Never seed test accounts into production.

### User stories

Each story has format: **As a [persona], I want [goal] so that [reason].** Followed by acceptance criteria and named test cases.

---

#### Story 1 — Free user starts a Blitz match against a human

**As** Alice (free user)
**I want** to start a 5-minute Blitz match against another human player
**So that** I can experience the game without paying

**Acceptance criteria:**

- Alice can enter the Blitz queue.
- She is matched with Bob (also free) within 60s OR is offered the bot-fallback option.
- The match starts at the briefing screen.
- Neither Alice nor Bob has a Rating shown (free tier).
- Match completes and both see the post-match screen with template (not LLM) coach.

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-1.1 | Sign in as Alice; click "Play"; choose Coffee Shop + Blitz + Human; click "Find match" | Queue page loads, status "Searching for opponent…" | alice+test |
| TC-1.2 | In parallel, sign in as Bob in second browser; same flow | Both queue pages transition to "Match found! Starting…" within 5s of second enqueue | alice+test, bob+test |
| TC-1.3 | Briefing screen loads for both | No Rating shown anywhere; "Unrated match" badge visible | alice+test, bob+test |
| TC-1.4 | Both play through 8 rounds | Match completes; both see post-match | alice+test, bob+test |
| TC-1.5 | Inspect post-match for Alice | Coach narrative is template-rendered (no LLM call); "Upgrade for personalized coaching" CTA visible | alice+test |
| TC-1.6 | Inspect `pricewar.match_coach_reports` row for this match-user pair | `generated_by = "template"`, `cost_usd = "0"` | DB |

---

#### Story 2 — Paid user plays a Rapid match against a human

**As** Carol (paid user)
**I want** to play a Rapid (15-minute) match with rated Elo
**So that** I can climb the leaderboard

**Acceptance criteria:**

- Carol sees Rapid as available (not locked).
- Match is rated; Rating delta shown post-match.
- Coach LLM narrative generated post-match.
- Match shows up in Carol's history with rating-delta indicator.

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-2.1 | Sign in as Carol; choose Coffee Shop + Rapid + Human | Rapid is selectable (no lock icon) | carol+test |
| TC-2.2 | Sign in as Dan; same flow; both queue | Match found within 60s | carol+test, dan+test |
| TC-2.3 | Briefing shows Rating for both players | Carol Rating: 1200 (starting); Dan Rating: 1200 | carol+test, dan+test |
| TC-2.4 | Play through to completion (Carol wins) | Post-match shows Rating delta (e.g. Carol +18, Dan -18) | carol+test, dan+test |
| TC-2.5 | Inspect `pricewar.match_coach_reports` for Carol | `generated_by = "llm"`, `cost_usd > 0`, `model = "openai/gpt-4o-mini"` | DB |
| TC-2.6 | Hit `/api/pricewar/rating/coffee-shop` as Carol | Returns Rapid rating object showing 1218 | carol+test |

---

#### Story 3 — Free user attempts Rapid mode

**As** Alice (free user)
**I want** to be clearly informed that Rapid requires an upgrade and have a path to subscribe

**Acceptance criteria:**

- Rapid card shows a lock icon and "Paid only" badge.
- Clicking Rapid opens an upgrade prompt.
- The prompt links to existing `/subscribe`.

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-3.1 | Alice on setup screen | Rapid card has lock + "Paid" badge | alice+test |
| TC-3.2 | Alice clicks Rapid card | Dialog opens: "Rapid 15+0 requires a paid account" + "Upgrade" CTA | alice+test |
| TC-3.3 | Alice clicks Upgrade | Browser navigates to `/subscribe` | alice+test |

---

#### Story 4 — Free user attempts second concurrent match

**As** Alice (free)
**I want** to be informed I can only have one match at a time and shown the upgrade path

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-4.1 | Alice has 1 in-progress match against Bob | Lobby shows "Continue current match" for that row | alice+test |
| TC-4.2 | Alice clicks "New match" | Dialog: "You have 1 match in progress. Upgrade for up to 5 concurrent matches." | alice+test |
| TC-4.3 | API call `POST /api/pricewar/match` directly | 403 with `{ code: "FORBIDDEN", message: "You already have a match in progress. Upgrade to play multiple matches concurrently." }` | alice+test |

---

#### Story 5 — User plays a vs-bot match

**As** Carol (paid)
**I want** to play against a specific bot persona for practice
**So that** I can train without risking Rating

**Acceptance criteria:**

- Vs-bot match is unrated (Rating not affected).
- Bot persona selectable.
- Bot makes moves within the same clock as a human would.

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-5.1 | Carol picks Coffee Shop + Blitz + "Bot: Maya Chen (Tier 2)" | Match created immediately, no queue | carol+test |
| TC-5.2 | Match runs through 8 rounds | Bot submits within ~5s on each round | carol+test |
| TC-5.3 | Match completes | Carol's Rating unchanged (vs-bot = unrated) | carol+test |
| TC-5.4 | Inspect match row in DB | `matchPlayers.B.isBot = true`, `botPersonalityId = 'bot.budget'` | DB |

---

#### Story 6 — User completes the tutorial

**As** Alice (free, first-time)
**I want** to be guided through a tutorial match so I understand the game
**So that** I'm not lost on my first real match

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-6.1 | Alice clicks "Tutorial" from lobby | Tutorial route loads with narration overlay | alice+test |
| TC-6.2 | Tutorial bot plays scripted moves | Each round resolves as designed; narrative explains | alice+test |
| TC-6.3 | Tutorial completes | Alice has earned the "First Tutorial" achievement (or XP grant); tutorial can be replayed but no longer awards XP | alice+test |

---

#### Story 7 — Player runs out of time on first round

**As** Carol (paid)
**I want** my round to auto-pass and be allowed to continue if I run out of time once
**So that** a wifi blip doesn't end my match

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-7.1 | Carol in Blitz match vs Dan; her clock hits 0 on round 3 with no draft | Round 3 auto-passes for Carol (empty moves); match continues; Carol sees "Round 3 auto-passed — out of time" banner | carol+test, dan+test |
| TC-7.2 | Match continues to round 4; Dan still has time | Round 4 plays normally | carol+test, dan+test |
| TC-7.3 | Carol runs out of time again on round 5 | Match ends; Dan wins by `forfeit_on_timeout`; Carol Rating drops by reduced K (e.g. -9 instead of -18) | carol+test, dan+test |

---

#### Story 8 — Player tries to cheat by manipulating client state

**As** an attacker
**When** I modify the JS client state to claim I have more cash than I do
**Then** the server rejects my move because it validates against canonical state

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-8.1 | Using browser devtools, mutate the `PlayerView` cash to $999999, then submit a $999000 marketing move | API returns `{ code: "INSUFFICIENT_RESOURCES", message: "Move rejected." }`; match state unchanged in DB | alice+test |
| TC-8.2 | Send a hand-crafted POST to `/api/pricewar/match/[id]/submit` with another user's matchId | API returns 403 with generic envelope | alice+test, with Bob's matchId |
| TC-8.3 | Send POST `/rest/v1/pricewar.match` directly to Supabase (PostgREST) | 404 or 406 — pricewar schema not exposed | any |

---

#### Story 9 — Admin debugs a confused match

**As** Test Admin
**When** a user reports "my match is broken"
**Then** I can view full engine trace, filtered views, and replay the match

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-9.1 | Admin navigates to `/admin/pricewar/matches/[id]` | Match deep-dive page loads | admin+test |
| TC-9.2 | Open "Engine trace" tab | Full ordered EngineEvent log visible, filterable | admin+test |
| TC-9.3 | Open "State-at-round 3" view | Both Alice's and Bob's filtered views render side-by-side; Bob's view does NOT show Alice's cash | admin+test |
| TC-9.4 | Run `pnpm pricewar:replay <matchId>` in terminal | Diff between stored result and re-resolved result printed; should be empty diff for same engineVersion | admin+test |
| TC-9.5 | Click "Void match" | Match marked voided; both players' ratings reverted; XP refunded | admin+test |

---

#### Story 10 — Admin monitors LLM costs

**As** Test Admin
**I want** to see LLM spend so I can detect runaway costs

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-10.1 | Navigate to `/admin/pricewar/costs` | Dashboard shows today's spend, per-user breakdown, per-feature breakdown | admin+test |
| TC-10.2 | Verify single match's coach call shows up | Row with `feature = "coach"`, `cost_usd > 0` | admin+test |
| TC-10.3 | Set `PRICEWAR_COACH_GLOBAL_DAILY_USD=0.01` in env, restart server, play a paid Carol match through to coach generation | Coach falls back to template; banner on post-match shows "AI coaching paused for today" | admin+test, carol+test |

---

#### Story 11 — Player abandons match

**As** Dan
**If** I close my browser mid-match and never return
**Then** Carol eventually gets a forfeit win

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-11.1 | Carol and Dan start a Blitz match; Dan closes browser before submitting round 2 | Dan's clock ticks down; Carol's SSE stream eventually shows "opponent_disconnected" event | carol+test, dan+test |
| TC-11.2 | After Dan's clock fully expires, then 60s grace pass | Match ends; Carol wins via `forfeit_on_abandonment` | carol+test, dan+test |
| TC-11.3 | Dan's history shows the lost match with abandonment reason | Visible in `/play/history` | dan+test |

---

#### Story 12 — Race condition: both players submit at exactly the same moment

**As** the system
**When** both Carol and Dan submit within 50ms of each other
**Then** exactly one round resolution happens, both see consistent results

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-12.1 | Simulated load test: 10 concurrent submits per match across 10 matches | Each match has exactly 1 round resolution; no duplicate `round_reports` rows; no errors | various |
| TC-12.2 | Inspect SSE event delivery | Both players received exactly one `round_resolved` event for the contested round | various |

---

#### Story 13 — User completes match, post-match recommendations link to existing lessons

**As** Carol
**I want** the coach to recommend specific lessons I can take to improve

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-13.1 | Carol finishes a Coffee Shop match | Post-match screen shows "Recommended lessons" Card with 2–3 lesson titles | carol+test |
| TC-13.2 | Click a recommended lesson | Browser navigates to `/lessons/<slug>` (existing route) | carol+test |
| TC-13.3 | Inspect `pricewar.match_coach_reports.payload.recommendedLessonSlugs` | Slugs are valid (exist in `lessons` table) | DB |

---

#### Story 14 — Rate-limited submit

**As** an attacker
**If** I send 100 submits/sec to the submit endpoint
**Then** I'm rate-limited

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-14.1 | Script 50 submits in 1 second to `/api/pricewar/match/[id]/submit` | First 1 succeeds, remaining 49 return 429 `{ code: "RATE_LIMITED" }` | alice+test |
| TC-14.2 | Script 11 match-creation calls in 1 hour | 11th returns 429 | alice+test |

---

#### Story 15 — Engine determinism

**As** an engineer
**When** I run the engine on the same input twice
**Then** the output is byte-identical

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-15.1 | `pnpm test -t "engine determinism"` | 100 invocations of `resolveTurn` with the same input produce identical output | N/A |
| TC-15.2 | Replay a 30-day-old match with `pricewar:replay` | Output matches stored result exactly | admin+test |

---

#### Story 16 — Bot persona transparency toggle

**As** a developer or admin
**When** I set `NEXT_PUBLIC_BOT_TRANSPARENT=true`
**Then** UI labels bots as bots; otherwise they show as humans

**Test cases:**

| TC | Steps | Expected | Credentials |
|---|---|---|---|
| TC-16.1 | With env flag off, Alice plays vs-bot | Opponent shows as "Maya Chen" with no bot indicator | alice+test |
| TC-16.2 | Set flag on, restart, replay scenario | Opponent shows as "Bot · Maya Chen (Tier 2)" | alice+test |

---

### Test infrastructure

- **Unit tests** in `packages/pricewar-engine/test/` — Vitest.
- **Integration tests** in `apps/econblog/test/pricewar/` — Vitest + a test DB connection (separate Supabase staging project).
- **E2E tests** in `apps/econblog/e2e/pricewar/` — Playwright. Run against staging deployment.
- **Load test** in `tooling/load-tests/pricewar/` — k6 scripts targeting the staging Railway service.

CI workflow: `unit → integration → build → e2e`. Unit and integration must pass for any PR. E2E runs against staging post-merge.

---

## 14. Parallel Execution Plan

This section answers your specific request: "outline in another section which sections can be executed by subagents in parallel."

### Dependency graph

```
Phase 0: Repo restructure  (MUST be first; everything depends on it)
                │
                ▼
        ┌───────┴───────┐
        ▼               ▼
Phase 1A: Types     Phase 1B: DB schema scaffold
        │               │
        ▼               ▼
        └───────┬───────┘
                ▼
        ┌───────┼───────┬─────────┬──────────┐
        ▼       ▼       ▼         ▼          ▼
   Phase 2A   Phase 2B  Phase 2C  Phase 2D   Phase 2E
   Engine     Server    UI        Bots       Coach
   internals  routes    screens   personas   prompts
        │       │       │         │          │
        └───────┴───────┴─────────┴──────────┘
                        ▼
                Phase 3: Integration + tests
                        ▼
                Phase 4: Admin tools
                        ▼
                Phase 5: Launch hardening
```

### What CAN'T be parallelized

- **Phase 0 (repo restructure)** — single-threaded. Touches root configs, breaks everything until done.
- **Phase 1A (types)** — single-threaded for v1. All packages depend on types. Run alone, ship, move on.
- **Phase 3 (integration)** — by definition, gathers all work. Single coordinator.
- **Phase 5 (launch hardening)** — single coordinator, multiple workers OK on specific bugs.

### What CAN be parallelized (concrete subagent assignment)

**Phase 1B (DB schema scaffold)** runs in parallel with **Phase 1A (types)** because they don't depend on each other's contents:

- Subagent X: writes Drizzle schema following §7 spec.
- Subagent Y: writes type definitions following §4 spec.

After both finish, **Phase 2** has 5 parallel tracks:

#### Phase 2A — Engine internals
**Subagent assignment:** 1 senior agent.
**Files:** all of `packages/pricewar-engine/src/engine/*`, `moves/*`, `scenarios/coffee-shop/*`, `visibility/*`, `rng/*`, `rating/*`.
**Dependencies:** types (Phase 1A).
**Outputs:** working engine + tests.
**Estimated:** 3–5 days for a strong agent.

#### Phase 2B — Server routes
**Subagent assignment:** 1 mid agent.
**Files:** all of `apps/econblog/src/app/api/pricewar/*`, `apps/econblog/src/server/pricewar/*`.
**Dependencies:** types (Phase 1A), DB schema (Phase 1B). Engine can be stubbed for first cut.
**Outputs:** API surface + repository + matchmaker + SSE skeleton.
**Estimated:** 4–6 days.

#### Phase 2C — UI screens
**Subagent assignment:** 1–2 mid agents.
**Files:** all of `apps/econblog/src/app/(game)/*`, `apps/econblog/src/components/pricewar/*`, `apps/econblog/src/client/pricewar/*`.
**Dependencies:** types (Phase 1A) only — UI works against types, API mocked with MSW or static JSON for first cut.
**Outputs:** all 23 wireframe screens rendered.
**Estimated:** 7–10 days for a single agent; 4–6 days if split into 2 agents (one for Decide/Review/Report, one for Lobby/Matchmaking/Post-match/Edge states).

#### Phase 2D — Bot personas
**Subagent assignment:** 1 mid agent.
**Files:** `packages/pricewar-engine/src/bots/*`.
**Dependencies:** engine pipeline shape (Phase 2A skeleton).
**Outputs:** 7 bot personas + scripted tutorial bot.
**Estimated:** 2–3 days for first cut, more for balancing later.

#### Phase 2E — Coach prompts + module
**Subagent assignment:** 1 mid agent.
**Files:** `packages/pricewar-engine/src/coach/extract-facts.ts`, `apps/econblog/src/server/pricewar/coach.ts`, prompt files.
**Dependencies:** engine event shape (Phase 2A skeleton).
**Outputs:** coach pipeline with template fallback + LLM path.
**Estimated:** 2–3 days.

### Parallelizable late-phase work

After Phase 3 (integration) completes, **Phase 4 (admin tooling)** has 4 parallel tracks:

- **4A:** Match list + deep-dive (matches/[id] page).
- **4B:** Move catalog analytics page.
- **4C:** Player debug + flag UI.
- **4D:** LLM cost dashboard + CLI replay.

Each is independent and uses the same admin layout.

### Coordination protocol for parallel agents

1. **One PR per phase track.** No agent should commit to another's files. Use `git worktree` or branch-per-subagent.
2. **Shared interface contract = the types package.** If an agent needs to change a type, that's a 1-day pause + revoke and re-run for downstream agents. Minimize type churn after Phase 1A.
3. **CI runs on every PR.** Unit + integration + lint.
4. **Daily sync** (or sub-agent equivalent) for shared decisions: balance tuning, UI copy, bot persona names.
5. **Mock APIs for UI agents.** While server routes are being written, UI agent uses MSW fixtures matching the type definitions. Swap to real API in Phase 3.
6. **Phase gate before integration.** Each track produces an acceptance demo before Phase 3 starts: engine passes goldens, server passes integration tests, UI renders all screens against mocks, bots play 100 self-play matches without crashing, coach produces output for a fixture match.

### Solo execution

If you're solo: roughly halve the parallel scope; do Phase 1 fully, then Phase 2 in serial preferred order: 2A (engine) → 2B (server) → 2C (UI) → 2D (bots) → 2E (coach). This is also fine and produces the same result, just slower.

---

## 15. Phased Build Plan

This section is the executable playbook. Each phase has clear entry criteria, exit criteria, and a list of deliverables. Numbered tasks within phases can mostly be done in any order unless explicitly sequenced.

### Phase 0 — Repo restructure (PREREQUISITE)
**Owner:** 1 senior agent. Single-threaded.
**Duration:** 1–2 days.
**Entry criteria:** branch off main; CI green.
**Exit criteria:** all of §3 acceptance criteria met.

Tasks:
1. Fix `/pnpm-workspace.yaml`.
2. Move `econblog/` → `apps/econblog/`.
3. Create `tsconfig.base.json`.
4. Scaffold `packages/pricewar-types/` + `packages/pricewar-engine/`.
5. Add `transpilePackages` to Next config.
6. Set up ESLint cross-package rules.
7. Verify `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test` all work.
8. Update root README to describe the new shape.

### Phase 1 — Types + DB skeleton
**Owner:** Parallel: 2 agents.
**Duration:** 3–5 days.
**Entry criteria:** Phase 0 complete.
**Exit criteria:** types compile across packages; DB migrations applied to staging.

Tasks (Track A, types):
1. Write every file in §4.
2. Add barrel export.
3. Verify `pnpm -F @adamsaxion/pricewar-types typecheck` passes.
4. Verify cross-package import from `econblog` and `pricewar-engine` resolves.

Tasks (Track B, DB):
1. Write `apps/econblog/src/db/schema/pricewar.ts` per §7.
2. Update `apps/econblog/src/db/index.ts` to load both schemas.
3. Update `apps/econblog/drizzle.config.ts` schema path.
4. Generate migration files (`drizzle-kit generate`).
5. Apply to staging Supabase project.
6. Disable PostgREST exposure for `pricewar` schema in Supabase dashboard.
7. Verify direct REST call returns 404.
8. Write seed script per §13 test credentials.

### Phase 2 — Parallel build (engine, server, UI, bots, coach)
**Owner:** Parallel: 5 tracks (see §14).
**Duration:** 5–10 days depending on parallelism.
**Entry criteria:** Phase 1 complete.
**Exit criteria:** each track passes its acceptance criteria.

See §14 for per-track tasks.

### Phase 3 — Integration
**Owner:** 1 senior agent coordinating.
**Duration:** 3–5 days.
**Entry criteria:** all Phase 2 tracks merged.
**Exit criteria:** full happy-path Story 1 (free Blitz vs human) and Story 2 (paid Rapid vs human) work end-to-end in staging.

Tasks:
1. Wire UI to real APIs (swap MSW for fetch).
2. Wire engine to real submit pipeline.
3. Wire SSE end-to-end.
4. Run integration test suite (Stories 1, 2, 5, 7).
5. Smoke-test in staging with two browsers.
6. Fix bugs.
7. Verify all acceptance criteria across §§3–9.

### Phase 4 — Admin tooling
**Owner:** Parallel: 2–4 agents.
**Duration:** 4–6 days.
**Entry criteria:** Phase 3 complete.
**Exit criteria:** all admin debug stories (9, 10) pass.

See §14 for per-track tasks.

### Phase 5 — Launch hardening
**Owner:** 1 senior agent + bug-fix support.
**Duration:** 4–7 days.
**Entry criteria:** Phase 4 complete.
**Exit criteria:** load test at 100 concurrent users passes; observability green; rollout plan signed off.

Tasks:
1. Run k6 load test at 100 → 500 concurrent users.
2. Tune connection pool, rate limits, bot fallback timing.
3. Verify Sentry capturing errors.
4. Verify metrics endpoint working.
5. Write runbook for: void match, recompute rating, flush stuck queue, reduce coach cap.
6. Soft launch behind `enable_pricewar=false` feature flag to a small alpha group.
7. Watch for 48h. Fix blockers.
8. Flip flag to true for all paid users (gated rollout).
9. After 1 week, open to free users.

### Phase 6 (post-launch v1.1) — Casual mode + push notifications
**Duration:** 2–3 weeks post-launch.

Tasks:
1. Add Casual play mode to registry.
2. Build push notification infra (web-push library + Supabase webhooks).
3. Build email reminder cron.
4. Implement Casual round-timer cron.
5. UI changes for async match list ("Your turn" badges).

---

## 16. Phase Test Gates

This section defines the **end-of-phase test gates**. Each phase must pass its gate before the next phase starts. The gate is a binary go/no-go: every checkbox passes, or the phase is not done. Agents finishing a phase run this checklist; reviewers verify it.

### 16.0 Test taxonomy

Eight kinds of tests exist; not every phase needs every kind. The matrix at the top of each phase tells you which apply.

| Kind | What it tests | Tool | When to run |
|---|---|---|---|
| **Smoke** | "Does the basic stuff still work?" | manual + `pnpm dev` / `pnpm build` | Every phase |
| **Unit** | One function, no I/O | Vitest | Engine, server util, components with logic |
| **Integration** | Module + DB / module + module | Vitest + test DB | Server routes, repository, matchmaker |
| **Component (UI)** | One React component, mocked deps | Vitest + React Testing Library | Phase 2C, Phase 4 |
| **API contract** | Request/response shapes, status codes, headers | Vitest or Playwright API | Phase 2B onwards |
| **E2E / Intent** | Real user journey across browser + server | Playwright | Phase 3 onwards |
| **Property / Fuzz** | Invariants hold across many random inputs | Vitest + `fast-check` | Engine (visibility, determinism) |
| **Load** | Behavior under concurrency | k6 | Phase 5 only |

**Intent testing** is the same as **E2E user-story testing**: take a user story from §13, execute it in a browser against staging, assert the outcome. We do intent testing in Phase 3 (basic stories) and Phase 5 (full sweep). We do not invest in intent testing for Phases 0–2 because the units aren't integrated yet.

### 16.1 What we always check across every phase

These are the universal gates. Every phase must pass them, in addition to phase-specific gates.

1. **Existing app regressions.** `apps/econblog` still passes its existing flows (sign-in, lessons/lesson-zero, subscribe page, leaderboard, profile, admin lesson generation). No new commit should break the lessons product. Manual checklist + screenshot diff acceptable. Test credentials: any seeded test user from §13.
2. **No leakage of build artifacts.** `git status` shows no `.next/`, `node_modules/`, or `.pnpm-store/` accidentally staged.
3. **CI green.** GitHub Actions: install → lint → typecheck → unit → integration. All green.
4. **No new ESLint violations.** `pnpm lint` exit code 0.
5. **TypeScript strict.** `pnpm typecheck` exit code 0 across every package.
6. **No console errors in dev.** Sign in, load homepage, open game routes — browser console empty (no React warnings, no 404s).
7. **No secret leaks.** `rg -i "supabase.*service" apps/econblog/src` — service role key is never imported in client components. Verified by an audit script.

If any of these fail, the phase gate fails regardless of phase-specific tests.

---

### 16.2 Phase 0 gate — Repo restructure

**Applicable test kinds:** Smoke, Unit (none new), Regression. **NOT applicable:** Load, E2E, API contract, Property.

**Why no API/E2E gate here?** Phase 0 doesn't add features. Its job is "the existing app still works after we moved files." So the gate is heavy on regression + smoke and light on new tests.

#### 16.2.1 Smoke tests

| # | Test | Expected | Fail signal |
|---|---|---|---|
| P0-S1 | `pnpm install` from repo root | Exit 0, lockfile updated, no `peer dep` errors | Workspace not detected, duplicated lockfiles, missing packages |
| P0-S2 | `pnpm -F @adamsaxion/econblog dev` | App boots, no compile errors, port 3000 responds | Build error, "module not found" |
| P0-S3 | `pnpm -F @adamsaxion/econblog build` | Production build succeeds, `.next/` populated | Build error |
| P0-S4 | `pnpm -F @adamsaxion/pricewar-types typecheck` | Exit 0 (empty barrel is OK) | tsc errors |
| P0-S5 | `pnpm -F @adamsaxion/pricewar-engine typecheck` | Exit 0 | tsc errors |
| P0-S6 | `pnpm test` (root) | Vitest runs (zero tests is fine; framework boots) | "vitest not found", config error |

#### 16.2.2 Regression checks on the existing app

Smoke-test every existing route. Test as authenticated user (`alice+test@adamsaxion.dev` / `TestAlice123!`).

| Route | Expected status | Critical observations |
|---|---|---|
| `GET /` | 200 | Landing page renders; Source Serif heading visible |
| `GET /lessons` | 200 | Lesson Zero card visible |
| `GET /lessons/lesson-zero` | 200 | LessonPlayer mounts, sections load |
| `GET /leaderboard` | 200 | Leaderboard table renders |
| `GET /profile` (signed in) | 200 | Profile tabs render |
| `GET /profile` (signed out) | 307 redirect to `/auth` | Existing middleware behavior intact |
| `GET /admin` (signed in as admin) | 200 | Admin page renders |
| `GET /admin` (signed in as non-admin) | 307 redirect | Existing gate intact |
| `POST /api/auth/check-username` with `{"username":"alice"}` | 200, JSON `{ available: false }` | Existing API contract unchanged |
| `POST /api/lessons/lesson-zero/quiz/attempt` | 200 with XP delta | Quiz still records progress |

If any of these break in Phase 0, **the gate fails** — fix before proceeding.

#### 16.2.3 Cross-package import resolution

| Test | Method | Expected |
|---|---|---|
| P0-X1 | Add `import {} from "@adamsaxion/pricewar-types"` to `apps/econblog/src/app/page.tsx` | TypeScript and Next both resolve, no errors. Then revert. |
| P0-X2 | Run ESLint with a known-bad cross-schema import (e.g. `import {match} from "@/db/schema/pricewar"` in a component file) | ESLint fails with our custom restricted-import rule |
| P0-X3 | Run ESLint with a known-bad engine import (e.g. `import {createClient} from "@/lib/supabase/server"` inside `packages/pricewar-engine/src/`) | ESLint fails |

#### 16.2.4 Headers and auth (regression only)

Phase 0 doesn't change auth. We verify nothing was broken.

| Request | Expected response status | Expected response headers |
|---|---|---|
| `GET /profile` without auth cookie | 307 → `/auth?next=/profile` | `Location: /auth?next=/profile` |
| `GET /profile` with valid Supabase auth cookie | 200 | `Set-Cookie: sb-*` may refresh; existing behavior |
| `GET /api/user/dashboard` without auth | 401 (or whatever existing route returns) | Match prior behavior |
| `POST /api/lessons/lesson-zero/quiz/attempt` without `Content-Type: application/json` | 400 or existing behavior | Match prior |

**Capture prior responses to a baseline file (`tooling/baseline/phase0-headers.json`) on a known-good commit, compare post-restructure.**

#### 16.2.5 Phase 0 sign-off checklist

- [ ] All 6 smoke tests pass.
- [ ] All 10 regression routes return expected status.
- [ ] All 3 cross-package import tests pass.
- [ ] Headers/auth behavior matches baseline.
- [ ] §16.1 universal gates pass.
- [ ] PR reviewed and merged.

**Load test?** No. Nothing new to load.
**Intent test?** No. No new user-facing behavior.

---

### 16.3 Phase 1 gate — Types + DB

**Applicable test kinds:** Smoke, Unit (types are compile-time only), Integration (DB migrations), Security (PostgREST disabled). **NOT applicable:** E2E, API contract (no APIs yet), Load.

#### 16.3.1 Smoke tests

| # | Test | Expected | Fail signal |
|---|---|---|---|
| P1-S1 | Types barrel exports all symbols | `tsc --noEmit` from a test importer succeeds importing every type via `@adamsaxion/pricewar-types` | Missing export |
| P1-S2 | Drizzle generate runs | `pnpm -F @adamsaxion/econblog db:generate` produces a numbered SQL migration | Schema doesn't compile |
| P1-S3 | Drizzle introspect | `pnpm -F @adamsaxion/econblog db:push` against staging succeeds | Missing FK, type mismatch |
| P1-S4 | Seed script idempotent | Run `pnpm seed:pricewar` twice, no duplicate rows, no errors | Conflict errors, dup users |

#### 16.3.2 Type structural tests

Light-weight unit tests in `packages/pricewar-types/test/index.test.ts`:

```ts
import { it, expect, assertType } from "vitest";
import type { PlayerView, MatchState } from "../src";

it("PlayerView.opponent does not contain private state keys", () => {
  // assertType-style compile-time check
  type OpponentKeys = keyof PlayerView["opponent"];
  const allowed: OpponentKeys[] = ["slot", "displayName", "currentPrice", "brandTier", "isBot"];
  // If a new private field accidentally landed in opponent, this would fail to compile
  expect(allowed.length).toBeGreaterThan(0);
});

it("MatchState contains required versioning fields", () => {
  type Required = "scenarioVersion" | "engineVersion" | "rngSeed";
  type Has = Required extends keyof MatchState ? true : false;
  const has: Has = true;
  expect(has).toBe(true);
});
```

#### 16.3.3 DB integration tests (against staging Supabase project)

Test credentials: a dedicated Postgres connection string for the staging project, set in CI as `STAGING_DATABASE_URL`. **Never run these against production.**

| # | Test | Expected | Fail signal |
|---|---|---|---|
| P1-DB1 | `SELECT 1 FROM pricewar.match LIMIT 1` (after migration) | Empty result, no schema-not-exist error | "schema pricewar does not exist" |
| P1-DB2 | Insert a fixture match + 2 match_players, query back | Round-trip preserves all JSONB fields | JSON parse error, missing fields |
| P1-DB3 | Insert duplicate `(matchId, round, slot)` into `turn_submissions` | Second insert errors with unique constraint violation | Duplicate row accepted |
| P1-DB4 | Insert duplicate `(matchId, round)` into `round_reports` | Same — unique violation | Duplicate accepted |
| P1-DB5 | Delete a `profiles` row used as FK | Cascade deletes related `pricewar.*` rows | Orphaned rows |
| P1-DB6 | `EXPLAIN ANALYZE SELECT * FROM pricewar.match WHERE phase='decide'` | Uses `match_phase_idx` | Sequential scan on large table |
| P1-DB7 | `EXPLAIN ANALYZE SELECT * FROM pricewar.ratings ORDER BY rating DESC LIMIT 100 WHERE scenarioId='coffee-shop' AND playModeId='blitz'` | Uses `ratings_leaderboard_idx` | Sequential scan |

#### 16.3.4 Security: PostgREST exposure check

**This is the single most important Phase 1 test.** If this fails, hidden information is broken.

| # | Test | Expected | Fail signal |
|---|---|---|---|
| P1-SEC1 | `curl -i "https://<staging>.supabase.co/rest/v1/pricewar.match?select=*" -H "apikey: <anon>"` | HTTP 404 or 406, body mentions schema not exposed | HTTP 200 with rows = CRITICAL FAIL |
| P1-SEC2 | Same with service role key | HTTP 200 (server has full access) — only proves the schema exists at the DB level | If this returns 404, the schema doesn't exist |
| P1-SEC3 | `curl -i "https://<staging>.supabase.co/rest/v1/profiles" -H "apikey: <anon>"` | HTTP 200 with public profiles | Regression: existing PostgREST surface broken |
| P1-SEC4 | Postgres role inspection: `SELECT has_schema_privilege('anon', 'pricewar', 'USAGE')` | `false` | `true` = leak risk via direct SQL |

#### 16.3.5 Auth + headers checks

| Request | Expected response |
|---|---|
| Any direct REST call to `pricewar.*` with anon key | 404/406, headers `Content-Type: application/json` |
| Direct call to `pricewar.*` with no `apikey` header | 401, `WWW-Authenticate` header present |

#### 16.3.6 Phase 1 sign-off checklist

- [ ] 4 smoke tests pass.
- [ ] 2 type structural tests pass.
- [ ] 7 DB integration tests pass.
- [ ] **4 security tests pass — P1-SEC1 is CRITICAL.**
- [ ] 2 header tests pass.
- [ ] Migration files committed.
- [ ] Supabase dashboard "Exposed schemas" excludes `pricewar` — screenshot in runbook.
- [ ] §16.1 universal gates pass.

**Load test?** No. No traffic yet.
**Intent test?** No. No user-facing changes.
**Flaws to look for specifically:** Drizzle generates `CREATE TABLE pricewar.match` but forgets to `CREATE SCHEMA pricewar` first → migration order matters. Migration `0001_create_pricewar_schema.sql` must run before `0002_create_pricewar_tables.sql`.

---

### 16.4 Phase 2A gate — Engine internals

**Applicable test kinds:** Unit (heavy), Property (visibility, determinism), Integration with types only. **NOT applicable:** API contract, E2E, Load (engine is in-process; load test happens at server level).

This is the most test-heavy gate in the whole project. Engine correctness is the foundation; everything above depends on it.

#### 16.4.1 Unit tests

Target ≥ 80% line coverage on `packages/pricewar-engine/src/engine/`, `moves/handlers/`, `rating/`, `visibility/`.

**Move handler tests** — one test file per handler in `packages/pricewar-engine/test/moves/`:

| Test pattern | Example |
|---|---|
| Happy path | "set_price changes player's currentPrice" |
| Validation: insufficient resources | "ad_campaign with cost > cash rejected" |
| Validation: input shape | "set_price with negative input rejected" |
| Conflicts | "two pricing moves in same submission rejected" |
| State immutability | "handler does not mutate input state" |

**Engine pipeline tests** in `packages/pricewar-engine/test/resolve-turn.test.ts`:

| # | Test | Expected |
|---|---|---|
| P2A-U1 | `resolveTurn` for a fixture round-1 state with both players setting prices | Returns `nextState` with updated prices, `events` includes 2 `move_resolved` and 1 `round_resolved` |
| P2A-U2 | Same round resolved twice | Output byte-identical (deep equal) — determinism |
| P2A-U3 | Bankruptcy trigger fires when cash < 0 for 2 consecutive rounds | `outcome.kind === "win"`, `winner` is opponent, `reason === "bankruptcy"` |
| P2A-U4 | End of round 8 with A having more cash | `outcome.winner === "A"`, `reason === "victory_points"` |
| P2A-U5 | Zero-move submission both players | Round resolves with base costs only, no revenue events |
| P2A-U6 | Stochastic event with seed `"abc:3"` | Specific event from the deck appears in `events`; reproducible |
| P2A-U7 | Pipeline step order is correct | Manual: read `resolveTurn.ts`, verify policies before events before product before people before demand before allocate before finance before reputation before triggers before reports |

#### 16.4.2 Property tests (visibility — CRITICAL)

`packages/pricewar-engine/test/visibility.test.ts` using `fast-check`:

| # | Property | Iterations |
|---|---|---|
| P2A-P1 | For all arbitrary `MatchState`s, `toPlayerView(state, "A")` does NOT structurally contain `state.playersPrivate.B` | 1000 |
| P2A-P2 | For all arbitrary states, `toPlayerView(state, "B")` does NOT contain `state.playersPrivate.A` | 1000 |
| P2A-P3 | For all arbitrary states, the keys of `view.opponent` are a strict subset of `PlayerPublicState` keys | 1000 |
| P2A-P4 | `view.me.slot === slot` always | 100 |
| P2A-P5 | `view.market` deep-equals `state.market` | 100 |

These properties must hold no matter how the engine's internal state shape changes. **If P2A-P1 or P2A-P2 ever fail, the build is broken at the security level. CI must block.**

#### 16.4.3 Property tests (determinism)

| # | Property | Iterations |
|---|---|---|
| P2A-P6 | For all arbitrary `(state, submittedA, submittedB)` triples, calling `resolveTurn` twice produces deep-equal results | 500 |
| P2A-P7 | Same seed + same inputs across two separate processes produces deep-equal results (serialize → spawn process → resolve → compare) | 10 (expensive) |

#### 16.4.4 Golden fixture tests

`packages/pricewar-engine/test/golden/` contains JSON files: one full match (8 rounds, full event log) per scenario configuration we want to lock in.

| # | Test | Expected |
|---|---|---|
| P2A-G1 | Re-run `match_001.json` from initial state through all submitted moves | Final state and events match snapshot exactly |
| P2A-G2 | Same for `match_002.json` (bankruptcy mid-match) | Snapshot match |
| P2A-G3 | Same for `match_003.json` (draw scenario) | Snapshot match |
| P2A-G4 | Same for `match_004.json` (one player auto-passes round 3) | Snapshot match |
| P2A-G5 | Same for `match_005.json` (event deck-driven supply shock) | Snapshot match |

These are the regression net for balance tweaks. When you intentionally rebalance, update the snapshot; when you don't intend to, the failing snapshot tells you what changed.

#### 16.4.5 Rating math tests

`packages/pricewar-engine/test/elo.test.ts`:

| # | Test | Expected |
|---|---|---|
| P2A-E1 | Two equal-rated players (1200/1200), A wins | A gains +16, B loses -16 (K=32) |
| P2A-E2 | 1200 beats 1600 | A gains ~+29, B loses ~-29 (K=32 underdog bonus) |
| P2A-E3 | 1600 beats 1200 | A gains ~+3, B loses ~-3 (heavy favorite, small gain) |
| P2A-E4 | Reduced K on timeout forfeit (K=16 instead of 32) | Half magnitude |
| P2A-E5 | Draw between equals | Zero delta both sides |
| P2A-E6 | K-factor table by games played | <30 games → 40, 30–100 → 32, >100 → 20 |
| P2A-E7 | Rating floor at 100 (no negative ratings) | Player at 105 losing big stays ≥100 |

#### 16.4.6 Bot tests

`packages/pricewar-engine/test/bots/`:

| # | Test | Expected |
|---|---|---|
| P2A-B1 | Every persona, called 100 times with random `PlayerView`s, returns 1–3 legal moves | Smoke pass |
| P2A-B2 | Bots never read `MatchState` directly (only `PlayerView`) | Compile-time enforced via type signature |
| P2A-B3 | `bot.random` produces uniformly-distributed pick distribution across 1000 calls | Within statistical tolerance |
| P2A-B4 | `bot.aggressive` chooses marketing/price-cut moves at >2× the rate of `bot.premium` | Differential behavior verified |
| P2A-B5 | Self-play: 100 matches `bot.random` vs `bot.savant` | `bot.savant` win rate ≥ 70% (sanity check) |
| P2A-B6 | Determinism: same persona + same seed + same view → same submission | Identical output |

#### 16.4.7 Coach extract-facts tests

`packages/pricewar-engine/test/coach/`:

| # | Test | Expected |
|---|---|---|
| P2A-C1 | `extractFacts` on a known fixture match | Returns expected `turningPoints`, `bestMoves`, deltas |
| P2A-C2 | Determinism | Same inputs → same `MatchFacts` |
| P2A-C3 | Edge case: 8 rounds of no-moves both players | `MatchFacts.turningPoints` empty, `bestMoves` null both slots |

#### 16.4.8 CLI replay tool test

| # | Test | Expected |
|---|---|---|
| P2A-CLI1 | `pnpm pricewar:replay test/golden/match_001.json` | Stdout shows event-by-event replay; exit 0; diff against stored result is empty |
| P2A-CLI2 | Replay a tampered match (modify one move in fixture, expect mismatch) | Non-zero exit, diff printed |

#### 16.4.9 Phase 2A sign-off checklist

- [ ] Coverage report shows ≥ 80% line, ≥ 90% on `visibility/`.
- [ ] All 7 pipeline unit tests pass.
- [ ] All 7 visibility/determinism property tests pass (1000+ iterations).
- [ ] All 5 golden fixture tests pass.
- [ ] All 7 Elo tests pass.
- [ ] All 6 bot tests pass.
- [ ] All 3 coach extraction tests pass.
- [ ] CLI replay works.
- [ ] No imports of `next/*`, `react`, `@supabase/*`, `drizzle-orm` in `packages/pricewar-engine/src/` — verified by `rg` script.
- [ ] §16.1 universal gates pass.

**Load test?** No. Engine alone is in-memory.
**Intent test?** No. No user-facing surface yet.
**Flaws to look for specifically:**
- A reducer that uses `Math.random()` instead of seeded RNG → catches in P2A-P6.
- A handler that mutates input state → caught in handler tests.
- Pipeline step order silently changed (e.g. demand before product) → caught in P2A-U7 and golden tests.
- New private field added to `PlayerPrivateState` but `toPlayerView` not updated → caught in P2A-P1/P2.

---

### 16.5 Phase 2B gate — Server routes

**Applicable test kinds:** Integration, API contract, Auth, Headers, Concurrency. **NOT applicable:** UI tests, Load (Phase 5).

#### 16.5.1 API contract matrix

Every endpoint gets tested with the matrix: **happy path, unauthenticated, wrong-user, malformed body, rate-limited, missing-content-type, idempotent retry.**

Test credentials: `alice+test`, `bob+test`, `carol+test`, `dan+test`, `admin+test` (see §13).

**Convention for tables:** `OK` means HTTP 200; `4xx`/`5xx` are explicit codes. JSON body abbreviated.

##### `POST /api/pricewar/match`

| Case | Auth | Body | Headers sent | Expected status | Expected body | Expected response headers |
|---|---|---|---|---|---|---|
| Happy create vs-bot (paid) | carol+test | `{"scenarioId":"coffee-shop","playModeId":"blitz","opponentType":"bot","botPersonalityId":"bot.budget"}` | `Content-Type: application/json` | 201 | `{"matchId":"<uuid>","phase":"briefing","slot":"A"}` | `Content-Type: application/json` |
| Happy enqueue (paid) | carol+test | `{"scenarioId":"coffee-shop","playModeId":"rapid","opponentType":"human"}` | json | 201 | `{"matchId":null,"queuedAt":"<iso>"}` (queued; no opponent yet) | json |
| Free user tries Rapid | alice+test | `{"scenarioId":"coffee-shop","playModeId":"rapid","opponentType":"human"}` | json | 403 | `{"code":"FORBIDDEN","message":"Rapid 15+0 requires a paid account."}` | json |
| Free user with 1 in-progress match tries to create 2nd | alice+test (with active match) | `{"scenarioId":"coffee-shop","playModeId":"blitz","opponentType":"bot"}` | json | 403 | `{"code":"FORBIDDEN","message":"You already have a match in progress. Upgrade to play multiple matches concurrently."}` | json |
| Paid user with 5 in-progress matches tries 6th | carol+test (with 5 active) | (any) | json | 403 | `{"code":"FORBIDDEN","message":"You have 5 matches in progress, the maximum for your plan."}` | json |
| Unauthenticated | (none) | (any) | (no cookie) | 401 | `{"code":"FORBIDDEN","message":"Sign in required."}` | `WWW-Authenticate` should NOT leak details |
| Malformed JSON | alice+test | `{"bad":` (invalid JSON) | json | 400 | `{"code":"INVALID_SUBMIT","message":"Invalid request body."}` | json |
| Missing `Content-Type` | alice+test | valid JSON | none | 415 or 400 | generic envelope | json |
| Wrong scenario | alice+test | `{"scenarioId":"nonexistent",...}` | json | 400 | `{"code":"INVALID_SUBMIT","message":"Unknown scenario."}` | json |
| Rate limited (11th call in 1 hour) | alice+test | valid | json | 429 | `{"code":"RATE_LIMITED","message":"Slow down — try again in N seconds."}` | `Retry-After: <seconds>` |

##### `GET /api/pricewar/match/[id]/view`

| Case | Auth | Expected status | Expected body shape | Critical assertions |
|---|---|---|---|---|
| Player A views their match | alice+test (slot A of `matchAB`) | 200 | `PlayerView` shape | `view.opponent` keys are subset of `PlayerPublicState`; no `cash`/`morale` from opponent leaked |
| Player B views same match | bob+test | 200 | `PlayerView` | `view.me.cash` equals B's private cash, not A's |
| Spectator (logged-in non-player) | carol+test | 403 | generic | No state leakage |
| Unauthenticated | (none) | 401 | generic | No body details |
| Match not found | alice+test, random UUID | 404 | `{"code":"MATCH_NOT_FOUND","message":"Match not found."}` | Body identical regardless of whether match exists for someone else |

**The "Match not found vs Forbidden" merger is critical.** If a malicious user can distinguish "exists but not yours" from "doesn't exist," they can enumerate match IDs. Verify both return 404 with same body.

##### `POST /api/pricewar/match/[id]/submit`

| Case | Auth | Body | Expected status | Expected body | Notes |
|---|---|---|---|---|---|
| Happy submit 3 moves | alice+test (slot A, decide phase) | `{"moves":[{"moveId":"sales.set_price","input":{"newPrice":300}},{...},{...}]}` | 200 | `{"submitted":true,"opponentLocked":false}` | If opponent already locked, round resolves; `opponentLocked: true` |
| Opponent submitting second triggers resolution | bob+test (after Alice's submit) | valid | 200 | `{"submitted":true,"opponentLocked":true,"resolved":true,"reportAvailable":true}` | SSE `round_resolved` event emitted to both |
| Same submission twice (idempotency) | alice+test | identical body | 200 (1st), 409 (2nd) | `{"code":"ALREADY_SUBMITTED","message":"You've already submitted this round."}` | Constraint `(matchId, round, slot)` enforces |
| Insufficient resources | alice+test | move that costs more than current cash | 400 | `{"code":"INSUFFICIENT_RESOURCES","message":"Move rejected."}` | Generic message — no cash amount leak |
| Wrong round (race against resolution) | alice+test, payload has `round: 3` but server is on 4 | 409 | `{"code":"MATCH_COMPLETED","message":"Submission rejected."}` | |
| Clock expired | alice+test, clock at 0 | 400 | `{"code":"CLOCK_EXPIRED","message":"Time's up — round auto-passed."}` | |
| Match already over | alice+test | valid for completed match | 409 | `{"code":"MATCH_COMPLETED",...}` | |
| Wrong slot (Bob submitting for A) | bob+test, matchId where Bob is B | 200 (submits as B, not A) | submits as B | Slot derived from `userId`, never from request body |
| Unauthenticated | (none) | any | 401 | generic | |
| Rate limited (>1/sec) | alice+test, 2 calls in 500ms | 200 (1st), 429 (2nd) | rate-limited | `Retry-After: 1` |

##### `GET /api/pricewar/match/[id]/events` (SSE)

| Case | Headers sent | Expected status | Expected response headers | Expected stream behavior |
|---|---|---|---|---|
| Happy connect as player | `Accept: text/event-stream` | 200 | `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`, `X-Accel-Buffering: no` | Heartbeat `: ping\n\n` every 30s; events when emitted |
| Connect as spectator | as carol+test on alice/bob match | 403 | generic | Stream never starts |
| Opponent locks in | (during connection) | (stream) | (n/a) | Receives `data: {"type":"opponent_locked","round":N}\n\n` |
| Round resolves | (during connection) | (stream) | (n/a) | Receives `data: {"type":"round_resolved","round":N,"view":{...},"report":{...}}\n\n` |
| Filter: A's stream | alice+test | (stream) | (n/a) | `view` is A's filtered view; never contains B's private state |
| Client disconnects | (close socket) | (n/a) | (n/a) | Server removes listener; no memory leak |

##### `POST /api/pricewar/matchmaking/queue`

| Case | Expected status | Expected body |
|---|---|---|
| Happy enqueue | 201 | `{"queuedAt":"<iso>","botFallbackInSec":60}` |
| Already in queue | 409 | `{"code":"ALREADY_SUBMITTED","message":"You're already in the matchmaking queue."}` (reusing code) |
| Concurrent match cap reached | 403 | `{"code":"FORBIDDEN",...}` |

##### `GET /api/pricewar/match/[id]/coach`

| Case | Auth | Expected status | Body |
|---|---|---|---|
| Paid user, match completed | carol+test | 200 | LLM-generated `CoachReport` |
| Free user, match completed | alice+test | 200 | Template `CoachReport` (no LLM call) |
| User on match not completed yet | carol+test | 409 | `{"code":"MATCH_COMPLETED","message":"Coach available after match ends."}` |
| Cached response (second hit) | carol+test | 200 | Same body as first; no new LLM call (verify via cost ledger) |
| LLM daily cap exceeded (global) | carol+test | 200 | Template fallback with banner notice |

##### Admin endpoints

| Route | Auth | Expected |
|---|---|---|
| `GET /api/pricewar/admin/matches` | admin+test | 200, paginated list |
| Same | alice+test (non-admin) | 403, generic |
| Same | unauthenticated | 401 |
| `POST /api/pricewar/admin/matches/[id]/void` | admin+test | 200, ratings reverted; verify in DB |
| Same | alice+test | 403 |

#### 16.5.2 Concurrency tests

`apps/econblog/test/pricewar/concurrency.test.ts`:

| # | Test | Setup | Expected |
|---|---|---|---|
| P2B-C1 | Double-submit race | Both A and B submit within 10ms | Exactly one resolution; one `round_reports` row; both clients get SSE `round_resolved` |
| P2B-C2 | 10 simultaneous submits from same user | Same player POSTs 10× in 50ms | Exactly one accepted (200), nine return 429 or 409 |
| P2B-C3 | Match creation race | 5 simultaneous `POST /api/pricewar/match` from same free user | Only one match created; others return 403 or 409 |
| P2B-C4 | Matchmaking pair race | 4 users enqueue simultaneously into same `(scenario, mode)` | 2 matches created, each with 2 distinct users; no duplicate pairings |

#### 16.5.3 Security tests

| # | Test | Expected |
|---|---|---|
| P2B-SEC1 | API call attempts to mutate match by passing `slot: "A"` in body but user is B | Slot derived from session, ignored from body; mutation applies as B |
| P2B-SEC2 | Replay attack: capture a valid submit, replay 5 min later | 409 (idempotency) or match-already-resolved |
| P2B-SEC3 | Direct call to `apps/econblog/src/server/pricewar/repository.ts` functions from a UI route handler | ESLint catches and fails build |
| P2B-SEC4 | Error envelope consistency: 10 different 4xx scenarios | All return `{code, message}` shape; no nested error.stack; no opponent state |

#### 16.5.4 Critical request headers we must validate

| Header | Why it matters | What to test |
|---|---|---|
| `Content-Type: application/json` | Required for JSON parsing; missing it causes silent body drops in some setups | Without it, POST returns 415 or 400 with generic envelope |
| `Cookie: sb-<ref>-auth-token` | Supabase session | Required on protected routes; without it returns 401 |
| `Accept: text/event-stream` | SSE negotiation | Without it, SSE route should still work but client may misinterpret |
| `Authorization: Bearer <token>` | Alternative to cookie | Either cookie OR header must work |

#### 16.5.5 Critical response headers we must validate

| Header | Required on | Why |
|---|---|---|
| `Content-Type` | Every response | JSON or SSE marker |
| `Cache-Control: no-store` | All authenticated API responses | Prevent CDN/browser caching of private data |
| `Cache-Control: no-cache, no-transform` | SSE | Prevent buffering |
| `Connection: keep-alive` | SSE | Long-lived |
| `X-Accel-Buffering: no` | SSE | Disable proxy buffering |
| `Set-Cookie` (when refreshed) | Auth-refreshing routes | Must include `HttpOnly`, `Secure`, `SameSite=Lax` |
| `Retry-After` | 429 responses | Tells client when to retry |
| **No `X-Powered-By`** | All responses | Should be stripped per security best practice |
| **No `Server: detailed-version`** | All responses | Don't advertise stack |

`apps/econblog/test/pricewar/headers.test.ts` runs a fetch against staging for every endpoint and asserts these.

#### 16.5.6 Phase 2B sign-off checklist

- [ ] Every API endpoint has a happy-path test + at least 3 error-path tests.
- [ ] 4 concurrency tests pass.
- [ ] 4 security tests pass.
- [ ] All 4 critical request headers tested.
- [ ] All 9 critical response headers tested.
- [ ] Generic error envelope consistent across 10+ error paths.
- [ ] §16.1 universal gates pass.
- [ ] Coverage on `apps/econblog/src/server/pricewar/` ≥ 75%.

**Load test?** No (deferred to Phase 5).
**Intent test?** No (deferred to Phase 3).
**Flaws to look for specifically:**
- An endpoint that returns different status codes for "not found" vs "forbidden" → enumeration leak.
- A 4xx body containing opponent state.
- An endpoint that trusts `slot` or `userId` from the request body.
- SSE handler that subscribes once but never unsubscribes on disconnect → memory leak.
- Idempotency violation: the same submit accepted twice.

---

### 16.6 Phase 2C gate — UI screens

**Applicable test kinds:** Component (unit), Visual regression, Accessibility, Responsive. **NOT applicable:** API (mocked), Load.

#### 16.6.1 Per-screen render tests

`apps/econblog/test/pricewar/screens/<screen>.test.tsx` — one file per screen.

| # | Screen | Test | Expected |
|---|---|---|---|
| P2C-R1 | Lobby | Renders empty state, with-matches state, free-tier upgrade prompt state | DOM contains expected text and CTAs in each state |
| P2C-R2 | Match setup | All play modes render; Rapid shows lock for free user, no lock for paid | conditional rendering correct |
| P2C-R3 | Matchmaking queue | Queue page renders; bot-fallback timer counts down | DOM updates |
| P2C-R4 | Decide | All 6 domain tabs render; clicking move card opens dialog; draft slots track picks | interactions wired |
| P2C-R5 | Review & lock | 3 selected moves render in read-only Cards; "Lock in" requires AlertDialog confirm | confirmation flow |
| P2C-R6 | Waiting | Pulse animation present; SSE event triggers navigation | useEffect on event |
| P2C-R7 | Round report | Sections render sequentially with stagger animation; private deltas shown only to player | order |
| P2C-R8 | Post-match | Win/loss/draw banners; coach card shows LLM vs template based on tier prop; recommended lessons link out | conditional |
| P2C-R9 | History | List paginates; filter dropdown works | |
| P2C-R10 | Leaderboard | Paid user listed by Rating; free user shows "Unranked" badge | |
| P2C-R11 | Tutorial | Scripted match progresses; narrative overlays appear at correct steps | |
| P2C-R12 | Notifications | List with notification items; mark-read interaction | |
| P2C-R13 | Idle warning overlay | Triggered by SSE event; dismissible | |
| P2C-R14 | Forfeit confirm | AlertDialog with destructive styling; "Cancel" closes | |
| P2C-R15 | Opponent abandoned | Full-screen with rematch CTA | |
| P2C-R16 | Bankruptcy | Full-screen with explanation | |
| P2C-R17 | Austerity warning | Banner appears when cash < threshold; dismissible | |
| P2C-R18 | Timer warning | <30s clock animation pulses; <10s screen border accent | |
| P2C-R19 | Network error | Shown when SSE fails repeatedly; "Reconnect" CTA | |

#### 16.6.2 Component unit tests (the net-new game components)

| Component | Test cases |
|---|---|
| `MoveCard` | Renders name, description, cost; tooltip shows on hover; locked variant shows lock icon; disabled when can't afford |
| `DraftSlot` | Empty state, filled state, click clears |
| `ClockBadge` | Shows formatted time; pulses when low; respects reduced motion |
| `MatchHeaderStrip` | Shows round X/N, my cash, opponent price+brand, my clock; updates on prop change |
| `OpponentLockBadge` | "Deciding..." pulses; "Locked ✓" with check; transition animates 200ms |
| `RoundReport` | Stagger animation on mount; expandable details |
| `CoachCard` | LLM variant; template variant; upgrade-prompt variant for free users |

#### 16.6.3 Accessibility tests

Run `axe-core` against each rendered screen. Target: zero serious violations.

| # | Check | Expected |
|---|---|---|
| P2C-A1 | All interactive elements have accessible name | Pass |
| P2C-A2 | Color contrast on `--color-foreground` over `--color-surface-raised` ≥ 4.5:1 | Pass (verify with WCAG tool) |
| P2C-A3 | Focus order on Decide screen | Logical: tabs → moves → draft slots → lock CTA |
| P2C-A4 | Reduced motion respected | All keyframe animations disabled when `prefers-reduced-motion` |
| P2C-A5 | Keyboard nav: can complete a full match without mouse | Manual; document deviations |

#### 16.6.4 Responsive tests

| Breakpoint | Test |
|---|---|
| 320px (mobile minimum) | All game screens scroll without horizontal overflow; CTAs visible |
| 768px (tablet) | Layout reflows appropriately |
| 1024px+ (desktop) | Wireframe layout matches |

Use Playwright with viewport sizes; screenshot at each breakpoint for at least Lobby, Decide, Report, Post-match.

#### 16.6.5 Phase 2C sign-off checklist

- [ ] 19 screen render tests pass.
- [ ] 7 component unit test files pass.
- [ ] axe-core: zero serious violations across all screens.
- [ ] Reduced-motion verified globally.
- [ ] Responsive verified at 3 breakpoints.
- [ ] No new console errors or React warnings in dev.
- [ ] Existing UI primitives reused (no new shadcn-default-style additions to `apps/econblog/src/components/ui/`).
- [ ] §16.1 universal gates pass.

**Load test?** No.
**Intent test?** No (mocked APIs — real intent tests in Phase 3).
**API contract?** No (mocked).
**Flaws to look for specifically:**
- A new design token added instead of reusing existing CSS variables.
- A component that imports directly from `@adamsaxion/pricewar-engine/engine/*` (should only import from types).
- A screen that doesn't use the existing `Header` / breaks the persistent strip pattern.
- Animations that don't respect `prefers-reduced-motion`.

---

### 16.7 Phase 2D gate — Bots

**Applicable test kinds:** Unit, Self-play simulation, Differential behavior. **NOT applicable:** API, UI, Load.

Already covered in §16.4.6. Phase 2D gate is **the same tests**, run again as the bot agent finalizes personas. Plus:

| # | Test | Expected |
|---|---|---|
| P2D-1 | Win rate matrix: tier N vs tier N+1 across 100 matches | Tier N+1 wins ≥ 55% (sanity: higher tier wins more) |
| P2D-2 | Each persona's "voice" is distinct: log move-selection histograms across 100 matches per persona | `bot.aggressive` skews heavily marketing; `bot.premium` skews HR/training; `bot.budget` skews finance |
| P2D-3 | No persona crashes across 1000 matches against any other persona | Zero exceptions |
| P2D-4 | Tutorial bot follows scripted sequence exactly | Replay against script fixture; match exact |

#### Phase 2D sign-off checklist

- [ ] All P2A-B1–6 tests pass.
- [ ] All P2D-1–4 differential tests pass.
- [ ] 1000-match self-play marathon completes without crashes.

---

### 16.8 Phase 2E gate — Coach

**Applicable test kinds:** Unit (fact extraction), Mocked LLM, Cost accounting, Output validation.

| # | Test | Expected |
|---|---|---|
| P2E-1 | `extractFacts` deterministic on golden match | Identical `MatchFacts` |
| P2E-2 | Template renders for free user, no LLM call | DB has `generated_by="template"`, `cost_usd="0"`; no OpenRouter call made (verify with mock) |
| P2E-3 | LLM call made for paid user, OpenRouter mocked | Mock receives expected system + user prompts; mock returns valid `CoachLlmOutput`; parsed and saved |
| P2E-4 | LLM returns malformed JSON | Parser catches, falls back to template, logs error |
| P2E-5 | Daily user cap enforced | After $5 spent today by user, next call returns template fallback |
| P2E-6 | Daily global cap enforced | After $200 spent today across all users, all coach calls return template |
| P2E-7 | Cache hit on second request | DB row read; no new LLM call |
| P2E-8 | LLM-recommended lessons validated | Slugs must exist in `lessons` table; invalid slugs filtered out |
| P2E-9 | Prompt hash stability | Same `MatchFacts` produces same prompt hash; useful for cache keying |

#### Phase 2E sign-off checklist

- [ ] All 9 coach tests pass.
- [ ] Cost ledger entries written correctly.
- [ ] Free user never triggers OpenRouter call (verified via mock).
- [ ] Malformed LLM output gracefully degrades.

---

### 16.9 Phase 3 gate — Integration

**Applicable test kinds:** E2E (intent), API contract (real APIs now), Cross-browser, Mobile.

This is the **first phase where intent testing happens.** The 16 user stories from §13 must execute end-to-end against staging.

#### 16.9.1 E2E intent tests (Playwright against staging)

For each user story from §13, write a Playwright spec. Run as part of CI on every PR after Phase 3.

| Story | Spec file | Credentials | Key assertions |
|---|---|---|---|
| 1: Free Blitz vs human | `e2e/free-blitz-vs-human.spec.ts` | alice+test, bob+test | Both users complete 8-round match; no Rating shown; coach is template |
| 2: Paid Rapid vs human | `e2e/paid-rapid-vs-human.spec.ts` | carol+test, dan+test | Match completes; Rating delta shown post-match; coach is LLM-generated |
| 3: Free user tries Rapid | `e2e/free-rapid-locked.spec.ts` | alice+test | Lock icon visible; upgrade dialog opens; CTA goes to /subscribe |
| 4: Free concurrent match cap | `e2e/free-concurrent-cap.spec.ts` | alice+test | API and UI both block second match; specific message text |
| 5: Vs-bot match | `e2e/vs-bot.spec.ts` | carol+test | Match created immediately; bot submits within 5s; unrated |
| 6: Tutorial | `e2e/tutorial.spec.ts` | alice+test | All 8 rounds with narration; replay disables XP gain |
| 7: Mid-match clock-out | `e2e/clock-out.spec.ts` | carol+test, dan+test | First clock-out auto-passes; second ends match with reduced K |
| 8: Anti-cheat | `e2e/cheat-attempts.spec.ts` | alice+test | Devtools mutation rejected; PostgREST direct call rejected; cross-user submit rejected |
| 9: Admin debug match | `e2e/admin-debug.spec.ts` | admin+test | Engine trace visible; both filtered views render; void revokes ratings |
| 10: Admin LLM cost monitor | `e2e/admin-costs.spec.ts` | admin+test | Dashboard shows accurate spend; global cap triggers fallback |
| 11: Abandonment forfeit | `e2e/abandonment.spec.ts` | carol+test, dan+test | Closing browser eventually awards opponent win |
| 12: Concurrent submit race | `e2e/race-condition.spec.ts` | various | Exactly one resolution under 10 parallel submits |
| 13: Recommended lessons | `e2e/recommended-lessons.spec.ts` | carol+test | Slugs valid; click navigates to lesson |
| 14: Rate limit | `e2e/rate-limit.spec.ts` | alice+test | 11th match-create → 429 |
| 15: Determinism | `e2e/determinism.spec.ts` | admin+test | Replay CLI matches stored result |
| 16: Bot transparency toggle | `e2e/bot-transparency.spec.ts` | alice+test | Env flag changes UI labels |

#### 16.9.2 Cross-browser

Run the 5 most important specs (1, 2, 4, 7, 8) on:
- Chromium
- Firefox
- WebKit (Safari)

SSE specifically is known to behave subtly differently across browsers — verify it works on all 3.

#### 16.9.3 Mobile

Same 5 specs on Playwright iPhone 14 and Pixel 7 viewports. Verify:
- Decide screen scrolls correctly.
- Move-card dialogs are not cut off.
- Clock badge remains visible.
- Touch events work for tab switching.

#### 16.9.4 API contract regression

Re-run the full §16.5 API contract matrix against real (non-mocked) staging. Any drift = fail.

#### 16.9.5 Phase 3 sign-off checklist

- [ ] All 16 intent specs pass on Chromium.
- [ ] Cross-browser specs (1, 2, 4, 7, 8) pass on Firefox and WebKit.
- [ ] Mobile specs pass.
- [ ] API contract regression: 100% identical to §16.5 expectations.
- [ ] Manual exploratory: spend 30 minutes as Alice and Carol on staging; report any visual or interaction bugs.
- [ ] §16.1 universal gates pass.

**Load test?** No (Phase 5).
**Flaws to look for specifically:**
- SSE drops on real (non-localhost) network — verify reconnect logic.
- A specific browser caches an SSE response incorrectly.
- Coach output text contains an HTML/JS injection from the LLM that the UI renders unsafely → XSS risk. Test with a fixture that returns `<script>alert(1)</script>`; should render as text.

---

### 16.10 Phase 4 gate — Admin tooling

**Applicable test kinds:** API contract (admin endpoints), Auth (admin gating), E2E (intent for admin flows).

#### 16.10.1 Admin auth gate

Every admin endpoint and admin page must pass this matrix:

| Caller | Expected for admin endpoint | Expected for admin page |
|---|---|---|
| `admin+test` (in `ADMIN_EMAILS`) | 200 with data | 200 renders page |
| `alice+test` (not admin) | 403 generic | 307 redirect (existing pattern) |
| Unauthenticated | 401 generic | 307 redirect to `/auth` |
| `admin+test` with manipulated cookie | 401 | 307 |

#### 16.10.2 Admin intent tests

| # | Spec | Credentials | Assertions |
|---|---|---|---|
| P4-I1 | Admin views match deep-dive | admin+test | Engine trace, state-at-round, submissions, coach output, actions panel all render |
| P4-I2 | Admin filters matches | admin+test | Filter by phase, scenario, mode, player; pagination works |
| P4-I3 | Admin voids match | admin+test | Match marked voided; participants' ratings reverted; XP refunded; SSE notifies players |
| P4-I4 | Admin re-resolves match | admin+test | Engine re-runs against current engine version; diff shown |
| P4-I5 | Admin flags player | admin+test | Flag row created; visible in player debug view |
| P4-I6 | Admin views move catalog | admin+test | Move list with pick rate, win rate, sortable |
| P4-I7 | Admin views LLM costs | admin+test | Today's spend, per-user, per-feature; sortable |
| P4-I8 | Non-admin attempts admin endpoint via direct API call | alice+test | 403 generic |

#### 16.10.3 Phase 4 sign-off checklist

- [ ] All 8 admin intent tests pass.
- [ ] Admin auth gate verified across every admin endpoint and page.
- [ ] Engine trace viewer renders for a 100-event match without performance issue (<500ms initial render).
- [ ] §16.1 universal gates pass.

**Load test?** No (admin is low traffic).
**Flaws to look for specifically:**
- Admin endpoint exposed via shared route file with non-admin endpoint — easy to miss the gate.
- Admin "void match" action that doesn't actually revert Rating because of a transaction bug.
- Engine trace viewer that renders all events synchronously on a 10k-event match → frozen tab. Implement pagination/virtualization.

---

### 16.11 Phase 5 gate — Launch hardening

**Applicable test kinds:** Load, Soak, Chaos, Observability. **All prior kinds also re-run for final regression.**

This is the only phase where load testing is mandatory.

#### 16.11.1 Load test ramp

Use k6 against staging Railway service. Scripts in `tooling/load-tests/pricewar/`.

| # | Scenario | Setup | Duration | Pass criteria |
|---|---|---|---|---|
| P5-L1 | 100 concurrent vs-bot Blitz matches | Spawn 100 bot accounts; each plays 1 full match | 15 min | p95 submit latency <500ms; zero 5xx; zero match resolution failures |
| P5-L2 | 500 concurrent users in Blitz queue | 500 enqueue; matchmaking pairs them | 5 min | All users matched or bot-fallback within 90s; zero crashes |
| P5-L3 | 1000 concurrent SSE connections | 1000 clients open SSE on different matches; events emitted at 1/sec each | 10 min | All clients receive events; no connection drops beyond 1% |
| P5-L4 | Submit spike: 100 req/sec across all matches | k6 sustained | 5 min | p99 latency <1000ms; rate limit kicks in for abusive clients only |
| P5-L5 | Soak: 50 concurrent matches | Continuous, restart matches as they complete | 24h | Memory stable (no leak); no orphaned SSE listeners; no DB connection pool exhaustion |

If P5-L1 fails: profile the engine resolution path. Likely culprits: synchronous I/O in handler, unbatched DB writes.

If P5-L3 fails: shift to Postgres `LISTEN/NOTIFY` early.

If P5-L5 leaks memory: check SSE listener cleanup on disconnect.

#### 16.11.2 Chaos tests

| # | Scenario | Expected |
|---|---|---|
| P5-CH1 | Kill Railway instance mid-match | Other instance (or restarted instance) recovers; matches in `decide` phase preserve submissions; SSE clients reconnect |
| P5-CH2 | Disconnect Supabase DB for 30s | App returns 5xx during outage; recovers when DB returns; no data corruption |
| P5-CH3 | OpenRouter outage | Coach calls fall back to template; no user-facing failure |
| P5-CH4 | Disable feature flag `enable_pricewar` | All `/api/pricewar/*` routes return 503; existing lessons app unaffected |

#### 16.11.3 Observability

| # | Check | Expected |
|---|---|---|
| P5-O1 | Sentry receiving errors | Trigger a deliberate 500; Sentry event appears within 30s |
| P5-O2 | Metrics endpoint scrapeable | `GET /api/pricewar/metrics` returns Prometheus format |
| P5-O3 | LLM cost alert | Manually exceed $150/day; alert fires (email or admin dashboard) |
| P5-O4 | Engine trace sampling | 1% of matches retain full event log past 30 days; verify policy |

#### 16.11.4 Rollback runbook test

Practice the rollback procedure:

| Step | Test |
|---|---|
| Find a "bad" match | Use admin filter |
| Void it | Verify ratings reverted |
| Flush stuck queue | Run admin endpoint, verify queue empty |
| Lower coach cap | Update env, restart, verify new behavior |
| Flip `enable_pricewar` off | Verify routes return 503 |
| Restore from a Supabase point-in-time | Verify staging restore works |

Document each step in `apps/econblog/RUNBOOK_PRICEWAR.md`.

#### 16.11.5 Final regression

Re-run **every** prior gate's tests on the launch candidate build. The full unit + integration + e2e + load suite. Estimated 2–4 hours of CI time.

#### 16.11.6 Phase 5 sign-off checklist (Launch)

- [ ] All 5 load tests pass.
- [ ] All 4 chaos tests pass.
- [ ] All 4 observability checks pass.
- [ ] Rollback runbook practiced.
- [ ] All prior phase gates re-run and pass.
- [ ] Sentry, metrics endpoint, LLM cost alert all live.
- [ ] `enable_pricewar` feature flag controls the entire game cleanly.
- [ ] 48h alpha with admin-tier users on staging — no critical bugs.
- [ ] Product owner sign-off.

**Flaws to look for specifically at launch:**
- Hot path uses `Date.now()` somewhere it shouldn't (breaks determinism).
- A subtle race in matchmaking that pairs the same user with themselves.
- An SSE handler holding a DB connection long-lived.
- A bot persona that occasionally submits illegal moves (caught by validate but pollutes logs).
- Coach LLM occasionally returns recommendations to lessons that don't exist (slug typo).

---

### 16.12 Summary table — what to run when

| Test kind | Phase 0 | Phase 1 | Phase 2A | Phase 2B | Phase 2C | Phase 2D | Phase 2E | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|---|---|---|---|---|
| Smoke | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Unit | — | type-level | ✅ heavy | ✅ | ✅ | ✅ | ✅ | — | — | regression |
| Property/Fuzz | — | — | ✅ CRITICAL | — | — | — | — | — | — | regression |
| Integration (DB) | — | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ | regression |
| API contract | — | — | — | ✅ heavy | — | — | — | ✅ | ✅ | regression |
| Component (UI) | — | — | — | — | ✅ | — | — | — | ✅ | regression |
| E2E / Intent | — | — | — | — | — | — | — | ✅ heavy | ✅ admin | full sweep |
| Auth + headers | regression | ✅ DB-level | — | ✅ heavy | — | — | — | ✅ | ✅ | regression |
| Security | regression | ✅ CRITICAL | — | ✅ | — | — | — | ✅ | ✅ | regression |
| Accessibility | — | — | — | — | ✅ | — | — | — | — | regression |
| Cross-browser | — | — | — | — | — | — | — | ✅ | — | regression |
| Load | — | — | — | — | — | — | — | — | — | ✅ CRITICAL |
| Chaos | — | — | — | — | — | — | — | — | — | ✅ |

### 16.13 Test data and credentials reference (single source)

Test credentials are defined in §13. Add to a `.env.test` not committed to git; CI loads from secrets store.

**Production data:** never test against production. Period.

**Staging data:** the seed script (§7) creates the 5 test accounts. Add a `staging-only` flag to `seed-pricewar.ts` that refuses to run if `NODE_ENV !== "development" && DATABASE_URL !~ /staging/`.

### 16.14 What "gate failure" means in practice

- **Phase 0–2 gate failure:** the phase isn't done. Fix and rerun. No exception.
- **Phase 3 gate failure:** integration broke. Roll back the breaking commit. Diagnose. Fix forward.
- **Phase 4 gate failure:** admin tooling has gaps. Acceptable to ship if non-blocking *and* product owner explicitly accepts the risk and the gap is documented.
- **Phase 5 gate failure:** **do not launch.** Period. Set a new launch date. Identify which subsystem failed. Re-run all gates after fix.

The goal of the gate is to make it impossible to ship a broken Price War. If a gate is wrong (too strict, too loose), update the gate — but never skip it.

---

## Appendix A: Existing Code You Must Not Touch

These files/folders are unrelated to The Price War and have working business logic. **Do not refactor, "improve," or move them.**

| Path | Reason |
|---|---|
| `apps/econblog/src/components/lesson/LessonPlayer.tsx` | 685-line component working for the lessons product. The audit calls it ugly, but it works. Touching it = scope creep. |
| `apps/econblog/src/app/admin/*` (lesson generation) | Working content pipeline. New admin pages for Price War live alongside, not inside. |
| `apps/econblog/src/lib/admin/*` | 1.7K LoC content pipeline. |
| `apps/econblog/src/lib/learning/*` | Lesson recommendation engine. Reused via `recommendedLessonSlugs` from coach output; no code changes needed. |
| `apps/econblog/src/lib/stripe/*` | Working subscription wiring. |
| `apps/econblog/src/lib/supabase/{client,server}.ts` | Reused; no changes. |
| `apps/econblog/src/middleware.ts` | EXTENDED (add `GAME_ROUTES` allowlist), never refactored. |
| `apps/econblog/scripts/*` | Lesson generation CLIs. New seed script for Price War lives alongside. |
| `adams-agents/` | Python YouTube CLI. Unrelated to web app entirely. |

Anything not in this list is fair game **but** prefer additive changes. If you find yourself wanting to rename or refactor an existing file in `econblog/src/`, stop and ask.

---

## Appendix B: Glossary

- **Match** — One 2-player game session. Lives in `pricewar.match`.
- **Round** — One turn within a match. Coffee Shop = 8 rounds.
- **Move** — A discrete action a player takes within a round. Catalog ~25–30 moves for Coffee Shop. Max 3 per round.
- **Domain** — One of 6 functional areas (sales, procurement, ops, hr, marketing, finance). Moves are categorized by domain.
- **Submission** — A player's locked-in moves for a round. Stored in `pricewar.turn_submissions`.
- **Resolution** — The engine's processing of both players' submissions to produce a new match state and round report.
- **Engine trace** — The full ordered list of `EngineEvent`s produced during resolution. Stored as `pricewar.round_reports.events_slice` per round.
- **Player view** — A filtered view of match state, produced by `toPlayerView(state, slot)`. Only the player's own private state plus public market and opponent's public-only fields.
- **Rating** — A per-(scenario, playMode) Elo number, only for paid users on rated matches.
- **Coach** — Post-match LLM narrative + recommended lessons. Paid feature.
- **Scenario** — A specific economic situation (Coffee Shop is the v1 scenario). Defines starting state, available moves, victory conditions, balancing.
- **Play mode** — A timer + tier configuration. Blitz/Rapid/Tutorial in v1; Casual in v1.1.
- **Bot persona** — A scripted heuristic AI opponent. 7 personalities in v1.
- **Visibility** — A tag on each move/state field that controls who can see what. Five values: public, private, inferable, conditional, revealedAfterResolution.

---

*End of execution plan. If you got here from the top, congratulations. This document is the source of truth for The Price War v1 build. Start with §15.*
