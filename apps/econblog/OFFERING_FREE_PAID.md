# Free vs paid offering

Status: **Living doc** — product and marketing source of truth. Iterate as we ship.

**Positioning:** Baseline interactive economics education (lessons + games), not career upskilling. Price follows value; growth is volume and funnel, not arbitrary price bumps.

**Target member pricing** (Stripe / subscribe UI should match when ready):

| Plan | Target price | Notes |
|------|--------------|--------|
| Monthly | **$14.99/mo** | Default member tier |
| Annual | **$79–89/yr** | Not in checkout yet — add when ready |
| Lifetime | **$129–149** one-time | “Own the finished library” — fits ~6mo build then maintain |

---

## Tiers

| Tier | Price | Job in funnel |
|------|-------|----------------|
| **Free** | $0 | Reach, habit, proof, qualify |
| **Member** | Paid plans above | Full curriculum + full games |

One membership unlocks everything in the Member column.

---

## 1. Econ Wordle

| Feature | Free | Member | Value |
|---------|------|--------|-------|
| Daily puzzle (shared word of the day) | Yes, no account | Yes | Habit + shares; YouTube front door |
| Six guesses, on-screen keyboard, local streak | Yes | Yes | Complete loop |
| Share grid (emoji results) | Yes | Yes | Viral loop |
| Term + definition on finish | Yes | Yes | Teaching moment |
| “Learn this term →” lesson link | Yes | Yes | Wordle → curriculum |
| Cloud streak / puzzle archive | No (v2) | TBD | Optional later |

**YouTube CTA:** Link directly to `/play/econ-wordle` — not required to hit landing first.

---

## 2. Lessons

| Feature | Free | Member | Value |
|---------|------|--------|-------|
| One full sample lesson (Lesson Zero, no account) | Yes | Yes | Format proof |
| Other lessons — Section 1 preview | Yes (signed in) | — | See depth before pay |
| Full lesson access (51 → 150 roadmap) | No | Yes | Core product |
| Quiz gates | Sample only | All lessons | Doing, not watching |
| Mastery exams | No | Yes | Prove retention |
| Personalized learning path | No | Yes | Guided sequence |
| XP, levels, progress | Sample + basics | Full | Motivation |
| XP leaderboard | View / limited | Full standing | Learner social proof |
| Bridges from Wordle / games | Yes | Yes | One ecosystem |

---

## 3. Margin (strategy game)

Account required to play (unlike Wordle).

| Feature | Free | Member | Value |
|---------|------|--------|-------|
| Tutorial (scripted, Prof. Aldo) | Yes | Yes | Learn rules |
| Coffee shop scenario | Yes | Yes | Default world |
| Extra scenarios (tech startup, etc.) | No | Yes | Expansion content |
| **Standard 15-minute match** | Yes, practice / unrated | Yes + ranked when live | Real game on free tier |
| **Blitz 5-minute match** | No | Yes | Fast mode for repeat players |
| Ranked ladder / Elo | No | Yes | Competition + status |
| Margin leaderboard | View when on | Compete | Gamer social proof |
| Match history | Yes | Yes | Review games |
| Post-match template debrief | Yes | Yes | Useful summary |
| Post-match AI coach debrief | No | Yes | “Why did I lose?” |
| Active matches at once | **1** | **5** | Casual vs power users |
| Recommended lessons after match | Yes | Yes | Game → curriculum |

### Implementation gap (code today)

`packages/pricewar-engine/src/play-modes/registry.ts` currently has **Blitz on free** and **Rapid on paid only**. Target is the **opposite**: **15-min Rapid free**, **Blitz paid**. Flip tiers when implementing.

Rated matchmaking requires `MARGIN_RATED_ENABLED` and is **paid-only** when enabled. Only **coffee-shop** scenario is live in prod today; extra scenarios are roadmap.

---

## 4. Account & trust

| Feature | Free | Member |
|---------|------|--------|
| Google sign-in | Optional (required for Margin / full lessons flow) | Yes |
| Profile & activity | Basic | Full |
| Public roadmap (planned) | View | Same + owns shipping benefits |
| Margin notifications | If account | Yes |

---

## User-facing copy (pricing page / subscribe)

### Free

- Play today’s Econ Wordle and share your grid
- Try one full interactive lesson — no credit card
- Learn Margin (beta): tutorial plus 15-minute practice games running a coffee shop

### Member

- Every lesson, quiz gate, and mastery exam
- Personalized path and full XP progression
- All Margin (beta) scenarios, Blitz mode, and ranked play when live
- AI debrief after matches
- Run multiple matches at once (up to five)

---

## Roadmap value (next ~6 months)

Not separate tiers — reasons to join or buy lifetime while we build:

| Shipping | Free | Member |
|----------|------|--------|
| More lessons (→150) | Sample + previews | Full access as each ships |
| More games (→10) | Wordle + Margin free slice | All modes, scenarios, ranked |
| New scenarios | Coffee shop | All worlds |
| Rated / ladder | Practice | Ranked + Elo |

---

## Funnel (reference)

```
YouTube → Wordle (free) ──→ lesson bridge ──→ subscribe
YouTube → Margin quiz ──→ play (free slice) ──→ post-match upsell ──→ subscribe
Organic → landing (lessons + games hero) ──→ pricing below fold
```

Landing hero leads with **solution** (lessons + games), not the offer. Pricing section comes later on the page.

---

## Revenue reference (at $14.99/mo)

| Goal | MRR | ARR | ~Active subs |
|------|-----|-----|----------------|
| $5k MRR | $5,000 | $60k | ~334 |
| $100k ARR | ~$8,333 | $100k | ~556 |

Lifetime and annual revenue are cash / renewal events — not the same as MRR unless modeled separately.

---

## Related code

- Marketing bullets: `src/lib/offering/tiers.ts`
- Landing pricing: `src/lib/landing/content.ts` → `PRICING`
- Stripe display amounts: `src/lib/stripe/config.ts`
- Margin tiers: `src/server/pricewar/auth.ts`, play modes registry
- Coach gating: `src/server/pricewar/coach.ts`
- Lesson access: `src/app/lessons/[slug]/page.tsx` (`preview` vs `full`)
