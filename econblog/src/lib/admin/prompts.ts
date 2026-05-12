import fs from "fs";
import path from "path";

const STYLE_RULES = `
STYLE CONSTRAINT: Never use em dashes (—) anywhere in your output. Use commas, semicolons, colons, parentheses, or separate sentences instead.`;

function loadWritingRules(): string {
  const rulesPath = path.join(process.cwd(), "src/content/lesson_writing_rules.md");
  return fs.readFileSync(rulesPath, "utf-8") + "\n" + STYLE_RULES;
}

export function researchSynthesisPrompt(
  topic: string,
  searchResults: { query: string; results: { title: string; link: string; snippet: string }[] }[],
  uploadedSources: string[]
): { system: string; user: string } {
  return {
    system: `You are an economics research assistant. Your job is to synthesize search results and source materials into comprehensive research notes for an educational lesson.

Focus on:
- Specific facts, statistics, dates, and data points (with sources)
- Real historical events and their outcomes
- Named individuals and their roles
- Policy decisions and their measurable consequences
- Multiple perspectives on controversial topics
- Caribbean and African examples alongside Western ones

Format your output as structured research notes with clear sections. Include source URLs where available. Flag any claims that seem uncertain or need verification.
${STYLE_RULES}`,
    user: `Research topic: "${topic}"

## Web Search Results
${searchResults.map((sr) => `### Query: "${sr.query}"\n${sr.results.map((r) => `- [${r.title}](${r.link}): ${r.snippet}`).join("\n")}`).join("\n\n")}

${uploadedSources.length > 0 ? `## Uploaded Source Materials\n${uploadedSources.map((s, i) => `### Source ${i + 1}\n${s.slice(0, 3000)}`).join("\n\n")}` : ""}

Synthesize all available information into comprehensive research notes for creating an economics lesson on this topic. Include specific data points, real scenarios, and verifiable facts.`,
  };
}

export function outlinePrompt(
  topic: string,
  researchNotes: string,
  category: string,
  difficulty: string
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are an expert economics curriculum designer. Generate a lesson outline following these rules:

${rules}

You must output valid JSON matching this structure:
{
  "sections": [
    {
      "id": "section-1",
      "title": "Section title",
      "subsections": [
        {
          "id": "section-1-sub-1",
          "title": "Subsection title",
          "contentSummary": "2-3 sentence summary of what this subsection covers",
          "quizHint": "One line describing what concept the quiz will test",
          "quizType": "intuition" | "in-lesson" | "recap"
        }
      ]
    }
  ],
  "suggestedTitle": "Full lesson title",
  "suggestedDescription": "2-3 sentence lesson description",
  "estimatedMinutes": number
}`,
    user: `Create a lesson outline for: "${topic}"
Category: ${category}
Difficulty: ${difficulty}

## Research Notes
${researchNotes}

Generate exactly 8 sections with approximately 3 subsections each (~24 total). Follow the section structure template from the rules (Hook → Foundation → Progressive Complexity → Synthesis → Real-World). Ensure question type distribution meets the constraints.`,
  };
}

export function sectionContentPrompt(
  topic: string,
  lessonTitle: string,
  researchNotes: string,
  sectionOutline: { id: string; title: string; subsections: { id: string; title: string; contentSummary: string }[] },
  sectionIndex: number,
  previousSectionsContent: string
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are an expert economics educator writing lesson content. Follow these rules strictly:

${rules}

You must output valid JSON matching this structure:
{
  "subsections": [
    {
      "id": "section-N-sub-1",
      "title": "Subsection title",
      "content": "Full markdown content (200-500 words)"
    }
  ]
}

Write engaging, specific, real-world-grounded prose. Every statistic must be real. Every scenario must be verifiable. Use markdown formatting with **bold** for key terms, > blockquotes for real quotes, and valid GitHub-flavored markdown tables for matrices or tabular comparisons. Do not repeat the subsection title as a markdown heading because the UI already renders it separately.`,
    user: `Lesson: "${lessonTitle}"
Topic: "${topic}"
Section ${sectionIndex + 1} of 8: "${sectionOutline.title}"

Subsections to write:
${sectionOutline.subsections.map((sub) => `- ${sub.id}: "${sub.title}" — ${sub.contentSummary}`).join("\n")}

## Research Notes
${researchNotes.slice(0, 4000)}

${previousSectionsContent ? `## Previously Written Content (for continuity)\n${previousSectionsContent.slice(-3000)}` : ""}

Write the full content for all ${sectionOutline.subsections.length} subsections in this section. Maintain narrative flow between subsections.`,
  };
}

export function questionGenerationPrompt(
  sectionContent: { id: string; title: string; content: string; quizType: string; quizHint: string }[],
  lessonTitle: string,
  sectionTitle: string,
  sectionIndex: number
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are an expert economics assessment designer. Create quiz questions following these rules strictly:

${rules}

You must output valid JSON matching this structure:
{
  "questions": [
    {
      "subsectionId": "section-N-sub-M",
      "quiz": {
        "id": "unique-kebab-case-id",
        "type": "intuition" | "in-lesson" | "recap",
        "question": "The question stem — a scenario, not a definition test",
        "options": ["Option A with full reasoning (2-4 sentences)", "Option B with full reasoning (2-4 sentences)"],
        "correctAnswer": 0 | 1 | null,
        "difficulty": "easy" | "medium" | "hard",
        "xpReward": number,
        "xpPenalties": [number, number],
        "explanation": "Detailed explanation of why the correct answer is correct and what concept it teaches"
      }
    }
  ]
}

CRITICAL RULES:
- Intuition questions: correctAnswer = null, xpReward = 5, xpPenalties = [0, 0]
- In-lesson questions: xpPenalties = [0, 0], xpReward = 10/15/20 based on complexity
- Recap questions: real penalties, xpReward = 20-25
- Options must be 2-4 sentences each with genuine reasoning
- Never mention the economic concept name in the question stem
- Both options must be genuinely appealing`,
    user: `Lesson: "${lessonTitle}"
Section ${sectionIndex + 1}: "${sectionTitle}"

Generate a quiz question for each subsection:

${sectionContent.map((sub) => `### ${sub.id}: "${sub.title}"
Type: ${sub.quizType}
Quiz hint: ${sub.quizHint}
Content:
${sub.content.slice(0, 1500)}`).join("\n\n")}

Create ${sectionContent.length} questions, one per subsection, matching the specified types.`,
  };
}

export function questionValidationPrompt(
  questions: unknown[],
  sectionContent: string
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are a quality auditor for economics quiz questions. Your job is to check each question against these rules:

${rules}

For each question, check:
1. Does the question stem avoid naming the economic concept? (Rule 1)
2. Are both options genuinely appealing with real reasoning? (Rule 2)
3. Do options include second-order effects? (Rule 3)
4. Does it test values/thinking, not just recall? (Rule 4)
5. Is the scenario real and verifiable? (Rule 5)
6. Are XP values correct for the question type?
7. Is the explanation substantive?

Output valid JSON:
{
  "results": [
    {
      "questionId": "string",
      "passed": true | false,
      "violations": ["Rule 1: question mentions 'elasticity' in the stem"],
      "suggestions": ["Reframe as a pricing scenario without naming the concept"]
    }
  ]
}`,
    user: `Validate these questions against the section content:

## Section Content
${sectionContent.slice(0, 3000)}

## Questions to Validate
${JSON.stringify(questions, null, 2)}`,
  };
}

export function masteryPoolPrompt(
  lessonTitle: string,
  allSectionsContent: string,
  questionsPerAttempt: number,
  poolSize: number,
  existingQuestionStems: string[] = []
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are creating mastery exam questions for an economics lesson. These are the hardest questions — they require integrating concepts across multiple sections.

${rules}

Mastery questions are always type "recap" with difficulty "hard".
- xpReward: 30
- xpPenalties: [10, 15]
- correctAnswer: must be a valid index (not null)
- Options: 2-4 choices, each 3-5 sentences with deep reasoning

Questions must span all sections proportionally. Each question should require knowledge from at least 2 different sections.

Output valid JSON:
{
  "questionsPerAttempt": ${questionsPerAttempt},
  "passingScore": number (percentage, e.g. 70),
  "timeLimitMinutes": number,
  "questionPool": [
    {
      "id": "mastery-unique-id",
      "type": "recap",
      "question": "...",
      "options": ["...", "..."],
      "correctAnswer": 0,
      "difficulty": "hard",
      "xpReward": 30,
      "xpPenalties": [10, 15],
      "explanation": "..."
    }
  ]
}`,
    user: `Lesson: "${lessonTitle}"
Pool size: ${poolSize} questions
Draw per attempt: ${questionsPerAttempt} questions

## Full Lesson Content
${allSectionsContent.slice(0, 12000)}

${existingQuestionStems.length > 0 ? `## Existing Mastery Questions To Avoid Duplicating
${existingQuestionStems.map((stem, index) => `${index + 1}. ${stem}`).join("\n")}

Generate new questions that test different scenarios, combinations, or contexts from the ones above.
` : ""}

Generate ${poolSize} mastery questions spanning all sections. Each question should integrate concepts from multiple sections.`,
  };
}

export function masteryQuestionPrompt(
  lessonTitle: string,
  allSectionsContent: string,
  questionsPerAttempt: number,
  questionNumber: number,
  targetCount: number,
  existingQuestionStems: string[] = []
): { system: string; user: string } {
  const rules = loadWritingRules();

  return {
    system: `You are creating one mastery exam question for an economics lesson. This question must be hard and require integrating concepts across multiple sections.

${rules}

The output must be valid JSON with this exact shape:
{
  "questionsPerAttempt": ${questionsPerAttempt},
  "passingScore": number,
  "timeLimitMinutes": number,
  "question": {
    "id": "mastery-unique-id",
    "type": "recap",
    "question": "...",
    "options": ["...", "..."],
    "correctAnswer": 0,
    "difficulty": "hard",
    "xpReward": 30,
    "xpPenalties": [10, 15],
    "explanation": "..."
  }
}

Rules for this one question:
- It must feel distinct from the existing mastery questions
- It must require knowledge from at least 2 different sections
- It must use 2-4 options
- Every option must include deep reasoning
- correctAnswer must not be null`,
    user: `Lesson: "${lessonTitle}"
Question ${questionNumber} of ${targetCount}
Draw per attempt: ${questionsPerAttempt} questions

## Full Lesson Content
${allSectionsContent.slice(0, 12000)}

${existingQuestionStems.length > 0 ? `## Existing Mastery Questions To Avoid Duplicating
${existingQuestionStems.map((stem, index) => `${index + 1}. ${stem}`).join("\n")}

Create a new mastery question that uses a clearly different setup, scenario, or angle from the ones above.
` : ""}

Generate exactly one mastery question as valid JSON only.`,
  };
}
