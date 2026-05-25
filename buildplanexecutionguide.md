# Adam's Axiom — Parallelized Build Plan

# Which development tasks can agents work on simultaneously?

---

## BUILD DEPENDENCY GRAPH

```
                    ┌──────────────┐
                    │  PHASE 0     │
                    │  Cleanup     │
                    │  (Day 1)     │
                    └──────┬───────┘
                           │
                           ▼
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  PHASE 1A    │ │  PHASE 1B    │ │  PHASE 1C    │
   │  Script      │ │  Audio       │ │  Image Search│
   │  Output      │ │  Pipeline    │ │  + QA        │
   │  Upgrade     │ │  Fix         │ │  (new)       │
   │  (Days 2-4)  │ │  (Days 2-4)  │ │  (Days 2-5)  │
   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
          │                │                │
          │         ┌──────┘                │
          │         │                       │
          ▼         ▼                       │
   ┌──────────────────────┐                │
   │  PHASE 2A            │                │
   │  Video Assembly      │◄───────────────┘
   │  (MoviePy + Pillow)  │
   │  (Days 5-10)         │
   └──────────┬───────────┘
              │
              │         ┌──────────────┐
              │         │  PHASE 2B    │
              │         │  Thumbnail   │  ◄── Can start as soon as
              │         │  Generator   │      Image Search is done
              │         │  (Days 5-6)  │
              │         └──────┬───────┘
              │                │
              ▼                ▼
   ┌─────────────────────────────────────┐
   │  PHASE 3                            │
   │  Orchestrator + CLI + Upload        │
   │  (Days 10-12)                       │
   └──────────┬──────────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │  PHASE 4             │
   │  Topic Queue +       │  ◄── Can actually start anytime
   │  Suggestion Engine   │      after Phase 0 (independent)
   │  (Days 10-14)        │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │  PHASE 5             │
   │  End-to-End Test     │
   │  (Days 14-16)        │
   └──────────────────────┘

```

---

## WHAT CAN RUN IN PARALLEL

### PARALLEL GROUP 1: Three agents, same time (after cleanup)

These three modules share NO code dependencies. They all read from a script.json format, but they don't import from each other. Three agents can build them simultaneously.


| Agent   | Task                  | What They Build                                                                                    | Days |
| ------- | --------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| Agent A | Script Output Upgrade | Update `simple_agents.py`, `storytelling_rules.md`, new JSON output schema, GPT-5 integration      | 2-4  |
| Agent B | Audio Pipeline Fix    | Fix LINEAR16/.mp3 bug, update Gemini chunking, section-based naming, manifest.json, resume logic   | 2-4  |
| Agent C | Image Search + QA     | New `utils/image_search.py` (Serper), new `utils/image_qa.py` (GPT-4o vision), download + organize | 2-5  |


**Why they're independent:**

- Agent A changes the script generator output format
- Agent B changes the audio generation flow
- Agent C builds entirely new modules
- None import from each other
- They all need to agree on `script.json` schema → give all three agents the schema from the spec as a shared contract

**Shared contract they must all respect:**

```
script.json is the interface between all modules.
- Agent A PRODUCES script.json
- Agent B READS script.json (narration text, section structure)
- Agent C READS script.json (image_searches, section structure)

The schema is defined in the spec (Section 3.2).
Do not deviate from it.

```

### PARALLEL GROUP 2: Two agents, same time (after Group 1)


| Agent   | Task                | What They Build                                                                            | Depends On                                              | Days |
| ------- | ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ---- |
| Agent D | Video Assembly      | `utils/video_assembler.py` — MoviePy + Pillow, all layout types, transitions, ad insertion | Script schema + Audio manifest + Image folder structure | 5-10 |
| Agent E | Thumbnail Generator | `utils/thumbnail_generator.py` — Pillow, grid layout, circular icons, headline text        | Script schema + Image icon files                        | 5-6  |


**Why they're independent:**

- Video assembler produces `video.mp4`
- Thumbnail generator produces `thumbnail.jpg`
- Neither depends on the other's output
- Both depend on the image folder structure from Agent C

**Agent E will finish early.** They can then help Agent D or move to Phase 3 tasks.

### INDEPENDENT TRACK: Topic Queue (anytime after Phase 0)


| Agent   | Task                      | What They Build                                                                                             | Depends On                         | Days |
| ------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---- |
| Agent F | Topic Queue + Suggestions | `topic_queue.json` schema, CLI commands (add/list/approve), YouTube API analytics, GPT-4o suggestion engine | Nothing — fully independent module | 3-5  |


**This can start on Day 1 alongside everything else.** It has zero dependencies on the rest of the pipeline. It just needs to output topic records that the orchestrator reads.

---

## OPTIMAL AGENT ALLOCATION

### If you have 3 agents:

```
Day 1:        All 3 → Phase 0 Cleanup (split the cleanup tasks)
Days 2-5:     Agent A → Script | Agent B → Audio | Agent C → Images
Days 5-6:     Agent A → Thumbnail | Agent B → Video Assembly (start) | Agent C → Video Assembly (help)
Days 6-10:    Agent A → Topic Queue | Agent B+C → Video Assembly (it's the biggest piece)
Days 10-12:   All 3 → Orchestrator + CLI + Upload
Days 12-14:   All 3 → End-to-End Testing + Fixes

```

**Total: ~14 days**

### If you have 2 agents:

```
Day 1:        Both → Phase 0 Cleanup
Days 2-5:     Agent A → Script + Audio | Agent B → Images + QA
Days 5-10:    Agent A → Video Assembly | Agent B → Thumbnail then Topic Queue
Days 10-12:   Both → Orchestrator + CLI + Upload
Days 12-15:   Both → End-to-End Testing + Fixes

```

**Total: ~15 days**

### If you have 1 agent:

```
Day 1:        Phase 0 Cleanup
Days 2-4:     Script Output Upgrade
Days 4-6:     Audio Pipeline Fix
Days 6-9:     Image Search + QA
Days 9-14:    Video Assembly
Days 14-15:   Thumbnail Generator
Days 15-17:   Orchestrator + CLI + Upload
Days 17-19:   Topic Queue + Suggestions
Days 19-21:   End-to-End Testing + Fixes

```

**Total: ~21 days**

---

## HANDOFF CONTRACTS BETWEEN AGENTS

Each agent group needs to know what format the other groups expect. These are the interface contracts — include them in every agent's prompt.

### Contract 1: script.json (Agent A produces → Agents B, C, D, E consume)

Agent A must output the exact schema defined in the spec Section 3.2. All other agents build against this schema. **If Agent A changes the schema, all other agents break.**

Test: Agent A should produce a sample `script.json` on Day 2 that other agents can use as test data while building their modules.

### Contract 2: Audio manifest.json (Agent B produces → Agent D consumes)

```json
{
  "sections": [
    {
      "section_number": 0,
      "audio_files": [
        {"filename": "00_hook_the_money_spigot.mp3", "duration_seconds": 13}
      ]
    }
  ],
  "failed_sections": []
}

```

Agent D (video assembly) reads this to know which audio files to place on the timeline and how long each section is.

### Contract 3: Image folder structure (Agent C produces → Agents D, E consume)

```
projects/<id>/images/
├── section_00/
│   ├── approved/
│   │   ├── img_001.jpg
│   │   └── img_002.jpg
│   └── icon.jpg          ← Used by both video assembly AND thumbnail
├── section_01/
│   └── ...

```

Agent D reads `approved/` images for video frames. Agent E reads `icon.jpg` files for thumbnail grid.

### Contract 4: Output files (Agents D, E produce → Orchestrator consumes)

```
projects/<id>/output/
├── video.mp4              ← Agent D
├── thumbnail.jpg          ← Agent E
└── _metadata.txt          ← Orchestrator generates from script.json

```

---

## PHASE 0 CLEANUP — PARALLELIZABLE SUBTASKS

Even the cleanup can be split across agents:


| Task                                      | Independent?                      | Time   |
| ----------------------------------------- | --------------------------------- | ------ |
| Delete `crew_agents.py`                   | Yes                               | 2 min  |
| Remove stale deps from `requirements.txt` | Yes                               | 5 min  |
| Update `.env.example`                     | Yes                               | 10 min |
| Remove ElevenLabs from test files         | Yes                               | 5 min  |
| Delete/update stale docs                  | Yes                               | 10 min |
| Remove `voice_style` parameter            | Yes                               | 10 min |
| Fix LINEAR16/.mp3 mismatch                | Yes (but Agent B should own this) | 15 min |
| Remove markdown section header injection  | Yes (but Agent A should own this) | 10 min |
| Fix research output directory             | Yes                               | 5 min  |


**Assignment:** Give the format-related cleanups to the agent who owns that module:

- Agent A gets: remove markdown injection, fix research directory
- Agent B gets: fix LINEAR16/.mp3, remove voice_style
- Agent C gets: everything else (dead code, stale deps, stale docs)

All three start cleanup simultaneously on Day 1, each handling their domain.

---

## TESTING STRATEGY PER PHASE

Each agent should produce testable output before the integration phase.


| Agent               | Standalone Test                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Agent A (Script)    | Generate a script.json for "Quantitative Easing Explained". Validate JSON schema. Confirm image search terms follow the rules.          |
| Agent B (Audio)     | Take the test script.json, generate audio. Confirm files are named correctly, manifest.json is valid, format is correct.                |
| Agent C (Images)    | Take the test script.json, fetch images for all sections. Confirm folder structure, QA pass/fail logging, icon generation.              |
| Agent D (Video)     | Take test script.json + test audio + test images, render a 2-minute sample. Confirm layout, transitions, text highlighting, audio sync. |
| Agent E (Thumbnail) | Take test icon images, render thumbnail. Confirm grid layout, text rendering, resolution.                                               |
| Agent F (Queue)     | Add 5 topics, list them, approve 2, confirm status tracking.                                                                            |


**The test script.json from Agent A is the critical path item.** Get this produced on Day 2 so Agents B and C can test against real data, not mocks.