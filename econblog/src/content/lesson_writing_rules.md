# Lesson Writing Rules

## Core Philosophy
- Challenge intuition first, then build understanding
- Real-world scenarios before abstract theory
- Progressive complexity with frequent reinforcement
- Academic rigor with conversational engagement

## Lesson Structure (8 Major Sections)

### Section 1: The Hook — Crisis Scenario
- Place the reader in a high-stakes decision-making role using second-person ("You wake to...")
- Use real historical scenarios with documented outcomes
- Present a binary choice with compelling logic for both options
- Never reveal the economic concept being taught in the hook setup
- Ground the scenario with specific dates, locations, names, and data points

### Sections 2–3: Foundation Building
- Introduce formal definitions AFTER the reader has wrestled with the concept emotionally
- Pattern: "What you just experienced is [concept]" → formal definition → key components → examples
- Use the format: conversational explanation → bolded formal definition → numbered key components
- Include 2-3 relatable examples that span personal, institutional, and national scales
- Caribbean and African examples are preferred alongside Western ones

### Sections 4–6: Progressive Complexity
- Build on foundations with increasingly nuanced applications
- Introduce second-order effects and trade-offs
- Each section should feel like a new "chapter" with its own mini-narrative
- Use transitional prose between subsections to maintain flow
- Include real data with specific numbers, dates, and sources

### Section 7: Synthesis & Integration
- Connect all concepts from previous sections
- Show how individual concepts interact in real markets
- Use a comprehensive case study that requires applying multiple concepts

### Section 8: Real-World Implications
- Show how the lesson's concepts apply to current events or personal decisions
- End with a forward-looking question or challenge
- Bridge to related topics in other lessons (without requiring them)

## Writing Style

### Tone
- Conversational but authoritative — like a brilliant professor at a pub
- Second-person immersion for scenarios ("You sit across from...")
- Third-person for historical accounts and data presentation
- Never condescending, never dumbed-down

### Prose Structure Per Subsection
- Each subsection: 200–500 words of markdown content
- Open with context or narrative, not a definition
- Use markdown headers (### for subsection title)
- Bold key terms on first introduction
- Use bullet points or numbered lists for components/criteria
- Include at least one concrete example per subsection

### Formatting Rules
- Markdown format (rendered in a React markdown component)
- Use ### for subsection headers (not # or ##)
- Bold (**term**) for key economic terms on first use
- Use blockquotes (>) for real quotes from historical figures
- Use specific numbers, never vague ("inflation hit 231,000,000%" not "hyperinflation occurred")

### Anti-Patterns
- Never start with a definition — always start with a scenario or question
- Never use "In this section, we will learn about..."
- Never use placeholder data — all statistics must be real and verifiable
- Never write generic textbook prose — every paragraph should feel like it was written by someone who cares
- Avoid "AI voice" patterns: no "Let's dive in," "It's worth noting," "In conclusion"
- No emoji in prose content

## Question Design Rules

### Rule 1: Never Give Away the Economic Concept
- Question stems must describe scenarios, not name theories
- Wrong: "What happens to the demand curve when income rises?"
- Right: "Jamaica's minimum wage doubles overnight. What happens at Kingston clothing stores?"

### Rule 2: Make Both Options Genuinely Appealing
- Each option must include real-world constraints that justify it
- Add institutional context and second-order reasoning
- A student should genuinely struggle to choose

### Rule 3: Include Second-Order Effects
- Options should require thinking beyond immediate consequences
- Include competitive dynamics, behavioral responses, time horizons

### Rule 4: Test Values, Not Just Knowledge
- At least some questions should reveal the student's assumptions about fairness, efficiency, and trade-offs
- No single "correct" worldview

### Rule 5: Use Only Real, Verifiable Scenarios
- Every scenario must reference real events, companies, countries, or policies
- Include enough context that the scenario feels lived-in, not contrived

## Question Type Specifications

### Intuition Questions (type: "intuition")
- XP: +5, Penalties: [0, 0]
- No correct answer (correctAnswer: null) — any choice awards XP
- Test gut reactions, values, and assumptions
- Appear in early sections (1–3) to build emotional investment
- UI shows: "There's no wrong answer — this tests your instincts"

### In-Lesson Questions (type: "in-lesson")
- XP: +10 (application), +15 (analysis), +20 (integration)
- Penalties: [0, 0] — safe learning environment
- Have a correct answer with detailed explanation
- Test application of concepts just taught
- Immediate feedback with explanation

### Recap Questions (type: "recap")
- XP: +20 (easy recall) / +25 (hard analysis)
- Penalties: real risk — [5, 8] for easy, [10, 15] for hard
- Only question type with XP penalties
- Appear in later sections (5–8) to test retention
- Require applying concepts from earlier sections

## Distribution Constraints
- At least 2 intuition questions in sections 1–3
- At least 4 recap questions in sections 5–8
- No two recap questions in adjacent subsections
- In-lesson questions fill remaining slots
- Each section's ~3 subsections should have varied question types when possible
