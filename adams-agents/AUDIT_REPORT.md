# Codebase Audit Report — Adam's Axiom YouTube Automation Pipeline

**Date:** May 16, 2026
**Scope:** Full codebase at `adamsaxion/`, focused on `adams-agents/` YouTube pipeline

---

## 1. Directory Tree

```
adamsaxion/
├── .env                            # Env vars: DB, Supabase, OpenRouter, Serper (8 keys)
├── .gitignore                      # Ignores node_modules, .env, .next, venv, projects/, audio, credentials
├── ECONBLOG_REFACTOR_SPEC.md       # Product spec for the econblog learning platform
├── README.md                       # Monorepo overview documenting both projects
├── package.json                    # Root deps (Supabase, Drizzle, Postgres) — no scripts
├── package-lock.json               # npm lockfile (~57k — mixed npm/pnpm history)
├── pnpm-lock.yaml                  # pnpm lockfile (~32k)
├── pnpm-workspace.yaml             # Placeholder — no real workspace packages defined
├── review.md                       # Audit prompt
│
├── adams-agents/                   # Python CLI — YouTube automation pipeline
│   ├── .env.example                # STALE env template (missing Gemini/GCP TTS vars)
│   ├── CLI_OPERATIONS.tx           # CLI cheat sheet (accurate)
│   ├── ENV_SETUP_GUIDE.md          # Setup guide (more current than .env.example)
│   ├── GOOGLE_DRIVE_SETUP.md       # Drive OAuth setup instructions
│   ├── MIGRATION_TO_GOOGLE_TTS.md  # Migration doc (references CLI flags that DON'T EXIST)
│   ├── README_GOOGLE_DRIVE.md      # Drive integration docs
│   ├── SAAS_CONVERSION_AUDIT.md    # Future architecture notes (not executable)
│   ├── cli.py                      # MAIN ENTRY POINT — Click CLI orchestrating full pipeline
│   ├── config.py                   # Central env loading and defaults
│   ├── crew_agents.py              # DEAD CODE — broken CrewAI multi-agent setup
│   ├── requirements.txt            # Python deps (includes UNUSED elevenlabs, crewai, langchain)
│   ├── simple_agents.py            # GPT-4o agents: research, outline, script, validation
│   ├── storytelling_rules.md       # Injected into LLM prompts for script style
│   ├── style_guide.md              # Editorial reference — NOT loaded by any code
│   ├── temp_context.txt            # Scratch notes — NOT loaded by any code
│   ├── transcript_examples.txt     # Example transcripts — NOT loaded by any code
│   ├── test_drive_integration.py   # Smoke test for Drive (stale ElevenLabs references)
│   ├── test_google_tts.py          # Smoke test for TTS
│   └── utils/
│       ├── __init__.py             # Package marker
│       ├── google_drive.py         # OAuth Drive upload (scripts + audio only, no outline)
│       ├── google_tts.py           # GCP TTS Long Audio API (Chirp3 HD Puck, hardcoded)
│       └── project_manager.py      # Local projects/ tree + metadata.csv CRUD
│
└── econblog/                       # Next.js 15 learning platform (SEPARATE product)
    └── ...                         # Not part of YouTube automation — excluded from audit
```

---

## 2. Pipeline Step Status

| # | Step | Status | File Paths | Notes |
|---|------|--------|------------|-------|
| 1 | Topic Selection | **Partial** | `cli.py` (`create`) | Manual — user provides topic + context via CLI args |
| 2 | Research | **Yes** | `simple_agents.py` (`ResearchAgent`) | GPT-4o; saves to `./research/` (NOT under project dir) |
| 3 | Script Generation | **Yes** | `simple_agents.py` (`SimpleContentAgent`), `cli.py` | Section-by-section GPT-4o; outline then script; `storytelling_rules.md` injected |
| 4 | Audio Generation | **Yes** | `cli.py` (`generate_audio`), `utils/google_tts.py` | Google Cloud TTS Chirp3 HD Puck; Gemini chunks; files named `t=<topic>_chunk_NNN.mp3` |
| 5 | Image Sourcing | **No** | — | No code exists. Currently manual by editor. |
| 6 | Image QA | **No** | — | No code exists. |
| 7 | Video Assembly | **No** | — | No code exists. Done manually in Canva. |
| 8 | Thumbnail Generation | **No** | — | No code exists. |
| 9 | Upload to Drive | **Yes** | `cli.py` (`upload_to_drive`), `utils/google_drive.py` | OAuth; uploads scripts + audio; does NOT upload outline |
| 10 | Upload to YouTube | **No** | — | No YouTube Data API integration anywhere |

---

## 3. Integration Details

### Script Generation

- **Model:** OpenAI GPT-4o via `openai` Python package
- **Prompt:** Research agent runs first, then outline is generated with validation/retry logic, then script is generated section-by-section. `storytelling_rules.md` is injected into prompts.
- **Section structure:** YES — sections are generated individually via `create_script_section_by_section`
- **Image search terms per section:** NO
- **On-screen text overlay specs:** NO
- **Keyword highlighting instructions:** NO
- **SaaS product plug:** Unclear from code — would need to inspect `storytelling_rules.md` prompt content
- **Issue:** Section headers are prepended with `**Section N: Title**` markdown, contradicting "no markdown" instructions and causing problems for downstream Gemini cleanup
- **Dead path:** `style_guide.md` exists but is NOT loaded by any code. `create_script()` (full-script path) exists but is NOT called by the CLI.

### Audio Generation

- **TTS service:** Google Cloud TTS — Chirp3 HD voice `en-US-Chirp3-HD-Puck`
- **Chunking:** Gemini 1.5 Flash splits script using `CHUNK_BREAK` markers; targets ~150-250 words / ~90s per chunk
- **<1 minute constraint:** Targeted at ~90s per chunk, but not strictly enforced
- **File naming:** `t=<topic_snippet>_chunk_NNN.mp3` — **confirms poorly named**, not by section
- **Output location:** Local `projects/<id>/audio/`, then uploaded to Drive
- **Post-processing:** NONE — no silence trimming, normalization, or audio processing
- **Issue:** Long Audio API uses `LINEAR16` encoding but files saved as `.mp3` — decoder-dependent, may cause silent corruption
- **Issue:** `voice_style` parameter is accepted but **ignored** — always returns Puck regardless of input

### Image Pipeline

- **No automated image fetching code exists anywhere in the codebase**
- **No Google Custom Search API, SerpAPI, or any search API integration**
- **Images are currently sourced manually by the editor**

### Video Assembly

- **No programmatic video generation code exists**
- **No Remotion, MoviePy, FFmpeg, Canva API, or Creatomate usage**
- **Current process:** Editor assembles manually in Canva

### Upload & Distribution

- **Google Drive:** OAuth installed-app flow (`token.pickle`); uploads scripts + MP3 audio to hierarchical folders; does NOT upload outline.txt
- **YouTube:** No YouTube Data API integration
- **Metadata generation:** None — no auto-generated titles, descriptions, or tags

### Tracking & Workflow

- **Local tracking only:** `projects/metadata.csv` tracks project status + timestamps
- **Status flow:** `created` → `outlined` → `scripted` → `audio_generated` → `drive_synced`
- **No remote dashboard, notification system, or task queue**
- **Owner checks status by running `cli.py list` or `cli.py status`**
- **`segments_count` / `total_duration` fields exist in metadata but are NOT populated**

---

## 4. Architecture Summary

1. **Languages/frameworks:** YouTube pipeline is **100% Python** (Click CLI, OpenAI, Google Cloud SDKs). The `econblog/` is Node.js/TypeScript/React but is a completely separate product with no runtime integration to the YouTube pipeline.

2. **Entry point:** `adams-agents/cli.py` — Click CLI. It is a **collection of discrete commands**, not a single orchestrator. Each step (outline, script, audio, upload) is triggered manually with a separate CLI command.

3. **Deployment:** Runs **locally only**. No server, no cloud functions, no cron, no CI/CD. Everything is manual CLI invocation from the developer's machine.

4. **Configured API keys:**
   - `OPENAI_API_KEY` — GPT-4o for script/outline/research/validation
   - `GOOGLE_GEMINI_API_KEY` — Gemini 1.5 Flash for cleanup/chunking
   - `GOOGLE_CLOUD_PROJECT_ID` + `GOOGLE_SERVICE_ACCOUNT_KEY` — Cloud TTS + GCS
   - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Drive OAuth
   - `GOOGLE_DRIVE_ROOT_FOLDER` / `_SCRIPTS_FOLDER` / `_AUDIO_FOLDER` — Drive folder config
   - `GOOGLE_TTS_SPEAKING_RATE` / `_PITCH` / `_VOLUME_GAIN` / `_SAMPLE_RATE` — TTS tuning
   - Stale: `ELEVENLABS_*`, `VOICE_SETTINGS` — still loaded in config but unused
   - Root `.env` also has: `OPENROUTER_API_KEY`, `SERPER_API_KEY` (econblog only)

5. **Database:** **None.** Everything is file-based — `projects/` directory tree + `metadata.csv`.

6. **Code quality:** **Between hacky scripts and structured code.** The CLI is reasonably organized with proper Click commands and the agent code has retry/validation logic. However: dead code paths (`crew_agents.py`, ElevenLabs), stale docs that contradict reality, format bugs (markdown in sections, LINEAR16/.mp3 mismatch), unused dependencies, and no error recovery for partial audio generation.

---

## 5. Gap Analysis

### #1 Bottleneck

**Video Assembly** is the single biggest bottleneck. Everything before it (topic → research → script → audio → Drive) is automated via CLI. Everything after it (YouTube upload) can't happen until video exists. The editor manually assembles in Canva, which is the primary time sink and the reason videos cannot be produced autonomously.

### Missing Pieces (Priority Order)

1. **Video Assembly** — programmatic frame composition (white bg, title top, image left, text right, transitions)
2. **Image Sourcing** — automated image fetching per script section via search API
3. **Image QA** — vision model validation that images match intent, aren't AI-generated, are adequate quality
4. **Script Output Restructuring** — needs to include per-section: image search terms, on-screen text, keyword highlights
5. **YouTube Upload** — YouTube Data API integration with auto-generated metadata
6. **Thumbnail Generation** — template-based thumbnail creation
7. **Audio File Naming** — section-based naming instead of generic chunk numbering
8. **End-to-End Orchestrator** — single command that runs all steps in sequence without manual intervention

### Existing Code Needing Restructuring

1. **Script output format** — must be extended to include per-section: image search terms, on-screen text overlays, keyword highlights, timing cues
2. **Audio file naming** — needs `01_hook_intro.mp3` style instead of `t=topic_chunk_001.mp3`
3. **Gemini chunking prompt** — needs to preserve section boundaries so audio maps to sections
4. **`create_script_section_by_section`** — adds markdown headers (`**Section N: Title**`) that downstream cleanup must strip; fragile coupling
5. **Research output location** — saves to `./research/` instead of `projects/<id>/research/`
6. **Dead code removal** — `crew_agents.py`, ElevenLabs deps, stale docs

---

## 6. Decision-Relevant Findings

### Decision 1: Remotion vs. Alternatives for Video Assembly

- **Existing stack is 100% Python.** No Node.js in the YouTube pipeline. The econblog is Node.js/React but is a completely separate product with no shared runtime.
- **No existing video generation attempts** that suggest a direction.
- **Remotion compatibility:** Would require adding Node.js/React to the pipeline, introducing a language/runtime boundary. Powerful but adds complexity.
- **Given the video format** (white background, image left, text right, simple fade/slide transitions, 3-5s per frame, 180-300 frames): **MoviePy + Pillow** would be the path of least resistance. It's Python-native, the entire existing pipeline is Python, and the visual format is simple enough to not need React's component model.
- **FFmpeg directly** would also work but requires more manual frame/transition math.
- **Canva API / Creatomate** would work but add external service dependencies and recurring costs.
- **Bottom line:** The video format is simple enough that MoviePy can handle it without Remotion's overhead. If the format evolves toward more complex animations, Remotion becomes more attractive later.

### Decision 2: Image Sourcing API

- **No search API is currently set up** in the YouTube pipeline.
- **However:** The root `.env` already has `SERPER_API_KEY` configured for the econblog. Serper (`serper.dev`) is a Google Search API wrapper that supports image search.
- **Google Custom Search API** is another option — already in the Google ecosystem with service account configured — but requires more console setup (custom search engine ID, etc.).
- **Path of least resistance:** Use the existing Serper key. Add a `search_images(query)` function that hits the Serper image endpoint. Already proven in the econblog codebase.

### Decision 3: Vision Model for Image QA

- **Existing AI APIs:** OpenAI GPT-4o (already configured, primary model) and Google Gemini 1.5 Flash (already configured, used for cleanup).
- **Both support multimodal/vision input.**
- **GPT-4o** is already the "brain" of the pipeline — adding image QA prompts would be trivial and keeps everything in one provider.
- **Gemini** could be a cheaper alternative for bulk image screening.
- **No existing image analysis code to extend.**
- **Recommendation-relevant finding:** Either works. GPT-4o for consistency, Gemini for cost. Could even use Gemini as first-pass filter and GPT-4o for borderline cases.

### Decision 4: Editor Retention vs. Full Automation

- **Option A (structured handoff):** Requires restructuring script output (add image search terms + text overlays), renaming audio files by section, creating a manifest/package the editor follows. **~1-2 days of work** from current state.
- **Option B (full automation):** Requires image sourcing API, image QA model, video assembly tool, thumbnail generation, YouTube upload API. **~2-4 weeks of engineering** with multiple unsolved problems (video quality, image reliability, YouTube API quotas).
- **Finding:** Option A is achievable immediately and reduces editor work from creative decisions to mechanical assembly. Option B is the long-term goal but has a real engineering runway. They are not mutually exclusive: Option A can be shipped now while Option B is built incrementally.

### Decision 5: Audio File Management

- **Current naming:** `t=<topic_snippet>_chunk_NNN.mp3` — purely sequential, no section mapping
- **Where to add naming:** In `cli.py`'s `generate_audio` function, after Gemini chunks the script. Update the Gemini prompt to output section labels alongside chunks.
- **Script-to-audio mapping:** Currently **NOT traceable**. Chunking is done by Gemini on the cleaned script, and original section boundaries are lost.
- **Manifest approach:** YES — the script generator could output a JSON manifest mapping `section_id → section_title → text_content → audio_filename`. This needs changes in both `simple_agents.py` (output format) and `cli.py` (audio naming).
- **Easiest fix:** Update the Gemini chunking prompt to preserve section boundaries and output structured data, then use that to name audio files like `01_hook_intro.mp3`.

---

## 7. Red Flags & Quick Wins

### Red Flags

- **LINEAR16/.mp3 mismatch** — Long Audio API outputs LINEAR16 (raw PCM) but files are saved with `.mp3` extension. May cause playback issues or silent corruption.
- **Dead dependencies in production** — `elevenlabs`, `crewai`, `langchain_*` in `requirements.txt` but unused. Security/maintenance risk.
- **`crew_agents.py` is silently broken** — `Crew` constructed with `tasks=[]`; would fail if ever called. Trap for anyone exploring the codebase.
- **Stale docs mislead contributors** — `.env.example` missing key vars, `MIGRATION_TO_GOOGLE_TTS.md` references CLI flags that don't exist, `test_drive_integration.py` references ElevenLabs.
- **Research saves to wrong directory** — `ResearchAgent` saves to `./research/` (cwd) not `projects/<id>/research/`. Artifacts disconnect from their project.
- **`voice_style` silently ignored** — `get_voice_config()` always returns Puck regardless of input. User thinks they're choosing a voice but aren't.
- **No audio generation resume** — If audio generation fails midway through chunks, there's no resume. Must regenerate all audio from scratch.
- **Section markdown bleeds into audio** — `create_script_section_by_section` adds `**Section N: Title**` markers that downstream Gemini cleanup must strip. Fragile coupling that can break TTS output.

### Quick Wins (<1 hour each)

1. **Delete `crew_agents.py`** and remove `crewai`/`langchain_*`/`elevenlabs` from `requirements.txt` — immediate declutter.
2. **Update `.env.example`** to match actual `config.py` expectations — prevents onboarding confusion.
3. **Fix audio file extension** — change Long Audio output to `.wav` (matches LINEAR16) or add an MP3 encoding step.
4. **Section-label audio filenames** — update the chunk loop in `cli.py` to name files by section title + index instead of generic `chunk_NNN`.
5. **Move research output** into `projects/<id>/research/` so artifacts stay with their project.
6. **Remove stale docs** — strip ElevenLabs references from test files and migration doc.
7. **Upload outline.txt to Drive** — one-line addition in `google_drive.py` to include the outline in the upload set.
