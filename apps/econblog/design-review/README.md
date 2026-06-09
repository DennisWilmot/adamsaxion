# Margin design review screenshots

Automated full-page captures of shell + match UI states.

## Prerequisites

1. Dev server running with E2E helpers enabled:
   ```bash
   PRICEWAR_E2E_ENABLED=1 pnpm dev
   ```
2. Seeded test users (default from `e2e/pricewar/`):
   - `carol+test@adamsaxion.dev` / `TestCarol123!`
   - `dan+test@adamsaxion.dev` / `TestDan123!` (for waiting + abandonment)

## Run

```bash
cd apps/econblog
pnpm screenshots:margin
```

Output: `design-review/screenshots/*.png`

## Captured states

| File | State |
|------|--------|
| `01-shell-home` | Kanban home (Up next / Submitted / Waiting) |
| `02-queue-searching` | Queue / searching |
| `03-history` | Match history |
| `04-leaderboard` | Ladder |
| `05-match-briefing` | Pre-round briefing |
| `06-match-decide` | Decide phase |
| `07-match-review` | Lock-in review |
| `08-match-report` | Round report |
| `09-terminal-postmatch` | Post-match (`OutcomeBanner` + trajectories + coach lesson) |
| `10-match-waiting` | Locked, waiting on opponent |
| `11-terminal-abandoned-win` | Opponent abandoned |

Not yet automated: **bankruptcy** terminal (no E2E shortcut), **tutorial** flow, **error modals**.
