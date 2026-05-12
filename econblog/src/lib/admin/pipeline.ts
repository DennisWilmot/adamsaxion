import { chat, chatJSON } from "@/lib/openrouter";
import { searchMultiple } from "@/lib/serper";
import * as prompts from "./prompts";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === MAX_RETRIES - 1;
      if (isLast) throw err;
      const delay = RETRY_DELAYS[attempt] ?? 8000;
      console.warn(`[${label}] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, err);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

export async function runResearch(
  topic: string,
  uploadedSources: { content: string }[]
): Promise<{ notes: string; searchResults: { query: string; results: { title: string; link: string; snippet: string }[] }[] }> {
  let searchResults: { query: string; results: { title: string; link: string; snippet: string }[] }[] = [];

  const hasSerperKey = !!process.env.SERPER_API_KEY;
  if (hasSerperKey) {
    try {
      const queries = [
        `${topic} economics real world examples data`,
        `${topic} case study historical`,
        `${topic} economics policy consequences statistics`,
      ];
      searchResults = await withRetry(
        () => searchMultiple(queries),
        "web-search"
      );
    } catch (err) {
      console.warn("[research] Web search failed, continuing with uploaded sources + model knowledge:", err);
    }
  }

  const prompt = prompts.researchSynthesisPrompt(
    topic,
    searchResults,
    uploadedSources.map((s) => s.content)
  );

  const notes = await withRetry(
    () => chat([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ], { temperature: 0.4, maxTokens: 4096 }),
    "research-synthesis"
  );

  return { notes, searchResults };
}

interface OutlineSection {
  id: string;
  title: string;
  subsections: {
    id: string;
    title: string;
    contentSummary: string;
    quizHint: string;
    quizType: "intuition" | "in-lesson" | "recap";
  }[];
}

interface OutlineResult {
  sections: OutlineSection[];
  suggestedTitle: string;
  suggestedDescription: string;
  estimatedMinutes: number;
}

export async function generateOutline(
  topic: string,
  researchNotes: string,
  category: string,
  difficulty: string
): Promise<OutlineResult> {
  const prompt = prompts.outlinePrompt(topic, researchNotes, category, difficulty);

  return withRetry(
    () => chatJSON<OutlineResult>([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ], { temperature: 0.7, maxTokens: 6144 }),
    "outline-generation"
  );
}

interface SectionContentResult {
  subsections: {
    id: string;
    title: string;
    content: string;
  }[];
}

export async function generateSectionContent(
  topic: string,
  lessonTitle: string,
  researchNotes: string,
  sectionOutline: OutlineSection,
  sectionIndex: number,
  previousSectionsContent: string
): Promise<SectionContentResult> {
  const prompt = prompts.sectionContentPrompt(
    topic,
    lessonTitle,
    researchNotes,
    sectionOutline,
    sectionIndex,
    previousSectionsContent
  );

  return withRetry(
    () => chatJSON<SectionContentResult>([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ], { temperature: 0.7, maxTokens: 6144 }),
    `section-${sectionIndex}-content`
  );
}

interface QuestionResult {
  questions: {
    subsectionId: string;
    quiz: {
      id: string;
      type: "intuition" | "in-lesson" | "recap";
      question: string;
      options: string[];
      correctAnswer: number | null;
      difficulty: "easy" | "medium" | "hard";
      xpReward: number;
      xpPenalties: [number, number];
      explanation: string;
    };
  }[];
}

interface ValidationResult {
  results: {
    questionId: string;
    passed: boolean;
    violations: string[];
    suggestions: string[];
  }[];
}

export async function generateSectionQuestions(
  sectionContent: { id: string; title: string; content: string; quizType: string; quizHint: string }[],
  lessonTitle: string,
  sectionTitle: string,
  sectionIndex: number
): Promise<QuestionResult> {
  const prompt = prompts.questionGenerationPrompt(
    sectionContent,
    lessonTitle,
    sectionTitle,
    sectionIndex
  );

  let questions = await withRetry(
    () => chatJSON<QuestionResult>([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ], { temperature: 0.7, maxTokens: 6144 }),
    `section-${sectionIndex}-questions`
  );

  const fullContent = sectionContent.map((s) => s.content).join("\n\n");
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const valPrompt = prompts.questionValidationPrompt(questions.questions, fullContent);
    const validation = await chatJSON<ValidationResult>([
      { role: "system", content: valPrompt.system },
      { role: "user", content: valPrompt.user },
    ], { temperature: 0.1, maxTokens: 4096 });

    const failures = validation.results.filter((r) => !r.passed);
    if (failures.length === 0) break;

    if (attempt < MAX_RETRIES - 1) {
      const retryPrompt = prompts.questionGenerationPrompt(
        sectionContent,
        lessonTitle,
        sectionTitle,
        sectionIndex
      );

      const feedbackStr = failures
        .map((f) => `Question ${f.questionId}: ${f.violations.join("; ")} — ${f.suggestions.join("; ")}`)
        .join("\n");

      questions = await chatJSON<QuestionResult>([
        { role: "system", content: retryPrompt.system },
        { role: "user", content: retryPrompt.user + `\n\n## Validation Feedback (fix these issues)\n${feedbackStr}` },
      ], { temperature: 0.7, maxTokens: 6144 });
    }
  }

  return questions;
}

export async function generateMasteryQuestion(
  lessonTitle: string,
  allSectionsContent: string,
  questionsPerAttempt: number,
  questionNumber: number,
  targetCount: number,
  existingQuestionStems: string[] = []
): Promise<{
  questionsPerAttempt: number;
  passingScore: number;
  timeLimitMinutes: number;
  question: QuestionResult["questions"][0]["quiz"];
}> {
  const prompt = prompts.masteryQuestionPrompt(
    lessonTitle,
    allSectionsContent,
    questionsPerAttempt,
    questionNumber,
    targetCount,
    existingQuestionStems
  );

  return withRetry(
    () =>
      chatJSON<{
        questionsPerAttempt: number;
        passingScore: number;
        timeLimitMinutes: number;
        question: QuestionResult["questions"][0]["quiz"];
      }>(
        [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        { temperature: 0.7, maxTokens: 4096 }
      ),
    `mastery-question-${questionNumber}`
  );
}

export async function generateMasteryPool(
  lessonTitle: string,
  allSectionsContent: string,
  sectionCount: number
): Promise<{
  questionsPerAttempt: number;
  passingScore: number;
  timeLimitMinutes: number;
  questionPool: QuestionResult["questions"][0]["quiz"][];
}> {
  const questionsPerAttempt = Math.max(5, Math.min(10, sectionCount));
  const poolSize = questionsPerAttempt * 2;
  const questionPool: QuestionResult["questions"][0]["quiz"][] = [];
  let passingScore = 70;
  let timeLimitMinutes = 15;

  while (questionPool.length < poolSize) {
    const result = await generateMasteryQuestion(
      lessonTitle,
      allSectionsContent,
      questionsPerAttempt,
      questionPool.length + 1,
      poolSize,
      questionPool.map((question) => question.question)
    );

    if (!result.question) {
      throw new Error("Mastery generation returned no question");
    }

    passingScore = result.passingScore ?? passingScore;
    timeLimitMinutes = result.timeLimitMinutes ?? timeLimitMinutes;
    questionPool.push(result.question);
  }

  return {
    questionsPerAttempt,
    passingScore,
    timeLimitMinutes,
    questionPool: questionPool.slice(0, poolSize),
  };
}
