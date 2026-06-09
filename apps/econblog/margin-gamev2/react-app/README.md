# Margin · Price War — screens (React)

A faithful React port of the Price War screen set. Every state from the route
map is a self-contained component you can drop into a real router and wire to
the server phases.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

A dev-only left-rail navigator (in `App.jsx`) lists every screen grouped the
same way as the spec. It is **not** part of the product — delete it and mount
the screen components in your own router.

## Layout

```
react-app/
  index.html
  package.json            # react 18 + vite
  vite.config.js
  src/
    main.jsx              # ReactDOM root
    App.jsx               # dev navigator + screen registry (route map)
    kit.jsx               # design tokens (T) + atoms (Cash, Price, Btn, Glyph,
                          #   avatars, Eyebrow, Panel…) + injected fonts/classes
    shell.jsx             # BrandBar, GameShell, MatchShell, FullBleed, Modal,
                          #   BattleBoard, RouteTag, LessonNudge, LessonPreview…
    decide.jsx            # CoachBubble, MoveTile/Detail, TurnLog, Decide/Lock columns
    screens-home.jsx      # Home (kanban), Queue, Match history
    screens-match.jsx     # match-lobby, briefing, decide, review, waiting, report
    screens-terminal.jsx  # post-match (win/loss), bankruptcy, you/opponent
                          #   disconnect·timeout·forfeit, abandoned, overlays, errors, austerity
    screens-extra.jsx     # Catalog, Tutorial bootstrap
```

## How it maps to the backend

`RouteTag` on each screen (and the `route` field in `App.jsx`'s registry) names
the canonical route + server phase, 1:1 with the spec:

- `waiting_for_opponent` → `MatchLobby`
- `briefing` → `Briefing`
- `decide` → `DecideScreen` (low-cash variant: `AusterityDecide`)
- `decide → review` (full-bleed) → `Review`
- `decide / resolving` (you locked) → `Waiting`
- `report` → `Report`
- `completed` → terminal screens, routed by outcome + reason
  (`getMatchEndPath`): bankruptcy / abandoned / postmatch, plus the
  self-inflicted (`forfeit_on_timeout`, `forfeit_on_abandonment`, voluntary
  forfeit) and opponent-side wins.

## Notes for the build

- **Tokens.** All color/spacing live in `T` (`kit.jsx`). Styling is inline
  style objects + three font-role classes (`.serif` display, `.mono` for any
  compared quantity, `.eyebrow` labels) injected once on import.
- **Sample data is hard-coded** inside each screen (e.g. `GAMES`, `TURNS`,
  `HISTORY`). Lift these to props / server data when you wire it up.
- **Lessons.** `LessonNudge` is the Prof. Aldo upsell CTA; it appears on every
  report and terminal screen. `LessonPreview` is the destination overlay.
- **Avatars** (`AvPlayer/AvOpp/AvCoach`) are flat SVG stand-ins — swap for the
  real memoji art.
- **Removed for now:** Leaderboard, Profile, Inbox (kept out of the registry;
  re-add when ready).

The original side-by-side design canvas lives at `../Margin States.html` for
visual reference.
