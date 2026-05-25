# Price War Codebase Architecture Audit

> Audit target: `/Users/denniswilmot/adamsaxion`
> Primary app under audit: `econblog/` (Next.js 15 app, currently shipped as "Adam's Axioms")
> Date of audit: 2026-05-24
> Auditor's posture: blunt, repo-specific, no generic advice
> Scope: do not change code; identify the gap between what exists today and what is needed to build **The Price War** (turn-based PvP economics strategy game) on top of this repo.

---

## 1. Executive Summary

**Blunt summary:** there is no game in this repository today. The `econblog/` app is a moderately mature **content + subscription product** (lessons, quiz gates, mastery exams, XP, leaderboard, Stripe, admin lesson generator). It is *not* a prototype, but it is also nowhere near a game engine. The repo's center of gravity is **markdown/JSONB lessons rendered by React with optimistic client-side gating** — the exact opposite of the server-authoritative, deterministic, hidden-information engine The Price War requires.

There is **zero existing code** for `Match`, `Round`, `Move`, `PlayerState`, `Scenario`, `engine`, `report`, `matchmaking`, `visibility`, or `Elo`. Greps for "price war", "coffee shop", "match", "round", "move", "domain" return only lesson content and incidental matches in unrelated files. The `path-engine.ts` file is a curriculum recommender, not a game engine. The only "turn-based" thing in the repo is the lesson section unlock state machine in `src/components/lesson/LessonPlayer.tsx`, which is **client-state with server persistence**, not a server-authoritative simulator.

### Position on the maturity spectrum

| Dimension | Current state |
|---|---|
| As a content + lessons platform | **Late prototype / early production** — schema exists, auth works, Stripe wired, admin pipeline real |
| As a basis for The Price War | **Empty.** No domain model, no engine, no game routes, no game state, no hidden-info architecture |
| Visual design language | Strong: deliberate, editorial, Tailwind variables, no shadcn defaults |
| Testing | Effectively **none** (no jest/vitest/playwright, no `*.test.ts`, no `*.spec.ts`) |
| Concurrency / real-time | None. All flows are request/response |

### What is already strong (worth keeping)

- **Stack choices are correct for the game.** Next.js 15 App Router + React 19 + TS strict + Drizzle + Supabase Postgres + Supabase Auth + Stripe + Tailwind variables is *the* sensible stack for a 2-player turn-based web game. No need to switch frameworks.
- **Path-aliased TS (`@/*` → `src/*`)** is already configured in `econblog/tsconfig.json`.
- **A working Supabase Auth + middleware pattern** (`src/middleware.ts`) you can extend to gate game routes.
- **A working API route convention** (`src/app/api/...`) you can extend to `/api/match`, `/api/turn`, etc.
- **A working Drizzle schema + drizzle-kit pipeline** (`src/db/schema.ts`, `drizzle.config.ts`, `pnpm db:push`).
- **A serious Tailwind design system** (`tailwind.config.js`, `src/app/globals.css`) and an explicit visual posture in `.impeccable.md` ("Atlas Pilot meets a well-written textbook") that you can extend to a "competitive ladder" aesthetic without reinventing tokens.
- **A solid Radix-based UI primitives layer** in `src/components/ui/*` (button, dialog, popover, tabs, tooltip, dropdown, etc.) you can reuse for move cards, planning UI, and overlays.
- **A clean route protection mental model** (`PROTECTED_ROUTES`, `ADMIN_ROUTES` in `src/middleware.ts`) — extend with a `GAME_ROUTES` bucket.

### What will become painful if we build the engine on top of the current structure

- **No engine boundary.** `src/lib/learning/path-engine.ts` is named "engine" but it's a recommender. There is no `engine/` module that is UI-free, dependency-free, deterministic, and testable in isolation. If we drop game logic into `src/lib/` next to learning helpers, it will *immediately* leak into React components and `Server Component → DB` calls. Bad.
- **Game logic in components.** Today's gating/unlock logic lives in `LessonPlayer.tsx` (685 lines) with React state. That is the pattern that will be copied if we don't establish an engine module first. We will end up with a "decide screen" component that knows how to compute outcomes — exactly the anti-pattern the brief calls out.
- **No shared `types/` boundary.** Domain types currently live next to features (`src/lib/types/lesson.ts`, `src/lib/learning/path-engine.ts`, etc.). For the game we need **shared types** that both the engine and the React app import without coupling. Nothing in the repo enforces that.
- **No server-state library in active use.** `@tanstack/react-query` is in `package.json` but **0 files import it**. Every component uses raw `fetch()` in `useEffect`. Across ~20 fetch sites (`Header.tsx`, `LessonsCatalog.tsx`, `LessonPlayer.tsx`, `MasteryExam.tsx`, `QuizGate.tsx`, profile tabs, `PathSetupModal.tsx`, etc.). For a turn-based game with polling/optimistic submit/server reconciliation, that will hurt fast.
- **No tests.** Zero engine tests means we will have nothing to lean on when we tune Coffee Shop economics or refactor the resolution pipeline.
- **Schema is content-shaped, not match-shaped.** `src/db/schema.ts` is built around `profiles`, `lessons` (JSONB content), `lesson_progress`, `quiz_attempts`, `leaderboard_seeds`, `subscriptions`. None of `matches`, `match_players`, `round_states`, `submitted_turns`, `round_reports`. Game tables will need to coexist with content tables in the same Supabase DB or be split into a `game` schema — pick now.
- **No realtime.** Supabase Realtime is *available* but not wired anywhere. Two-player "submit and wait" UX needs either polling or Realtime; nothing in the codebase currently does either.
- **No deterministic RNG.** Nothing in the repo seeds randomness. The mastery exam pool uses `Math.random()` semantics via JS (`questionPool` shuffle). For a replayable engine you need a seeded PRNG from day one.
- **Single Next.js project, no workspace boundary** for the engine. `pnpm-workspace.yaml` files exist (`/pnpm-workspace.yaml` and `econblog/pnpm-workspace.yaml`) but they are misused — they contain only `allowBuilds:` keys, no `packages:` declarations. There is no `packages/engine` workspace today.

### What to fix before adding more screens

1. **Carve out the engine.** Either an internal module (`econblog/src/game/engine/`) or a workspace package (`packages/engine`). Do this before writing a single "Decide" screen.
2. **Pick where match state lives.** Supabase Postgres (recommended — you already pay for it) vs. an external KV. Decide now.
3. **Adopt React Query for game data.** It's already in deps; just use it. Raw `fetch()` in `useEffect` will not survive draft state + submit + opponent waiting + round reveal.
4. **Add a test runner.** Vitest. Engine without tests is malpractice for this product.
5. **Stop calling things "actions"** in any new code. Brief says "moves." Set the linguistic anchor now so it stays consistent.
6. **Add a `shared/types/` (or `packages/types/`) boundary** so engine, server, and UI all import the same `Move`, `MatchState`, `PublicMatchView` shapes.
7. **Decide the visibility filter location** (server-only) and write a single `toPlayerView(matchState, playerId)` function before any "screen" needs it.

If the next three weeks add 5–10 new game screens *without* doing the seven items above, the engine work later will require ripping out half of those screens.

---

## 2. Current Repo Map

### 2.1 Workspace shape

```
/Users/denniswilmot/adamsaxion/
├── package.json                # minimal — just supabase + drizzle deps; not used as workspace root
├── pnpm-workspace.yaml         # MISCONFIGURED — only contains `allowBuilds:` keys, no `packages:`
├── pnpm-lock.yaml              # root lockfile (~205 KB)
├── adams-agents/               # Python CLI for YouTube content (unrelated to econblog)
├── econblog/                   # ← the actual Next.js app (audit target)
├── buildplan.md                # YouTube pipeline plan (unrelated)
├── ECONBLOG_REFACTOR_SPEC.md   # latest spec — about lessons, NOT the game
└── README.md                   # describes the two-project split
```

There is *no* `packages/` directory. The two `pnpm-workspace.yaml` files do not declare packages; they are effectively decorative.

### 2.2 econblog tree (important parts only)

```
econblog/
├── package.json                # Next.js 15.5.9, React 19, Drizzle 0.45, Supabase, Stripe, @tanstack/react-query
├── pnpm-workspace.yaml         # also misconfigured (only allowBuilds keys)
├── pnpm-lock.yaml
├── next.config.ts              # Turbopack root + image config + a single redirect
├── tsconfig.json               # strict: true, paths { "@/*": ["./src/*"] }
├── tailwind.config.js          # custom CSS-variable design system (no shadcn defaults)
├── drizzle.config.ts           # postgres dialect, schema at src/db/schema.ts, uses DIRECT_URL
├── postcss.config.js
├── components.json             # shadcn config
├── .env / .env.example         # Supabase, OpenRouter, SerpAPI, Stripe, ADMIN_EMAILS, NEXT_PUBLIC_APP_URL
├── .impeccable.md              # design philosophy — read this before drawing pixels
├── scripts/                    # lesson generation CLI + DB seeding (tsx-based)
└── src/
    ├── middleware.ts           # Supabase session refresh + /profile and /admin gates
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # Source Serif 4 + Hanken Grotesk, Header + AuthNotice
    │   ├── page.tsx            # landing (LandingPage)
    │   ├── globals.css
    │   ├── robots.ts, sitemap.ts, favicon, icon.svg
    │   ├── auth/{page.tsx, callback/route.ts, finalize/}
    │   ├── lessons/page.tsx, lessons/[slug]/{page.tsx,loading.tsx}
    │   ├── leaderboard/page.tsx           # client component, fetches /api/leaderboard
    │   ├── profile/{page.tsx, loading.tsx}
    │   ├── subscribe/page.tsx, subscribe/success/page.tsx
    │   ├── admin/page.tsx, admin/lessons/[id]/page.tsx
    │   └── api/
    │       ├── admin/                     # lesson generation pipeline routes
    │       ├── auth/                      # check-username, ensure-profile
    │       ├── leaderboard/route.ts
    │       ├── lessons/                   # /[slug]/progress, /[slug]/quiz/{attempt,status}, /[slug]/mastery/complete
    │       ├── stripe/                    # checkout, portal, webhook
    │       └── user/                      # admin-status, dashboard, preferences, profile, subscription
    ├── components/
    │   ├── Header.tsx, HeaderShell.tsx, HeaderAuthActions.tsx, AuthNotice.tsx, FloatingIcons.tsx
    │   ├── admin/AdminJobsWidget.tsx
    │   ├── auth/{AuthForm,SignInPrompt}.tsx
    │   ├── billing/{ProfileBilling,SubscribePlans,SubscribePrompt}.tsx
    │   ├── landing/{LandingPage, LessonCarousel, HowItWorksSection, OutcomesSection, PricingSection, ...}
    │   ├── learning/{LearningPathTimeline,PathSetupBanner,PathSetupModal}.tsx
    │   ├── lesson/{LessonPlayer.tsx (685 LoC), LessonPreviewBanner.tsx}
    │   ├── lessons/{LessonsCatalog.tsx, LessonsPageExtras.tsx}
    │   ├── profile/{ProfileHeader, ProfilePageClient, ProfileDashboard, ProfileTabNav, ...; tabs/{ProfileMyPathTab, ProfilePersonalTab, ProfileProgressTab, ProfileSubscriptionTab}}
    │   ├── quiz/{QuizGate.tsx, MasteryExam.tsx}
    │   ├── seo/JsonLd.tsx
    │   └── ui/                            # Radix-based primitives (~21 files)
    ├── content/
    │   ├── lesson_writing_rules.md
    │   └── lessons/lesson-zero.json       # the one published lesson, ~126 KB JSON
    ├── db/{index.ts, schema.ts}           # Drizzle: postgres-js client, ~160 LoC schema
    └── lib/
        ├── utils.ts                       # cn() helper
        ├── middleware-like helpers, types/lesson.ts (the only types file)
        ├── lesson-loader.ts, lesson-thumbnail.ts, user-profile.ts, openrouter.ts, serpapi.ts
        ├── admin/                         # lesson generation pipeline (~1.7K LoC)
        ├── auth/{client.ts, username.ts, redirect.ts}
        ├── constants/lessons.ts           # slug canonicalisation
        ├── landing/content.ts
        ├── learning/                      # corpus, interest tags, onboarding, path-engine, profile-progress, user-dashboard, slug-aliases
        ├── lesson/{markdown-components.tsx, quiz-question.ts}
        ├── seo/metadata.ts
        ├── stripe/{client.ts, config.ts, webhooks.ts}
        ├── subscription/{service.ts, types.ts}
        ├── supabase/{client.ts, server.ts}
        └── types/lesson.ts
```

### 2.3 Framework & routing

- **Next.js 15.5.9 App Router**, **React 19.2**, Turbopack dev+build.
- Routing is file-based under `src/app`. No catch-all route patterns. No parallel routes. No intercepting routes. No route groups (no `(group)/` folders).
- `next.config.ts` declares `turbopack.root`, one redirect (legacy lesson slug), and image config (Google avatars). No headers/rewrites/middleware config.
- `src/middleware.ts` (~120 LoC) handles Supabase session cookies, OAuth code forwarding, `/profile` protection, `/admin*` and `/api/admin*` allowlist via `ADMIN_EMAILS` env.

### 2.4 State management

- **No global store.** No Zustand, Redux, Jotai, Valtio. No React Context for app state.
- **No React Query in use.** `@tanstack/react-query` and `@tanstack/react-query-persist-client*` are in deps but `rg useQuery|useMutation|QueryClient` returns 0 hits in `src/`.
- All client data flows: `useState` + `useEffect` + raw `fetch()`. Counted ~40 raw `fetch()` sites across components/pages.
- Form state: ad-hoc `useState`. No react-hook-form, no zod.

### 2.5 Data fetching

- Server Components fetch via Drizzle directly (e.g. `src/app/page.tsx` → `loadAllLessonMeta()`; `src/app/profile/page.tsx` → `db.select(...).from(profiles)`).
- Client Components hit `/api/*` via `fetch()`.
- `loadLesson` uses React 19 `cache()` for per-request dedupe.
- `src/app/lessons/page.tsx` uses `export const revalidate = 3600` (1h ISR).

### 2.6 Styling

- Tailwind 3.4 + `tailwindcss-animate` + `class-variance-authority` + `clsx` + `tailwind-merge`.
- All semantic colors and spacing come from CSS variables defined in `src/app/globals.css` (`--color-surface`, `--color-primary`, `--space-md`, etc.).
- `tailwind.config.js` extends `colors`, `spacing`, `borderRadius`, `boxShadow`, `fontSize` from those CSS vars.
- shadcn primitives exist in `src/components/ui/` but the project has its own Atlas-Pilot-inspired token set; the shadcn `bg-primary text-primary-foreground` defaults in `ui/button.tsx` don't match the rest of the codebase (the rest uses `bg-primary text-surface-raised`). Mild inconsistency.

### 2.7 Backend / API structure

- **Single Next.js app**, no separate backend service.
- API routes under `src/app/api/`:
  - Admin: `/api/admin/jobs`, `/api/admin/lessons/...` (8 routes for the lesson generation pipeline).
  - Auth helpers: `/api/auth/check-username`, `/api/auth/ensure-profile`.
  - Leaderboard: `/api/leaderboard`.
  - Lessons: `/api/lessons/[slug]/progress`, `/api/lessons/[slug]/quiz/attempt`, `/api/lessons/[slug]/quiz/status`, `/api/lessons/[slug]/mastery/complete`, `/api/lessons` (catalog).
  - Stripe: `/api/stripe/{checkout,portal,webhook}`.
  - User: `/api/user/{admin-status,dashboard,preferences,profile,subscription}`.
- No tRPC, no GraphQL, no server actions in use (`"use server"` not found).
- No matchmaking, no game, no realtime endpoints. Nothing related to The Price War.

### 2.8 Database / schema / migrations

- Supabase Postgres. Drizzle ORM with `postgres-js` driver.
- Single schema file at `src/db/schema.ts` (10 tables):
  - `profiles`, `subscriptions`, `user_preferences`, `quiz_attempts`, `lesson_progress`, `leaderboard_seeds`, `lessons`, `lesson_generation_jobs`, `generation_cache`, `lesson_sources`.
- `drizzle.config.ts` outputs migrations to `./drizzle/` (currently empty in the working tree; deploys use `drizzle-kit push`).
- No game tables exist. No Postgres RLS policies are visible in this repo (they'd live in Supabase dashboard).

### 2.9 Package manager & scripts

- pnpm (`pnpm-lock.yaml` present at both root and `econblog/`).
- `econblog/package.json` scripts:
  - `dev`, `build`, `start` (Next.js with Turbopack).
  - `db:push`, `db:generate`, `db:studio`, `db:seed`, `db:migrate-lessons`.
  - Worker / batch / requeue / restart scripts for lesson generation (`worker:lessons`, `batch:generate`, `batch:resume`, `restart:early-lessons`, `purge:batch`, `resume:lessons`).
  - `react-doctor`, `react-doctor:verbose`, `react-doctor:score`.
  - `optimize:landing-images` (bash).
  - **`test:serpapi`** — *not* a real test runner. It's a script that calls SerpAPI.

### 2.10 Deployment assumptions

- README mentions **Railway (app) + Supabase (DB + auth)**. No `railway.toml`/`vercel.json` checked in.
- `next.config.ts` shows nothing deployment-specific beyond images and one redirect.
- `NEXT_PUBLIC_APP_URL` is used for Stripe redirect URLs and SEO `metadataBase`.

### 2.11 Environment variables (from `.env.example`)

- `DATABASE_URL` (pgbouncer pooled), `DIRECT_URL` (direct connection for migrations).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no service role key in `.env.example`).
- `ADMIN_EMAILS` (comma-separated allowlist).
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
- `SERPAPI_API_KEY` (note: README mentions Serper, but real code uses SerpAPI — `src/lib/serpapi.ts`).
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_LIFETIME`.
- `NEXT_PUBLIC_APP_URL`.
- Optional PostHog (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`).

### 2.12 Testing setup

- **None.** No `vitest.config.*`, no `jest.config.*`, no `playwright.config.*`, no `.test.*` or `.spec.*` files in `econblog/`.
- `react-doctor` exists but is a static-analysis linter, not a test runner.

### 2.13 Lint / typecheck / build

- TypeScript strict mode on (`tsconfig.json`). `noEmit: true`. `moduleResolution: "bundler"`.
- No ESLint config file in `econblog/` (no `.eslintrc*` or `eslint.config.*`). Next.js 15 does not auto-run ESLint at `next build` time without setup.
- Lint script not in `package.json`. There is **no** `pnpm typecheck` or `pnpm lint` script.
- Build: `next build --turbopack`. No prebuild type checks beyond what Next.js does internally.

---

## 3. Current UI Architecture Audit

### 3.1 Are screens organised cleanly?

Partially. The App Router gives clean route boundaries (`app/lessons/`, `app/profile/`, `app/admin/`). But:

- **Page files are mostly thin wrappers** that fetch data and pass to a big client component (e.g. `app/profile/page.tsx` → `ProfilePageClient`). Good pattern.
- **One page is bloated.** `src/app/admin/page.tsx` is **627 LoC** with inline filters, status colors, gradients, view modes, batch parser. That's a single-file admin SPA. Tolerable for admin, intolerable as the template we'd copy for game screens.

### 3.2 Are components reusable or one-off?

Mixed.

- **Reusable, good:** `src/components/ui/*` Radix primitives; `Header`, `HeaderShell`, `HeaderAuthActions`, `AuthNotice`, `FloatingIcons`, landing primitives (`BrushUnderline`, `CircleHighlight`, `BurstHighlight`, `ScrollReveal`).
- **One-off, large:** `LessonPlayer.tsx` (685 LoC), `QuizGate.tsx` (309 LoC), `MasteryExam.tsx` (281 LoC), `LessonsCatalog.tsx` (~258 LoC client component with search/filter/pagination + subscription gating + thumbnails), `ProfilePageClient.tsx` (125 LoC) with its tab folder.
- **`ProgressRing` is defined inside `LessonPlayer.tsx`** (lines 18–109). That is a generic UI primitive locked inside a domain component. The "Decide" screen will want a different ring (rounds-left? cash?), and we will copy-paste this unless we extract it first.

### 3.3 Are layout, state, and domain logic mixed?

Yes, in the lesson player. Specifically in `LessonPlayer.tsx`:

- Layout (sidebar, mobile tabs, mastery rendering, sticky aside, prose container).
- Local state (`activeSection`, `activeSubsection`, `showMastery`, `progress`, `quizStatuses`, `pathSetupOpen`).
- Server state fetching (`/api/lessons/:id/progress`, `/api/lessons/:id/quiz/status`) in `useEffect`.
- Domain rules: `isSectionUnlocked`, `isSectionCompleted`, `canAccessSub`, `allSectionsAttempted`. These are **gating rules that should live in a pure module** (the lesson "engine"), not in a React component.
- Optimistic update: `handleQuizComplete` mutates client `progress` then re-fetches.

This is the exact pattern that will be lethal if reused for the Decide screen. The brief explicitly says React must not hold authoritative game logic — but the current pattern proves the team is comfortable doing exactly that.

### 3.4 Duplicated UI patterns

- **Status color maps** repeated in `src/app/admin/page.tsx` and `src/app/admin/lessons/[id]/page.tsx` (`STATUS_COLORS`).
- **Category gradient maps** repeated in `src/app/admin/page.tsx` and `src/components/lessons/LessonsCatalog.tsx` (`CARD_GRADIENTS`).
- **Tab-style "All / status" filter UIs** in admin and lessons catalog.
- **Sign-in / subscribe prompts** repeated logic between `QuizGate.tsx` and other gated surfaces.

None of these are tragic individually. Together they signal: **no shared "filterable catalog", "status badge", "stat ring", "gated prompt" primitives exist**. The Price War will need these (matches catalog, status badges, "round X of 8" ring, "submit waits" prompt).

### 3.5 Is the visual system centralised or scattered?

**Centralised at the design-token level**, scattered at the component level.

- Tokens live in `src/app/globals.css` and `tailwind.config.js`. Good.
- But ad-hoc inline color choices appear in admin (`bg-yellow-100`, `bg-orange-100`, `from-blue-600 to-indigo-700`). These bypass the token system.
- Two button styles co-exist: token-based (`bg-primary text-surface-raised hover:bg-primary-hover`) and shadcn-default (`bg-primary text-primary-foreground` in `ui/button.tsx`). The latter references `primary-foreground` which is not defined in the token system — so it silently falls back to default Tailwind. Pre-existing tech debt.

### 3.6 Is the current structure suitable for 23+ game screens?

**Not as-is.** The current app has ~12 routes total. To add 23 game screens you need:

- A route grouping discipline (e.g. `app/(game)/...`) — does not exist yet.
- A shared game shell (sidebar/topbar for "Round 3 of 8", forfeit, opponent name, cash, reputation, market state). Does not exist.
- A reusable "screen container" with consistent padding, max-width, header — partially exists (`mx-auto max-w-[72rem] px-xl py-3xl`) but it's copy-pasted into every page rather than abstracted.
- A way to share "current match" context across many screens. Today there's no React Context anywhere in the repo.

### 3.7 Is the Decide screen likely to become unmanageable?

Yes — if you build it the way `LessonPlayer.tsx` is built, **with certainty**. The Decide screen has:

- 6 domain columns × N moves each = many cards.
- Per-move input controls (slider, stepper, toggle, target select, amount, mode).
- Draft state (3 moves picked, with inputs).
- Validation against legal moves from server (prerequisites, conflicts, cost ≤ cash, unlock budget).
- Cost/known-effect previews.
- Submit + lock + revise flow.

If all of that lives in `DecideScreen.tsx` like `LessonPlayer.tsx`, we will have a 1500-LoC component within a sprint. It must be split before it is written: a `useDraftTurn()` hook + a `MoveCatalogue` selector + per-input `MoveInput*` components + a thin shell.

### 3.8 Are domain cards and move cards modelled cleanly?

No domain or move cards exist. **At all.** Closest analogues:

- `LessonsCatalog.tsx` lesson card pattern with category gradients — a *vague* template you might lift.
- `QuizGate.tsx` "answer one of four options" pattern — closer to picking a move, but tightly coupled to quiz schema.

There is no `<MoveCard>` and no abstraction that would render one from metadata.

### 3.9 Is there a clear path to reusable move components?

There is *no* path; there is a *clean slate*. That's actually good news — nothing to refactor, just establish the abstraction.

Recommended location (no code yet, just structure): `src/components/game/moves/MoveCard.tsx`, `src/components/game/moves/inputs/{Slider,Stepper,SingleChoice,Toggle,Amount,Target,Mode}Input.tsx`. Reuse `src/components/ui/*` primitives underneath.

---

## 4. Current Game / Domain Architecture Audit

### 4.1 Is there a clear Match model?

**No.** Nothing called `Match`, `match`, `matches`, `MatchState`, `MatchPlayer` exists in `src/`. No DB table. No type. No route.

### 4.2 Is there a clear Round model?

**No.** No `Round`, `RoundState`, `round_states` table. The word "round" appears only in unrelated phrases ("rounded-lg") and comments.

### 4.3 Is there a clear PlayerState model?

**No.** The only player-ish thing is `profiles` in `src/db/schema.ts` (id, username, totalXp, currentLevel, createdAt, updatedAt) — that's an *account*, not a game-player state.

### 4.4 Is there a clear PublicState vs PrivateState distinction?

**No.** There is no visibility model anywhere. Lesson progress is per-user but it's not designed as "filterable state across viewers" — it's just per-row ownership.

### 4.5 Is there a clear Move / Action model?

**No.** The brief's "moves" do not exist as a concept. Lesson quizzes have `QuizQuestion { options, correctAnswer, ... }` but that is multiple-choice content, not a parameterised move catalogue.

### 4.6 Is price modelled as persistent state or just UI input?

**Not modelled at all.** Nowhere in the repo. The word "price" appears 0 times in `src/`. (It appears 19 times across the whole `econblog/` workspace — only in lesson markdown, Stripe price IDs, and Tailwind config.)

### 4.7 Are visibility rules represented anywhere?

**No.** There's no concept of "filter this state for player X." The closest analogue is the `quizStatuses` returned per user — which is trivially per-user-owned, not a visibility filter.

### 4.8 Are move prerequisites / conflicts represented anywhere?

**No.** The lesson "corpus" in `src/lib/learning/corpus-lessons.ts` has `prereqs: number[]` for *lessons*, used by `path-engine.ts` to order recommendations. That is **the only "prereq" pattern in the entire repo** — recommendation graph traversal, not validation of legal moves. It is structurally similar but conceptually unrelated.

### 4.9 Is there any current engine logic?

**No game engine.** Two things are *named* "engine":

- `src/lib/learning/path-engine.ts` — recommends an ordered list of corpus lesson IDs from interest tags + completion set. Pure-ish (no React, no DB, no IO). Good shape, wrong domain.

The only logic that resembles "engine" behaviour is the unlock state machine in `LessonPlayer.tsx` + `src/app/api/lessons/[slug]/quiz/attempt/route.ts`, both of which are **interleaved UI + DB writes**, not deterministic and not isolated.

### 4.10 Is game logic mixed into React components?

There is no game logic at all. But the *pattern* in this codebase — gating logic in `LessonPlayer.tsx`, XP arithmetic in `app/api/lessons/[slug]/quiz/attempt/route.ts` (lines 80–124) — predicts that game logic would also be mixed in. That is the highest-leverage thing to fix preemptively.

### 4.11 Is there any deterministic resolution path?

**No.** Quiz attempts compute `xpEarned` based on `attemptNumber` and `xpPenalties` arrays, but with side effects (DB writes), interleaved reads, and `new Date()` for timestamps. Not deterministic, not pure, not replayable. Acceptable for quizzes; unacceptable for a game engine.

### 4.12 Is there seeded randomness?

**No.** No `seedrandom`, no `xoshiro`, no `mulberry32`, no PRNG dependency in `package.json`. Mastery exam pool sampling is not in the repo as code yet (the schema has `masteryQuiz.questionPool` and `questionsPerAttempt`, but the random draw must be happening in `MasteryExam.tsx` — which means using `Math.random()`, unsuitable for replayable rounds).

### 4.13 Is there any report generation logic?

**No.** There is no concept of a "report" anywhere. `RoundReport`, `PublicReport`, `PrivateReport` do not exist as types, DB rows, or functions.

### 4.14 Risk summary for this section

- **Critical:** there is no domain model. Building UI before a domain model produces UI that has to be rewritten when the engine arrives.
- **Critical:** the existing patterns predict that game logic will leak into React.
- **High:** no seeded RNG means even toy reproducibility is impossible today.
- **High:** there is no "report" concept; the brief depends heavily on reports as the post-round teaching tool.

---

## 5. Hidden Information and Anti-Cheat Audit

### 5.1 Does the client currently receive data it should not?

**Yes, but only at the level the current product allows.** The lesson quiz answer endpoint reveals the correct answer in the response when the user is wrong-but-not-locked? Let me be precise — in `src/app/api/lessons/[slug]/quiz/attempt/route.ts`:

```ts
correctAnswer: isCorrect ? question.correctAnswer : undefined,
explanation: question.explanation,
```

The explanation is always returned, even on wrong answers. The correctAnswer is only returned on correct. That's deliberate for lessons. But notice the *shape*: the server returns enough info to power the client UI without re-fetching the question. That is the **right** pattern — but it's the only place I see that pattern enforced. Other endpoints (`/api/lessons/[slug]/progress`, `/api/lessons/[slug]/quiz/status`) return raw DB rows.

The mastery quiz question pool returned to the client *includes* `correctAnswer` and `explanation` for every question (`rowToLessonData` in `src/lib/lesson-loader.ts` reads `q.correctAnswer` and `q.explanation` and they get sent to the page, which means a determined user can read the correct answers from the network tab). This is a known limitation for the lessons product but reveals that **the team's current pattern is to send everything to the client and rely on UI to gate**. That habit will sink hidden information in The Price War.

### 5.2 Is state filtering done server-side?

**No filtering is done at all.** No `toPublicView()`, `toPlayerView()`, `redact()`, or similar function exists. Every endpoint returns either:

- Per-user rows (lesson_progress, quiz_attempts) where the filter is just "where user_id = me" — trivial.
- Public catalog content (lessons, leaderboard) — already public.

There is no two-player endpoint anywhere, so the problem hasn't surfaced yet.

### 5.3 Is there a concept of viewer-specific match state?

**No.**

### 5.4 Could a player inspect the browser payload and see opponent private data?

Not today, because no payload contains opponent data. But: given the existing pattern of "load the entire lesson with answers into the client", the **default temptation** when building the game will be to load the whole `MatchState` into the client and let React filter. That is the worst possible outcome and would be undetectable until exploited.

### 5.5 Does the current structure make future anti-cheat easy or hard?

**Hard, by default**, because:

- No engine module exists where validation can be centralised.
- No "server view" abstraction exists.
- No project convention discourages returning over-fetched DB rows.
- The shadcn pattern + Drizzle + `select()` everywhere encourages `return NextResponse.json(row)` shorthand.

But **easy to fix preemptively** if you establish two rules now:

1. The server's only response shape for game data is the return value of `toPlayerView(matchState, playerId, scenario, recentEvents)`. Never return `matchState` directly.
2. Hidden state never lives in the client; the client never receives `opponent.private`. Anything inferable is derived server-side and returned as `intel` with provenance.

### 5.6 Risks specific to naïvely adding a backend now

If you add a Supabase Realtime channel on a `matches` table without a visibility filter:

- Both players will subscribe to the same row.
- The full row will broadcast to both clients.
- All fields, including the opponent's submitted moves and private cash/morale/loyalty, will arrive in both browsers.
- The DevTools "Network → WS" tab will leak everything.

This is the most predictable, most catastrophic failure for this product. Prevent it by **not using Supabase Realtime on game tables at all** — use it only on `match_events_public` projections, or push public-only deltas through a server endpoint.

---

## 6. Engine-Readiness Audit

### 6.1 Where should the engine live?

Two viable options. Both work; pick one and commit.

**Option A — internal module (simplest).** `econblog/src/game/`:

```
src/game/
├── engine/        # pure, no React, no Next, no DB
├── scenarios/     # coffee-shop/{config.ts, demand.ts, costs.ts, events.ts}
├── moves/         # catalogue + types + per-move handlers
├── types/         # shared types (Match, Round, Move, State, Reports, Visibility)
├── visibility/    # toPlayerView, intel inference
└── rng/           # seeded PRNG wrapper
```

Pros: no new tooling, no workspace plumbing, no version bumps. Works with the existing `pnpm-workspace.yaml` mess. Imports via `@/game/...`.

Cons: the boundary is convention-only. Someone can `import { db } from "@/db"` inside engine and nothing stops them. Mitigate with a small ESLint rule once you adopt ESLint.

**Option B — workspace package.** `packages/engine`:

```
packages/
├── engine/        # @pricewar/engine — pure TS, no Next.js, no React
├── types/         # @pricewar/types — shared types only
└── scenarios/     # @pricewar/scenarios — coffee shop, future scenarios
econblog/          # imports @pricewar/engine, @pricewar/types
```

Pros: hard boundary. The engine cannot import `next/*`, `@/db`, or React. Easier to reuse in a worker or background job.

Cons: needs working `pnpm-workspace.yaml` (currently broken — only has `allowBuilds:` keys). Needs `tsconfig` project references. More plumbing today, less rot later.

**Recommendation: start with Option A**, plan to extract to Option B before scenario 2 (post-v1). The migration is cheap if `src/game/engine` keeps zero `@/db` and zero `next/*` imports from day 1.

### 6.2 Is the current repo structure compatible with a pure TypeScript engine module?

Yes. The TypeScript config (`tsconfig.json`) is strict and uses bundler resolution. Adding a `src/game/` folder requires zero config changes. `@/game/*` will resolve through the existing path alias.

### 6.3 Should the engine be isolated from the UI?

**Absolutely yes.** Engine must:

- Be a function: `resolve(state, submittedTurns, scenario, seed) → { nextState, publicReport, privateReports, trace }`.
- Have no DB, no `fetch`, no `next/*`, no React, no `process.env`.
- Be importable from a Node script (`scripts/sim.ts`) to run 10,000 simulated matches.

### 6.4 What types should be shared between UI and engine?

Shared (engine + UI both import from `src/game/types/`):

- `MoveDefinition` (catalogue entry, including UI hints like `inputType`).
- `SubmittedMove` (instance with input value chosen by the player).
- `PublicMatchView` (what the server returns to a viewer).
- `PrivateMatchView` (the viewer's own state).
- `RoundReport` (public + private).
- `Intel` (revealed/inferred opponent info).
- `Domain`, `MoveTag`, `Visibility`, `Timing` enums.
- `ScenarioId`, `MatchPhase`, `MatchOutcome`.

Not shared (engine-only):

- `MatchState` (full state including both players' private state — never crosses the network).
- Internal computation types: `DemandModelInput`, `CostModelInput`, `EventRoll`, `Allocation`.
- Trace types (`EngineTrace`, `Step`).

Not shared (UI-only):

- Draft state types, modal state types, etc.

### 6.5 Deterministic resolution and replay

- Add a seeded PRNG (recommended: a 5-line `mulberry32` or import `seedrandom`). Pass it through every step. **Never** call `Math.random()` in engine.
- Store the seed per round (`round_states.seed`) so any round is replayable from `(stateBefore, submittedTurns, scenarioConfig, seed)`.
- Store the engine version (`engine_version`) on each round so old replays can pin to old code.

### 6.6 Debug traces

- Return a `trace: EngineTrace` from `resolve()`. Each step (validate, apply policies, roll events, compute demand, allocate, finalise) pushes a structured entry: `{ step, before, after, deltas, notes }`.
- Persist on dev/admin only. Hide in prod responses.
- A debug overlay (admin-only) renders the trace next to the report. Reuses existing admin-gated route pattern.

### 6.7 How to test the engine

- **Vitest** for unit + property tests. Add `vitest` + `@vitest/coverage-v8` to dev deps. Add `pnpm test` to scripts.
- **Snapshot fixtures.** Each test scenario is a JSON: `{ stateBefore, turns, seed, expectedReport, expectedStateAfter }`. Replay loops verify byte-for-byte equality.
- **Property tests.** "Allocated customers ≤ total demand." "Cash never goes below `-debtLimit`." "If both players submit the same moves with the same seed, the report is identical."

### 6.8 Recommended engine folder structure

```
src/game/
├── types/
│   ├── index.ts           # re-exports
│   ├── match.ts           # Match, MatchPhase, MatchOutcome
│   ├── round.ts           # RoundState, RoundReport
│   ├── move.ts            # MoveDefinition, SubmittedMove, MoveTag, MoveInputSpec
│   ├── domain.ts          # Domain enum, six-domain colors
│   ├── visibility.ts      # Visibility, Intel
│   ├── views.ts           # PublicMatchView, PrivateMatchView, OpponentSnapshot
│   └── trace.ts           # EngineTrace, EngineStep
├── engine/
│   ├── resolve.ts         # the entry point
│   ├── validate.ts        # move count, prereqs, conflicts
│   ├── policies.ts        # persistent policy application
│   ├── events.ts          # stochastic events
│   ├── product.ts         # quality + cost
│   ├── people.ts          # morale, service, capacity
│   ├── demand.ts          # market demand + traffic
│   ├── allocate.ts        # customer allocation
│   ├── finance.ts         # revenue, expenses, cash, debt
│   ├── reputation.ts      # satisfaction, loyalty, review, reputation
│   ├── triggers.ts        # austerity, bankruptcy, abandonment
│   └── reports.ts         # build public + private reports
├── moves/
│   ├── catalogue.ts       # the full registry
│   ├── handlers/          # one per move (or one per family)
│   └── inputSpecs.ts      # input type definitions
├── scenarios/
│   └── coffee-shop/
│       ├── index.ts       # ScenarioConfig
│       ├── moves.ts       # which moves are available + which are locked behind events
│       ├── events.ts      # event deck for coffee shop
│       └── balancing.ts   # numeric constants (referenced from engine)
├── visibility/
│   ├── toPlayerView.ts    # MatchState + playerId + scenario → PublicMatchView
│   └── intel.ts           # Scout / inferable derivation
├── rng/
│   └── seeded.ts          # mulberry32 wrapper
└── index.ts               # public API
```

---

## 7. Move Catalogue Audit

### 7.1 Are moves currently hardcoded?

There are **no moves** at all in the repo, so the question is forward-looking. The closest analogue is `corpus-lessons.ts` — an exported `const CORPUS_LESSONS: CorpusLesson[]` array. That **is** the pattern that would be copied: a single TS file with a giant array of literal objects. Fine for v1; not durable.

### 7.2 Is move data separate from rendering?

N/A — does not exist. But based on existing patterns (`onboarding-questions.ts`, `corpus-lessons.ts`, `interest-tags.ts`), the team's instinct is to put data in `src/lib/<feature>/...data.ts` files and render from there. That's the right instinct. Keep it.

### 7.3 Is there a move schema?

**No.** Not as a type, not as a Zod schema, not as a JSON Schema.

### 7.4 Are input types modelled?

**No.** Even the lesson `QuizQuestion` type in `src/lib/types/lesson.ts` has a fixed shape (`options: string[]`, `correctAnswer: number | null`). No discriminated union of input types exists.

### 7.5 Can the UI render a move from metadata?

**No.** And the lesson UI does *not* currently render quizzes from metadata in a generic way — `QuizGate.tsx` hardcodes the 4-option layout. So we have no existing precedent for "render from spec." We need to invent it.

### 7.6 Can the server validate a submitted move from the same metadata?

**No.** Same answer.

### 7.7 What needs to change?

- Define `MoveDefinition` and `MoveInputSpec` as discriminated unions in `src/game/types/move.ts`.
- Implement `<MoveCard move={def} value={draft} onChange={...} />` in `src/components/game/moves/MoveCard.tsx`.
- Implement `<MoveInput spec={def.input} ... />` that switches on `spec.kind`.
- Implement `validateSubmittedMove(def, submitted)` in `src/game/engine/validate.ts` that uses the same `MoveDefinition`.
- Per-move custom logic (effect application) lives in `src/game/moves/handlers/`, keyed by `move.id`.

### 7.8 Recommended structure for the catalogue

```
src/game/moves/
├── catalogue.ts                # const MOVE_CATALOGUE: Record<MoveId, MoveDefinition>
├── inputSpecs.ts               # MoveInputSpec discriminated union
└── handlers/                   # per-move side effects (engine-only)
    ├── sales/{set-price, run-promo, ...}.ts
    ├── procurement/{...}.ts
    ├── operations/{...}.ts
    ├── hr/{...}.ts
    ├── marketing/{...}.ts
    └── finance/{...}.ts
```

Indirection is on purpose: the catalogue is data; the handlers are code. UI imports catalogue only.

---

## 8. Data Model Recommendations

Add to `src/db/schema.ts` (Drizzle, Postgres). Names follow existing snake_case convention.

### 8.1 Entities

| Entity | Type | Purpose |
|---|---|---|
| `users` | reuse Supabase `auth.users` | account |
| `profiles` | **already exists** | display username, totalXp, currentLevel — extend if needed |
| `matches` | **new** | one row per match |
| `match_players` | **new** | one row per player per match |
| `round_states` | **new** | one row per round per match |
| `submitted_turns` | **new** | one row per (round, player) — encrypted? or just gated read |
| `submitted_moves` | **new** | one row per submitted move (3 per turn) |
| `move_definitions` | **derived constant** | source of truth lives in TS (`src/game/moves/catalogue.ts`); not in DB |
| `scenario_configs` | **derived constant** | source of truth in TS (`src/game/scenarios/coffee-shop/`) |
| `round_reports` | **new** | denormalised serialised reports per round (public + private blobs) |
| `match_events_public` | **new** | append-only public events stream (for real-time / replay) |
| `player_intel` | **new** | revealed/inferred opponent info per player per round |
| `elo_ratings` | **new** | per (user, scenario) Elo |
| `notifications` | **new** | per user, append-only |
| `match_history` | **view or table** | per-user list with outcomes |

### 8.2 Suggested schemas (Drizzle pseudocode)

```ts
// src/db/schema/game.ts (new file; existing schema in src/db/schema.ts stays)

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioId: text("scenario_id").notNull(),           // "coffee-shop"
  scenarioVersion: text("scenario_version").notNull(),
  engineVersion: text("engine_version").notNull(),
  totalRounds: integer("total_rounds").notNull().default(8),
  currentRound: integer("current_round").notNull().default(1),
  phase: text("phase").notNull().default("decide"),    // "decide" | "resolving" | "report" | "complete" | "abandoned"
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  outcome: text("outcome"),                            // "p1_win" | "p2_win" | "draw" | "p1_bankrupt" | "p1_abandoned" | ...
  rngSeed: text("rng_seed").notNull(),                 // base seed; round_states store per-round derived seeds
});

export const matchPlayers = pgTable("match_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  slot: integer("slot").notNull(),                     // 0 | 1
  displayName: text("display_name").notNull(),
  eloBefore: integer("elo_before").notNull(),
  eloAfter: integer("elo_after"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  abandonedAt: timestamp("abandoned_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("match_players_match_slot_idx").on(t.matchId, t.slot),
  index("match_players_user_idx").on(t.userId),
]);

export const roundStates = pgTable("round_states", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  stateBlob: jsonb("state_blob").notNull(),            // full authoritative MatchState (server-only)
  seed: text("seed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("round_states_match_round_idx").on(t.matchId, t.roundNumber),
]);

export const submittedTurns = pgTable("submitted_turns", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  playerSlot: integer("player_slot").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  draftBlob: jsonb("draft_blob"),                      // pre-submit drafts (overwritable)
  finalBlob: jsonb("final_blob"),                      // final submitted (3 moves) — null until lock-in
  autopassed: boolean("autopassed").default(false).notNull(),
}, (t) => [
  uniqueIndex("submitted_turns_match_round_slot_idx").on(t.matchId, t.roundNumber, t.playerSlot),
]);

export const submittedMoves = pgTable("submitted_moves", {
  id: uuid("id").defaultRandom().primaryKey(),
  turnId: uuid("turn_id").references(() => submittedTurns.id, { onDelete: "cascade" }).notNull(),
  slot: integer("slot").notNull(),                     // 0 | 1 | 2 (within the turn)
  moveId: text("move_id").notNull(),                   // matches MoveDefinition.id
  inputs: jsonb("inputs").notNull(),                   // typed-per-move input payload
});

export const roundReports = pgTable("round_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  publicBlob: jsonb("public_blob").notNull(),          // both players see
  privateBlobs: jsonb("private_blobs").notNull(),      // { "0": {...}, "1": {...} }
  trace: jsonb("trace"),                               // engine trace, admin-only response
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("round_reports_match_round_idx").on(t.matchId, t.roundNumber),
]);

export const matchEventsPublic = pgTable("match_events_public", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  kind: text("kind").notNull(),                        // "price_change" | "announcement" | "scout_used" | ...
  payload: jsonb("payload").notNull(),                 // PUBLIC payload only
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("match_events_public_match_idx").on(t.matchId, t.roundNumber)]);

export const playerIntel = pgTable("player_intel", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  playerSlot: integer("player_slot").notNull(),
  source: text("source").notNull(),                    // "scout" | "inference" | "announcement"
  payload: jsonb("payload").notNull(),
});

export const eloRatings = pgTable("elo_ratings", {
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  scenarioId: text("scenario_id").notNull(),
  rating: integer("rating").notNull().default(1200),
  matches: integer("matches").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.scenarioId] })]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  kind: text("kind").notNull(),                        // "match_ready" | "opponent_submitted" | "rematch_request" | ...
  payload: jsonb("payload").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)]);
```

`MoveDefinition` and `ScenarioConfig` are **not** in the DB — they are versioned TS in `src/game/`. Match rows reference them by id + version.

### 8.3 Public vs Private vs Derived vs Persisted

| Data | Public | Private | Derived | Persisted |
|---|---|---|---|---|
| `matches` row (id, currentRound, phase, currentPrice per slot) | yes (limited) | — | — | yes |
| `match_players` row | yes (slot, displayName, elo) | — | — | yes |
| `round_states.stateBlob` | **never** | server-only | — | yes (server-only read) |
| `submitted_turns.finalBlob` (your own) | — | yes (own only, after lock) | — | yes |
| `submitted_turns.finalBlob` (opponent) | **never** until resolution | — | — | yes |
| `submittedMoves` (opponent) | **never** until resolution | — | — | yes |
| `round_reports.publicBlob` | yes (both players) | — | — | yes |
| `round_reports.privateBlobs[mySlot]` | — | yes (own only) | — | yes |
| `round_reports.privateBlobs[opponentSlot]` | **never** | — | — | yes (server-only) |
| `match_events_public` | yes | — | — | yes |
| `player_intel` (own) | — | yes | yes | yes |
| Current price per slot | yes (public) | — | derived from history | yes |
| Cash, debt, morale, capacity | — | yes (own only) | — | yes |
| Elo deltas | yes (post-match) | — | — | yes |
| `round_reports.trace` | **never** in production | admin only | — | yes (admin-only response) |

---

## 9. API Architecture Recommendations

All under `src/app/api/`. All require `Authorization` via Supabase session cookie (existing middleware). All game routes go in a new `src/app/api/game/` namespace to keep them separable from existing content APIs.

| Route | Method | Caller | Returns | Notes |
|---|---|---|---|---|
| `/api/game/match/[id]/view` | GET | one of the two players | `PublicMatchView + PrivateMatchView(mySlot)` | Calls `toPlayerView(state, mySlot)` server-side. **Never** returns raw `stateBlob`. Cache: `no-store`. |
| `/api/game/match/[id]/legal-moves` | GET | one of the two players | `LegalMove[]` for current round/state | Engine pure-function call. Returns IDs, available input ranges, prereq/conflict warnings, known costs. |
| `/api/game/match/[id]/draft` | PUT | one of the two players | 200 `{ ok }` | Save partial draft (autosave). Idempotent. Upserts into `submitted_turns.draftBlob`. |
| `/api/game/match/[id]/submit` | POST | one of the two players | `{ submitted: true, opponentSubmitted: boolean }` | Validates → writes `submitted_turns.finalBlob`. If both submitted → triggers resolve. |
| `/api/game/match/[id]/unlock` | POST | one of the two players | `{ unlocked: true }` | Only allowed while phase=decide and not yet locked-globally. Clears `finalBlob`. |
| `/api/game/match/[id]/resolve` | POST | server-only / cron / triggered from submit | `{ resolved: true, roundNumber }` | Idempotent via row lock. Loads state + turns, runs engine, writes next `round_state`, writes `round_reports`, writes `match_events_public`, advances `matches.phase`. |
| `/api/game/match/[id]/report/[round]` | GET | one of the two players | `{ public, private(mySlot) }` | Filters out `privateBlobs[opponentSlot]` and `trace`. |
| `/api/game/match/[id]/post-match` | GET | both players | aggregated analysis: turning points, best/worst move, charts, recommended lessons | Server-derived. Links recommended lessons by slug. |
| `/api/game/match/[id]/forfeit` | POST | one of the two players | `{ ok }` | Sets `outcome`, advances phase, updates Elo. |
| `/api/game/matchmaking/queue` | POST | any signed-in user | `{ matchId? }` | Enqueue or match. Naïve v1 = pair-by-Elo proximity. |
| `/api/game/matchmaking/cancel` | POST | the queued user | `{ ok }` | Removes from queue. |
| `/api/game/rematch/[matchId]/request` | POST | one of the two players | `{ requested: true }` | Notifies the other. |
| `/api/game/rematch/[matchId]/accept` | POST | the other player | `{ matchId: newId }` | Creates new match using same scenario + paired players. |
| `/api/game/lobby` | GET | any signed-in user | `{ active: Match[], pendingRematches: ..., queue: { in: boolean, since: ts } }` | Cheap aggregation. |
| `/api/game/notifications` | GET | the user | `Notification[]` | Pagination. |
| `/api/game/notifications/[id]/read` | POST | the user | `{ ok }` | |
| `/api/game/profile/[userId]/history` | GET | any | `Match[] (public-safe)` | Public match cards. |
| `/api/game/leaderboard?scenario=coffee-shop` | GET | public | Elo-ranked | Separate from XP leaderboard. |

### Per-route risks to watch

- **`/match/[id]/view`** — never include `state_blob` directly. The single highest-leverage anti-cheat enforcement point.
- **`/match/[id]/submit`** — must validate moves *server-side using the engine's `validate.ts`*, not trust the client's "legal moves" response.
- **`/match/[id]/resolve`** — must be **idempotent** under both players submitting near-simultaneously and under retries. Use a `SELECT ... FOR UPDATE` or an advisory lock on `match_id` to serialize.
- **`/match/[id]/legal-moves`** — must be pure. Returning richer hints later (e.g. predicted cost) must remain a pure function of `(state, scenario)`.
- **`/match/[id]/unlock`** — define what "unlock and revise" means precisely. If the opponent has already submitted, do we tell them? Probably yes via `opponentSubmitted` flag (already in submit response) but **not** the opponent's submitted contents.
- **`/matchmaking/queue`** — racy. Two players may match the same opponent. Use a single Postgres transaction with `FOR UPDATE SKIP LOCKED`.
- **`/rematch/.../accept`** — must verify both users explicitly opted in within a TTL.

### Realtime

Avoid Supabase Realtime on `matches`, `round_states`, `submitted_turns`. **Only** subscribe to `match_events_public`. Even then, server should filter row-by-row that the subscriber is one of the two players.

For v1, polling at 1–2s while phase=`decide` and phase=`resolving` is fine. Switch to Realtime in v1.5 if polling cost becomes real.

---

## 10. State Management Recommendations

### 10.1 The four categories

| Category | Where it lives | Library |
|---|---|---|
| Server state (match view, lobby, reports) | server, fetched | **React Query** (already in deps, currently unused) |
| Local draft state (the 3 moves picked, their inputs, reordering) | client only, ephemeral | `useReducer` in a small `useDraftTurn()` hook |
| Derived display state (cost preview, conflict highlights, "valid?" flag) | computed from draft + legal moves response | pure selector function `selectDraftDerived(draft, legalMoves)` |
| Optimistic UI | none for game-critical flows | **disallow** for `submit/resolve`; allow for `draft autosave` only |

### 10.2 Specifically

- **Selected moves:** `useDraftTurn()` with `slots: [Slot, Slot, Slot]`, each `Slot = null | { moveId, inputs }`. Persist to localStorage **and** debounced `PUT /api/game/match/:id/draft` server-side.
- **Move inputs:** typed per `MoveInputSpec`. Inputs are *always* validated against the same spec on the server.
- **Review/Submit:** show derived `summary` from a pure function. Submit button disabled until `derived.canSubmit`. On submit, optimistic = false; show "submitting…" until server confirms.
- **Submitted/waiting state:** poll `/api/game/match/:id/view` every 2s; show `opponentSubmitted: boolean`. When `phase === "report"`, transition to report screen.
- **Unlock and revise:** UI shows revise button while `phase === "decide" && !globallyLocked`. Backend may forbid; React Query revalidates.
- **Round results:** read-only from `/api/game/match/:id/report/:round`. Animate in chunks: announcement → demand → allocation → finance → reports → key takeaways.
- **Hidden opponent state:** never modelled client-side. The "ScoutIntel" cards render only what the server returned in `private.intel[]`.
- **Tooltips / expanded details:** local component state (Radix popover/tooltip already available in `src/components/ui/{popover,tooltip,dialog}.tsx`).

### 10.3 Concretely

- Add `QueryClientProvider` in a new client-side wrapper around `<main>` in `src/app/layout.tsx` (or a `app/(game)/layout.tsx` only for game routes).
- Build the four hooks first: `useMatchView()`, `useLegalMoves()`, `useDraftTurn()`, `useSubmitTurn()`. All other game UI should be built on top of these.

---

## 11. Testing Strategy

### 11.1 What is missing today

Everything. There is no test infrastructure of any kind in `econblog/`. `pnpm test:serpapi` is a connectivity check, not a test.

### 11.2 Recommended

| Layer | Tool | What to cover first |
|---|---|---|
| Engine unit tests | Vitest | every step (`validate`, `policies`, `events`, `demand`, `allocate`, `finance`, `reports`); 30–50 small tests per scenario |
| Deterministic replay tests | Vitest | given `{state, turns, seed, scenarioVersion}`, `resolve()` must produce a byte-identical `nextState` + `roundReports` snapshot |
| Move validation tests | Vitest | every move id: legal inputs accepted, illegal rejected, conflicts detected, prereqs enforced |
| Visibility filtering tests | Vitest | property: `JSON.stringify(toPlayerView(state, 0))` must never contain any value from `state.players[1].private` |
| API tests | Vitest + lightweight harness around `app/api/*/route.ts` handlers | submit-twice → idempotent; submit-without-auth → 401; submit-bad-payload → 400; resolve-while-opponent-pending → 409 |
| Component tests | React Testing Library | `<MoveCard>`, `<MoveInput*>`, draft hook, submit hook |
| Important user flow tests | Playwright | `decide → submit → wait → report → next round`, played as two browser contexts in parallel |
| Regression for balancing formulas | Vitest snapshot tests over golden replays | every tuning change diffs a clear set of fixtures |

### 11.3 Add at minimum

```jsonc
// econblog/package.json scripts
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage",
"typecheck": "tsc --noEmit"
```

A simple `vitest.config.ts` at `econblog/` root. No new tools beyond `vitest` and `@vitest/coverage-v8`.

### 11.4 CI

There is no CI workflow in this repo today (`.github/` is absent). Add one only after the first test exists; resist over-engineering.

---

## 12. Risks and Red Flags (Prioritised)

### Critical

- **C1 — Hidden opponent state leaking via "default" Supabase patterns.** If anyone writes a Server Component that does `await db.select().from(matches).where(eq(matches.id, id))` and returns the row to the client, opponent state leaks. Current habit (e.g. `app/profile/page.tsx`) is to `select()` whole rows. Mitigation: enforce `toPlayerView` as the *only* function that returns match data to clients.
- **C2 — Game logic in React.** The 685-LoC `LessonPlayer.tsx` is the prototype for "domain logic in a screen component." The Decide screen will be 2× worse unless engine is established first. Establish engine module before the screen.
- **C3 — No deterministic engine / no seeded RNG.** Once shipped, fixing this requires migrating all existing matches. Cheap now, expensive later.

### High

- **H1 — Move catalogue hardcoded in JSX.** Strong likelihood given existing `corpus-lessons.ts`-as-array pattern. If move metadata isn't a type-first registry from day one, you will be hand-editing JSX every time you balance.
- **H2 — No debug trace.** Without `EngineTrace` from day one, every bug becomes "I think it computed demand wrong." With trace, every bug is a JSON diff. Cheap to add; expensive to add later.
- **H3 — Route / component sprawl.** 23 screens vs. the existing 12 routes, with no `app/(game)/` route group and no `GameShell` layout. Will produce 23 copy-pasted page containers.
- **H4 — No clear domain model.** Predictable cost: doubled refactor work after the engine arrives.
- **H5 — No scenario config abstraction.** Coffee Shop will end up hardcoded in engine code unless `ScenarioConfig` is a typed object you can swap.
- **H6 — Weak / nonexistent testing.** Already covered. Highest leverage to fix in week 1.
- **H7 — Overbuilding UI before engine structure.** Existing pattern of "ship the screen first, plumb later" is already visible in admin and lessons. Will repeat here.

### Medium

- **M1 — Business-sim feel overtaking game feel.** Brief explicitly warns about this. The visual system in `.impeccable.md` is editorial/dense; not gamified. The Price War needs more punch (round timer, opponent-name banner, "submit" button as a hand-played card). Apply a *parallel* token scale in `globals.css` (e.g. `--color-arena-*`, `--shadow-card`) rather than overloading existing tokens. Keep the brand sober; bring tension through layout and motion.
- **M2 — Price incorrectly treated as always-required.** No state model exists yet, so this is preventable. Make `currentPrice` a *persistent attribute*, not a per-turn input. Brief is explicit.
- **M3 — "No change" incorrectly treated as a move.** Same. Holding price is the *absence* of a move, not a move with id `hold-price`. Encode "no change" as never appearing in `submitted_moves` for slot N. The catalogue should not contain a `hold` move id at all.
- **M4 — Missing conflict rules.** Already covered. Add `conflictsWith: MoveId[]` and `requiresAnyOf: MoveId[]` to `MoveDefinition`. Enforce in `validate.ts`.
- **M5 — Missing visibility rules per move.** `MoveDefinition.visibility: "public" | "private" | "inferable" | "conditional" | "revealedAfterResolution"`. Enforce in `reports.ts`.
- **M6 — Missing report-generation architecture.** Already covered. Address with `src/game/engine/reports.ts`.
- **M7 — `pnpm-workspace.yaml` is broken at both levels.** Files contain only `allowBuilds:` keys. If we move to a workspace, this needs a real `packages:` declaration.
- **M8 — `@tanstack/react-query` in deps but unused.** Either commit to using it (recommended) or remove it.
- **M9 — No ESLint config.** Strict TS catches a lot but not visibility leaks. Eventually add an `eslint-plugin-import` rule to forbid `import from "@/db"` and `import from "next/*"` inside `src/game/`.
- **M10 — Naming drift.** Repo already uses both "actions" and "moves" in adjacent contexts. The lesson XP code uses "actions" colloquially. Codify "moves" now.

### Low

- **L1 — `LessonPlayer.tsx` size.** Refactoring it is out of scope for the game but it sets the cultural ceiling on component size. Worth eventual cleanup.
- **L2 — Mild design-token inconsistency** between `src/components/ui/button.tsx` (shadcn defaults) and the rest of the app (custom tokens). Won't affect the game directly.
- **L3 — Two near-duplicate gradient maps** for category cards (`src/app/admin/page.tsx`, `src/components/lessons/LessonsCatalog.tsx`).
- **L4 — README outdated.** Mentions Serper but code uses SerpAPI.
- **L5 — `Prisma`-era comment in README** ("Prisma — Database ORM (ready for future use)") despite Drizzle being the actual ORM.

---

## 13. Recommended Target Architecture

Pragmatic, not overengineered. Designed to ship Coffee Shop v1, support 23+ screens, and not block scenario 2.

```
econblog/
├── src/
│   ├── app/
│   │   ├── (marketing)/                   # existing landing/lessons/leaderboard stay
│   │   │   └── ...
│   │   ├── (game)/
│   │   │   ├── layout.tsx                 # GameShell — current match top bar, side rail, presence
│   │   │   ├── play/
│   │   │   │   ├── page.tsx               # lobby
│   │   │   │   ├── scenarios/page.tsx     # scenario select
│   │   │   │   ├── queue/page.tsx         # matchmaking
│   │   │   │   └── match/[id]/
│   │   │   │       ├── page.tsx           # routes to current phase
│   │   │   │       ├── briefing/page.tsx
│   │   │   │       ├── decide/page.tsx
│   │   │   │       ├── review/page.tsx
│   │   │   │       ├── waiting/page.tsx
│   │   │   │       ├── report/[round]/page.tsx
│   │   │   │       ├── postmatch/page.tsx
│   │   │   │       ├── austerity/page.tsx
│   │   │   │       ├── bankruptcy/page.tsx
│   │   │   │       └── abandoned/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── leaderboard/page.tsx       # ELO leaderboard (separate from XP one)
│   │   │   ├── notifications/page.tsx
│   │   │   └── tutorial/page.tsx
│   │   └── api/
│   │       └── game/                      # all game routes; see §9
│   ├── components/
│   │   ├── game/
│   │   │   ├── shell/                     # GameTopBar, RoundCounter, MarketTicker, OpponentBadge
│   │   │   ├── moves/
│   │   │   │   ├── MoveCard.tsx
│   │   │   │   ├── MoveDetailPanel.tsx
│   │   │   │   ├── MoveTagPill.tsx
│   │   │   │   └── inputs/
│   │   │   │       ├── SliderInput.tsx
│   │   │   │       ├── StepperInput.tsx
│   │   │   │       ├── SingleChoiceInput.tsx
│   │   │   │       ├── ToggleInput.tsx
│   │   │   │       ├── AmountInput.tsx
│   │   │   │       ├── TargetInput.tsx
│   │   │   │       └── ModeInput.tsx
│   │   │   ├── decide/                    # DecideScreen, DraftSlot, DomainColumn
│   │   │   ├── review/                    # ReviewSubmit
│   │   │   ├── report/                    # RoundReport, DemandPanel, FinancePanel, IntelCards
│   │   │   ├── postmatch/                 # PostMatchAnalysis, TurningPoints, BestMove, RecommendedLessons
│   │   │   ├── lobby/                     # LobbyList, MatchCard, RematchPrompt
│   │   │   ├── matchmaking/               # Queue, QueueStatus
│   │   │   └── notifications/             # NotificationsList, NotificationCard
│   │   └── ui/                            # existing primitives — reused
│   ├── game/                              # the engine + types + scenarios — pure TS
│   │   ├── types/
│   │   ├── engine/
│   │   ├── moves/
│   │   ├── scenarios/coffee-shop/
│   │   ├── visibility/
│   │   ├── rng/
│   │   └── index.ts                       # the only allowed external import surface
│   ├── server/
│   │   └── game/
│   │       ├── repository.ts              # DB reads/writes — wraps Drizzle
│   │       ├── matchmaker.ts              # queue + pair
│   │       ├── resolver.ts                # orchestrates loadState → resolve → persist → notify
│   │       └── elo.ts
│   ├── client/
│   │   └── game/
│   │       ├── hooks/
│   │       │   ├── useMatchView.ts
│   │       │   ├── useLegalMoves.ts
│   │       │   ├── useDraftTurn.ts
│   │       │   └── useSubmitTurn.ts
│   │       └── providers/
│   │           └── QueryProvider.tsx
│   ├── db/
│   │   ├── index.ts                       # existing
│   │   ├── schema.ts                      # existing (content) — leave alone
│   │   └── schema/
│   │       ├── content.ts                 # move existing schema here (optional)
│   │       └── game.ts                    # the new game tables (§8)
│   ├── lib/                               # existing — content / auth / utility
│   └── middleware.ts                      # extend with /play and /api/game gating
└── vitest.config.ts                       # new
```

### Boundaries

- `src/game/**` may only import from `src/game/**`. No `next/*`, no `@/db`, no `@/components/*`. Enforced by convention now, ESLint later.
- `src/server/game/**` is allowed to import `src/game/**` and `@/db`. This is the only place where engine meets DB.
- `src/components/game/**` may import `src/game/types/**` but **never** `src/game/engine/**`. UI sees types only.
- `src/client/game/hooks/**` may import `src/game/types/**` and call `/api/game/**`. No direct engine import.

### What does not change

- `src/app/(marketing)/...`, `src/components/landing/**`, `src/lib/lesson/**`, `src/lib/admin/**`, Stripe wiring, Supabase wiring, middleware — leave entirely alone. Game additions are additive.

### What changes only slightly

- `src/middleware.ts` — add a `GAME_ROUTES` allowlist that requires auth.
- `src/app/layout.tsx` — keep marketing header on marketing routes; let `(game)/layout.tsx` provide its own shell.
- `src/db/schema.ts` — either co-locate game tables here or split into `src/db/schema/{content,game}.ts` and update `src/db/index.ts` to import both.

---

## 14. Migration / Build Sequence (repo-specific)

Numbered, fast-to-slow. Each step is small enough to ship in a half-day, except where noted. **Stop at any step to gather feedback; nothing later depends on a final answer at this point.**

1. **Clean folders.** Create `src/game/`, `src/components/game/`, `src/server/game/`, `src/client/game/`. Add a placeholder `src/game/README.md` describing the import rule. (½ day)
2. **Define core types.** `src/game/types/{match,round,move,domain,visibility,views,trace}.ts`. No implementation yet. Get the discriminated unions for `Move`, `MoveInputSpec`, `Visibility`, `Domain` reviewed before anything else. (1 day)
3. **Define move catalogue (data only, no handlers).** `src/game/moves/catalogue.ts` with the *initial* Coffee Shop moveset as data only (no effects yet). 4–6 per domain × 6 domains = ~30 moves. Keep handlers empty / stubbed. (1–2 days)
4. **Create mock Coffee Shop scenario config.** `src/game/scenarios/coffee-shop/index.ts` with `startingState`, `rounds: 8`, `eventDeck: []` (empty for v0), `balancing` constants. (½ day)
5. **Create engine skeleton.** `src/game/engine/resolve.ts` that loops the pipeline (`validate → policies → events → product → people → demand → allocate → finance → reputation → triggers → reports`) but each step is a stub that returns input unchanged. Pure. Tested with vitest. (1 day; introduces vitest as a side effect)
6. **Create visibility filter.** `src/game/visibility/toPlayerView.ts` — for now it just returns `{ public: {...}, private: state.players[mySlot].private, opponent: { slot, displayName, currentPrice } }`. Add property tests proving no opponent private data leaks regardless of input. (1 day)
7. **Add seeded RNG.** `src/game/rng/seeded.ts` (`mulberry32`). Wire through `resolve()`. (½ day)
8. **Add game DB schema.** Create `src/db/schema/game.ts` with the tables from §8. Update `src/db/index.ts` and `drizzle.config.ts` glob. Run `pnpm db:push` against Supabase. (1 day; **needs a no-break review** if you don't want to dual-write your production DB — recommend creating a separate Supabase project for game tables first, or a separate schema)
9. **Wire `/api/game/match/[id]/view`** to return a player view from a hand-crafted fixture match (no real persistence yet). (½ day)
10. **Wire lobby to mock data.** `app/(game)/play/page.tsx`. Renders the fixture match as a `MatchCard`. No real matchmaking. (½ day)
11. **Wire Decide screen to legal moves.** Render `<MoveCard>` × catalogue, hook up `useDraftTurn()`, no submit yet. (2 days)
12. **Implement Submit Turn.** `app/(game)/play/match/[id]/review/page.tsx`. `POST /api/game/match/[id]/submit`. Writes to `submitted_turns`. (1 day)
13. **Implement Resolve Round.** Triggered when both `submitted_turns` exist for the round. Stub engine still returns input unchanged → write `round_reports.publicBlob` and `privateBlobs`. Verify visibility filter holds. (1 day)
14. **Implement Reports.** `app/(game)/play/match/[id]/report/[round]/page.tsx`. Read from `/api/game/match/[id]/report/[round]`. (1 day)
15. **Implement real engine logic.** Replace stubs in `engine/{demand,allocate,finance,...}` with the actual Coffee Shop economics. Add a comprehensive replay test suite of 10–30 golden fixtures. This is the **big** step (1–3 weeks). Iterate balancing here.
16. **Add tests.** Already underway from step 5. Push coverage on engine to >80%, visibility filter to 100%, API routes to "all happy paths + key 4xx".
17. **Add persistence beyond the fixture.** Implement matchmaking (`/api/game/matchmaking/queue`), real match creation, real round persistence end-to-end. (2–4 days)
18. **Add matchmaking + Elo + lobby + history + notifications.** (1–2 weeks)
19. **Add post-match analysis with recommended lessons.** Reuse `src/lib/learning/corpus-lessons.ts` to suggest lessons by `interests` tag → the report can already link to `/lessons/[slug]`. (3–5 days)
20. **Polish: tutorial, austerity / bankruptcy / abandonment screens, forfeit confirm, rematch.** (1–2 weeks)
21. **Cut over from polling to Supabase Realtime** on `match_events_public` only. (2–3 days; optional v1.5)

### What you should *not* do in this sequence

- Build matchmaking before the engine resolves a single round end-to-end.
- Build the Decide screen before `MoveDefinition` and `MoveCard` exist.
- Build the post-match analysis before the engine produces a `RoundReport`.
- Migrate the existing schema layout to split into `schema/{content,game}.ts` until you have at least one engine test passing — minimize moving parts.
- Try to "improve" `LessonPlayer.tsx` while doing the above. Leave it.

---

## 15. Open Questions (must resolve before build)

These are sequenced so the most-blocking ones are first.

1. **Where does match state persist?** Supabase Postgres (same project as content) vs. a separate Supabase project (cleaner isolation) vs. an external KV (Redis). **Strong recommendation: same Postgres, separate schema (`game`).**
2. **Backend topology.** Is this still a single Next.js app, or do we want a separate Node service for `/api/game/...resolve` to keep cold-start latency low? **Recommendation: keep single Next.js app for v1; revisit if resolve gets slow.**
3. **Realtime vs polling.** Recommendation: polling for v1 (1–2s); Realtime on `match_events_public` only when latency becomes a real complaint.
4. **Mock vs real for v1 launch.** How much of v1 can be vs-bot to validate before PvP matchmaking is real? **Recommend a single-player bot as a *first-week* milestone**, to exercise the engine without matchmaking.
5. **Move catalogue source of truth.** TS data file (recommended) vs JSON file vs DB rows. **Recommendation: TS data file in `src/game/moves/catalogue.ts`, versioned in git.**
6. **Multiple moves from the same domain — allowed?** Brief implies yes ("players can spend moves across one domain or many"). Confirm so `MoveDefinition.maxPerTurn` defaults to 3 unless restricted.
7. **"Hold price" model.** Confirm the recommendation: **no `hold` move id; absence of a sales/set-price move means the prior price persists**. Brief implies this; encode it.
8. **Conditional moves (price-match guarantee).** Are these registered as moves with a `condition` predicate (active for N rounds while predicate is true) or as policies? **Recommendation: introduce `MoveKind = "one-shot" | "persistent-policy" | "conditional-policy"`** and let the engine apply persistent/conditional policies before stochastic events.
9. **Timer expiry / autopass.** What happens if a player doesn't submit within N seconds/minutes? Options: (a) autopass = submit zero moves, (b) autopass = submit "rest" (no-op moves), (c) other player wins by default. **Recommendation: configurable per scenario**; v1 default = autopass with zero moves, telegraphed clearly in UI.
10. **Abandonment.** If a player disconnects mid-match, do we forfeit immediately or wait? Brief includes "opponent abandonment" screen. Recommend a 2-round grace period (player can rejoin), then auto-forfeit. Encode with `match_players.abandonedAt` and a job that flips outcome.
11. **Free-to-play vs gated by subscription.** The Price War launches inside a paid product. Decide whether matches are free for non-subscribers, gated to subscribers, or hybrid (X matches/day free). This shapes the auth check in `/api/game/*`.
12. **Lesson cross-link.** Reports recommend lessons. How tight is this coupling? Recommend: report carries `recommendedLessonSlugs: string[]`; UI links to existing `/lessons/[slug]` routes; no other dependency.
13. **Scenario versioning.** When we tune Coffee Shop balancing, do in-flight matches use the old or new version? Recommend: matches pin `scenarioVersion` + `engineVersion` at creation; in-flight matches finish with their pinned versions; new matches use latest.
14. **Anonymous play.** Lesson Zero is anonymous. Can game be too? Recommend: **no anonymous game**. Game needs identity for Elo, rematch, abandonment handling. Force auth (Supabase Google OAuth, already wired).
15. **Profanity / display names.** What name shows opposite the opponent? Currently `profiles.username` is unique and required. Reuse it. Add a `display_name_override` later if needed.

---

## Appendix A: Important Files Inspected

Repo-wide:

- `/Users/denniswilmot/adamsaxion/README.md`
- `/Users/denniswilmot/adamsaxion/ECONBLOG_REFACTOR_SPEC.md`
- `/Users/denniswilmot/adamsaxion/package.json`
- `/Users/denniswilmot/adamsaxion/pnpm-workspace.yaml`

Econblog config:

- `econblog/package.json`
- `econblog/next.config.ts`
- `econblog/tsconfig.json`
- `econblog/tailwind.config.js`
- `econblog/drizzle.config.ts`
- `econblog/.env.example`
- `econblog/.gitignore`
- `econblog/.impeccable.md`
- `econblog/pnpm-workspace.yaml`
- `econblog/README.md`

App router:

- `econblog/src/app/layout.tsx`
- `econblog/src/app/page.tsx`
- `econblog/src/app/lessons/page.tsx`
- `econblog/src/app/lessons/[slug]/page.tsx`
- `econblog/src/app/leaderboard/page.tsx`
- `econblog/src/app/profile/page.tsx`
- `econblog/src/app/admin/page.tsx` (627 LoC)
- `econblog/src/app/subscribe/page.tsx`
- All `econblog/src/app/api/**/route.ts` (28 routes)
- `econblog/src/middleware.ts`

Components (selected):

- `econblog/src/components/Header.tsx`
- `econblog/src/components/lesson/LessonPlayer.tsx` (685 LoC)
- `econblog/src/components/quiz/QuizGate.tsx` (309 LoC)
- `econblog/src/components/quiz/MasteryExam.tsx` (281 LoC)
- `econblog/src/components/landing/LandingPage.tsx`
- `econblog/src/components/lessons/LessonsCatalog.tsx`
- `econblog/src/components/profile/ProfilePageClient.tsx`
- `econblog/src/components/ui/button.tsx` (and the rest of `ui/`)

Lib (selected):

- `econblog/src/lib/utils.ts`
- `econblog/src/lib/lesson-loader.ts`
- `econblog/src/lib/types/lesson.ts`
- `econblog/src/lib/learning/path-engine.ts`
- `econblog/src/lib/learning/corpus-lessons.ts`
- `econblog/src/lib/learning/user-dashboard.ts`
- `econblog/src/lib/supabase/{client,server}.ts`
- `econblog/src/lib/constants/lessons.ts`

DB:

- `econblog/src/db/index.ts`
- `econblog/src/db/schema.ts`

---

## Appendix B: Suggested Folder Structure

(Compact restatement of §13. Everything new is additive; existing paths are untouched unless noted.)

```
econblog/
├── src/
│   ├── app/
│   │   ├── (marketing)/                       # OPTIONAL: move existing landing/lessons here
│   │   ├── (game)/                            # NEW
│   │   │   ├── layout.tsx
│   │   │   ├── play/page.tsx
│   │   │   ├── play/scenarios/page.tsx
│   │   │   ├── play/queue/page.tsx
│   │   │   └── play/match/[id]/
│   │   │       ├── page.tsx
│   │   │       ├── briefing/page.tsx
│   │   │       ├── decide/page.tsx
│   │   │       ├── review/page.tsx
│   │   │       ├── waiting/page.tsx
│   │   │       ├── report/[round]/page.tsx
│   │   │       ├── postmatch/page.tsx
│   │   │       ├── austerity/page.tsx
│   │   │       ├── bankruptcy/page.tsx
│   │   │       └── abandoned/page.tsx
│   │   ├── (game)/history/page.tsx
│   │   ├── (game)/leaderboard/page.tsx
│   │   ├── (game)/notifications/page.tsx
│   │   ├── (game)/tutorial/page.tsx
│   │   └── api/game/...                        # see §9
│   ├── components/game/                        # NEW: shell, moves, decide, review, report, postmatch, lobby, matchmaking, notifications
│   ├── game/                                   # NEW: types, engine, moves, scenarios, visibility, rng — pure TS
│   ├── server/game/                            # NEW: repository, matchmaker, resolver, elo
│   ├── client/game/                            # NEW: hooks, providers (React Query)
│   └── db/schema/game.ts                       # NEW: see §8
├── vitest.config.ts                            # NEW
└── ...
```

---

## Appendix C: Example Type Definitions

> These are illustrative, not final. Names match what the rest of this doc references.

```ts
// src/game/types/domain.ts
export type Domain =
  | "sales"
  | "procurement"
  | "operations"
  | "hr"
  | "marketing"
  | "finance";

// src/game/types/visibility.ts
export type Visibility =
  | "public"                     // both players see now
  | "private"                    // only the actor sees, never revealed
  | "inferable"                  // not stated but logically derivable from public events
  | "conditional"                // visible only if a condition holds (e.g. scout active)
  | "revealedAfterResolution";   // hidden during decide, shown in next round's report

// src/game/types/move.ts
export type MoveId = string & { readonly __brand: "MoveId" };
export type ScenarioId = "coffee-shop" | (string & { readonly __brand: "ScenarioId" });

export type MoveInputSpec =
  | { kind: "none" }
  | { kind: "slider"; min: number; max: number; step: number; unit?: string; default?: number }
  | { kind: "stepper"; min: number; max: number; step: number; default?: number }
  | { kind: "singleChoice"; options: { id: string; label: string; hint?: string }[] }
  | { kind: "toggle"; default?: boolean }
  | { kind: "amount"; min: number; max: number; currency?: string }
  | { kind: "target"; targets: { id: string; label: string }[] }
  | { kind: "mode"; modes: { id: string; label: string; description?: string }[] };

export type MoveTag =
  | "public"
  | "private"
  | "cost"
  | "locked"
  | "conditional"
  | "policy"           // persistent
  | "oneShot";

export type MoveKind = "oneShot" | "persistentPolicy" | "conditionalPolicy";

export interface MoveDefinition {
  id: MoveId;
  domain: Domain;
  scenarios: ScenarioId[];                  // availability
  name: string;                             // player-facing
  description: string;                      // plain English effect
  kind: MoveKind;
  input: MoveInputSpec;
  knownUpfrontCost?: (state: PublicMatchView, input: unknown) => number;
  ongoingCost?: number | { perRound: number };
  visibility: Visibility;
  durationRounds?: number;                  // undefined = one round
  timing: "preEvents" | "postEvents";       // when in the pipeline it applies
  prerequisites?: MoveId[];
  conflictsWith?: MoveId[];
  warnings?: string[];                      // surfaced in detail panel
  tags?: MoveTag[];
  modifies: Array<keyof PlayerPrivateState | keyof PublicMarketState>;
}

// src/game/types/move-instance.ts
export interface SubmittedMove {
  moveId: MoveId;
  inputs: unknown;                          // typed against MoveDefinition.input on validate
}

export interface SubmittedTurn {
  matchId: string;
  roundNumber: number;
  playerSlot: 0 | 1;
  moves: SubmittedMove[];                   // 0..3
  submittedAt: string;                      // ISO
  autopassed: boolean;
}

// src/game/types/match.ts
export type MatchPhase = "decide" | "resolving" | "report" | "complete" | "abandoned";

export type MatchOutcome =
  | { kind: "win"; slot: 0 | 1; reason: "score" | "bankruptcy" | "abandonment" }
  | { kind: "draw" };

export interface MatchHeader {
  id: string;
  scenarioId: ScenarioId;
  scenarioVersion: string;
  engineVersion: string;
  totalRounds: number;
  currentRound: number;
  phase: MatchPhase;
  startedAt: string;
  finishedAt?: string;
  outcome?: MatchOutcome;
  players: [MatchPlayerHeader, MatchPlayerHeader];
}

export interface MatchPlayerHeader {
  slot: 0 | 1;
  userId: string;
  displayName: string;
  eloBefore: number;
  eloAfter?: number;
  abandoned: boolean;
}

// src/game/types/state.ts (server-only; never crosses network)
export interface MatchState {
  header: MatchHeader;
  market: PublicMarketState;
  players: [PlayerStateFull, PlayerStateFull];
  history: RoundHistoryEntry[];
}

export interface PlayerStateFull {
  slot: 0 | 1;
  public: PlayerPublicState;
  private: PlayerPrivateState;
  activePolicies: ActivePolicy[];
}

export interface PlayerPublicState {
  currentPrice: number;
  storefrontMessage?: string;
  recentPublicActions: PublicAction[];
}

export interface PlayerPrivateState {
  cash: number;
  debt: number;
  inventory: number;
  productQuality: number;
  morale: number;
  serviceQuality: number;
  capacity: number;
  reputation: number;
  satisfaction: number;
  loyalty: number;
  reviewScore: number;
  // ...
}

export interface PublicMarketState {
  totalAddressableTraffic: number;
  seasonality: number;
  publishedEvents: PublicEvent[];
}

// src/game/types/views.ts (the client safe shape)
export interface PublicMatchView {
  header: Omit<MatchHeader, never>;
  market: PublicMarketState;
  opponent: {
    slot: 0 | 1;
    displayName: string;
    public: PlayerPublicState;
  };
}

export interface PrivateMatchView extends PublicMatchView {
  me: {
    slot: 0 | 1;
    public: PlayerPublicState;
    private: PlayerPrivateState;
    activePolicies: ActivePolicy[];
    intel: Intel[];
  };
}

export interface Intel {
  source: "scout" | "inference" | "announcement";
  roundNumber: number;
  payload: Record<string, unknown>;
  confidence?: "exact" | "approximate" | "rumored";
}

// src/game/types/round.ts
export interface RoundReportPublic {
  roundNumber: number;
  marketUpdate: PublicMarketState;
  publicEvents: PublicEvent[];
  bothActions: { slot: 0 | 1; moveId: MoveId; visibility: Visibility; summary: string }[];
  priceChanges: { slot: 0 | 1; before: number; after: number }[];
  outcomes: { slot: 0 | 1; revenuePublic?: never; reputationDelta?: number }[];
  keyTakeaways: string[];
}

export interface RoundReportPrivate {
  roundNumber: number;
  myMovesApplied: { moveId: MoveId; appliedCost: number; appliedEffects: string[] }[];
  myFinance: { revenue: number; expenses: number; cashDelta: number };
  myDeltas: Partial<PlayerPrivateState>;
  warnings?: string[];                       // austerity/bankruptcy proximity
  intel: Intel[];
}

// src/game/types/trace.ts
export interface EngineTraceStep {
  step:
    | "validate"
    | "applyPolicies"
    | "applyCommitments"
    | "rollEvents"
    | "applyEventEffects"
    | "computeProduct"
    | "computePeople"
    | "computeDemand"
    | "allocateCustomers"
    | "computeFinance"
    | "computeReputation"
    | "checkTriggers"
    | "buildReports";
  inputDigest: string;
  outputDigest: string;
  notes?: string[];
  deltas?: Record<string, unknown>;
}

export interface EngineTrace {
  matchId: string;
  roundNumber: number;
  seed: string;
  engineVersion: string;
  scenarioVersion: string;
  steps: EngineTraceStep[];
}

// src/game/engine/resolve.ts
export interface ResolveInput {
  state: MatchState;
  turns: [SubmittedTurn, SubmittedTurn];
  scenario: ScenarioConfig;
  seed: string;
}

export interface ResolveOutput {
  nextState: MatchState;
  publicReport: RoundReportPublic;
  privateReports: [RoundReportPrivate, RoundReportPrivate];
  trace: EngineTrace;
}

export type ResolveFn = (input: ResolveInput) => ResolveOutput;

// src/game/visibility/toPlayerView.ts
export type ToPlayerViewFn = (
  state: MatchState,
  viewerSlot: 0 | 1,
  scenario: ScenarioConfig,
) => PrivateMatchView;
```

---

*End of audit. No code in `econblog/` was modified. This document is intended to feed the architecture doc and a repo-specific build plan.*
