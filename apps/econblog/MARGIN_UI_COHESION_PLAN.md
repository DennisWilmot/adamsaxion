# Margin UI Cohesion Plan

Living document for unifying the Margin player journey from `/play` through match completion.
Tracks implementation status after each phase.

**Last updated:** 2026-05-28

---

## Goal

One cohesive product: same **fonts**, **icons**, **backgrounds**, **card hierarchy**, **buttons**, and **shell chrome** from Games catalog → lobby → queue → match → terminal.

---

## Design system spec (styling level)

### Fonts (CD stack only inside Margin)

| Role | Class / var | Face | Size | Use |
|------|-------------|------|------|-----|
| Body | `.cd` | Inter (`--font-cd-body`) | 13–15px | All UI copy |
| Display | `.serif` | Source Serif 4 | 22–46px | Headlines, opponent names |
| Data | `.mono` / `.num` | JetBrains Mono | 12–28px | Timers, cash, Elo |
| Eyebrow | `.tab` | Inter 500 | 12px, 0.12em | Section labels |

**Rule:** No Hanken Grotesk / shadcn typography inside `(game)/play/price-war/*`.

### Iconography

| Asset type | Source | Sizes | Where |
|------------|--------|-------|-------|
| Mode icons | `/pricewar/icons/mode-*.webp` | 48px cards | Lobby mode picker |
| Lobby mark | `/pricewar/icons/lobby-coffee.webp` | 40px | Lobby header |
| Domain glyphs | Unicode in `CD.d.*.glyph` | 32px tabs | Decide domains |
| Avatars | `AvatarPlayer` / `AvatarOpponent` | 30–120px | Match bar, briefing, terminals |
| Lucide | `Settings`, `Shield` only in lobby header | 14–16px | Settings, rated badge |

**Rule:** No emoji icons in match shell. Prefer webp mode icons + CD domain glyphs.

### Background layers

| Layer | Token | Value |
|-------|-------|-------|
| Viewport wash | `SHELL.viewportGradient` | Blue-grey gradient (full bleed) |
| Tab bar | `SHELL.tabBarGradient` | `#dce9f5 → #c5d9ea` |
| Content well | `SHELL.contentBg` | `CD.paper` |
| Card surface | `SHELL.card.bg` | `CD.cardstock` (#fff) |
| Recessed panel | `CD.paperDeep` | Arena trays, turn log inset |
| Hero plate | `SHELL.hero.overlay` | Lobby arena photo + gradient |

### Card hierarchy

| Level | Border | Radius | Padding | Shadow |
|-------|--------|--------|---------|--------|
| **Frame** (home/queue) | `SHELL.frame.border` #9eb5c8 | 12px | 0 (children pad) | none |
| **Card** | `CD.rule` | 14px | 16–18px | subtle |
| **Hero** | `SHELL.hero.glassBorder` | 16px | 24px | photo backdrop |
| **Action** (left column) | `CD.rule` | 14px | 16px | none |
| **Terminal** | `CD.rule` | 14px embedded / 22 legacy | 28px | CoffeeBackdrop |

### Buttons (shell = SquareBtn primary)

| Variant | Component | Use |
|---------|-----------|-----|
| Primary CTA | `SquareBtn` solid | Play, Begin Round 1, Lock moves |
| Secondary | `PillBtn` outline/ghost | Cancel, Back, View history |
| Destructive | `SquareBtn` outline red | Forfeit |

**Migration:** Replace `PillBtn` primary CTAs in shell with `SquareBtn` over time.

### Spinner & modals

| Element | Spec |
|---------|------|
| Spinner | `CD.primary` top border (not terracotta) |
| Modal scrim | `ModalShell` brown oklch scrim |
| Disconnect overlay | Must match `ModalShell` (Phase 4) |

---

## Architecture target

```
ShellViewport (gradient)
  GameTabs (Home | Match…)
  ShellContentCard (home + queue)
  MatchSessionShell
    3-col: Controls | CoffeeBattleBoard | TurnLog
    full-bleed: Review, Terminals (MatchTerminalFrame)
```

---

## Phase tracker

| Phase | Focus | Status | Completed |
|-------|--------|--------|-----------|
| **0** | Design tokens (SHELL), spinner, chrome | ✅ Done | 2026-05-28 |
| **1** | Wire LobbyScreen, ShellContentCard | ✅ Done | 2026-05-28 |
| **2** | Match shell parity + TerminalFrame | ✅ Done | 2026-05-28 |
| **3** | Satellite pages in shell | ✅ Done | 2026-05-28 |
| **4** | CD overlays (disconnect, errors) | ✅ Done | 2026-05-28 |
| **5** | Legacy cleanup | ✅ Done | 2026-05-28 |

---

## Phase 0 — Design system foundation

- [x] Add `shell-tokens.ts` (SHELL + typography + card + icon scales)
- [x] Re-export from `design-system/index.ts`
- [x] Align `lobby-tokens.ts` to reference SHELL where overlapping
- [x] Fix `.cd-spinner` → `CD.primary`
- [x] Replace hardcoded shell hex in `PriceWarShellChrome`, `MarginShellFrame`, `MatchSessionShell`

**Acceptance:** Grep shows no `#9eb5c8` / `#dce9f5` outside `shell-tokens.ts`.

---

## Phase 1 — Pre-match unification

- [x] Add `ShellContentCard` shared wrapper (home + queue)
- [x] Wire `LobbyScreen` into `PriceWarShellHome` (presence, profile, rating, modes)
- [x] Queue page uses same `ShellContentCard`
- [x] Remove minimal `ShellHomePanel` from active home path

**Acceptance:** `/play/price-war` shows full lobby; queue uses identical frame.

---

## Phase 2 — Match shell polish

- [x] `MatchTerminalFrame` — shared terminal card (postmatch, bankruptcy, abandonment)
- [x] Port decide parity: austerity, coach, tutorial from legacy `DecideScreen`
- [x] Unify left-column `ActionCard` pattern (briefing, decide, waiting, report, lobby)
- [x] Tokenize turn log background (`SHELL.turnLog.bg`)
- [ ] Optional compact status strip (timer/cash) above arena — deferred; `CoffeeBattleBoard` covers this

---

## Phase 3 — Satellite pages in shell

- [x] History, leaderboard, notifications → `ShellViewport` + `GameTabs`
- [x] Tutorial loading → `MatchLoadingGate` in shell frame

---

## Phase 4 — Overlays & errors

- [x] `OpponentDisconnectedOverlay` → CD `ModalShell`
- [x] `GameErrorBoundary` → CD styling
- [x] Queue Suspense → CD copy + shell frame

---

## Phase 5 — Legacy cleanup

- [x] Delete unwired legacy `*Screen.tsx` duplicates
- [x] Remove `RedirectToMatchShell`, `MatchHeaderStrip`, `ForfeitMatchDialog`, `ShellHomePanel`

---

## Terminal outcome matrix

| Reason | Won? | Route | Headline |
|--------|------|-------|----------|
| `victory_points` | Yes/No | `/postmatch` | You won / {opp} won |
| `forfeit_on_timeout` | No | `/postmatch` | You ran out of time |
| `forfeit_on_timeout` | Yes | `/postmatch` | You won the match |
| `forfeit_on_abandonment` | Yes | `/abandoned` | {opp} stepped out |
| `forfeit_on_abandonment` | No | `/postmatch` | You disconnected |
| `bankruptcy` | No | `/bankruptcy` | You ran out of cash |

---

## Phase completion log

### Phase 0
- Added `design-system/shell-tokens.ts` with viewport, tab, frame, card, hero, typography, icon scales.
- Fixed `.cd-spinner` border-top to `CD.primary`.
- Migrated shell chrome hex to `SHELL.*` in `PriceWarShellChrome`, `MatchSessionShell`.
- `lobby-tokens.ts` now references `SHELL` (no duplicate palette).

### Phase 1
- Added `ShellContentCard`; `MarginShellFrame` uses it for home + queue.
- `PriceWarShellHome` wires full `LobbyScreen` (profile, subscription, rating, presence, mode picker).
- Lobby primary CTA uses `SquareBtn` (shell button system).

### Phase 2
- Added `MatchTerminalFrame`; refactored postmatch, bankruptcy, abandonment panels.
- Extracted shared `ActionCard` (`shell/ActionCard.tsx`) using `SHELL.card` tokens.
- Decide phase: `AusterityBanner`, `MatchDecideCoach` (tutorial + round debrief), `ActionCard` wrapper.
- Shared coach logic in `client/pricewar/match-coach.ts`.

### Phase 3
- History, leaderboard, notifications wrapped in `MarginShellFrame`.
- Tutorial start uses shell frame + `MatchLoadingGate`.
- `isMarginShellFramedPath` includes tutorial route.

### Phase 4
- `OpponentDisconnectedOverlay` restyled with `ModalShell` + CD typography.
- `GameErrorBoundary` uses CD card + `SquareBtn`.
- Queue page Suspense fallback uses shell frame + CD spinner.

### Phase 5
- Removed 12 legacy unwired components: `DecideScreen`, full-page terminal/briefing/review/report screens, `CafeMatchLobbyScreen`, `RedirectToMatchShell`, `MatchHeaderStrip`, `ForfeitMatchDialog`, `ShellHomePanel`.
