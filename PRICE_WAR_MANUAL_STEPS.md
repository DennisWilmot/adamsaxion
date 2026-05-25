# Price War — Manual Steps (Owner Checklist)

> **For Dennis.** These steps require dashboard access, browser smoke tests, or secrets you control.  
> The agent continues building without them unless noted as **BLOCKING**.

Last updated: 2026-05-25

---

## Status key

| Symbol | Meaning |
|---|---|
| ⬜ | Not done |
| ✅ | Done |
| 🚫 **BLOCKING** | Agent cannot fully verify the next gate until this is done |

**Current blocker for agent:** None. All items below are verification, security hardening, or optional env — build can continue in parallel.

---

## 1. Supabase — PostgREST security (P1-SEC1) ⬜

**Why:** Prevents clients from reading `pricewar.*` game state via REST. Critical for hidden-information design.

**Steps:**
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Project Settings** → **API** → **Exposed schemas**
3. Ensure **`pricewar` is NOT listed** — only `public` (and any other non-game schemas you need)
4. Save

**Verify:**
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: YOUR_ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/match?select=id"
```
Expected: **404** or **406** (not 200 with data).

---

## 2. Environment — test auth seeding ⬜

**Why:** Lets `pnpm seed:pricewar` create sign-in accounts (alice, bob, carol, dan, admin) for E2E stories.

**Add to `apps/econblog/.env`:**
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Then run:**
```bash
pnpm -F @adamsaxion/econblog seed:pricewar
```

**Verify:** Sign in at `/auth` as `alice+test@adamsaxion.dev` / `TestAlice123!`

| Account | Email | Password | Tier |
|---|---|---|---|
| Alice | `alice+test@adamsaxion.dev` | `TestAlice123!` | Free |
| Bob | `bob+test@adamsaxion.dev` | `TestBob123!` | Free |
| Carol | `carol+test@adamsaxion.dev` | `TestCarol123!` | Paid |
| Dan | `dan+test@adamsaxion.dev` | `TestDan123!` | Paid |
| Admin | `admin+test@adamsaxion.dev` | `TestAdmin123!` | Paid + admin |

**Also add to `.env` for admin routes:**
```env
ADMIN_EMAILS=admin+test@adamsaxion.dev,your-real-admin@email.com
```

---

## 3. Environment — LLM coach (optional for dev) ⬜

**Why:** Paid users get AI coach post-match. Without key, paid users get template fallback (still works).

**Add to `apps/econblog/.env`:**
```env
OPENROUTER_API_KEY=your-key
PRICEWAR_COACH_MODEL=openai/gpt-4o-mini
PRICEWAR_COACH_USER_DAILY_USD=5
PRICEWAR_COACH_GLOBAL_DAILY_USD=200
```

---

## 4. E2E smoke tests (Phase 3 gate) ⬜

**Depends on:** §2 (test accounts) for full Story 1/2. Can partial-test with your own account before seed.

**Story 1 — Free Blitz vs human (alice + bob, two browsers):**
1. Both sign in → `/play` → Blitz → **Find human match**
2. Should pair within ~5s
3. Play 8 rounds each → post-match shows **Unrated match** + template coach + upgrade CTA

**Story 2 — Paid Rapid vs human (carol + dan):**
1. Both sign in → `/play` → Rapid → **Find human match**
2. Complete match → post-match shows **rating delta**
3. `GET /api/pricewar/rating/coffee-shop?playModeId=rapid` shows updated rating

**Story 5 — Vs bot (any user):**
1. Blitz → **Play vs bot** → bot submits automatically → 8 rounds → complete

---

## 5. Admin access smoke ⬜

**After Phase 4 admin pages ship:**
1. Add your email to `ADMIN_EMAILS` in `.env`
2. Sign in → `/admin` → click **Price War** (or go to `/admin/pricewar`)
3. Open a match **Trace** — verify events, submissions, player views
4. Confirm non-admin gets 403 on `/api/pricewar/admin/matches`

---

## 6. Git — commit monorepo restructure ⬜

**When ready:** Large uncommitted diff (`econblog/` → `apps/econblog/` + pricewar packages). Review and commit when you have time — not blocking agent work.

---

## 7. Sentry — error tracking (optional, Phase 5) ⬜

**Why:** Production error visibility for Price War routes and admin tooling.

**Steps:**
1. Create a Sentry project (Next.js) at [sentry.io](https://sentry.io)
2. Add to `apps/econblog/.env` (either var works; both is fine):
   ```env
   SENTRY_DSN=https://...@sentry.io/...
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```
3. Redeploy / restart dev server

**Verify:** Trigger a test error or check Sentry → Issues after a deploy.  
**Note:** If DSN is unset, Sentry is not initialized and the build is unaffected.

---

## 8. Production / staging rollout (Phase 5) ⬜

Deferred until Phase 5. Documented here for completeness:

- [ ] `ENABLE_PRICEWAR=false` feature flag soft launch
- [ ] k6 load test at 100 concurrent users (P5-L1)
- [ ] Sentry + metrics green
- [ ] Runbook signed off (`PRICE_WAR_RUNBOOK.md`)

---

## Quick reference — commands that work without manual steps

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm -F @adamsaxion/econblog db:push
pnpm -F @adamsaxion/econblog seed:pricewar   # profiles OK; auth users need §2
pnpm dev
```
