import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons, lessonSources } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  runResearch,
  generateOutline,
  generateSectionContent,
  generateSectionQuestions,
  generateMasteryQuestion,
} from "@/lib/admin/pipeline";
import { getActiveLessonJob } from "@/lib/admin/lesson-generation-runner";

export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage, sectionIndex } = body;

    const activeJob = await getActiveLessonJob(id);
    if (activeJob) {
      return NextResponse.json(
        {
          error:
            "A background generation job is already running for this lesson.",
        },
        { status: 409 }
      );
    }

    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    switch (stage) {
      case "research": {
        const sources = await db
          .select()
          .from(lessonSources)
          .where(eq(lessonSources.lessonId, id));

        const uploadedContent = sources
          .filter((s) => s.type !== "web_research")
          .map((s) => ({ content: s.content }));

        const { notes, searchResults } = await runResearch(
          lesson.title,
          uploadedContent
        );

        for (const sr of searchResults) {
          for (const r of sr.results.slice(0, 3)) {
            await db.insert(lessonSources).values({
              lessonId: id,
              type: "web_research",
              title: r.title,
              content: r.snippet,
              sourceUrl: r.link,
            });
          }
        }

        await db
          .update(lessons)
          .set({ researchNotes: notes, updatedAt: new Date() })
          .where(eq(lessons.id, id));

        return NextResponse.json({ notes, searchResults });
      }

      case "outline": {
        if (!lesson.researchNotes) {
          return NextResponse.json(
            { error: "Research must be completed first" },
            { status: 400 }
          );
        }

        const outline = await generateOutline(
          lesson.title,
          lesson.researchNotes,
          lesson.category,
          lesson.difficulty
        );

        await db
          .update(lessons)
          .set({
            outlineData: outline as unknown as Record<string, unknown>,
            title: outline.suggestedTitle || lesson.title,
            description: outline.suggestedDescription || lesson.description,
            estimatedMinutes: outline.estimatedMinutes || lesson.estimatedMinutes,
            status: "outline",
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, id));

        return NextResponse.json({ outline });
      }

      case "content": {
        if (sectionIndex === undefined || sectionIndex === null) {
          return NextResponse.json(
            { error: "sectionIndex required for content generation" },
            { status: 400 }
          );
        }

        const outlineRaw = lesson.outlineData as { sections: Array<{
          id: string;
          title: string;
          subsections: Array<{
            id: string;
            title: string;
            contentSummary: string;
            quizHint: string;
            quizType: string;
          }>;
        }> } | null;

        if (!outlineRaw?.sections?.[sectionIndex]) {
          return NextResponse.json(
            { error: "Invalid section index or outline not generated" },
            { status: 400 }
          );
        }

        const outlineSection = {
          ...outlineRaw.sections[sectionIndex],
          subsections: outlineRaw.sections[sectionIndex].subsections.map((sub) => ({
            ...sub,
            quizType: sub.quizType as "intuition" | "in-lesson" | "recap",
          })),
        };

        const currentSections = (lesson.sections as Array<{
          id: string;
          title: string;
          subsections: Array<{ id: string; title: string; content: string }>;
        }>) || [];

        const previousContent = currentSections
          .slice(0, sectionIndex)
          .map((s) =>
            s.subsections.map((sub) => `### ${sub.title}\n${sub.content}`).join("\n\n")
          )
          .join("\n\n---\n\n");

        const result = await generateSectionContent(
          lesson.title,
          lesson.title,
          lesson.researchNotes || "",
          outlineSection,
          sectionIndex,
          previousContent
        );

        const updatedSections = [...currentSections];
        updatedSections[sectionIndex] = {
          id: outlineSection.id,
          title: outlineSection.title,
          subsections: result.subsections.map((sub) => ({
            id: sub.id,
            title: sub.title,
            content: sub.content,
          })),
        };

        const progress = (lesson.contentProgress as { completedSections: string[] }) || { completedSections: [] };
        const sectionId = outlineSection.id;
        if (!progress.completedSections.includes(sectionId)) {
          progress.completedSections.push(sectionId);
        }

        const allDone = progress.completedSections.length >= (outlineRaw?.sections?.length ?? 8);

        await db
          .update(lessons)
          .set({
            sections: updatedSections as unknown as Record<string, unknown>[],
            contentProgress: progress,
            status: allDone ? "questions" : "content",
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, id));

        return NextResponse.json({ section: updatedSections[sectionIndex], progress });
      }

      case "questions": {
        if (sectionIndex === undefined || sectionIndex === null) {
          return NextResponse.json(
            { error: "sectionIndex required for question generation" },
            { status: 400 }
          );
        }

        const qOutline = lesson.outlineData as { sections: Array<{
          id: string;
          title: string;
          subsections: Array<{
            id: string;
            title: string;
            contentSummary: string;
            quizHint: string;
            quizType: string;
          }>;
        }> } | null;

        const currentSections = (lesson.sections as Array<{
          id: string;
          title: string;
          subsections: Array<{
            id: string;
            title: string;
            content: string;
            quiz?: Record<string, unknown>;
          }>;
        }>) || [];

        const section = currentSections[sectionIndex];
        const outlineSection = qOutline?.sections?.[sectionIndex];
        if (!section || !outlineSection) {
          return NextResponse.json(
            { error: "Section content must be generated first" },
            { status: 400 }
          );
        }

        const subsWithHints = section.subsections.map((sub, i) => ({
          id: sub.id,
          title: sub.title,
          content: sub.content,
          quizType: outlineSection.subsections[i]?.quizType || "in-lesson",
          quizHint: outlineSection.subsections[i]?.quizHint || "",
        }));

        const result = await generateSectionQuestions(
          subsWithHints,
          lesson.title,
          section.title,
          sectionIndex
        );

        const updatedSections = [...currentSections];
        updatedSections[sectionIndex] = {
          ...section,
          subsections: section.subsections.map((sub) => {
            const q = result.questions.find((rq) => rq.subsectionId === sub.id);
            return q ? { ...sub, quiz: q.quiz } : sub;
          }),
        };

        const progress = (lesson.questionsProgress as { completedSections: string[] }) || { completedSections: [] };
        if (!progress.completedSections.includes(section.id)) {
          progress.completedSections.push(section.id);
        }

        const totalSections = qOutline?.sections?.length ?? 8;
        const allDone = progress.completedSections.length >= totalSections;

        await db
          .update(lessons)
          .set({
            sections: updatedSections as unknown as Record<string, unknown>[],
            questionsProgress: progress,
            status: allDone ? "mastery" : "questions",
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, id));

        return NextResponse.json({ section: updatedSections[sectionIndex], progress });
      }

      case "mastery": {
        const currentSections = (lesson.sections as Array<{
          id: string;
          title: string;
          subsections: Array<{ id: string; title: string; content: string }>;
        }>) || [];

        const allContent = currentSections
          .map((s) =>
            `## ${s.title}\n${s.subsections.map((sub) => `### ${sub.title}\n${sub.content}`).join("\n\n")}`
          )
          .join("\n\n---\n\n");
        const questionsPerAttempt = Math.max(
          5,
          Math.min(10, currentSections.length)
        );
        const targetCount = questionsPerAttempt * 2;
        const existingMastery = (lesson.masteryQuiz as {
          questionsPerAttempt?: number;
          passingScore?: number;
          timeLimitMinutes?: number;
          questionPool?: Array<Record<string, unknown>>;
        } | null) ?? null;
        const questionPool = [...(existingMastery?.questionPool ?? [])];
        let passingScore = existingMastery?.passingScore ?? 70;
        let timeLimitMinutes = existingMastery?.timeLimitMinutes ?? 15;

        while (questionPool.length < targetCount) {
          const result = await generateMasteryQuestion(
            lesson.title,
            allContent,
            questionsPerAttempt,
            questionPool.length + 1,
            targetCount,
            questionPool.map((question) => String(question.question ?? ""))
          );

          if (!result.question) {
            throw new Error("Mastery generation returned no question");
          }

          passingScore = result.passingScore ?? passingScore;
          timeLimitMinutes = result.timeLimitMinutes ?? timeLimitMinutes;
          questionPool.push(result.question);

          await db
            .update(lessons)
            .set({
              masteryQuiz: {
                questionsPerAttempt,
                passingScore,
                timeLimitMinutes,
                questionPool: questionPool.slice(0, targetCount),
                generationProgress: {
                  generatedCount: Math.min(questionPool.length, targetCount),
                  targetCount,
                  complete: questionPool.length >= targetCount,
                  lastUpdatedAt: new Date().toISOString(),
                },
              } as unknown as Record<string, unknown>,
              status: "mastery",
              updatedAt: new Date(),
            })
            .where(eq(lessons.id, id));
        }

        await db
          .update(lessons)
          .set({
            masteryQuiz: {
              questionsPerAttempt,
              passingScore,
              timeLimitMinutes,
              questionPool: questionPool.slice(0, targetCount),
              generationProgress: {
                generatedCount: targetCount,
                targetCount,
                complete: true,
                lastUpdatedAt: new Date().toISOString(),
              },
            } as unknown as Record<string, unknown>,
            status: "review",
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, id));

        return NextResponse.json({
          mastery: {
            questionsPerAttempt,
            passingScore,
            timeLimitMinutes,
            questionPool: questionPool.slice(0, targetCount),
            generationProgress: {
              generatedCount: targetCount,
              targetCount,
              complete: true,
              lastUpdatedAt: new Date().toISOString(),
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown stage: ${stage}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`POST /api/admin/lessons/[id]/generate error:`, error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
