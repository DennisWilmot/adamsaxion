# Econ Wordle — Game Definition & Scope Guardrails

Date: 2026-05-28
Status: Pre-build spec. Target: launchable v1 in ~3 days.

## Purpose of this document

This is a **scope contract**, not a design doc. Its job is to keep Econ Wordle
from turning into a multi-week project. If a decision isn't written here, the
default answer is "v2, after launch." Read the [Hard Line](#the-hard-line) before
adding anything.

---

## 1. What it is

A daily word-guessing game (Wordle mechanic) where every answer is an economics
term. Six guesses, green/yellow/gray letter feedback, one puzzle per day shared
by everyone, a shareable emoji result grid, and — on finish — the term's
definition plus a link to the lesson that teaches it.

One sentence: **Wordle, but every word is econ, and every word is a doorway to a
lesson.**

## 2. Strategic role (why it exists)

Econ Wordle is the **acquisition front door**, not a revenue product.

- Its job is reach and habit: a free, daily, shareable hook that brings cold
  traffic in.
- The money is in **lessons** (subscription). Wordle's success metric is
  *players who click through to a lesson and create an account* — not game
  revenue.
- Therefore: **never paywall the game loop or the share grid.** Those are the
  marketing engine. (Compare Price War, where rated/ranked play is the paid
  surface — Wordle has no paid surface in v1.)

The funnel: shared result → play today's puzzle → win/lose → "Learn this term →"
→ lesson → account/subscribe.

---

## 3. The Hard Line

> **If a feature isn't the game loop, the share grid, or the lesson link, it's v2.**

Everything in v1 is allowed to be simple and local. No backend state, no
accounts, no sync. This single rule is what makes a 3-day launch real.

---

## 4. v1 scope — what we build

1. **Route:** `/play/econ-wordle`, surfaced in the existing games hub (`/play`).
2. **Core loop:** 6 guesses, tile feedback (correct / present / absent),
   on-screen keyboard with key-state coloring, physical keyboard support.
3. **Variable word length (4–8 letters), shown to the player before guess 1.**
   This expands the usable econ vocabulary so we don't run out of fair words.
4. **Daily puzzle:** deterministic — a date-seeded index into a static answer
   list. Everyone gets the same word on the same day. No server call required.
5. **Local persistence:** `localStorage` for today's progress + a local streak
   counter. Refusing/closing the tab resumes today's game.
6. **Share grid:** copy-to-clipboard emoji grid (🟩🟨⬜) + result line. This is
   non-negotiable; it is the viral loop.
7. **The bridge (the strategic payload):** on win or loss, reveal the term, a
   one-line definition, and a **"Learn this →"** button linking to the matching
   lesson (via a `word → lesson slug` map).
8. **Share/OG metadata:** so shared links render a nice card. It's an
   acquisition tool — the preview matters.

That is a complete, viral, lesson-funneling product.

## 5. Explicitly OUT of scope for v1 (do not build yet)

These are the scope-creep traps. All deferred to v2+:

- ❌ Accounts / login to play
- ❌ Server-side leaderboards or global stats
- ❌ Cross-device streaks / cloud sync
- ❌ Puzzle archive / "play past days"
- ❌ Difficulty modes / hard mode
- ❌ Guess validity dictionary beyond a basic allowed-guess list (see §7)
- ❌ Animations/polish beyond basic tile flip + simple feedback
- ❌ Multiplayer / head-to-head
- ❌ Admin UI for managing words (edit the static file by hand for now)
- ❌ Localization / multiple languages
- ❌ A/B testing infrastructure

If any of these feel necessary to launch, re-read §3. They are not.

---

## 6. Difficulty & word philosophy (read this before curating words)

**Difficulty in Wordle comes from deduction under constraint — not obscure
vocabulary.** The original uses common words on purpose.

- Obscure jargon = unfair = frustrated players = **no shares** = the acquisition
  strategy fails. People share when they feel clever, not stupid.
- The sweet spot: terms an econ-curious person **recognizes or is glad to learn**
  ("ah, of course — *yield*"), never something that makes them feel dumb.
- **AI's job is curation, not obscurity:** pick fair, recognizable econ words,
  write tight one-line definitions, and map each to a lesson. AI is *not* here to
  generate maximally hard words.
- Optional difficulty/flavor lever that fits the brand: a single one-line econ
  hint/definition available on request, which doubles as the lesson hook. (Hint
  is optional in v1 — defer if it costs time.)

## 7. Content plan (the part that can actually balloon — bound it)

The engineering is ~1–2 days; **content curation is the real time risk.** Bound
it hard:

- **Curate ~60–90 terms once** (≈2–3 months of daily puzzles). Do not try to
  build a year of content before launch. More can be appended later.
- Each entry is a single record:
  ```ts
  { word: "YIELD", length: 5, definition: "Return earned on an investment, as a % of its price.", lessonSlug: "bonds-and-yields" }
  ```
- **Allowed-guess list:** v1 can accept any guess of the correct length without a
  full dictionary check (simplest), OR use a small common-word list. Do NOT build
  or import a giant dictionary — that's a rabbit hole. Decision: accept any
  same-length alphabetic guess for v1.
- AI generates the curated list + definitions + slug mappings as **one bounded
  task**, then a human spot-checks for fairness and correct lesson mapping.

---

## 8. Technical approach (reuse, don't rebuild)

We already own the expensive infrastructure from Price War. Lean on it.

- **Stack:** existing Next.js app router + Tailwind design tokens. No new deps if
  avoidable.
- **No backend for v1.** Daily word is computed client-side from date + static
  list. State is `localStorage`. This removes auth, db, timezone-sync, and
  anti-cheat complexity entirely.
- **Files (indicative, keep it small):**
  - `src/app/(game)/play/econ-wordle/page.tsx` — the game page
  - `src/components/econwordle/` — `Board`, `Keyboard`, `Tile`, `ResultCard`
  - `src/lib/econwordle/words.ts` — the curated answer list
  - `src/lib/econwordle/daily.ts` — date → puzzle index
  - `src/lib/econwordle/state.ts` — localStorage read/write + guess evaluation
- **Games hub:** add an Econ Wordle card to the `/play` catalog and the games nav.
- **Shell:** reuse the games hub chrome / design tokens. Decide quickly whether
  to reuse the existing `GameShell` or a lighter wrapper — do not over-engineer a
  new shell.
- **Timezone:** v1 uses the player's local date for "today." Acceptable
  simplification; revisit only if it causes real problems.

## 9. The bridge (do not skip — it's the whole point)

The conversion happens at the moment a player finishes a puzzle. Minimum viable
bridge for v1:

- On win/lose, show: the term, its one-line definition, and **"Learn this →"**
  linking to `lessonSlug`.
- Soft account nudge: "Create an account to save your streak" (links to auth;
  does **not** block play).

That's it. Diagnostic upsells, concept-of-the-day theming, and streak-gated
account capture are v2.

---

## 10. Rough 3-day plan

- **Day 1 — Mechanics:** board, keyboard, guess evaluation, win/lose states, all
  `localStorage`, no backend. Wire into the games hub.
- **Day 2 — Daily + content + share + bridge:** date-seeded daily logic, the
  curated word list, share grid, result card with the "Learn this →" link.
- **Day 3 — Polish + ship:** mobile layout, tile-flip feedback, share/OG
  metadata, QA on a few simulated dates, deploy.

## 11. Definition of done (launch checklist)

- [ ] Plays start-to-finish on mobile and desktop
- [ ] Same word for everyone on a given day; resumes after refresh
- [ ] Share grid copies correctly and reads cleanly
- [ ] Win/lose result shows definition + working lesson link
- [ ] Econ Wordle card appears in `/play` and is reachable
- [ ] Shared link renders a proper preview card (OG metadata)
- [ ] ~60+ curated, fair words with definitions and valid lesson slugs

## 12. v2 backlog (only after v1 is live and people share it)

Accounts + cloud streaks, global leaderboard, puzzle archive, hint/clue system,
diagnostic lesson upsells ("you keep missing pricing terms →"), concept-of-the-day
theming, hard mode, admin word management, server-authoritative daily + timezone
handling.

---

**Remember:** the goal is to *launch*, learn whether people share it, and feed
lessons. A polished game nobody can find or share is worth less than a plain one
that ships. Hold the hard line.
