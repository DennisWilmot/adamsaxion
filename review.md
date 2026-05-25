# Codebase Audit Prompt — Adam's Axiom YouTube Automation Pipeline

## Your Role

You are auditing an existing codebase that automates YouTube video production for the channel "Adam's Axiom" — an economics education channel. Your job is to thoroughly inspect every file, understand the current system, identify what exists, what's missing, and what's broken — then report back with structured findings so the owner can make informed architectural decisions about what to build next.

**Do NOT fix anything. Do NOT refactor anything. Do NOT suggest code changes yet. Just report what you find.**

---

## Context: What the System Is Supposed to Do (End-to-End)

The full desired pipeline is:

1. **Topic Selection** → Choose a video topic (currently manual)
2. **Research** → Gather data, sources, and facts for the topic (exists in some form)
3. **Script Generation** → AI generates a structured script with sections (exists in some form)
4. **Audio Generation** → Text-to-speech via Google Chirp3 voices, generated in chunks of <1 minute each to maintain quality (exists in some form)
5. **Image Sourcing** → For each script section, fetch real images from Google Images based on search terms — NO AI-generated images allowed (unclear if this exists)
6. **Image QA** → A vision model reviews fetched images to confirm they match the search intent, aren't AI slop, and are adequate quality (does not exist yet)
7. **Video Assembly** → Programmatically assemble video frames: white background, section title at top, Google Image on left, narration text on right with keywords highlighted in red, simple fade/slide transitions, 3-5 seconds per frame (does not exist — currently done by a human editor in Canva)
8. **Thumbnail Generation** → Auto-generate thumbnail from template (does not exist yet)
9. **Upload to Google Drive** → Completed assets uploaded to Drive (exists in some form)
10. **Upload to YouTube** → Final video uploaded to YouTube with title, description, tags (currently manual, planned for automation)

---

## What I Need You to Do

### Phase 1: Discovery (Do This First)

Map the entire codebase. For every file and directory:

- What is its purpose?
- What does it depend on (APIs, libraries, other files)?
- Is it actively used or dead code?
- What external services does it connect to (Google Drive, Chirp3/Google TTS, YouTube API, any AI APIs)?

Produce a **directory tree** with one-line descriptions of every significant file.

### Phase 2: Pipeline Mapping

For each of the 10 pipeline steps listed above, answer:

1. **Does code exist for this step?** (yes / partial / no)
2. **If yes — where?** (file paths)
3. **How is it triggered?** (manual script run, cron, API call, chained from another step?)
4. **What are its inputs and outputs?** (what files/data does it consume, what does it produce?)
5. **Does it work reliably?** (look for error handling, edge cases, hardcoded values, TODO comments)
6. **What are its limitations?** (e.g., audio generation doesn't name files properly, script output isn't structured by section)

### Phase 3: Integration Assessment

Answer these specific questions:

**Script Generation:**

- What AI model/API is used for script generation?
- What does the prompt look like? Is it well-structured?
- Does the script output include section-by-section structure, or is it a wall of text?
- Does it include Google Image search terms per section?
- Does it include on-screen text overlay specifications?
- Does it include keyword highlighting instructions (which words should be red/bold)?
- Does it specify the SaaS product plug?

**Audio Generation:**

- What TTS service is used? (expecting Google Chirp3)
- How is the script split into chunks for generation? Is the <1 minute constraint enforced?
- How are the output audio files named? (expecting they're poorly named — confirm)
- Where do the audio files end up? (Google Drive? Local?)
- Is there any silence trimming, normalization, or post-processing?

**Image Pipeline:**

- Is there ANY code for automated image fetching?
- If yes, what API is used? (Google Custom Search API, SerpAPI, etc.)
- Is there any image validation or QA step?
- How are images currently sourced? (manually by the editor?)

**Video Assembly:**

- Is there ANY code for programmatic video generation?
- Any use of: Remotion, MoviePy, FFmpeg, Canva API, Creatomate, or similar?
- If not, what is the current assembly process? (editor does it manually in Canva)

**Upload & Distribution:**

- How does the Google Drive upload work?
- Is the YouTube Data API integrated?
- Is there any metadata generation (titles, descriptions, tags)?

**Tracking & Workflow:**

- Is there any system for tracking video status (in progress, editing, ready, uploaded)?
- How does the owner know when a video is done?
- Is there a task queue, status dashboard, or notification system?

### Phase 4: Architecture Assessment

Based on what you find, answer:

1. **What language(s) and frameworks is the codebase in?** (Python? Node.js? Both?)
2. **Is there a clear entry point or main orchestrator?** Or is it a collection of disconnected scripts?
3. **What's the deployment situation?** (runs locally? on a server? cloud functions?)
4. **What credentials/API keys are configured?** (don't share the values — just list what services have keys set up)
5. **Is there a database?** Or is everything file-based?
6. **How would you rate the overall code quality?** (well-structured vs. hacky scripts vs. somewhere in between)

### Phase 5: Gap Analysis for Full Automation

Given the goal of ZERO human involvement (except occasional review), identify:

1. **What's the #1 bottleneck right now?** The single thing that, if fixed, would have the biggest impact.
2. **What are the missing pieces** in order of priority to achieve full automation?
3. **What existing code needs to be restructured** to support the full pipeline? (e.g., script output format needs to change to include image search terms)

---

## Decisions the Owner Is Weighing (Provide Relevant Findings)

The owner is considering several architectural decisions. Your findings should help inform these:

### Decision 1: Remotion vs. Alternatives for Video Assembly

The owner is considering **Remotion** (React-based programmatic video) for the video assembly step. Based on what you find in the codebase:

- Is the existing tech stack compatible with Remotion (Node.js/React)?
- Are there any existing video generation attempts that suggest a different direction?
- Given the video format (white background, image left, text right, simple transitions, 180-300 frames per video), what's the simplest tool that would work?
- Alternatives to evaluate: Remotion, MoviePy (Python), FFmpeg directly, Canva API, Creatomate API

### Decision 2: Image Sourcing API

For automated Google Image fetching:

- Is Google Custom Search API already set up?
- Is SerpAPI or any other search API integrated?
- What would be the path of least resistance to add image fetching?

### Decision 3: Vision Model for Image QA

The owner wants to use a multimodal AI model to validate fetched images (confirm they match the search intent, aren't AI-generated, are good quality). Based on the existing AI integrations:

- What AI APIs are already in use?
- Would it make sense to use the same provider for image QA?
- Is there existing code for image analysis that could be extended?

### Decision 4: Editor Retention vs. Full Automation

The owner is deciding between:

- **Option A:** Keep the editor but make their job mechanical (structured handoff package, named files, checklist)
- **Option B:** Eliminate the editor entirely with programmatic video assembly

Your findings should clarify how far the current system is from each option.

### Decision 5: Audio File Management

The audio files are currently unnamed/poorly named. The owner wants them named by section (e.g., `01_hook_intro.mp3`, `02_context_setup.mp3`). Based on what you find:

- Where in the pipeline would naming be easiest to add?
- Is the script-to-audio mapping traceable in the current code?
- Could the script generator output a manifest that maps sections to audio chunks?

---

## Output Format

Structure your report exactly like this:

```
## 1. Directory Tree
[annotated tree]

## 2. Pipeline Step Status
[table: step | status | file paths | notes]

## 3. Integration Details
[structured answers per subsystem]

## 4. Architecture Summary
[answers to architecture questions]

## 5. Gap Analysis
[prioritized list of what's missing]

## 6. Decision-Relevant Findings
[findings organized by each of the 5 decisions above]

## 7. Red Flags & Quick Wins
- Red flags: things that are broken, risky, or will cause problems at scale
- Quick wins: things that could be fixed in <1 hour with high impact

```

---

## Important Notes

- **Be thorough.** Check every file, every config, every environment variable. The owner needs the full picture.
- **Be honest.** If the code is messy, say so. If something is well-built, say that too.
- **Don't assume.** If you can't determine something from the code, say "unclear — would need to test" rather than guessing.
- **Respect secrets.** Don't output API keys, tokens, or passwords. Just note what services are configured.
- **Think about the end goal.** Everything you report should be in service of answering: "How close are we to a fully automated video production pipeline, and what's the fastest path to get there?"

