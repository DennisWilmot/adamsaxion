# Margin — Match Flow Rebuild

> **Status:** Sprint 1 implemented  
> **Scope:** Player-facing match entry, queue, synthetic opponents, rated/ladder gating, debug visibility  
> **Internal codename:** `pricewar` (URLs, packages, DB schema unchanged)

---

## Problem

The current flow is broken in ways that fight launch reality:

1. **Split entry points** — Shell home exposes **Play CPU** (`/api/pricewar/match/vs-bot`); `LobbyScreen` has **Find Match** + **Play CPU** but is not wired; scenario page has **Queue** vs **Practice**; post-match **Play again** skips queue entirely.
2. **Queue UI leaks bots** — Countdown to AI, “Matching with AI opponent”, “Play a bot now”, Elo widening copy.
3. **Bots look like bots** — Robot icon avatars, heuristic name detection (`Riley`, `Sam`), optional `NEXT_PUBLIC_BOT_TRANSPARENT` badge.
4. **Rated complexity too early** — Elo ranges, ladder, Rapid paywall — before the player base supports human-heavy matchmaking.

**Launch reality:** Most early matches will be synthetic substitutes. Players must not know or care.

---

## Vision

**Margin** feels like a live duel from click one. One **Play** path. Human if available; otherwise a silent substitute opponent indistinguishable in UI.

### Player-facing buckets

| Bucket | Purpose |
|--------|---------|
| **Play** | Blitz (default) / Rapid (when enabled). Single CTA → “Finding a game…” → match. |
| **Tutorial** | Onboarding with Guide / Prof. Aldo — explicitly coached, separate from Play. |
| **History** | Past matches (secondary). |

**Removed from player UI:** Play CPU, Practice, vs-bot, AI countdown, bot badges, “play bot now”.

### Target flow

```
Click Play (mode: Blitz | Rapid)
    → Neutral queue: "Finding a game…"
    → [Server] Try human match on every poll
    → If human paired → resolve after 2–3s polish minimum
    → If no human after 30s → wait additional random 5–70s → synthetic opponent → start match
    → Briefing → Decide → …
```

**Timing summary**

| Outcome | Total queue time (from enqueue) |
|---------|----------------------------------|
| Human matched | **2–3s** after pairing (polish floor) |
| Synthetic substitute | **35–100s** (30s human-only window + random 5–70s) |

Player sees: opponent **name + human-like avatar**. No AI/CPU/bot/practice language.

---

## Locked decisions

| Topic | Decision |
|-------|----------|
| **Human-only window** | **30 seconds** from enqueue. Only human pairing allowed; no synthetic match may be created before this elapses. |
| **Search delay — human** | Once paired, resolve after **2–3s minimum** polish (same neutral “Finding a game…” UI). |
| **Search delay — synthetic** | After the 30s window, wait an **additional random 5–70 seconds**, then create match and return `matchId`. Player sees the same neutral UI throughout. |
| **Rated / ladder** | **Manual feature flag** (`MARGIN_RATED_ENABLED`), **off in prod** until explicitly flipped. No automatic threshold. |
| **Bot visibility — players** | **Never.** No labels, countdowns, or robot avatars in default UI/API. |
| **Bot visibility — admin** | **Yes** in admin match/player views. |
| **Bot visibility — dev** | **`?debug=1`** on match routes may expose `isBot` / synthetic source; never shown without debug. |
| **Display name** | **Margin** (cosmetic; internal `pricewar` unchanged). |

---

## Architecture (target)

### Single match entry

All player starts go through:

```
POST /api/pricewar/matchmaking/queue
GET  /api/pricewar/matchmaking/status  (poll until matched)
```

Deprecate player-facing calls to:

```
POST /api/pricewar/match/vs-bot   # internal / admin / e2e only
```

Wire these through queue instead:

- Shell home **Play**
- Scenario page **Play**
- Post-match **Play again**
- Any orphaned **Find Match** / **Play CPU** UI

### Server: `advanceMatchmaking` changes

Current behavior: try human → if queue age ≥ `botFallbackAfterSec` (30–45s fixed) → create bot match immediately.

**New behavior:**

1. Try human match on every status poll (unchanged).
2. If human matched → return `{ matched, matchId }` once **≥ 2s** since pairing (polish floor; cap ~3s).
3. If no human and `elapsedSec < HUMAN_ONLY_WINDOW_SEC` (**30s**) → stay queued; never create synthetic.
4. When `elapsedSec >= 30` and still no human:
   - On first crossing 30s: draw and persist `syntheticDelaySec = randomInt(5, 70)` on the queue row.
   - Do **not** create match until `elapsedSec >= 30 + syntheticDelaySec`.
   - At threshold: pick synthetic opponent profile + bot persona, create match, return `matchId`.
5. Response never includes `botFallback: true` to clients (admin/debug only).

**Constants (Sprint 1):**

```bash
MARGIN_HUMAN_ONLY_WINDOW_SEC=30   # no synthetic before this
MARGIN_SYNTHETIC_DELAY_MIN_SEC=5  # additional delay after window
MARGIN_SYNTHETIC_DELAY_MAX_SEC=70
MARGIN_HUMAN_POLISH_MIN_SEC=2     # min time after human pair before match starts
```

Replace per-mode `botFallbackAfterSec` in queue UI/API responses — players must not receive countdown fields.

### Synthetic opponent pool (Sprint 2)

| Field | Notes |
|-------|--------|
| `displayName` | e.g. `"Maya K."` — not `Riley` / bot persona labels |
| `avatarUrl` | Portrait from generated corpus |
| `botPersonalityId` | Internal only — drives engine |
| `syntheticOpponentId` | Stable pool reference |

Persist on `match_players` at creation. UI always renders **human avatar** for non-tutorial opponents.

**Backlog:** Generate portrait corpus (start 100–500); auto-assign on fallback.

### Bot intelligence (phased)

| Phase | Work |
|-------|------|
| **Sprint 1** | Persona rotation; human-like submit delay; no instant bot locks |
| **Sprint 2** | Shadow stats → pick persona tier near player skill |
| **Later** | Shrink synthetic % as DAU grows; enable rated via flag |

### Rated / ladder (`MARGIN_RATED_ENABLED`)

When **off** (default):

- Hide Elo, ladder tab, “searching your league”, Rapid rated copy.
- All matches unrated; no rating mutations.
- Queue UI: no Elo range bar.

When **on** (manual flip):

- Restore rated Blitz/Rapid per existing tier rules.
- Human matches affect rating; synthetic matches do not (or use shadow rating only).

Env:

```bash
MARGIN_RATED_ENABLED=false   # prod default
```

### Debug visibility

| Surface | `isBot` / synthetic source |
|---------|----------------------------|
| Player `GET .../view` | Stripped unless `?debug=1` and dev/admin |
| Admin `/admin/pricewar/*` | Visible |
| E2E | Use `PRICEWAR_E2E_ENABLED` + direct API as today |

Optional debug UI badge in match chrome when `?debug=1` only.

---

## UI changes (Sprint 1)

### Queue screen

**Remove:**

- `secondsUntilBotFallback` countdown copy
- “AI opponent in Ns…”
- “Matching with AI opponent”
- “Play a bot now” button
- Elo range / widening bar (when rated off)
- `matchingBot` distinct messaging

**Keep:**

- Neutral: “Finding a game…”
- Elapsed timer (optional, subtle)
- Cancel
- Mode + scenario subtitle

### Lobby / shell

**Replace:**

- Find Match + Play CPU → single **Play →**
- Shell home Play CPU → **Play →** (queue)
- Scenario Practice → remove or merge into Play

**Keep:**

- Mode cards: Blitz, Rapid (locked when rated off or unpaid), Tutorial
- Tutorial → `/play/price-war/tutorial` (unchanged)

### Match UI

- `OpponentAvatarFace`: never `kind === "bot"` for Play matches; use portrait or generic human avatar.
- `MatchHeaderStrip`: no Bot badge (unless `?debug=1`).
- `resolveOpponentAvatarKind`: do not infer bot from names like Riley/Sam in production.

### Copy

- Lobby “Real players · real prices” → neutral (“Live matches” or remove until population supports it).
- All user-facing strings: **Margin**, never Price War.

---

## Sprint plan

### Sprint 1 — Seamless illusion (~2–3 days)

- [ ] Single **Play** entry; remove player-facing CPU/practice paths
- [ ] Queue UI neutral state only
- [ ] Route shell home, scenario, play-again through queue
- [ ] Server: 30s human-only window; then synthetic random +5–70s; human 2–3s polish floor
- [ ] Strip `botFallback` / `isBot` from default client view API
- [ ] Human avatar for all non-tutorial opponents (interim generic OK)
- [ ] `MARGIN_RATED_ENABLED=false` hides rated/ladder UI
- [ ] `?debug=1` exposes bot flag for devs
- [ ] Update e2e: tutorial unchanged; queue flow asserts no AI copy

### Sprint 2 — Synthetic opponent pool (~3–5 days)

- [ ] Portrait corpus + `synthetic_opponents` pool
- [ ] Assign name + avatar at match creation
- [ ] DB: persist avatar URL on `match_players`
- [ ] Persona rotation + submit delays

### Sprint 3 — Population & rated (~when ready)

- [ ] Manual flip `MARGIN_RATED_ENABLED`
- [ ] Shadow skill matching for synthetics
- [ ] Metrics: human %, queue time, retention
- [ ] Optional: shorten synthetic window when queue depth high

---

## Files likely touched (Sprint 1)

| Area | Files |
|------|--------|
| Queue UI | `QueueScreen.tsx`, `QueuePageInner.tsx` |
| Lobby | `LobbyScreen.tsx`, `PriceWarShellHome.tsx`, `PriceWarShellChrome.tsx` |
| Scenario | `scenario/page.tsx`, `ScenarioScreen.tsx` |
| Server | `matchmaker.ts` (`advanceMatchmaking`), `matchmaking/status/route.ts` |
| View API | `match/[id]/view/route.ts`, `packages/pricewar-engine/.../to-player-view.ts` |
| Avatars | `opponent-avatar.tsx`, `MatchSessionShell.tsx`, `CafeMatchLobbyScreen.tsx` |
| Flags | `feature-flag.ts`, `.env.example` |
| Post-match | `MatchSessionShell.tsx` (`playAgain`) |
| Tests | `e2e/pricewar/*.spec.ts`, `bot-transparency.spec.ts` |

---

## Out of scope (this doc)

- URL rename `/play/price-war` → `/play/margin`
- Package/DB rename `pricewar`
- Full AI opponent intelligence / LLM-driven play
- Portrait generation pipeline implementation detail (Sprint 2 spec)

---

## Acceptance criteria (Sprint 1)

1. New player clicks **Play** → sees only “Finding a game…” → match starts with named opponent + human avatar.
2. No UI mentions AI, bot, CPU, practice, or fallback timing.
3. No synthetic match before **30s** from enqueue.
4. Synthetic match resolves between **35s and 100s** from enqueue (30 + random 5–70).
5. Human match resolves within **~2–3s** of pairing (even if pairing happens before 30s).
6. Admin can see bot flag; player API/view cannot without `?debug=1`.
7. With `MARGIN_RATED_ENABLED=false`, no Elo/ladder/rated queue UI.
8. **Play again** uses queue, not direct vs-bot.

---

*Last updated: 30s human-only window, then synthetic +5–70s; rated manual flip; debug admin + `?debug=1`.*
