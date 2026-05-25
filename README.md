# Adam's Axioms V2

Two interconnected projects powering an economics education business: a YouTube content pipeline and an interactive learning platform.

## Architecture Overview

```
AdamsAxiom-V2/
├── adams-agents/      # AI video content pipeline (Python CLI)
├── apps/
│   └── econblog/      # Interactive economics learning platform + The Price War (Next.js)
├── packages/
│   ├── pricewar-types/   # Shared game types
│   └── pricewar-engine/  # Pure TS game engine
└── ECONBLOG_REFACTOR_SPEC.md  # Detailed product spec for econblog
```

### How They Connect

**`adams-agents`** generates the YouTube content that drives traffic. **`econblog`** is the product those viewers pay for. The YouTube channel is the marketing funnel; the website is the revenue engine.

Both projects use AI for content generation but serve different outputs:
- `adams-agents` produces video scripts and audio files for YouTube
- `econblog` produces structured interactive lessons with quizzes and XP progression

The lesson generation admin inside `econblog` (`/admin`) is a separate pipeline from `adams-agents` — same philosophy (AI-generated educational content with human review) but different output format, rules, and tooling.

---

## adams-agents

**Python CLI** for AI-generated economics YouTube videos.

**Pipeline:** Topic → Research → Outline → Script → Audio → Google Drive

### Tech Stack
- Python 3 + Click CLI
- OpenAI GPT-4o (research, outline, script)
- Google Gemini 1.5 Flash (script cleanup, audio chunking)
- Google Cloud TTS (audio generation)
- Google Drive API (asset upload)

### Setup

```bash
cd adams-agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in API keys
```

### Required Environment Variables
- `OPENAI_API_KEY` — OpenAI API key
- `GOOGLE_GEMINI_API_KEY` — Google Gemini API key
- `GOOGLE_CLOUD_PROJECT_ID` — GCP project ID
- `GOOGLE_SERVICE_ACCOUNT_KEY` — GCP service account JSON (single line)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — For Drive OAuth

### Usage

```bash
# Create a project
python3 cli.py create --topic "Supply and Demand" --context "Undergrad-friendly"

# Generate content (sequential steps)
python3 cli.py generate_outline <project_id>
python3 cli.py generate_script <project_id>
python3 cli.py generate_audio <project_id>

# Upload to Google Drive
python3 cli.py upload_to_drive <project_id>

# Other commands
python3 cli.py list          # List all projects
python3 cli.py show <id>     # Show project details
python3 cli.py validate <id> # Validate content quality
```

See `CLI_OPERATIONS.tx` for the full command reference.

---

## econblog

**Next.js 15** interactive economics education platform with subscription model ($19.99/mo or $149 lifetime).

**Student experience:** Lessons with 8 major sections → ~3 subsections each → quiz gates → mastery exam. XP system with levels and leaderboard.

**Admin experience:** AI-powered lesson generator at `/admin` with tabbed workspace (Sources → Outline → Sections → Questions → Mastery → Preview → Publish).

### Tech Stack
- Next.js 15 (App Router, Turbopack)
- React 19, TypeScript 5
- Tailwind CSS 3.4, Radix UI
- Supabase (PostgreSQL + Auth via Google OAuth)
- Drizzle ORM
- Open Router (Claude Sonnet 4.6 for lesson generation)
- Serper API (web research for lesson content)

### Setup

```bash
cd econblog
npm install
cp .env.example .env  # Fill in all values
```

### Required Environment Variables
- `DATABASE_URL` — Supabase connection pooler URL
- `DIRECT_URL` — Supabase direct connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `ADMIN_EMAILS` — Comma-separated emails allowed to access `/admin`
- `OPENROUTER_API_KEY` — Open Router API key (for lesson generation)
- `OPENROUTER_MODEL` — Model slug (default: `anthropic/claude-sonnet-4`)
- `SERPER_API_KEY` — Serper API key (for web research, optional)

### Database Setup

```bash
# Push schema to Supabase
npm run db:push

# Seed leaderboard with simulated data
npm run db:seed

# Migrate existing JSON lessons into the database
npm run db:migrate-lessons
```

### Running

```bash
npm run dev    # Dev server at http://localhost:3000
npm run build  # Production build
npm start      # Production server
```

### Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/lessons` | Public | Lesson catalog with search/filter |
| `/lessons/[slug]` | Public | Lesson player (quiz interaction requires auth) |
| `/leaderboard` | Public | XP leaderboard |
| `/profile` | Authenticated | User profile, XP, progress |
| `/admin` | Admin only | Lesson generator dashboard |
| `/admin/lessons/[id]` | Admin only | Lesson generation workspace |

### Admin Lesson Generator

The `/admin` routes are protected by email allowlist (`ADMIN_EMAILS` env var). The lesson generation pipeline:

1. **Sources** — Upload PDFs/text, run AI web research, review synthesis
2. **Outline** — Generate 8-section skeleton with subsections and quiz type hints
3. **Sections** — Generate content section-by-section with inline editing
4. **Questions** — Generate quizzes per section with auto-validation against question design rules
5. **Mastery** — Generate mastery exam pool (2x draw count)
6. **Preview** — Live preview using the student-facing LessonPlayer component
7. **Publish** — Push to production (instant, no rebuild needed)

Question rules are codified in `src/content/lesson_writing_rules.md`. Questions are auto-validated against 5 rules (never reveal the concept, both options genuinely appealing, second-order effects, test values not knowledge, real verifiable scenarios) with retry loops.

### Database Tables

- `profiles` — User profiles (synced from Supabase Auth)
- `lessons` — Full lesson content as JSONB, pipeline status, metadata
- `lesson_sources` — Research sources (uploaded PDFs, pasted text, web research)
- `lesson_progress` — Per-user per-lesson progress tracking
- `quiz_attempts` — Individual quiz attempt records with XP
- `leaderboard_seeds` — Simulated leaderboard entries for launch

---

## Development Notes

- Both projects have independent dependency management (`requirements.txt` / `package.json`)
- Both use `.env` files for configuration (never committed)
- `econblog` uses Supabase as the single backend (DB + Auth + Storage)
- `adams-agents` uses local filesystem + Google Drive for asset management
- The detailed product spec for econblog is in `ECONBLOG_REFACTOR_SPEC.md` at the repo root
