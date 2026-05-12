import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  lessonGenerationJobs,
  lessons,
  lessonSources,
} from "@/db/schema";
import type {
  GenerationStage,
  LessonGenerationJobState,
} from "@/lib/admin/generation-state";
import {
  generateMasteryQuestion,
  generateOutline,
  generateSectionContent,
  generateSectionQuestions,
  runResearch,
} from "@/lib/admin/pipeline";

const ACTIVE_JOB_STATUSES = ["queued", "running"] as const;
const TERMINAL_JOB_STATUSES = ["completed", "failed", "cancelled"] as const;
const LESSON_STATUS_ORDER = [
  "research",
  "outline",
  "content",
  "questions",
  "mastery",
  "review",
  "published",
  "archived",
] as const;

type LessonRecord = typeof lessons.$inferSelect;
type LessonGenerationJob = typeof lessonGenerationJobs.$inferSelect;

function now() {
  return new Date();
}

export function estimateRemainingSteps(lesson: LessonRecord) {
  const statusIdx = LESSON_STATUS_ORDER.indexOf(
    lesson.status as (typeof LESSON_STATUS_ORDER)[number]
  );

  const needsResearch = statusIdx <= 0;
  const needsOutline = statusIdx <= 1;
  const needsContent = statusIdx <= 2;
  const needsQuestions = statusIdx <= 3;
  const needsMastery = statusIdx <= 4;

  const outlineData = lesson.outlineData as
    | { sections?: Array<unknown> }
    | null
    | undefined;
  const sectionCount = outlineData?.sections?.length ?? 8;

  const contentDone =
    ((lesson.contentProgress as { completedSections?: string[] } | null)
      ?.completedSections?.length ?? 0);
  const questionsDone =
    ((lesson.questionsProgress as { completedSections?: string[] } | null)
      ?.completedSections?.length ?? 0);

  let remainingSteps = 0;
  if (needsResearch) remainingSteps++;
  if (needsOutline) remainingSteps++;
  if (needsContent) remainingSteps += Math.max(sectionCount - contentDone, 0);
  if (needsQuestions) {
    remainingSteps += Math.max(sectionCount - questionsDone, 0);
  }
  if (needsMastery) remainingSteps++;

  return remainingSteps;
}

export async function getLessonById(lessonId: string) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return lesson ?? null;
}

export async function getActiveLessonJob(lessonId: string) {
  const [job] = await db
    .select()
    .from(lessonGenerationJobs)
    .where(
      and(
        eq(lessonGenerationJobs.lessonId, lessonId),
        inArray(lessonGenerationJobs.status, [...ACTIVE_JOB_STATUSES])
      )
    )
    .orderBy(desc(lessonGenerationJobs.createdAt))
    .limit(1);

  return job ?? null;
}

export async function listLessonJobs(lessonId: string, limit = 10) {
  return db
    .select()
    .from(lessonGenerationJobs)
    .where(eq(lessonGenerationJobs.lessonId, lessonId))
    .orderBy(desc(lessonGenerationJobs.createdAt))
    .limit(limit);
}

export async function listAdminJobs(limit = 8) {
  const activeJobs = await db
    .select({
      job: lessonGenerationJobs,
      lesson: {
        id: lessons.id,
        title: lessons.title,
        slug: lessons.slug,
        status: lessons.status,
      },
    })
    .from(lessonGenerationJobs)
    .innerJoin(lessons, eq(lessonGenerationJobs.lessonId, lessons.id))
    .where(inArray(lessonGenerationJobs.status, [...ACTIVE_JOB_STATUSES]))
    .orderBy(desc(lessonGenerationJobs.updatedAt))
    .limit(limit);

  const recentJobs = await db
    .select({
      job: lessonGenerationJobs,
      lesson: {
        id: lessons.id,
        title: lessons.title,
        slug: lessons.slug,
        status: lessons.status,
      },
    })
    .from(lessonGenerationJobs)
    .innerJoin(lessons, eq(lessonGenerationJobs.lessonId, lessons.id))
    .where(inArray(lessonGenerationJobs.status, [...TERMINAL_JOB_STATUSES]))
    .orderBy(desc(lessonGenerationJobs.updatedAt))
    .limit(limit);

  return { activeJobs, recentJobs };
}

export async function queueLessonGenerationJob(lessonId: string) {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const activeJob = await getActiveLessonJob(lessonId);
  if (activeJob) {
    return { job: activeJob, created: false };
  }

  const remainingSteps = estimateRemainingSteps(lesson);

  const [job] = await db
    .insert(lessonGenerationJobs)
    .values({
      lessonId,
      status: "queued",
      currentStage: lesson.status,
      currentStep:
        remainingSteps > 0
          ? "Queued. Waiting for worker to start..."
          : "Nothing left to generate.",
      progress: 0,
      total: remainingSteps,
      cancelRequested: false,
      updatedAt: now(),
    })
    .returning();

  return { job, created: true };
}

export async function cancelLessonGenerationJob(jobId: string) {
  const [job] = await db
    .select()
    .from(lessonGenerationJobs)
    .where(eq(lessonGenerationJobs.id, jobId))
    .limit(1);

  if (!job) {
    return null;
  }

  const [updated] =
    job.status === "queued"
      ? await db
          .update(lessonGenerationJobs)
          .set({
            status: "cancelled",
            cancelRequested: true,
            currentStep: "Cancelled before starting.",
            updatedAt: now(),
            finishedAt: now(),
          })
          .where(eq(lessonGenerationJobs.id, jobId))
          .returning()
      : await db
          .update(lessonGenerationJobs)
          .set({
            cancelRequested: true,
            updatedAt: now(),
          })
          .where(eq(lessonGenerationJobs.id, jobId))
          .returning();

  return updated ?? null;
}

export async function claimNextQueuedJob() {
  const [candidate] = await db
    .select()
    .from(lessonGenerationJobs)
    .where(
      and(
        eq(lessonGenerationJobs.status, "queued"),
        eq(lessonGenerationJobs.cancelRequested, false)
      )
    )
    .orderBy(asc(lessonGenerationJobs.createdAt))
    .limit(1);

  if (!candidate) {
    return null;
  }

  const [claimed] = await db
    .update(lessonGenerationJobs)
    .set({
      status: "running",
      startedAt: candidate.startedAt ?? now(),
      updatedAt: now(),
      currentStep: candidate.currentStep ?? "Starting job...",
    })
    .where(
      and(
        eq(lessonGenerationJobs.id, candidate.id),
        eq(lessonGenerationJobs.status, "queued")
      )
    )
    .returning();

  return claimed ?? null;
}

async function refreshJob(jobId: string) {
  const [job] = await db
    .select()
    .from(lessonGenerationJobs)
    .where(eq(lessonGenerationJobs.id, jobId))
    .limit(1);

  return job ?? null;
}

async function checkCancellation(jobId: string) {
  const job = await refreshJob(jobId);
  return !job || job.cancelRequested;
}

async function updateJob(
  jobId: string,
  updates: Partial<typeof lessonGenerationJobs.$inferInsert>
) {
  const [job] = await db
    .update(lessonGenerationJobs)
    .set({
      ...updates,
      updatedAt: now(),
    })
    .where(eq(lessonGenerationJobs.id, jobId))
    .returning();

  return job ?? null;
}

async function markCancelled(jobId: string, currentStep: string) {
  await updateJob(jobId, {
    status: "cancelled",
    currentStep,
    finishedAt: now(),
  });
}

async function markFailed(jobId: string, error: string) {
  await updateJob(jobId, {
    status: "failed",
    error,
    finishedAt: now(),
  });
}

async function setJobProgress(
  jobId: string,
  stage: GenerationStage,
  step: string,
  progress: number,
  total: number
) {
  await updateJob(jobId, {
    status: "running",
    currentStage: stage,
    currentStep: step,
    progress,
    total,
    error: null,
  });
}

export async function runLessonGenerationJob(jobId: string) {
  const job = await refreshJob(jobId);
  if (!job) {
    return;
  }

  try {
    let current = await getLessonById(job.lessonId);
    if (!current) {
      await markFailed(jobId, "Lesson not found");
      return;
    }

    const totalSteps = estimateRemainingSteps(current);
    if (totalSteps === 0) {
      await updateJob(jobId, {
        status: "completed",
        currentStage: "done",
        currentStep: "Nothing left to generate.",
        progress: 0,
        total: 0,
        finishedAt: now(),
      });
      return;
    }

    let completedSteps = 0;
    let researchNotes = current.researchNotes || "";
    let outlineData = current.outlineData as {
      sections: Array<{
        id: string;
        title: string;
        subsections: Array<{
          id: string;
          title: string;
          contentSummary: string;
          quizHint: string;
          quizType: string;
        }>;
      }>;
      suggestedTitle?: string;
      suggestedDescription?: string;
      estimatedMinutes?: number;
    } | null;
    let currentSections = (current.sections as Array<{
      id: string;
      title: string;
      subsections: Array<{
        id: string;
        title: string;
        content: string;
        quiz?: unknown;
      }>;
    }>) || [];

    const statusIdx = LESSON_STATUS_ORDER.indexOf(
      current.status as (typeof LESSON_STATUS_ORDER)[number]
    );
    const needsResearch = statusIdx <= 0;
    const needsOutline = statusIdx <= 1;
    const needsContent = statusIdx <= 2;
    const needsQuestions = statusIdx <= 3;
    const needsMastery = statusIdx <= 4;

    if (needsResearch) {
      if (await checkCancellation(jobId)) {
        await markCancelled(jobId, "Cancelled before research started.");
        return;
      }

      completedSteps++;
      await setJobProgress(
        jobId,
        "research",
        "Running AI web research...",
        completedSteps,
        totalSteps
      );

      const sources = await db
        .select()
        .from(lessonSources)
        .where(eq(lessonSources.lessonId, current.id));

      const uploadedContent: Array<{ content: string }> = [];
      for (const source of sources) {
        if (source.type !== "web_research") {
          uploadedContent.push({ content: source.content });
        }
      }

      const { notes, searchResults } = await runResearch(
        current.title,
        uploadedContent
      );

      const webSourcesToInsert = [];
      for (const searchResult of searchResults) {
        for (const result of searchResult.results.slice(0, 3)) {
          webSourcesToInsert.push({
            lessonId: current.id,
            type: "web_research" as const,
            title: result.title,
            content: result.snippet,
            sourceUrl: result.link,
          });
        }
      }

      await Promise.all(
        webSourcesToInsert.map((webSource) =>
          db.insert(lessonSources).values(webSource)
        )
      );

      researchNotes = notes;
      await db
        .update(lessons)
        .set({
          researchNotes: notes,
          status: "outline",
          updatedAt: now(),
        })
        .where(eq(lessons.id, current.id));

      current = (await getLessonById(current.id)) ?? current;
    }

    if (needsOutline) {
      if (await checkCancellation(jobId)) {
        await markCancelled(jobId, "Cancelled before outline generation.");
        return;
      }

      completedSteps++;
      await setJobProgress(
        jobId,
        "outline",
        "Generating lesson outline...",
        completedSteps,
        totalSteps
      );

      const outline = await generateOutline(
        current.title,
        researchNotes,
        current.category,
        current.difficulty
      );
      outlineData = outline as typeof outlineData;

      await db
        .update(lessons)
        .set({
          outlineData: outline as unknown as Record<string, unknown>,
          title: outline.suggestedTitle || current.title,
          description: outline.suggestedDescription || current.description,
          estimatedMinutes:
            outline.estimatedMinutes || current.estimatedMinutes,
          status: "content",
          updatedAt: now(),
        })
        .where(eq(lessons.id, current.id));

      current = (await getLessonById(current.id)) ?? current;
    }

    if (!outlineData?.sections) {
      await markFailed(jobId, "No outline data available.");
      return;
    }

    const sectionCount = outlineData.sections.length;
    const lessonTitle = current.title;

    if (needsContent) {
      const contentProgress = (current.contentProgress as {
        completedSections: string[];
      }) || { completedSections: [] };

      const completedSectionIds = new Set(contentProgress.completedSections);

      for (let i = 0; i < sectionCount; i++) {
        if (completedSectionIds.has(outlineData.sections[i].id)) {
          continue;
        }

        if (await checkCancellation(jobId)) {
          await markCancelled(
            jobId,
            `Cancelled during content generation at section ${i + 1}.`
          );
          return;
        }

        completedSteps++;
        await setJobProgress(
          jobId,
          "content",
          `Writing section ${i + 1} of ${sectionCount}: "${outlineData.sections[i].title}"`,
          completedSteps,
          totalSteps
        );

        const previousContent = currentSections
          .slice(0, i)
          .reduce<string[]>((sectionsContent, section) => {
            if (!section) {
              return sectionsContent;
            }

            sectionsContent.push(
              section.subsections
                .map((sub) => `### ${sub.title}\n${sub.content}`)
                .join("\n\n")
            );
            return sectionsContent;
          }, [])
          .join("\n\n---\n\n");

        const result = await generateSectionContent(
          current.title,
          lessonTitle,
          researchNotes,
          outlineData.sections[i] as Parameters<typeof generateSectionContent>[3],
          i,
          previousContent
        );

        currentSections[i] = {
          id: outlineData.sections[i].id,
          title: outlineData.sections[i].title,
          subsections: result.subsections.map((sub) => ({
            id: sub.id,
            title: sub.title,
            content: sub.content,
          })),
        };

        contentProgress.completedSections.push(outlineData.sections[i].id);
        completedSectionIds.add(outlineData.sections[i].id);

        const allContentDone =
          contentProgress.completedSections.length >= sectionCount;

        await db
          .update(lessons)
          .set({
            sections: currentSections as unknown as Record<string, unknown>[],
            contentProgress,
            status: allContentDone ? "questions" : "content",
            updatedAt: now(),
          })
          .where(eq(lessons.id, current.id));
      }

      current = (await getLessonById(current.id)) ?? current;
    }

    if (needsQuestions) {
      current = (await getLessonById(current.id)) ?? current;
      currentSections =
        (current.sections as typeof currentSections) || currentSections;
      const questionsProgress = (current.questionsProgress as {
        completedSections: string[];
      }) || { completedSections: [] };
      const completedQuestionIds = new Set(questionsProgress.completedSections);

      for (let i = 0; i < sectionCount; i++) {
        if (!currentSections[i]) continue;
        if (completedQuestionIds.has(currentSections[i].id)) continue;

        if (await checkCancellation(jobId)) {
          await markCancelled(
            jobId,
            `Cancelled during question generation at section ${i + 1}.`
          );
          return;
        }

        completedSteps++;
        await setJobProgress(
          jobId,
          "questions",
          `Generating questions for section ${i + 1} of ${sectionCount}: "${outlineData.sections[i].title}"`,
          completedSteps,
          totalSteps
        );

        const subsWithHints = currentSections[i].subsections.map((sub, j) => ({
          id: sub.id,
          title: sub.title,
          content: sub.content,
          quizType:
            outlineData.sections[i].subsections[j]?.quizType || "in-lesson",
          quizHint: outlineData.sections[i].subsections[j]?.quizHint || "",
        }));

        const result = await generateSectionQuestions(
          subsWithHints,
          lessonTitle,
          currentSections[i].title,
          i
        );

        currentSections[i] = {
          ...currentSections[i],
          subsections: currentSections[i].subsections.map((sub) => {
            const question = result.questions.find(
              (generatedQuestion) => generatedQuestion.subsectionId === sub.id
            );
            return question ? { ...sub, quiz: question.quiz } : sub;
          }),
        } as (typeof currentSections)[number];

        questionsProgress.completedSections.push(currentSections[i].id);
        completedQuestionIds.add(currentSections[i].id);

        const allQuestionsDone =
          questionsProgress.completedSections.length >= sectionCount;

        await db
          .update(lessons)
          .set({
            sections: currentSections as unknown as Record<string, unknown>[],
            questionsProgress,
            status: allQuestionsDone ? "mastery" : "questions",
            updatedAt: now(),
          })
          .where(eq(lessons.id, current.id));
      }

      current = (await getLessonById(current.id)) ?? current;
    }

    if (needsMastery) {
      const allContent = currentSections
        .reduce<string[]>((sectionsContent, section) => {
          if (!section) {
            return sectionsContent;
          }

          sectionsContent.push(
            `## ${section.title}\n${section.subsections
              .map((sub) => `### ${sub.title}\n${sub.content}`)
              .join("\n\n")}`
          );
          return sectionsContent;
        }, [])
        .join("\n\n---\n\n");

      const questionsPerAttempt = Math.max(5, Math.min(10, sectionCount));
      const targetCount = questionsPerAttempt * 2;
      const existingMastery = (current.masteryQuiz as {
        questionsPerAttempt?: number;
        passingScore?: number;
        timeLimitMinutes?: number;
        questionPool?: Array<Record<string, unknown>>;
      } | null) ?? null;
      const questionPool = [...(existingMastery?.questionPool ?? [])];
      let passingScore = existingMastery?.passingScore ?? 70;
      let timeLimitMinutes = existingMastery?.timeLimitMinutes ?? 15;

      completedSteps++;

      while (questionPool.length < targetCount) {
        if (await checkCancellation(jobId)) {
          await markCancelled(
            jobId,
            `Cancelled during mastery generation at ${questionPool.length}/${targetCount} questions.`
          );
          return;
        }

        await setJobProgress(
          jobId,
          "mastery",
          `Generating mastery question ${questionPool.length + 1} of ${targetCount} (${questionPool.length}/${targetCount} questions saved)`,
          completedSteps,
          totalSteps
        );

        const result = await generateMasteryQuestion(
          lessonTitle,
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
            updatedAt: now(),
          })
          .where(eq(lessons.id, current.id));
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
          updatedAt: now(),
        })
        .where(eq(lessons.id, current.id));
    }

    await updateJob(jobId, {
      status: "completed",
      currentStage: "done",
      currentStep: "Lesson generation complete. Ready for review.",
      progress: totalSteps,
      total: totalSteps,
      finishedAt: now(),
      error: null,
    });
  } catch (error) {
    await markFailed(
      jobId,
      error instanceof Error ? error.message : "Job failed"
    );
  }
}

export function serializeJob(
  job: LessonGenerationJob
): LessonGenerationJobState {
  return {
    id: job.id,
    lessonId: job.lessonId,
    status: job.status as LessonGenerationJobState["status"],
    currentStage: (job.currentStage as GenerationStage) ?? null,
    currentStep: job.currentStep,
    progress: job.progress,
    total: job.total,
    error: job.error,
    cancelRequested: job.cancelRequested,
    createdAt: job.createdAt.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    updatedAt: job.updatedAt.toISOString(),
    finishedAt: job.finishedAt?.toISOString() ?? null,
  };
}
