# Margin v2 — Implementation Plan

> **Source of truth:** `apps/econblog/margin-gamev2/react-app/`  
> **RouteTag mapping:** preserved 1:1 from reference registry  
> **Locked product decisions (2026-06-01):**

| Topic | Decision |
|-------|----------|
| North star | All v2 RouteTag screens + outcomes |
| Lessons (CONFLICT #7) | Merged **Coach + Lesson nudge** on every **match-end terminal** (`phase === completed`) |
| Lesson Start CTA | **Coach-recommended slug is free** → `/lessons/{slug}`; catalog browse stays subscription-gated |
| Round report lessons | **Terminals only** (no lesson nudge on mid-match report) |
| Kanban home | **Phase-1 simplified** cards (phase, opponent, timer, column from history fields) |
| Elo when rated off | **Hide** Elo/ladder surfaces when `MARGIN_RATED_ENABLED=false` |
| Domain chips | Engine IDs unchanged; **visual** flat SVG glyphs per reference |
| Buttons | Reference **pill `Btn`** family (blue primary) inside Margin shell |
| Animation | Board still on lock/wait; transitional motion + breathe + dots; `prefers-reduced-motion` preserved |
| Colors / spacing | No new colors; pixel-equivalent to reference kit |

---

## Phase 0 — Kit foundation

Port reference atoms into production design system:

- Money: `Cash`, `Price` (mono, `$` / `¢`)
- Type roles: `.serif`, `.mono`, `.eyebrow` (alias `.tab`)
- `MarginBtn` pill button family
- `DomainChip` + SVG `Glyph` (map engine domains → reference visuals)
- Motion classes: `mtq-dot`, `mtq-breathe`, reduced-motion block
- Align `CD` / shell paper tones to reference `T` where they diverge

**Done when:** primitives match reference hex + spacing; no new palette entries.

---

## Phase 1 — Shell chrome

- `BrandBar` (wordmark, History, profile chip) above `GameTabs`
- **Kanban home** replaces `ShellHomePanel` (Up next / Submitted / Waiting)
- **Queue** → dots + prep lines layout (neutral copy, no avatar pulse)
- `ModePicker` dropdown on home (Blitz default; Rapid gated)
- Hide Elo on shell surfaces when rated off / unpaid per flags

**Done when:** `/play/price-war` and `/queue` screenshot-match reference layout.

---

## Phase 2 — Match shell parity

- `BattleBoard` / `BoardSide` status model
- Column widths ~372 | 432 | 340, gap 18
- Decide / lock / waiting / report panels aligned to reference
- Review + terminals: full-bleed frames unchanged in routing

**Done when:** decide, waiting, report panels match reference spacing.

---

## Phase 3 — Terminals + overlays

- Terminal panels → v2 `OutcomeBanner` + trajectory charts where reference shows them
- **Merged coach lesson block** on all terminal variants (coach API + `recommendedLessonSlugs`)
- `LessonPreview` modal on CTA tap (preview → free Start for coach slug)
- Overlays: disconnect, forfeit, errors → reference `Modal` styling
- Austerity decide variant preserved

**Done when:** all terminal RouteTags render with merged coach-lesson nudge.

---

## Phase 4 — Cleanup + verification

- Remove or deprecate unwired `LobbyScreen` hero path from active routes — **removed** `LobbyScreen.tsx`; home is `ShellKanbanHome`
- Update design-review screenshot spec for new home/queue
- Extend e2e: terminal shows lesson nudge with coach slug link
- Conflict report: route / phase / panel / token mismatches

---

## RouteTag registry (target)

| Route | Panel | Screen |
|-------|-------|--------|
| `/play` | games-catalog | Games catalog |
| `/play/price-war` | shell-home | Kanban home |
| `/play/price-war/queue` | queue-searching | Queue |
| `/play/price-war/history` | history | Match history |
| `/play/price-war/leaderboard` | leaderboard | Ladder |
| `/play/price-war/notifications` | notifications | Inbox |
| `/play/price-war/match/{id}` | match-lobby | Waiting for opponent |
| `…/briefing` | briefing | Briefing |
| `…/decide` | decide | Decide |
| `…/review` | review | Review (full-bleed) |
| `…/waiting` | waiting | Waiting |
| `…/report/{n}` | report | Round report |
| `…/postmatch` etc. | terminal-* | Terminals + merged coach lesson |
| overlay | lesson-preview | Lesson preview modal |

---

## Conflict log (resolved)

| # | Resolution |
|---|------------|
| 1 Home IA | Kanban |
| 2 Buttons | Pill blue |
| 3 Domains | Visual remap only |
| 4 Chrome | BrandBar + tabs |
| 5 Queue | Dots + prep lines |
| 6 Terminals | v2 layout |
| 7 Lessons | Merged coach nudge; free coach slug |
| 8 Kanban data | Phase-1 simplified |
| 9 Doc drift | This doc + react-app supersede cohesion/cafe-duel |
| 10 Rated | Hide Elo when off |

---

## Phase completion status (2026-06-01)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Kit | ✅ Done | `margin-kit.tsx`, `mtq-*` motion, `shell-tokens` aligned |
| 1 Shell | ✅ Done | `BrandBar`, `ShellKanbanHome`, `ModePicker`, queue v2 |
| 2 Match loop | ✅ Done | `BattleBoard`, 372/432/340 grid, `MarginBtn` on match CTAs |
| 3 Terminals + lessons | ✅ Done | `OutcomeBanner`, `TrajChart`, `CoachLessonBlock` on all terminals |
| 4 QA | ✅ Done | E2e terminal lesson assertion; re-run `pnpm screenshots:margin` to refresh PNGs |

---

## Post-implementation conflict report

| # | Outcome |
|---|---------|
| 1 | Kanban live — replaces `ShellHomePanel` |
| 2 | `MarginBtn` on home/queue/match CTAs |
| 3 | Domain SVG glyph chips (`domain-glyphs.tsx`) |
| 4 | `BrandBar` on shell + match |
| 5 | Queue uses dots + prep lines |
| 6 | `OutcomeBanner` + cash `TrajChart` on postmatch/bankruptcy |
| 7 | Coach slug free → preview → `/lessons/{slug}` |
| 8 | Phase-1 kanban columns from `phase` only |
| 9 | This doc is source of truth |
| 10 | Elo hidden in BrandBar when rated off |

**Remaining visual debt:** per-round price trajectory (not stored in round reports); bankruptcy terminal screenshot (no E2E shortcut).
