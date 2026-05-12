/**
 * Batch lesson generator — create and fully generate multiple lessons.
 *
 * Usage:
 *   pnpm tsx scripts/batch-generate.ts topics.json
 *   pnpm tsx scripts/batch-generate.ts --resume
 *
 * topics.json format:
 * [
 *   { "topic": "Supply and Demand", "category": "Microeconomics", "difficulty": "Beginner" },
 *   { "topic": "Monetary Policy", "category": "Macroeconomics", "difficulty": "Intermediate" }
 * ]
 *
 * --resume: skip lesson creation, just generate any lessons stuck in incomplete states
 */

import fs from "fs";
import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import {
  runResearch,
  generateOutline,
  generateSectionContent,
  generateSectionQuestions,
  generateMasteryPool,
} from "../src/lib/admin/pipeline";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set. Make sure .env is loaded.");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(sql, { schema });

interface TopicInput {
  topic: string;
  category: string;
  difficulty: string;
}

const STATUS_ORDER = ["research", "outline", "content", "questions", "mastery", "review", "published"];

async function generateLesson(lessonId: string) {
  const [lesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, lessonId)).limit(1);
  if (!lesson) {
    console.error(`  Lesson ${lessonId} not found, skipping`);
    return;
  }

  const statusIdx = STATUS_ORDER.indexOf(lesson.status);
  if (statusIdx >= 5) {
    console.log(`  Already in "${lesson.status}", skipping`);
    return;
  }

  let researchNotes = lesson.researchNotes || "";
  let outlineData = lesson.outlineData as {
    sections: Array<{
      id: string; title: string;
      subsections: Array<{ id: string; title: string; contentSummary: string; quizHint: string; quizType: string }>;
    }>;
    suggestedTitle?: string; suggestedDescription?: string; estimatedMinutes?: number;
  } | null;

  let currentSections = (lesson.sections as Array<{
    id: string; title: string;
    subsections: Array<{ id: string; title: string; content: string; quiz?: unknown }>;
  }>) || [];

  // --- RESEARCH ---
  if (statusIdx <= 0) {
    console.log(`  [1/5] Research...`);
    const sources = await db.select().from(schema.lessonSources).where(eq(schema.lessonSources.lessonId, lessonId));
    const uploadedContent = sources.filter((s) => s.type !== "web_research").map((s) => ({ content: s.content }));
    const { notes, searchResults } = await runResearch(lesson.title, uploadedContent);

    for (const sr of searchResults) {
      for (const r of sr.results.slice(0, 3)) {
        await db.insert(schema.lessonSources).values({ lessonId, type: "web_research", title: r.title, content: r.snippet, sourceUrl: r.link });
      }
    }
    researchNotes = notes;
    await db.update(schema.lessons).set({ researchNotes: notes, status: "outline", updatedAt: new Date() }).where(eq(schema.lessons.id, lessonId));
  }

  // --- OUTLINE ---
  if (statusIdx <= 1) {
    console.log(`  [2/5] Outline...`);
    const outline = await generateOutline(lesson.title, researchNotes, lesson.category, lesson.difficulty);
    outlineData = outline as typeof outlineData;
    await db.update(schema.lessons).set({
      outlineData: outline as unknown as Record<string, unknown>,
      title: outline.suggestedTitle || lesson.title,
      description: outline.suggestedDescription || lesson.description,
      estimatedMinutes: outline.estimatedMinutes || lesson.estimatedMinutes,
      status: "content",
      updatedAt: new Date(),
    }).where(eq(schema.lessons.id, lessonId));
  }

  if (!outlineData?.sections) {
    console.error(`  No outline data, cannot continue`);
    return;
  }

  const sectionCount = outlineData.sections.length;
  const lessonTitle = outlineData.suggestedTitle || lesson.title;

  // --- CONTENT ---
  if (statusIdx <= 2) {
    const contentProgress = (lesson.contentProgress as { completedSections: string[] }) || { completedSections: [] };

    for (let i = 0; i < sectionCount; i++) {
      if (contentProgress.completedSections.includes(outlineData.sections[i].id)) continue;

      console.log(`  [3/5] Content section ${i + 1}/${sectionCount}: "${outlineData.sections[i].title}"`);

      const previousContent = currentSections
        .slice(0, i).filter(Boolean)
        .map((s) => s.subsections.map((sub) => `### ${sub.title}\n${sub.content}`).join("\n\n"))
        .join("\n\n---\n\n");

      const result = await generateSectionContent(
        lesson.title, lessonTitle, researchNotes,
        outlineData.sections[i] as Parameters<typeof generateSectionContent>[3],
        i, previousContent
      );

      currentSections[i] = {
        id: outlineData.sections[i].id,
        title: outlineData.sections[i].title,
        subsections: result.subsections.map((sub) => ({ id: sub.id, title: sub.title, content: sub.content })),
      };

      contentProgress.completedSections.push(outlineData.sections[i].id);
      const allDone = contentProgress.completedSections.length >= sectionCount;
      await db.update(schema.lessons).set({
        sections: currentSections as unknown as Record<string, unknown>[],
        contentProgress,
        status: allDone ? "questions" : "content",
        updatedAt: new Date(),
      }).where(eq(schema.lessons.id, lessonId));
    }
  }

  // --- QUESTIONS ---
  if (statusIdx <= 3) {
    const [freshLesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, lessonId)).limit(1);
    currentSections = (freshLesson.sections as typeof currentSections) || currentSections;
    const questionsProgress = (freshLesson.questionsProgress as { completedSections: string[] }) || { completedSections: [] };

    for (let i = 0; i < sectionCount; i++) {
      if (!currentSections[i]) continue;
      if (questionsProgress.completedSections.includes(currentSections[i].id)) continue;

      console.log(`  [4/5] Questions section ${i + 1}/${sectionCount}: "${outlineData.sections[i].title}"`);

      const subsWithHints = currentSections[i].subsections.map((sub, j) => ({
        id: sub.id, title: sub.title, content: sub.content,
        quizType: outlineData!.sections[i].subsections[j]?.quizType || "in-lesson",
        quizHint: outlineData!.sections[i].subsections[j]?.quizHint || "",
      }));

      const result = await generateSectionQuestions(subsWithHints, lessonTitle, currentSections[i].title, i);

      currentSections[i] = {
        ...currentSections[i],
        subsections: currentSections[i].subsections.map((sub) => {
          const q = result.questions.find((rq) => rq.subsectionId === sub.id);
          return q ? { ...sub, quiz: q.quiz } : sub;
        }),
      } as typeof currentSections[number];

      questionsProgress.completedSections.push(currentSections[i].id);
      const allDone = questionsProgress.completedSections.length >= sectionCount;
      await db.update(schema.lessons).set({
        sections: currentSections as unknown as Record<string, unknown>[],
        questionsProgress,
        status: allDone ? "mastery" : "questions",
        updatedAt: new Date(),
      }).where(eq(schema.lessons.id, lessonId));
    }
  }

  // --- MASTERY ---
  if (statusIdx <= 4) {
    console.log(`  [5/5] Mastery pool...`);
    const allContent = currentSections.filter(Boolean)
      .map((s) => `## ${s.title}\n${s.subsections.map((sub) => `### ${sub.title}\n${sub.content}`).join("\n\n")}`)
      .join("\n\n---\n\n");

    const mastery = await generateMasteryPool(lessonTitle, allContent, sectionCount);

    await db.update(schema.lessons).set({
      masteryQuiz: mastery as unknown as Record<string, unknown>,
      status: "review",
      updatedAt: new Date(),
    }).where(eq(schema.lessons.id, lessonId));
  }

  console.log(`  Done — status: review`);
}

async function main() {
  const args = process.argv.slice(2);
  const isResume = args.includes("--resume");

  let lessonIds: string[] = [];

  if (isResume) {
    // Resume: find all incomplete lessons
    const incomplete = await db.select({ id: schema.lessons.id, title: schema.lessons.title, status: schema.lessons.status })
      .from(schema.lessons)
      .where(eq(schema.lessons.status, "research"))
      .then(rows => rows);

    // Also grab outline, content, questions, mastery statuses
    for (const status of ["outline", "content", "questions", "mastery"]) {
      const rows = await db.select({ id: schema.lessons.id, title: schema.lessons.title, status: schema.lessons.status })
        .from(schema.lessons)
        .where(eq(schema.lessons.status, status));
      incomplete.push(...rows);
    }

    if (incomplete.length === 0) {
      console.log("No incomplete lessons found. Nothing to resume.");
      await sql.end();
      return;
    }

    console.log(`Found ${incomplete.length} incomplete lesson(s):`);
    incomplete.forEach((l) => console.log(`  - "${l.title}" [${l.status}]`));
    lessonIds = incomplete.map((l) => l.id);
  } else {
    // Create from topics file
    const topicsFile = args.find((a) => !a.startsWith("--"));
    if (!topicsFile) {
      console.error("Usage: pnpm tsx scripts/batch-generate.ts <topics.json> | --resume");
      await sql.end();
      process.exit(1);
    }

    const filePath = path.resolve(topicsFile);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      await sql.end();
      process.exit(1);
    }

    const topics: TopicInput[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`Creating ${topics.length} lesson(s)...`);

    for (const t of topics) {
      const slug = t.topic.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
      const [created] = await db.insert(schema.lessons).values({
        slug,
        title: t.topic,
        category: t.category,
        difficulty: t.difficulty,
        status: "research",
        sections: [],
        contentProgress: { completedSections: [] },
        questionsProgress: { completedSections: [] },
      }).returning();
      console.log(`  Created: "${t.topic}" (${created.id})`);
      lessonIds.push(created.id);
    }
  }

  // Generate each lesson sequentially
  console.log(`\nGenerating ${lessonIds.length} lesson(s)...\n`);

  for (let i = 0; i < lessonIds.length; i++) {
    const [lesson] = await db.select({ title: schema.lessons.title, status: schema.lessons.status })
      .from(schema.lessons).where(eq(schema.lessons.id, lessonIds[i])).limit(1);

    console.log(`\n[${i + 1}/${lessonIds.length}] "${lesson.title}" (${lesson.status})`);

    try {
      await generateLesson(lessonIds[i]);
    } catch (err) {
      console.error(`  FAILED: ${err instanceof Error ? err.message : err}`);
      console.error(`  Continuing with next lesson...`);
    }
  }

  console.log(`\nBatch complete. ${lessonIds.length} lesson(s) processed.`);
  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
