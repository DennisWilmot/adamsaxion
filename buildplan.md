# Adam's Axiom — Automated Video Pipeline

# System Requirements Specification v1.0

**Date:** May 16, 2026 **Owner:** Dennis (joohoo) **Channel:** @adamsaxiom — Economics education YouTube **Business Goal:** Fully automated video production pipeline that drives traffic to an economics SaaS product. Zero manual intervention except topic approval and final video review before upload.

---

## 1. SYSTEM OVERVIEW

### 1.1 What This System Does

Takes an approved topic from a queue and produces a fully finished YouTube video — rendered, thumbnailed, titled, described, tagged — ready for the owner to review and upload. The owner's only recurring jobs are: approving suggested topics, reviewing finished videos, and uploading to YouTube.

### 1.2 Target Output

- **Volume:** 3 videos/week (Mon/Wed/Fri cadence), 12-13/month
- **Length:** 10-25 minute economics explainer videos
- **Visual style:** White background. Section title at top. Images on the left (slide-in). Narration text on the right with keywords highlighted in red. Small circular section icon top-left. Fade/slide transitions between frames. 3-5 seconds per frame.
- **Images:** 3-5 real images per section sourced from Google Images. NO AI-generated images. One image per section also serves as the circular icon (top-left of frame + thumbnail grid).
- **Audio:** Google Chirp3 HD Puck voice. Generated in <1 minute chunks.
- **SaaS Ad:** Pre-recorded video clip (owner provides 3-5 clips) inserted at ~2 min mark. If no clips exist, skip entirely.
- **Thumbnails:** Auto-generated grid of circular section icons with text labels, matching current channel brand style.
- **AI Disclosure:** Auto-include AI disclosure text in every video description.

### 1.3 Cost Targets


| Item                           | Current                    | Target                        |
| ------------------------------ | -------------------------- | ----------------------------- |
| Editor cost                    | $20-25/video ($240-300/mo) | $0                            |
| API costs (AI, TTS, search)    | ~$5-10/video               | $10-20/video (higher quality) |
| Owner time per video           | 15-30 min                  | <2 min (review + upload)      |
| Total monthly cost (12 videos) | ~$360-420                  | ~$120-240 (API only)          |


### 1.4 Tech Stack


| Component                        | Technology                         |
| -------------------------------- | ---------------------------------- |
| Language                         | Python (entire pipeline)           |
| Script Generation                | OpenAI GPT-5                       |
| Research / Validation / Image QA | OpenAI GPT-4o                      |
| Script Cleanup / Audio Chunking  | Google Gemini 1.5 Flash            |
| Text-to-Speech                   | Google Cloud TTS — Chirp3 HD Puck  |
| Image Search                     | Serper API (image endpoint)        |
| Video Assembly                   | MoviePy + Pillow                   |
| Thumbnail Generation             | Pillow                             |
| Database (production)            | Supabase (Postgres + Blob Storage) |
| Storage (initial testing)        | Local filesystem                   |
| Deployment (production)          | Railway                            |
| File Storage (intermediate)      | Google Drive                       |
| Distribution                     | YouTube (manual upload by owner)   |


### 1.5 Core Design Principle

**GRACEFUL DEGRADATION: Always produce a video. Never crash. Flag problems but don't block.**

- Missing SaaS ad clips → skip ad insertion entirely
- Image search returns only 1 usable image instead of 3-5 → use whatever passed QA
- Chirp3 fails for a section → retry 3x, then skip that section's audio and flag for review
- Any non-critical step fails → log it, degrade, continue to next step
- Critical step fails (script generation, no audio at all) → mark project as failed, move to next topic in queue, notify owner

---

## 2. PIPELINE ARCHITECTURE

### 2.1 End-to-End Flow

```
TOPIC SUGGESTION → OWNER APPROVAL → RESEARCH → SCRIPT → AUDIO → IMAGES → IMAGE QA → VIDEO ASSEMBLY → THUMBNAIL → UPLOAD TO DRIVE → NOTIFY OWNER
                                                                                                                         ↑
                                                                                                          SaaS Ad Clip (inserted at ~2 min if available)

```

### 2.2 Orchestration

**Single command:** `cli.py produce`

- Picks the next approved topic from the queue
- Runs every step in sequence
- Logs status after each step
- On failure: retries per step's retry policy, then degrades or fails gracefully
- On completion: uploads to Google Drive, updates status to "ready_for_review"

**Supporting commands:**

- `cli.py produce --batch N` — process N topics sequentially
- `cli.py produce --step <step_name> --project <id>` — re-run a single step for debugging
- `cli.py suggest` — generate topic suggestions based on YouTube analytics
- `cli.py queue list` — show topic queue and statuses
- `cli.py queue approve <id>` — approve a suggested topic
- `cli.py queue add "topic" --context "optional angle"` — manually add a topic
- `cli.py status` — show all projects and their pipeline stage

### 2.3 Status Flow

```
suggested → approved → researching → scripting → generating_audio → fetching_images → assembling_video → generating_thumbnail → uploading_to_drive → ready_for_review → uploaded_to_youtube
                                        ↓ (any step)
                                      failed (with failed_step logged)

```

---

## 3. MODULE SPECIFICATIONS

---

### 3.0 Topic Suggestion & Queue

**Purpose:** Maintain a prioritized backlog of video topics. AI suggests topics based on channel analytics and niche trends. Owner approves or rejects.

**Topic Suggestion Engine:**

- Pulls video performance data via YouTube Data API (view counts, watch time, CTR)
- Identifies outliers (videos performing >2x channel average)
- For outliers: generates 5-8 Phase 2 variation topics (same core subject, different emotional angles)
- For general pipeline: generates Phase 1 cast topics using the channel's niche and proven title structures
- Suggestions are presented to owner for approval

**Topic Selection Rules (baked into the suggestion prompt):**

Phase 1 (casting — no active outlier):

- Can it be framed as a comprehensive explainer? ("Every X", "All of Y", "The Complete Z", "X Explained in Y Minutes")
- Does it have a dramatic historical narrative built in?
- Is there a surprising or counterintuitive angle?
- Would someone share it to look smart?
- Must hit 3 of 4 to be suggested

Phase 2 (mining — active outlier detected):

- Must be a variation of the identified outlier topic
- Different emotional angle on same core subject
- Examples for an "Economic Theories" outlier: "Economic Theories That Failed", "Economic Theories Governments Don't Want You to Know", "The Economic Theory That Predicted 2008", "Economic Theories That Changed History"

**Queue Schema (Supabase table:** `topic_queue`**, local JSON for testing):**

```json
{
  "id": "uuid",
  "topic": "The Hidden Economics Behind Every Major War",
  "context": "Optional additional context or angle the owner provided",
  "priority": "high | normal | low",
  "category": "phase1_cast | phase2_variation",
  "parent_topic_id": "null or UUID of the outlier this is a variation of",
  "status": "suggested | approved | in_progress | completed | failed | rejected",
  "suggested_at": "ISO timestamp",
  "approved_at": "null or ISO timestamp",
  "completed_at": "null or ISO timestamp"
}

```

---

### 3.1 Research Module

**Purpose:** Gather factual data, sources, statistics, key figures, and narrative context for a topic.

**Model:** GPT-4o (cost-effective for research synthesis) **Web Search:** Serper API for grounding research in current sources

**Current State:** Exists (`simple_agents.py` → `ResearchAgent`). Works but outputs unstructured text and saves to wrong directory.

**Required Changes:**

- Fix output directory: save to `projects/<id>/research/` not `./research/`
- Use Serper API for web search grounding (already have key in root .env)
- Output structured JSON (schema below)
- Include source URLs for every major claim

**Output Schema → saved as** `projects/<id>/research/research.json`**:**

```json
{
  "topic": "Quantitative Easing Explained",
  "key_facts": [
    {
      "claim": "The Fed's balance sheet grew from $900B to $4.5T between 2008-2014",
      "source_url": "https://...",
      "confidence": "high | medium"
    }
  ],
  "key_figures": [
    {
      "name": "Ben Bernanke",
      "role": "Federal Reserve Chairman 2006-2014",
      "relevance": "Architect of QE1, QE2, QE3"
    }
  ],
  "key_events": [
    {
      "event": "Lehman Brothers Collapse",
      "date": "September 15, 2008",
      "relevance": "Triggered the crisis that led to QE"
    }
  ],
  "narrative_angles": [
    "The addiction metaphor — QE as a drug the economy can't quit",
    "The tightrope between stability and asset bubbles"
  ],
  "raw_research": "Full research text for injection into script generation prompt"
}

```

**Error Handling:** If Serper fails, fall back to GPT-4o's training data only. Log that research is ungrounded. Continue pipeline.

---

### 3.2 Script Generation Module

**Purpose:** Generate a section-by-section video script with ALL metadata needed for fully automated video assembly — images, text overlays, keyword highlights, layout hints, and thumbnail data.

**Model:** GPT-5 (highest quality for the creative/writing step) **Prompt Injection:** `storytelling_rules.md` (already exists, needs updates — see below)

**Current State:** Exists (`simple_agents.py`). Generates outline then script section-by-section via GPT-4o. Missing: image search terms, on-screen text specs, keyword highlights, layout hints, thumbnail spec.

**Required Changes:**

- Upgrade model from GPT-4o to GPT-5 for script generation
- Extend output to full structured JSON (schema below)
- Remove markdown header injection (`**Section N: Title`**) — causes downstream issues
- Load and inject `style_guide.md` into prompts (exists but currently unused)
- Add image search term rules to `storytelling_rules.md`
- Add per-section layout hints
- Add thumbnail specification in output
- Output must be valid JSON, not raw text

**Updates to** `storytelling_rules.md` **— add these rules:**

```markdown
## Image Search Term Rules

For every section, provide 3-5 Google Image search terms. These will be used
to automatically fetch real photographs. Follow these rules strictly:

- PEOPLE: Full name + title/role — "Alan Greenspan Federal Reserve Chairman portrait"
- CONCEPTS: Search for the real-world artifact — "US Federal Reserve balance sheet chart 2008-2014"
- EVENTS: Search for the iconic photograph — "Lehman Brothers employees carrying boxes September 2008"
- INSTITUTIONS: Search for the building or logo — "Federal Reserve Building Washington DC exterior"
- DATA/STATS: Search for the actual chart — "US inflation rate graph 1970-1980 CPI"
- NEVER search abstract concepts directly — "inflation" returns garbage
- ALWAYS add specificity: dates, locations, proper nouns
- Prefer editorial/news photography over stock photos
- Include "high resolution" or "photograph" for portrait/event searches
- Each search term must have a fallback_query (simpler/broader version)

## Section Icon Rule

The first image search result for each section will also be used as the circular
section icon (top-left of frame). Make sure the first search term per section
returns an image that works well cropped into a small circle (portraits, logos,
and iconic objects work best; wide landscape shots do not).

```

**Output Schema → saved as** `projects/<id>/script/script.json`**:**

```json
{
  "video_id": "project UUID",
  "title": "Every Major Central Bank Tool Explained in 20 Minutes",
  "description": "From interest rates to quantitative easing, here's how central banks actually control the economy. A complete breakdown of every tool in the modern central banker's toolkit.",
  "tags": ["economics", "central banks", "federal reserve", "quantitative easing", "interest rates", "monetary policy"],
  "ai_disclosure": "This video uses AI-generated narration and automated image sourcing.",
  "thumbnail": {
    "headline": "CENTRAL BANK TOOLS",
    "sub_text": "Every Tool Explained",
    "grid_images_from_sections": [0, 2, 4, 6, 8, 10],
    "note": "Use circular icon images from these section numbers for the thumbnail grid"
  },
  "saas_ad": {
    "insert_at_seconds": 120,
    "enabled": true,
    "note": "System checks for available ad clips. If none found, skip entirely."
  },
  "sections": [
    {
      "section_number": 0,
      "section_type": "hook",
      "section_title": "The Money Spigot",
      "narration": "What if I told you that a single room of unelected officials controls the fate of the entire global economy... and most people have no idea how they do it.",
      "word_count": 32,
      "estimated_duration_seconds": 13,
      "image_searches": [
        {
          "query": "Federal Reserve Board of Governors meeting room photograph",
          "purpose": "Establishing shot — the room where decisions are made",
          "fallback_query": "Federal Reserve building interior"
        },
        {
          "query": "Federal Reserve seal official logo",
          "purpose": "Institutional branding",
          "fallback_query": "US Federal Reserve logo"
        },
        {
          "query": "global stock market trading floor screens 2008",
          "purpose": "Scale of impact — markets reacting",
          "fallback_query": "stock market trading floor photograph"
        }
      ],
      "onscreen_text": "How Central Banks Control Everything",
      "keywords_to_highlight": ["single room", "unelected officials", "entire global economy", "no idea"],
      "layout": "standard",
      "visual_direction": "Open with the Fed meeting room, transition to the seal, then show markets"
    }
  ],
  "total_word_count": 2400,
  "estimated_total_duration_seconds": 960,
  "section_count": 12
}

```

**Layout Types:**

- `standard` — 1-2 images left, text right (default, most frames)
- `collage-3` — 3 images tiled left side
- `collage-4` — 4 images in grid on left side
- `single-focus` — one large image taking more horizontal space, less text
- `data-chart` — image is a chart/graph, shown larger with minimal text overlay
- `text-only` — no image, just large on-screen text (for dramatic moments / section transitions)

**Error Handling:** If GPT-5 fails, retry 2x. If still failing, fall back to GPT-4o and log the downgrade. Never block on model unavailability.

---

### 3.3 Audio Generation Module

**Purpose:** Convert script sections to speech via Chirp3 HD Puck, with properly named files that map exactly to script sections via a JSON manifest.

**TTS:** Google Cloud TTS — Chirp3 HD voice `en-US-Chirp3-HD-Puck` **Chunking:** Gemini 1.5 Flash (preserving section boundaries)

**Current State:** Exists (`utils/google_tts.py`, `cli.py`). Works but: files named `t=<topic>_chunk_NNN.mp3`, section boundaries lost during Gemini chunking, LINEAR16/.mp3 format mismatch, no resume on failure.

**Required Changes:**

- [ ] **CRITICAL FIX:** Resolve LINEAR16/.mp3 mismatch — either encode to actual MP3 or save as .wav
- [ ] Update Gemini chunking prompt to preserve section boundaries
- [ ] Name audio files by section: `00_hook_the_money_spigot.mp3`, `01_context_why_central_banks_exist.mp3`, etc.
- [ ] If a section's narration exceeds 1 minute, split into sub-chunks within that section: `03a_explanation_quantitative_easing.mp3`, `03b_explanation_quantitative_easing.mp3`
- [ ] Generate a JSON manifest mapping audio files to script sections
- [ ] Add resume capability — if generation fails at chunk N, restart from chunk N not chunk 0
- [ ] Fix: `voice_style` parameter is accepted but silently ignored — remove the parameter or wire it up (since we're Puck-only, just remove it)

**Audio Manifest Schema → saved as** `projects/<id>/audio/manifest.json`**:**

```json
{
  "video_id": "project UUID",
  "voice": "en-US-Chirp3-HD-Puck",
  "total_chunks": 15,
  "total_duration_seconds": 960,
  "sections": [
    {
      "section_number": 0,
      "section_title": "The Money Spigot",
      "audio_files": [
        {
          "filename": "00_hook_the_money_spigot.mp3",
          "duration_seconds": 13,
          "word_count": 32
        }
      ]
    },
    {
      "section_number": 3,
      "section_title": "Quantitative Easing Deep Dive",
      "audio_files": [
        {
          "filename": "03a_explanation_quantitative_easing.mp3",
          "duration_seconds": 55,
          "word_count": 138
        },
        {
          "filename": "03b_explanation_quantitative_easing.mp3",
          "duration_seconds": 48,
          "word_count": 120
        }
      ]
    }
  ],
  "failed_sections": []
}

```

**Error Handling:**

- Chirp3 fails for a section → retry 3x with exponential backoff
- Still failing after 3 retries → skip that section, add to `failed_sections` array, log warning, continue
- Resume: track last successful chunk in manifest, restart from there on re-run
- If >30% of sections fail audio generation → mark project as failed, don't proceed to video assembly

---

### 3.4 Image Sourcing Module

**Purpose:** For each script section, fetch 3-5 real images from Google Images using the search terms specified in the script. Download, resize, and organize by section.

**Search API:** Serper API — image search endpoint (key already exists in root .env)

**New Module:** `utils/image_search.py`

**Process per section:**

1. Read `image_searches` array from script.json
2. For each search term, call Serper image endpoint, request top 8 results
3. Filter results: minimum resolution 800x600, exclude known AI image domains, exclude results with watermark indicators
4. Download top 5 candidates per search term to `projects/<id>/images/section_NN/candidates/`
5. Pass candidates to Image QA module (3.5)
6. Accepted images saved to `projects/<id>/images/section_NN/approved/`
7. If primary query returns <3 usable results, automatically try `fallback_query`
8. First approved image per section is designated as the section icon

**Image Organization:**

```
projects/<id>/images/
├── section_00/
│   ├── candidates/          # Raw downloads before QA
│   │   ├── search1_001.jpg
│   │   ├── search1_002.jpg
│   │   └── ...
│   ├── approved/            # Passed QA
│   │   ├── img_001.jpg      # Main images for the frame
│   │   ├── img_002.jpg
│   │   └── img_003.jpg
│   └── icon.jpg             # First approved image, cropped to square for circular mask
├── section_01/
│   └── ...
└── thumbnail/
    ├── icon_section_00.jpg  # Circular crops for thumbnail grid
    ├── icon_section_02.jpg
    └── ...

```

**Error Handling:**

- Serper API fails → retry 2x, then log and continue with whatever images were fetched
- Search returns 0 results → try fallback_query, if still 0 → flag section, use text-only layout
- Download fails for individual image → skip it, move to next candidate
- Minimum viable: 1 approved image per section. Below that → degrade to text-only layout for that section

---

### 3.5 Image QA Module

**Purpose:** Validate that fetched images are relevant, real (not AI-generated), and adequate quality. Reject bad images before they enter the video.

**Model:** GPT-4o vision

**New Module:** `utils/image_qa.py`

**Process per image:**

1. Send image to GPT-4o with the search query and section context
2. Ask three questions:
  - **Relevance:** "Does this image match the search intent: '{query}'? Is it related to {section_title}?" (yes/no + confidence)
  - **AI Detection:** "Does this image appear to be AI-generated, digitally illustrated, or a stock graphic rather than a real photograph?" (yes/no + confidence)
  - **Quality:** "Is this image high enough resolution, free of prominent watermarks, and suitable for use in an educational video?" (yes/no)
3. Image passes if: relevant=yes AND ai_generated=no AND quality=yes
4. Images that pass move to `approved/` folder
5. Images that fail are logged with rejection reason

**Prompt for Image QA:**

```
You are a quality control reviewer for a YouTube economics education channel.

Evaluate this image for use in a video section about: "{section_title}"
The image was found by searching: "{search_query}"

Answer these three questions with YES or NO and a confidence level (high/medium/low):

1. RELEVANCE: Does this image accurately represent the search intent? Would a viewer understand why this image appears in a section about {section_title}?
2. AI DETECTION: Does this image appear to be AI-generated, digitally illustrated, computer-rendered, or a generic stock graphic? Look for: unnatural lighting, impossible anatomy, text artifacts, overly smooth textures, generic corporate style.
3. QUALITY: Is this image adequate resolution (not pixelated), free of prominent watermarks, and visually appropriate for an educational YouTube video?

Respond as JSON:
{
  "relevant": {"answer": "yes|no", "confidence": "high|medium|low", "reason": "brief explanation"},
  "ai_generated": {"answer": "yes|no", "confidence": "high|medium|low", "reason": "brief explanation"},
  "quality": {"answer": "yes|no", "reason": "brief explanation"},
  "overall_pass": true|false
}

```

**Cost Control:** At 3-5 images × 3-5 search terms × ~12 sections = potentially 180+ image QA calls per video. To manage costs:

- First-pass filter: skip QA for images below minimum resolution (check dimensions before sending to GPT-4o)
- Batch: send 3-4 images in a single GPT-4o call where possible
- Stop early: once 3 images pass QA for a section, stop reviewing remaining candidates

**Error Handling:**

- GPT-4o vision fails → retry 2x, then assume image passes (prefer false positive over blocking)
- All images for a section fail QA → try fallback queries, then degrade to text-only layout

---

### 3.6 Video Assembly Module

**Purpose:** Programmatically compose the full video from script data, approved images, and audio files. No human editor.

**Technology:** MoviePy + Pillow

**New Module:** `utils/video_assembler.py`

**Frame Layout (standard):**

```
┌──────────────────────────────────────────────────────────┐
│ (●) Icon    SECTION TITLE — Subtitle                     │  <- Top bar
│                                                          │
│  ┌──────────────┐    Narration text appears here         │
│  │              │    with **keywords** highlighted        │
│  │   IMAGE      │    in red. Text fades in line           │
│  │              │    by line synced to audio.             │
│  │              │                                        │
│  └──────────────┘                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘

```

- **Resolution:** 1920x1080 (standard YouTube HD)
- **Background:** White (#FFFFFF)
- **Section title:** Bold, black, top of frame. Font: clean sans-serif (e.g., Montserrat Bold)
- **Section icon:** Top-left corner, circular crop, ~80px diameter
- **Image area:** Left ~40% of frame. Images slide in from left over 0.3s.
- **Text area:** Right ~55% of frame. Narration text with keywords in red (#CC0000), rest in black.
- **Font for narration text:** Clean serif or sans-serif, ~28-32px. Handwriting-style for emphasis words (matching current channel style — see QE screenshot).
- **Transitions between frames:** Fade (0.3s default)
- **Frame duration:** Audio duration for that chunk (3-5 seconds minimum)

**Layout Variants:**


| Layout         | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `standard`     | 1-2 images left, text right. Default.                                                             |
| `collage-3`    | 3 images tiled on left side in a grid                                                             |
| `collage-4`    | 4 images in 2x2 grid on left side                                                                 |
| `single-focus` | One large image ~60% width, minimal text overlay                                                  |
| `data-chart`   | Chart/graph shown large ~70% width, small caption                                                 |
| `text-only`    | No image. Large centered text for dramatic moments. Also used as fallback when no images pass QA. |


**SaaS Ad Clip Insertion:**

- Check if ad clips exist in `assets/ad_clips/` directory
- If clips exist: randomly select one, insert at the timestamp specified in script.json (`saas_ad.insert_at_seconds`)
- If no clips exist: skip entirely, log "no ad clips available"
- Ad clip is inserted as a pre-rendered video segment — no processing needed, just splice into timeline

**Assembly Process:**

1. Load `script.json` and `audio/manifest.json`
2. For each section: a. Load approved images from `images/section_NN/approved/` b. Load section icon from `images/section_NN/icon.jpg` c. Load audio files from manifest d. Compose frame(s) using the specified layout e. Apply text with keyword highlighting (Pillow renders text → MoviePy composites) f. Set frame duration to match audio duration g. Apply slide-in animation for images, fade-in for text
3. Concatenate all section clips with fade transitions
4. Insert SaaS ad clip at specified timestamp (if available)
5. Add audio track (concatenated section audio)
6. Render to MP4 (H.264 video, AAC audio)
7. Save to `projects/<id>/output/video.mp4`

**Error Handling:**

- Missing images for a section → degrade to text-only layout for that section
- Missing audio for a section (flagged in manifest) → skip that section entirely in the video
- MoviePy rendering fails → retry once, then mark project as failed
- Output sanity check: if rendered video is <2 minutes or >30 minutes, flag as suspicious

---

### 3.7 Thumbnail Generation Module

**Purpose:** Auto-generate a thumbnail matching the Adam's Axiom grid style — circular section icons with text labels arranged in a grid, with bold headline text.

**Technology:** Pillow

**New Module:** `utils/thumbnail_generator.py`

**Thumbnail Layout:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   (●)Label   (●)Label   (●)Label   (●)Label             │
│                                                          │
│          BOLD HEADLINE TEXT                               │
│          (from thumbnail.headline in script.json)        │
│                                                          │
│   (●)Label   (●)Label   (●)Label   (●)Label             │
│                                                          │
└──────────────────────────────────────────────────────────┘

```

- **Resolution:** 1280x720 (YouTube thumbnail standard)
- **Background:** White or very light gray
- **Grid:** 2 rows of 3-4 circular icons each (6-8 icons total)
- **Icons:** Cropped from section icon images, circular mask, ~120px diameter
- **Labels:** Bold text below each icon (section title or key term), black
- **Headline:** Large bold text, centered, matching channel font style
- **Sub-headline:** Smaller text below headline (from `thumbnail.sub_text`)

**Process:**

1. Read `thumbnail` spec from `script.json`
2. Load icon images from specified sections (`grid_images_from_sections` array)
3. Crop each to circle
4. Arrange in grid layout
5. Render headline and sub-headline text
6. Save to `projects/<id>/output/thumbnail.jpg`

**Error Handling:**

- If fewer than 6 icon images available → use whatever exists, adjust grid layout
- If no icon images → generate text-only thumbnail with bold headline on colored background

---

### 3.8 Upload to Google Drive

**Purpose:** Upload all finished assets to Google Drive so the owner can review and then upload to YouTube.

**Current State:** Exists (`utils/google_drive.py`). Uploads scripts + audio. Does NOT upload outline, images, or video.

**Required Changes:**

- [ ] Upload the rendered video (`output/video.mp4`)
- [ ] Upload the thumbnail (`output/thumbnail.jpg`)
- [ ] Upload the script.json (for reference)
- [ ] Upload the audio manifest (for reference)
- [ ] Create a `_metadata.txt` file with title, description, tags ready to copy-paste for YouTube upload
- [ ] Organize in Drive folder: `Adam's Axiom / [Video Title] / {video.mp4, thumbnail.jpg, metadata.txt}`

**Output:** `_metadata.txt` **(auto-generated, ready to paste into YouTube):**

```
TITLE: Every Major Central Bank Tool Explained in 20 Minutes

DESCRIPTION:
From interest rates to quantitative easing, here's how central banks actually control the economy.

[AI Disclosure: This video uses AI-generated narration and automated image sourcing.]

TAGS: economics, central banks, federal reserve, quantitative easing, interest rates, monetary policy

THUMBNAIL: thumbnail.jpg (upload separately)

```

---

### 3.9 Status Dashboard

**Purpose:** Let the owner check pipeline status without digging through files or logs.

**Implementation:** CLI-based for now (dashboard UI is a future enhancement).

**Commands:**

- `cli.py status` — show all projects with current pipeline stage
- `cli.py status <project_id>` — detailed status for one project including per-step timing, any warnings/flags
- `cli.py queue list` — show topic queue
- `cli.py failures` — show all flagged issues across projects (failed audio sections, rejected images, etc.)

**Status Output Example:**

```
PROJECT STATUS — Adam's Axiom Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID        Topic                                    Status              Flags
aa-0042   Central Bank Tools Explained              ready_for_review    0
aa-0043   Why Every Empire Collapsed                assembling_video    1 (audio section 4 failed)
aa-0044   Economics of War                          fetching_images     0
aa-0045   Game Theory in Real Life                  approved            0 (queued)

QUEUE: 8 topics approved, 3 suggested (pending approval)

```

---

## 4. DATA ARCHITECTURE

### 4.1 Testing Phase (Local)

All data stored in local filesystem:

```
adamsaxion/adams-agents/
├── topic_queue.json                    # Topic queue
├── assets/
│   └── ad_clips/                       # Pre-recorded SaaS ad clips (owner provides)
│       ├── ad_v1.mp4
│       ├── ad_v2.mp4
│       └── ad_v3.mp4
├── projects/
│   ├── metadata.csv                    # Project status tracking
│   └── aa-0042/
│       ├── research/
│       │   └── research.json
│       ├── script/
│       │   └── script.json
│       ├── audio/
│       │   ├── manifest.json
│       │   ├── 00_hook_the_money_spigot.mp3
│       │   ├── 01_context_why_central_banks.mp3
│       │   └── ...
│       ├── images/
│       │   ├── section_00/
│       │   │   ├── candidates/
│       │   │   ├── approved/
│       │   │   └── icon.jpg
│       │   └── ...
│       └── output/
│           ├── video.mp4
│           ├── thumbnail.jpg
│           └── _metadata.txt

```

### 4.2 Production Phase (Supabase)

**Tables:**

- `topic_queue` — topic suggestions and approvals
- `projects` — project metadata, status, timestamps per step
- `project_flags` — warnings and issues per project (failed audio, rejected images, etc.)
- `analytics_cache` — cached YouTube analytics data for outlier detection

**Blob Storage (Supabase Storage):**

- All images, audio, video, and thumbnail files
- Organized by project ID in buckets

**Migration:** Once the local pipeline is tested end-to-end and produces a satisfactory video, migrate storage to Supabase and deploy to Railway. The code should use an abstraction layer (`storage.save()`, `storage.load()`) so swapping from local to Supabase is a config change, not a rewrite.

---

## 5. CLEANUP PREREQUISITES

Before building new features, clean up the codebase per audit findings:

- [ ] Delete `crew_agents.py` (dead code, broken)
- [ ] Remove `elevenlabs`, `crewai`, `langchain_*` from `requirements.txt`
- [ ] Update `.env.example` to match actual `config.py` requirements
- [ ] Remove ElevenLabs references from `test_drive_integration.py`
- [ ] Delete or update `MIGRATION_TO_GOOGLE_TTS.md` (references CLI flags that don't exist)
- [ ] Remove `voice_style` parameter (silently ignored, always Puck)
- [ ] Fix audio file format: resolve LINEAR16/.mp3 mismatch
- [ ] Remove `**Section N: Title`** markdown injection from `create_script_section_by_section`
- [ ] Fix research output directory: `projects/<id>/research/` not `./research/`

---

## 6. BUILD ORDER

**Phase 0: Cleanup (Day 1)** All items in Section 5. Clean slate for the build.

**Phase 1: Script Output Upgrade (Days 2-3)**

- Upgrade script generation to GPT-5
- Extend output schema to include image search terms, on-screen text, keyword highlights, layout hints, thumbnail spec
- Update `storytelling_rules.md` with image search term rules and section icon rules
- Validate output is clean JSON

**Phase 2: Audio Pipeline Fix (Days 3-4)**

- Fix LINEAR16/.mp3 format mismatch
- Update Gemini chunking prompt to preserve section boundaries
- Implement section-based audio file naming
- Generate audio manifest JSON
- Add resume capability for failed chunks

**Phase 3: Image Pipeline (Days 5-8)**

- Build `utils/image_search.py` using Serper API
- Build `utils/image_qa.py` using GPT-4o vision
- Implement fallback queries
- Implement image organization (candidates → approved → icon)
- Cost optimization: batch QA calls, early stopping

**Phase 4: Video Assembly (Days 8-14)**

- Build `utils/video_assembler.py` using MoviePy + Pillow
- Implement standard frame layout (white bg, title, icon, image left, text right)
- Implement keyword highlighting in red
- Implement slide-in for images, fade-in for text
- Implement all layout variants (standard, collage-3, collage-4, single-focus, data-chart, text-only)
- Implement SaaS ad clip insertion (with skip-if-missing)
- Implement fade transitions between sections
- Audio alignment and final render

**Phase 5: Thumbnail Generation (Days 14-15)**

- Build `utils/thumbnail_generator.py` using Pillow
- Implement grid layout with circular icons and labels
- Implement headline/sub-headline text rendering

**Phase 6: Orchestration & Upload (Days 15-17)**

- Wire all modules into `cli.py produce` single command
- Implement topic queue CLI commands
- Implement status dashboard CLI
- Update Google Drive upload to include video, thumbnail, metadata
- Implement graceful degradation at every step
- Implement status flow and logging

**Phase 7: Topic Suggestion Engine (Days 17-19)**

- YouTube Data API integration for analytics
- Outlier detection logic
- Topic suggestion generation via GPT-4o
- `cli.py suggest` command

**Phase 8: End-to-End Test (Days 19-21)**

- Run full pipeline on a real topic
- Review output video quality
- Fix issues found during test
- Run 3 more videos to validate consistency

**Phase 9: Production Migration (After successful testing)**

- Migrate storage layer to Supabase (Postgres + Blob Storage)
- Deploy to Railway
- Configure scheduling (3 videos/week, Mon/Wed/Fri)
- Monitor first week of automated production

---

## 7. SUCCESS CRITERIA

The pipeline is "done" when:

1. Owner adds 10 topics to the queue
2. Runs `cli.py produce --batch 3`
3. Walks away
4. Returns to find 3 rendered videos on Google Drive with thumbnails and metadata
5. Each video is watchable, has no AI-generated images, has properly synced audio, and looks consistent with the channel's existing style
6. Owner reviews each in <2 minutes, uploads to YouTube with copy-pasted metadata
7. Total owner time for 3 videos: <10 minutes
8. Total API cost for 3 videos: <$60

---

## 8. RISKS & MITIGATIONS


| Risk                                        | Likelihood | Impact   | Mitigation                                                            |
| ------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------- |
| Image search returns mostly AI images       | Medium     | High     | Vision QA layer + strict search term rules + fallback queries         |
| MoviePy can't handle 300+ frames smoothly   | Low        | High     | Test early in Phase 4. Fallback: FFmpeg directly                      |
| GPT-5 API unavailable or rate limited       | Low        | Medium   | Auto-fallback to GPT-4o for script generation                         |
| Chirp3 audio quality varies between chunks  | Medium     | Medium   | Normalize audio in post-processing step                               |
| YouTube flags channel for automated content | Low        | Critical | Space uploads (Mon/Wed/Fri), disclose AI use, vary thumbnails         |
| Serper API rate limits at scale             | Low        | Low      | Cache results, batch requests, 3 videos/week is low volume            |
| Video quality doesn't match editor output   | Medium     | High     | Phase 8 testing — compare automated vs editor-made video side by side |


---

## 9. FUTURE ENHANCEMENTS (Post v1.0)

- Auto-upload to YouTube (owner currently reviews + uploads manually)
- Web dashboard for status monitoring (replace CLI status)
- A/B thumbnail testing
- Auto-scheduling uploads at optimal times based on analytics
- Multi-channel support (reuse pipeline for different niches)
- Shorts generation from long-form video highlights
- Comment monitoring for outlier detection signals
- Integration with the economics SaaS product for analytics-driven content

