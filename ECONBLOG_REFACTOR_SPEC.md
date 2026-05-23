# Econblog Refactor Spec

> **Adam's Axioms** — Interactive economics education platform  
> Last updated: 2026-05-03  
> Status: Planning

---

## 1. Product Vision

A subscription-based interactive economics learning platform that aims to genuinely replace an undergraduate economics education. Users progress through structured lessons with gated quizzes that enforce real understanding. The YouTube channel serves as the marketing funnel; the website is the product.

**Pricing:**
- $19.99/month subscription
- $149 lifetime access
- Lesson Zero: free for all users (anonymous, no auth required)

**Revenue model:** Subscription revenue from the platform. YouTube ad revenue covers marketing costs. Video production is fully automated via `adams-agents`.

---

## 2. Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Landing experience | Lesson Zero (free, anonymous) | Show real product value before asking for signup. Not a toy demo — real curriculum content, just shorter (3-4 major sections, ~10-15 min). |
| Auth provider | Supabase Auth (Google OAuth) | Already on Supabase for DB. One fewer vendor. `auth.users` + app `profiles` table. |
| Auth timing | Anonymous for Lesson Zero, required from Lesson 1+ | Users experience the full gated flow before signing in. Capture them after they've invested time and earned XP. |
| ORM | Drizzle (replaces Prisma) | Clean rebuild. Current Prisma layer is mostly broken. |
| Database | Supabase PostgreSQL | Already provisioned. Shared with auth. |
| Payments | Stripe (built before launch, last to implement) | Never launch without paywall. Users never experience "free" — Lesson Zero is the only free content anyone ever sees. |
| Content source of truth | JSON files (one per lesson) | `adams-agents` generates JSON. DB stores user state only, never content. Content is version-controlled in git. |
| Question source | JSON lesson files (static reviewed pool) | Kill the 3 separate TS quiz files. Questions live nested under their subsection in the lesson JSON. Mastery quiz has a large pool, randomly sampled per attempt. |
| Deployment | Railway (app) + Supabase (DB + auth) | More control than Vercel, less ops than raw VPS. |
| Design direction | Atlas Pilot structure + blue/gold accents + warm backgrounds | Tabbed workspace layout. No emoji as UI elements. Soft warm backgrounds with gentle subtle animations. No purple. Clean typography-driven hierarchy. |
| Mobile | Responsive, desktop-primary | Nothing broken on mobile. Tabs scroll horizontally, quizzes stack. Optimized for desktop where users sit down to learn. |

---

## 3. Lesson Progression Model

### 3.1 Cross-Lesson Access
- **Open selection.** Users can start any lesson at any time from the lessons list.
- No sequential lesson unlocking. Each lesson is self-contained.
- Lesson Zero is accessible without authentication.
- Lesson 1+ requires Supabase Auth (Google sign-in).

### 3.2 Internal Lesson Gating (Section → Quiz → Section)
- Each lesson has ~8 **major sections** displayed as tabs.
- Each major section has ~3 **subsections** (short, 2-3 paragraphs of dense content).
- Every subsection ends with a **quiz gate** (~24 gates per lesson).
- Subsection quizzes gate forward progress within a major section.
- Completing all subsections in a major section unlocks the next tab.
- Users **can revisit** completed sections/tabs (Option C — tabs with lock icons).

### 3.3 Quiz Attempt Rules
- **3 attempts per question** with escalating penalties:
  - 1st wrong: small XP penalty
  - 2nd wrong: larger XP penalty  
  - 3rd wrong: 24h lockout on that specific question
- During lockout: user **can proceed** to the next subsection/section (Option C).
  - The failed question shows as incomplete in their progress.
  - Lesson is not marked "Complete" until all questions are passed.
  - After 24h, user can re-attempt for partial XP recovery.
- XP floor: user cannot go below 0 XP total.

### 3.4 Mastery Quiz
- Unlocked after user has **attempted** every section quiz (not necessarily passed all).
- Questions drawn randomly from a large reviewed pool (~200 questions per lesson, ~25-30 per attempt).
- Different questions each attempt — no memorization gaming.
- Timed (configurable per lesson).
- Has a passing score threshold.
- Mastery quiz completion (pass/fail) is the final marker for lesson "completion."

### 3.5 XP System
- **Tiered by difficulty with penalties (Option C):**
  - Easy: +5 XP correct
  - Medium: +15 XP correct
  - Hard: +25 XP correct
  - Mastery questions: +30 XP correct
- **Escalating penalties on wrong answers:**
  - 1st wrong on easy: -2 XP | medium: -5 XP | hard: -10 XP
  - 2nd wrong on easy: -3 XP | medium: -8 XP | hard: -15 XP
  - 3rd wrong: 24h lockout (no additional penalty beyond the 2nd)
- **Leveling:** every 1000 XP = next level
- XP floor: 0 (cannot go negative)

---

## 4. Lesson JSON Schema

One file per lesson. `adams-agents` generates this. Source of truth for all content and questions.

```json
{
  "id": "lesson-1-supply-and-demand-fundamentals",
  "title": "Supply and Demand Fundamentals",
  "category": "Microeconomics",
  "difficulty": "Intermediate",
  "estimatedMinutes": 35,
  "description": "Learn the fundamental principles of microeconomics...",
  "thumbnail": "/thumbnails/lesson-1.png",

  "sections": [
    {
      "id": "section-1",
      "title": "The World is Collapsing. You're in Charge.",
      "subsections": [
        {
          "id": "section-1-sub-1",
          "title": "December 2007, Harare",
          "content": "Markdown content here. 2-3 dense paragraphs.",
          "quiz": {
            "id": "s1-sub1-q1",
            "question": "You control Zimbabwe's remaining resources...",
            "options": [
              "Import food and medical supplies...",
              "Import fuel and industrial equipment..."
            ],
            "correctAnswer": 0,
            "difficulty": "medium",
            "xpReward": 15,
            "xpPenalties": [5, 8],
            "explanation": "Option A prioritizes immediate human survival..."
          }
        },
        {
          "id": "section-1-sub-2",
          "title": "Real-World Scarcity",
          "content": "More markdown content...",
          "quiz": { "..." }
        },
        {
          "id": "section-1-sub-3",
          "title": "The Fundamental Problem",
          "content": "More markdown content...",
          "quiz": { "..." }
        }
      ]
    }
  ],

  "masteryQuiz": {
    "questionsPerAttempt": 25,
    "passingScore": 70,
    "timeLimitMinutes": 25,
    "questionPool": [
      {
        "id": "mastery-q1",
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": 2,
        "difficulty": "hard",
        "xpReward": 30,
        "xpPenalties": [10, 15],
        "explanation": "..."
      }
    ]
  }
}
```

**Auto-calculated at build/load time (not stored in JSON):**
- `totalXp`: sum of all subsection quiz `xpReward` + all mastery pool `xpReward` (for the sampled count)
- Lesson index: auto-generated by scanning `src/content/lessons/*.json` at build time

---

## 5. Database Schema (Drizzle + Supabase)

User content (lessons, questions) lives in JSON files. The database stores **user state only.**

### Tables

```
profiles
├── id (uuid, references auth.users)
├── username (unique)
├── totalXp (int, default 0)
├── currentLevel (int, default 1)
├── createdAt
└── updatedAt

quiz_attempts
├── id (uuid)
├── userId (references profiles)
├── lessonId (string — lesson JSON id)
├── questionId (string — quiz id from JSON)
├── selectedAnswer (int)
├── isCorrect (boolean)
├── xpEarned (int — positive or negative)
├── attemptNumber (int — 1, 2, or 3)
├── lockedUntil (timestamp, nullable)
└── attemptedAt (timestamp)

lesson_progress
├── id (uuid)
├── userId (references profiles)
├── lessonId (string)
├── completedSubsections (string[] — subsection IDs)
├── unlockedSections (string[] — major section IDs)
├── masteryAttempted (boolean)
├── masteryPassed (boolean)
├── masteryBestScore (int, nullable)
├── totalXpEarned (int)
├── completedAt (timestamp, nullable)
├── createdAt
└── updatedAt

leaderboard_seeds
├── id (uuid)
├── username (string)
├── totalXp (int)
├── currentLevel (int)
├── isSeeded (boolean, default true)
└── createdAt
```

**Notes:**
- `profiles` extends Supabase `auth.users` — linked by ID.
- `leaderboard_seeds` holds fake users for launch. Leaderboard query unions `profiles` + `leaderboard_seeds` (where `isSeeded = true`). Remove seeds as real users accumulate.
- No `questions`, `lessons`, or `achievements` tables. Content is JSON. Achievements are a v2 feature.
- `quiz_attempts` tracks every attempt for analytics. `attemptNumber` + `lockedUntil` enforce the 3-strike rule.

---

## 6. API Routes (New)

Clean rebuild. All routes require Supabase Auth session except where noted.

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/callback` | GET | No | Supabase OAuth callback handler |
| `/api/user/profile` | GET | Yes | Get current user's profile (XP, level, username) |
| `/api/user/profile` | PATCH | Yes | Update username |
| `/api/lessons` | GET | No | List all lessons (metadata from auto-generated index) |
| `/api/lessons/[slug]/progress` | GET | Yes | Get user's progress for a specific lesson |
| `/api/lessons/[slug]/quiz/attempt` | POST | Yes | Submit a quiz answer. Validates, applies XP, enforces attempt rules. |
| `/api/lessons/[slug]/quiz/status` | GET | Yes | Get attempt status for all questions in a lesson (locks, attempts remaining) |
| `/api/leaderboard` | GET | No | Top N users by XP (unions profiles + seeds) |
| `/api/stripe/checkout` | POST | Yes | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | No (Stripe signature) | Handle subscription events |
| `/api/stripe/portal` | POST | Yes | Create Stripe customer portal session |

**Eliminated routes (from current codebase):**
- `/api/dashboard` — replaced by `/api/user/profile` + per-lesson progress
- `/api/user/default` — no more test user
- `/api/user/stats`, `/api/user/[userId]/stats` — consolidated into `/api/user/profile`
- `/api/quiz/can-attempt`, `/api/quiz/lock-status` — consolidated into `/api/lessons/[slug]/quiz/status`
- `/api/lesson-data` — replaced by `/api/lessons/[slug]/progress`
- `/api/profile/*` — replaced by `/api/user/profile`

---

## 7. Frontend Pages & Components

### 7.1 Page Map

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing / Lesson Zero | No | Anonymous users: marketing hero + direct entry into Lesson Zero experience. Authenticated users: redirect to `/lessons`. |
| `/lessons` | Lesson Catalog | Yes | Grid of all lessons with progress indicators. Open selection (no sequential lock). |
| `/lessons/[slug]` | Lesson Player | Yes (except Lesson Zero) | Tabbed major sections. Gated subsection flow within each tab. Quiz gates between subsections. Mastery quiz at end. |
| `/profile` | User Profile | Yes | Avatar, username, total XP, level, progress bar, per-lesson completion status. Billing tab (Stripe portal link). |
| `/leaderboard` | Leaderboard | No | Ranked table of users by XP. Seeded with fake data at launch. |
| `/auth/callback` | Auth Callback | No | Supabase OAuth redirect handler. |

**Eliminated pages:**
- `/about` — moved to footer link or removed entirely

### 7.2 Navigation

```
[Logo: Adam's Axioms]     Lessons | Leaderboard | [Profile Avatar]
```

- 3 nav items: Lessons, Leaderboard, Profile
- Logo click: `/lessons` (authenticated) or `/` (anonymous)
- Profile: avatar from Google account, links to `/profile`
- Mobile: hamburger menu with same items

### 7.3 Key Components to Build

**LessonPlayer** (replaces `JSONLessonRenderer`)
- Tab bar showing 8 major sections (locked/unlocked/completed states)
- Active tab shows subsection stepper
- Subsection content renderer (markdown → HTML, sanitized)
- Quiz gate component between subsections
- XP progress widget (simplified, not floating)
- Mastery quiz launcher at the end

**QuizGate** (replaces `QuizComponent`)
- Clean card layout with question + options
- Answer selection → submit → feedback (correct/incorrect + explanation)
- Attempt counter (1/3, 2/3, 3/3)
- XP earned/lost indicator
- Lock state display with countdown timer
- Escalating penalty messaging

**MasteryExam** (replaces `MasteryQuizWidget`)
- Start screen with quiz info (questions count, time limit, passing score)
- Per-question flow (progress bar, timer, XP tracker)
- Randomly sampled from question pool
- Completion summary (score, pass/fail, XP breakdown)
- Option to re-attempt (new random sample)

**LessonCard** (keep + restyle)
- Thumbnail, title, category, estimated time
- Progress bar showing subsection completion
- Completion badge when mastery passed

**ProfileView** (rebuild)
- Google avatar + editable username
- Total XP, level, progress to next level
- Per-lesson completion list with percentages
- Billing tab (Stripe portal link when Stripe is live)

---

## 8. Design System

> **Design governance:** All visual design decisions are validated through the `/impeccable` skill. The `.impeccable.md` file in the project root is the source of truth for design context (audience, personality, aesthetic direction). This file is created during Phase 3 via `/impeccable teach` and referenced on every subsequent UI build/review pass.

### 8.1 Visual Direction
- **Layout:** Atlas Pilot-inspired tabbed workspace. Cards with subtle shadows and thin borders. Generous whitespace.
- **Backgrounds:** Warm soft tones (cream/warm white), not cold gray or pure white. No pure `#000` or `#fff`.
- **Accents:** Blue primary + gold secondary for XP/achievements. No purple. Exact values defined in OKLCH during Phase 3 design system foundation.
- **Animations:** Gentle, subtle background motion (landing only). Exponential easing (ease-out-quart/quint). Respect `prefers-reduced-motion`. No bounce/elastic easing.
- **Typography:** Distinctive font pairing selected via impeccable font selection procedure (not Inter/default sans-serif). Display font + body font. Modular type scale with fluid `clamp()` for headings. Strong hierarchy through weight and size contrast.
- **Colors:** OKLCH color space. Neutrals tinted toward brand hue. 60-30-10 rule for visual weight distribution.
- **Icons:** Lucide (already in deps). No emoji as UI elements.
- **Components:** shadcn/ui primitives as base, restyled to warm palette.
- **Anti-patterns (enforced):** No gradient text, no colored side-stripe borders on cards, no card-in-card nesting, no glassmorphism, no hero metric template layouts, no generic drop shadows on rounded rectangles.

### 8.2 Key UI States
- **Tab locked:** Muted text, lock icon, not clickable
- **Tab unlocked:** Normal text, no icon, clickable
- **Tab completed:** Check icon, slightly muted (not the focus)
- **Tab active:** Bold text, accent underline
- **Quiz correct:** Green border, check icon, explanation reveal, XP +N animation
- **Quiz incorrect:** Red border, X icon, explanation reveal, XP -N animation, attempt counter update
- **Quiz locked:** Grayed out, countdown timer, "Come back in Xh Ym" message
- **Lesson complete (mastery passed):** Gold badge on lesson card, full progress bar

---

## 9. Keep / Throw Away / Rebuild

### Keep As-Is
- `src/content/lessons/lesson-1-*.json` (repair lesson-2)
- `src/components/ui/*` (shadcn primitives — restyle)
- `src/components/PostHogProvider.tsx`
- `src/components/QueryProvider.tsx`
- Next.js App Router structure
- `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`
- `package.json` (update deps: remove Prisma, add Drizzle + Supabase)

### Throw Away
- All Prisma files (`prisma/`, `src/generated/prisma/`)
- `src/lib/database-service.ts` (and `-fixed`, `-with-logging` variants)
- `src/lib/profile-service.ts`
- `src/lib/quiz-data.ts`
- `src/lib/lesson-quiz-data.ts`
- `src/lib/mastery-quiz-data.ts`
- `src/lib/markdown-parser.ts`
- `src/lib/services/quiz-data-service.ts`
- All current API routes (`src/app/api/*`)
- `src/components/EconomicBackground.tsx`
- `src/components/EconomicEmojiCarousel.tsx`
- `src/components/lesson/LessonRenderer.tsx` (legacy markdown renderer)
- All `.backup`, `.temp`, `.before-*` files
- `debug-db.js`, `dev.log`
- `scripts/fix-lesson-migration.ts`, `scripts/convert-lesson-to-json.ts`
- All migration docs (`MIGRATION_*.md`, `COMPREHENSIVE_MIGRATION_GUIDE.md`)

### Rebuild (new code, informed by old)
- `src/components/lesson/JSONLessonRenderer.tsx` → `LessonPlayer.tsx`
- `src/components/quiz/QuizComponent.tsx` → `QuizGate.tsx` (keep answer card visual pattern)
- `src/components/quiz/MasteryQuizWidget.tsx` → `MasteryExam.tsx`
- `src/components/Header.tsx` (new nav: Lessons, Leaderboard, Profile + mobile hamburger)
- `src/components/lesson/LessonCard.tsx` (restyle for new design system)
- `src/components/EditableUsername.tsx` (keep logic, restyle)
- All hooks (`useDashboard`, `useProfile`, `useLeaderboard`, `useLessonData`) — rewrite for new API contracts
- `src/lib/lesson-loader.ts` → update for new JSON schema (sections → subsections)
- `src/lib/lessons-index.ts` → auto-generate at build time
- `src/lib/question-lookup.ts` → simplified, reads from lesson JSON only
- `src/app/page.tsx` (new landing with Lesson Zero integration)
- `src/app/lessons/page.tsx` (new catalog with progress)
- `src/app/lessons/[slug]/page.tsx` (LessonPlayer shell)
- `src/app/profile/page.tsx` (simplified profile)
- `src/app/leaderboard/page.tsx` (fixed ranking, seeded data)
- `src/app/globals.css` (new design tokens, warm palette)

---

## 10. Build Phases

### Phase 1: Foundation
- [ ] Remove Prisma, install Drizzle + Supabase client deps
- [ ] Define Drizzle schema (`profiles`, `quiz_attempts`, `lesson_progress`, `leaderboard_seeds`)
- [ ] Push schema to Supabase
- [ ] Set up Supabase Auth with Google OAuth
- [ ] Auth middleware for Next.js (protect Lesson 1+ routes)
- [ ] Seed leaderboard with 30-40 fake users

### Phase 2: Core Lesson Experience
- [ ] Restructure lesson-1 JSON to new schema (8 sections × 3 subsections)
- [ ] Repair lesson-2 JSON (fix corruption, align title/content/questions)
- [ ] Build `LessonPlayer` component (tabbed sections, gated subsections)
- [ ] Build `QuizGate` component (3-attempt escalating penalties, lockout)
- [ ] Build `MasteryExam` component (random pool sampling, timer, scoring)
- [ ] Build lesson loader for new JSON schema
- [ ] Auto-generate `lessons-index.ts` from JSON files at build time
- [ ] Implement quiz attempt API (`/api/lessons/[slug]/quiz/attempt`)
- [ ] Implement quiz status API (`/api/lessons/[slug]/quiz/status`)
- [ ] Implement lesson progress API (`/api/lessons/[slug]/progress`)
- [ ] XP calculation + level-up logic in Drizzle

### Phase 3: UI Shell & Design

**Design review process:** Every page and component built in this phase goes through the `/impeccable` skill workflow before being considered complete.

- [ ] **Run `/impeccable teach`** — establish `.impeccable.md` design context (target audience, brand personality, aesthetic direction, anti-references). This gates all UI work below.
- [ ] **Design system foundation** — apply impeccable guidelines: choose distinctive font pairing (reject reflex defaults), define OKLCH color tokens with brand-tinted neutrals, set spacing scale (4pt), define type scale with fluid `clamp()` headings
- [ ] New `globals.css` (warm palette, design tokens, no pure black/white)
- [ ] **`/impeccable craft Header`** — Lessons | Leaderboard | Profile, mobile hamburger
- [ ] **`/impeccable craft Landing`** — landing page redesign (Lesson Zero integration for anonymous users)
- [ ] **`/impeccable craft LessonCatalog`** — lesson catalog page (progress indicators, completion badges)
- [ ] **`/impeccable craft LessonPlayer`** — design pass on tabbed lesson experience, quiz gates, mastery exam
- [ ] **`/impeccable craft Profile`** — XP, level, per-lesson progress, username edit
- [ ] **`/impeccable craft Leaderboard`** — ranked table with personality
- [ ] Remove all emoji from UI elements
- [ ] Subtle background animations (landing only, respect `prefers-reduced-motion`)
- [ ] **Final AI slop audit** — review every page against impeccable's anti-patterns (no gradient text, no side-stripe borders, no card-in-card, no hero metric templates, no glassmorphism)

### Phase 4: Payments *(deferred — implement last, before launch)*
> **Prerequisite:** Create Stripe account, generate API keys, configure products/prices in Stripe Dashboard before starting this phase.

- [ ] Stripe product/price setup ($19.99/month, $149 lifetime)
- [ ] `/api/stripe/checkout` — create checkout session
- [ ] `/api/stripe/webhook` — handle subscription lifecycle
- [ ] `/api/stripe/portal` — customer self-service
- [ ] Paywall enforcement: Lesson 1+ requires active subscription
- [ ] Profile billing tab: manage subscription link
- [ ] Free tier: Lesson Zero always accessible

### Phase 5: Launch Prep
- [ ] Railway deployment config
- [ ] Environment variables (Supabase, Stripe, PostHog)
- [ ] Remove console.logs from production code
- [ ] Content QA pass on all lessons
- [ ] Seed data review (fake leaderboard users)
- [ ] Smoke test: full flow (anonymous → Lesson Zero → sign up → subscribe → Lesson 1 → quiz → mastery)
- [ ] DNS / domain setup

---

## 11. Future Features (Post-Launch)

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Achievement badges | High | Medium | Profile badges for milestones (first lesson, streak, perfect mastery) |
| Async quiz duels | Medium | Medium | Challenge another user. Same question set. First to 3 wrong loses. 2-3 days of work. |
| Dynamic mastery questions | Low | Medium | AI-generated mastery questions on the fly. Cost ~$0.03-0.05 per attempt. Quality control risk. |
| Streak calendar | Medium | Small | GitHub-style contribution graph on profile |
| Quiz performance analytics | Low | Medium | "You're strongest in X, weakest in Y" insights tab |
| Content generation pipeline (adams-agents integration) | High | Large | Automated lesson JSON generation. Separate spec document. |
| Module grouping | Medium | Small | Group lessons into modules (Micro, Macro, etc.) on catalog page |
| Social proof on lessons | Low | Small | "47 people completed this lesson" counters |
| Email notifications | Medium | Small | "New lesson dropped" + "Your lockout expired" emails |
| Dark mode | Low | Medium | Alternate color scheme, user toggle |

---

## 12. Current Codebase Audit Summary

### API Routes (12 total)
| Route | Status | Key Issue |
|-------|--------|-----------|
| `GET /api/dashboard` | NEEDS_WORK | Hardcoded test user |
| `GET /api/leaderboard` | NEEDS_WORK | Missing rank computation, fragile limit parsing |
| `GET+POST /api/lesson-data` | SOLID | Minor: invalid JSON → 500 |
| `GET /api/lessons` | NEEDS_WORK | Unused, unknown user → 500 |
| `GET+POST /api/profile` | BROKEN | Identity bug: always returns test user data |
| `POST /api/profile/username` | SOLID | Separate Prisma client instance |
| `POST /api/quiz/attempt` | NEEDS_WORK | Trusts client-sent expectedXP |
| `POST /api/quiz/can-attempt` | BROKEN | Doesn't block already-correct questions |
| `GET /api/quiz/lock-status` | NEEDS_WORK | Unused, incomplete semantics |
| `GET /api/user/default` | NEEDS_WORK | Test user only, unused |
| `POST /api/user/stats` | NEEDS_WORK | Duplicate of userId/stats, unused |
| `GET /api/user/[userId]/stats` | NEEDS_WORK | 500 instead of 404 for missing user |

### Frontend Pages
| Page | Status | Key Issue |
|------|--------|-----------|
| Landing (`/`) | NEEDS_WORK | Feature cards off-screen on most widths, no mobile nav |
| Lessons list (`/lessons`) | NEEDS_WORK | console.logs in render, NaN% edge case |
| Lesson detail (`/lessons/[slug]`) | BROKEN (multi-user) | Hardcoded test user, no loading UI |
| Profile (`/profile`) | BROKEN | placeholderData defeats loading state, totalXP casing mismatch |
| Leaderboard (`/leaderboard`) | BROKEN | placeholderData shows false empty state, no rank |
| About (`/about`) | SOLID | Static, minor bg inconsistency |

### Content & Data
| Issue | Severity |
|-------|----------|
| Questions scattered across 3 TS files + JSON + markdown | Critical — rebuild |
| Lesson 2 title says "Elasticity" but content is "Consumer Preferences" | Critical — repair |
| Lesson 2 section-8 contains raw pasted JSON in content | Critical — repair |
| Same question (`course-foundation-concept`) has different correct answers in different files | Critical — single source of truth |
| XP values calculated differently in 4 different places | Critical — standardize |
| `embeddedQuizzes` array always empty while `{{quiz:}}` markers in content | Moderate — schema mismatch |
| Lesson 2 markdown has no frontmatter | Low — markdown path being removed |
| `lessons-index.ts` lesson 2 subtitle is "MLOps/LLMOps Crash Course—Part 2" | Critical — copy-paste error |

---

## 13. Technical Notes

### Supabase Auth Integration
- Use `@supabase/ssr` for Next.js App Router middleware
- Google OAuth: configure in Supabase dashboard → Auth → Providers
- Client: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- On first sign-in, create `profiles` row linked to `auth.users.id`
- Middleware checks session on protected routes, redirects to `/` if unauthenticated

### Drizzle Setup
- `drizzle-orm` + `drizzle-kit` + `postgres` (node-postgres driver)
- Schema file: `src/db/schema.ts`
- Connection: Supabase pooler URL (same `DATABASE_URL`)
- Migrations via `drizzle-kit push` (or generate + migrate for production)

### Build-Time Lesson Index Generation
- Script scans `src/content/lessons/*.json`
- Reads metadata (id, title, category, difficulty, estimatedMinutes, thumbnail)
- Calculates totalXp per lesson (sum of subsection quiz xpReward + mastery pool average)
- Outputs `src/lib/generated/lessons-index.ts`
- Runs as part of `npm run build` (or `postbuild` script)

### Leaderboard Seeding
- `leaderboard_seeds` table with 30-40 fake users
- Leaderboard API query: `SELECT username, totalXp, currentLevel FROM profiles UNION ALL SELECT username, totalXp, currentLevel FROM leaderboard_seeds WHERE isSeeded = true ORDER BY totalXp DESC LIMIT $1`
- As real user count grows, delete seed rows or set `isSeeded = false`
