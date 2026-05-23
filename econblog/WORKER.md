# Lesson generation worker (Railway)

The lesson pipeline uses **two Railway services** from the same `econblog/` directory:

| Service | Start command | Purpose |
|---------|---------------|---------|
| **Web** | `npm run build && npm start` | Next.js app — `/admin`, student site, `/api/admin/*` |
| **Worker** | `npm run worker:lessons` | Background job processor — polls `lesson_generation_jobs`, runs research → outline → content → questions → mastery |

Both services share **one Supabase database**. Admin queues jobs via the web app; the worker picks them up.

**Do not run `npm run worker:lessons` locally while the Railway worker is active** — two workers compete for the same queued jobs.

---

## Railway setup

### Web service
- **Root directory:** `econblog`
- **Build:** `npm run build` (or `pnpm build`)
- **Start:** `npm start`

### Worker service (separate Railway service, same repo)
- **Root directory:** `econblog`
- **Build:** `npm install` (no Next build needed)
- **Start command:** `npm run worker:lessons`

### Required env vars (both services unless noted)

| Variable | Web | Worker | Notes |
|----------|-----|--------|-------|
| `DATABASE_URL` | ✓ | ✓ | Supabase pooler URL |
| `OPENROUTER_API_KEY` | ✓ | ✓ | Lesson generation |
| `OPENROUTER_MODEL` | ✓ | ✓ | e.g. `anthropic/claude-sonnet-4` |
| `SERPAPI_API_KEY` | ✓ | ✓ | Web research — [serpapi.com](https://serpapi.com) (**not** serper.dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | — | Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | — | Auth |
| `ADMIN_EMAILS` | ✓ | — | Admin access |
| `NEXT_PUBLIC_APP_URL` | ✓ | — | Production URL |

### Optional worker tuning

| Variable | Default | Description |
|----------|---------|-------------|
| `LESSON_JOB_POLL_MS` | `2000` | Poll interval for queued jobs |
| `LESSON_JOB_CONCURRENCY` | `2` | Parallel jobs per worker instance |

---

## Ops scripts (run locally against prod DB)

These hit whatever `DATABASE_URL` is in `econblog/.env` — usually the same Supabase as production.

```bash
cd econblog

npm run test:serpapi          # Verify SerpAPI key
npm run resume:lessons        # Show status; --execute re-queues stuck lessons
npm run purge:batch -- --dry-run   # Preview delete + re-queue of all non-published lessons
npm run purge:batch -- --execute   # Actually purge Jamaica batch and re-queue fresh
npm run restart:early-lessons -- --execute  # Reset only research/outline lessons
```

After DB-only scripts, the **Railway worker** processes the queue — no local worker needed.

---

## Troubleshooting

**Jobs stuck on "Queued. Waiting for worker..."**
- Worker service not running on Railway, or crashed — check Railway logs for the worker service
- Wrong start command (must be `worker:lessons`, not `next start`)

**Research fails / no web results**
- Worker missing `SERPAPI_API_KEY` (or old code still using Serper)
- Redeploy worker after code/env changes

**Publish fails — "Check Railway logs"**
- Error comes from admin UI when publish API doesn't return `published` — check **web** service logs

**Local vs prod confusion**
- Admin on `adamsaxion-production.up.railway.app` reads prod DB
- Code changes only affect prod after **git push + Railway redeploy** (web + worker)
- DB scripts run locally still mutate prod if `.env` points at prod Supabase

---

## Production URL

Web: `https://adamsaxion-production.up.railway.app`

Supabase auth redirect: `https://adamsaxion-production.up.railway.app/auth/callback`
