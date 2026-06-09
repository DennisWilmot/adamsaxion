# Margin — Transition & Reveal Choreography Spec

> Status: **Design locked, not yet built.**
> Scope: in-match round reveals + terminal (end-of-match) transitions for the
> Margin / Price War game.

## Background & intent

We removed the in-game **latency** (optimistic lock-in, deferred resolution,
SSE-driven cache updates), so the game now updates instantly. The side effect is
that state changes now feel **jarring / teleporting** — there is no motion
carrying the player between states.

The goal of this work is to add **choreography**, not latency:

- **Latency** = the player waits on the system. Always bad. (Already eliminated.)
- **Choreography / pacing** = the system takes a deliberate beat to *communicate*
  a state change. This is good and is what we are adding back intentionally.

Guiding principle: **decouple data-readiness from presentation-readiness.** Data
can arrive instantly; the UI plays a fixed, self-paced timeline to present it.
The player is never *blocked* from acting — they are only ever watching the
consequence of a decision they already committed.

## Locked decisions

- **Feel:** dramatic & game-y, smooth/natural, immersive.
- **Tempo:** ~3s nominal per round turn; breathes 2.5–4s depending on outcome
  drama.
- **Reveal:** full sequenced reveal (opponent move → clash → bars → numbers →
  verdict).
- **Anticipation dwell:** yes — ~600–900ms floor after lock-in, even vs bots.
- **Skip:** tap-to-skip always available, never forced. **Tutorial runs full**
  (no skip).
- **PvP = bot:** identical choreography; in PvP the anticipation floor is just a
  minimum and the real opponent wait can exceed it.
- **Audio:** in scope; files not yet sourced. Build an event-driven audio layer
  now that is a **silent no-op until files exist.**
- **Easing:** ease-in builds tension, ease-out + slight overshoot (back-ease) on
  payoffs. Nothing linear.
- **Reduced motion:** `prefers-reduced-motion` collapses everything to instant.
- **End-state trigger beats:** **per-cause** signatures (not a single generic
  "match ended").

## Architecture: the presentation state machine

The core piece. A small **presentation state machine** that runs the reveal /
terminal timelines **independently of the data phase**.

- The data layer (React Query cache + SSE) can say "report ready" / "match
  ended" at any time; the presentation layer runs its own clock so an instant
  update can never **yank the screen past the show**.
- Audio cues and skip logic hang off this layer.
- **Interrupt → abort to terminal:** any terminal event (timeout, bankruptcy,
  abandonment, forfeit, match-end) can fire mid-reveal or mid-decision. The
  state machine must cleanly stop whatever is playing and run the terminal
  sequence ("abort to truth"). No races between a round reveal and an end screen.

## The match loop

```
briefing → decide → [Lock in] → waiting/anticipation → reveal → settle
        → [Continue] → decide(n+1) → … → (terminal)
```

## Round turn arc (~3s nominal)

| Time        | Beat              | Visual                                                              | Audio cue                               |
|-------------|-------------------|--------------------------------------------------------------------|-----------------------------------------|
| 0ms         | **Commit**        | Locked moves snap/glide into the tray; tray seals ("● Locked")      | `lock.commit`                           |
| 0–800ms     | **Anticipation**  | Your side locked; opponent "deciding…" pulse; board dims/focuses    | `opponent.thinking` (loop, fades in)    |
| ~800ms      | **Reveal: move**  | Opponent card flips face-up beside yours; held a beat               | `reveal.flip` (thinking loop stops)     |
| ~1000ms     | **Clash**         | Both moves shown head-to-head; slight zoom/spotlight                | —                                       |
| 1000–2200ms | **Consequences**  | Cash/demand bars grow (overshoot-settle); numbers count up/down     | `bar.fill`, `number.tick`               |
| ~2400ms     | **Verdict**       | Result line + private takeaway lands last (punctuation)             | `round.win` / `round.lose` / `round.neutral` |
| 2400–3000ms | **Settle**        | Board comes to rest; Continue affordance appears                   | —                                       |

Then **Continue** → ~400–600ms "Round N" re-deal into a fresh decide board
(`round.start`).

Sequencing notes:
- ~150ms stagger between reveal sub-steps so the eye follows cause → effect.
- The reveal **order is also the explanation** (move → clash → bars → numbers →
  verdict): pressure-test it against the economics we want players to learn.

## Terminal (end-of-match) transitions

Two emotional categories:

1. **Earned / anticipated endings** (player saw it coming) → **crescendo**, no
   interstitial. The final round reveal ramps *up* into the post-match summary as
   one continuous motion.
2. **Abrupt / interrupting endings** (match ends out from under the player) →
   need a cause-specific **trigger beat** so the player understands *why* before
   seeing the *result*.

### Universal terminal pattern

```
[telegraph the danger]  →  [per-cause trigger beat ~1s]  →  [match-over sweep ~500ms]  →  [end screen eases in]
```

- **Telegraph the danger** turns "shocks" into anticipated payoffs (dying clock,
  cash approaching the bankruptcy line). This is the main immersion lever.
- **Match-over sweep** is the shared connective tissue: board recedes, result
  panel rises — so all endings share a family resemblance.
- **End screen** content is unchanged (headline, "what happened", lesson card,
  Lobby / Rematch) — only the **runway into it** is new. It eases in, never hard
  cuts.
- All terminal sequences are tap-skippable (tutorial full).

### Per-cause trigger beats

| Cause | Telegraph (before) | Trigger beat (~1s) | Framing | Audio |
|---|---|---|---|---|
| **Your timer expires** | Last ~5s: clock pulses, amber→red, accelerating tick, heartbeat | Clock slams to 0:00; red "TIME'S UP" stamp; board freezes + desaturates; your side dims | Loss — ties to "Managing your turn clock" lesson | `clock.tick.escalate` → `clock.expire` (buzzer) |
| **Opponent's timer expires** | Their clock visibly bleeds down | Their clock dies; "ALEX RAN OUT OF TIME"; their side greys; your side glows | Win (gift moment) | buzzer → `match.win` |
| **You go bankrupt** | Cash trends red toward a visible bankruptcy line | Cash crashes through the line; "BANKRUPT" stamp; board collapses inward | Loss — ties to a margin/cash lesson | `cash.drain` → `bankrupt.stamp` |
| **Opponent goes bankrupt** | Their cash bar approaches the line | "ALEX WENT BANKRUPT"; their board collapses; you stand | Win | drain → `match.win` |
| **Opponent abandons / disconnects** | Existing grace overlay | Opponent avatar greys / "Alex left the match"; grace countdown resolves | Win (recorded per rules) | `opponent.leave` → `match.win` |
| **You forfeit** | Existing confirm dialog | Calm, subdued "You forfeited"; no drama | Loss — quiet | soft `forfeit.confirm` |
| **Normal completion** (all rounds) | Final round reveal ramps bigger | Crescendo out of last reveal → "MATCH WON/LOST" flourish | Win/Loss earned | `match.win` / `match.lose` |
| **Draw / dead heat** | — | Balanced neutral beat; both sides level; "DEAD HEAT" | Neutral | `draw` |

Notes:
- **Mirror cases are free:** the same machinery makes *your* timeout sting and
  *their* timeout a victory — swap which side dims vs. glows and resolve audio up
  vs. down.
- **Each trigger beat reinforces its lesson** (clock death → turn-clock lesson;
  cash crash → margin lesson). Drama and teaching are the same motion.
- **Forfeit stays deliberately undramatic** — opted into, so no flourish.

## Audio

Event-driven, asset-decoupled:

- Choreography emits **semantic cues**; a **manifest** maps cue → file (+ volume,
  throttle). Missing file = **silent no-op**.
- Single `play(cue)` helper called at each beat.
- **Autoplay unlock** on first user interaction (locking a move is a natural
  unlock point).
- Global **mute / volume** control; `prefers-reduced-motion` (and/or a sound
  toggle) collapses to silent/instant.

### Sound palette to source

Round: `lock.commit`, `opponent.thinking`, `reveal.flip`, `bar.fill`,
`number.tick`, `round.win`, `round.lose`, `round.neutral`, `round.start`.

Terminal: `clock.tick.escalate`, `clock.expire`, `cash.drain`, `bankrupt.stamp`,
`opponent.leave`, `forfeit.confirm`, `match.win`, `match.lose`, `draw`.

Prototype sources: Freesound, Kenney free SFX packs, ZapSplat. Wire placeholders
to hear *something* while sourcing finals.

## Build tiers (for when we scope)

- **Tier 1:** presentation state machine + anticipation dwell + full sequenced
  round reveal + audio hooks (silent) + tap-to-skip.
- **Tier 2:** coordinated screen-to-screen transitions (no hard cuts) + the
  full terminal-transition layer with per-cause trigger beats.
- **Tier 3:** polish — number tweening, round-intro beat, telegraph escalation
  detailing, completion crescendo, micro-interactions.

## Open / not-yet-decided

- Telegraph thresholds (when the clock starts escalating; where the bankruptcy
  line sits visually).
- Completion crescendo specifics (how much bigger the final reveal is).
- Whether to auto-shorten choreography for veterans (default: no; revisit after
  playtest).
