export type GenerationStage =
  | "research"
  | "outline"
  | "content"
  | "questions"
  | "mastery"
  | "done"
  | null;

export type GenerationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface LessonGenerationJobState {
  id: string;
  lessonId: string;
  status: GenerationStatus;
  currentStage: GenerationStage;
  currentStep: string | null;
  progress: number;
  total: number;
  error: string | null;
  cancelRequested: boolean;
  createdAt: string;
  startedAt: string | null;
  updatedAt: string | null;
  finishedAt: string | null;
}

export const ACTIVE_JOB_STATUSES: GenerationStatus[] = ["queued", "running"];
export const TERMINAL_JOB_STATUSES: GenerationStatus[] = [
  "completed",
  "failed",
  "cancelled",
];

export function normalizeLessonGenerationJob(
  raw: unknown
): LessonGenerationJobState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const state = raw as Partial<LessonGenerationJobState>;

  if (
    typeof state.id !== "string" ||
    typeof state.lessonId !== "string" ||
    typeof state.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: state.id,
    lessonId: state.lessonId,
    status:
      state.status === "queued" ||
      state.status === "running" ||
      state.status === "completed" ||
      state.status === "failed" ||
      state.status === "cancelled"
        ? state.status
        : "queued",
    currentStage:
      state.currentStage === "research" ||
      state.currentStage === "outline" ||
      state.currentStage === "content" ||
      state.currentStage === "questions" ||
      state.currentStage === "mastery" ||
      state.currentStage === "done"
        ? state.currentStage
        : null,
    currentStep:
      typeof state.currentStep === "string" ? state.currentStep : null,
    progress:
      typeof state.progress === "number" && Number.isFinite(state.progress)
        ? state.progress
        : 0,
    total:
      typeof state.total === "number" && Number.isFinite(state.total)
        ? state.total
        : 0,
    error: typeof state.error === "string" ? state.error : null,
    cancelRequested: Boolean(state.cancelRequested),
    createdAt: state.createdAt,
    startedAt:
      typeof state.startedAt === "string" ? state.startedAt : null,
    updatedAt:
      typeof state.updatedAt === "string" ? state.updatedAt : null,
    finishedAt:
      typeof state.finishedAt === "string" ? state.finishedAt : null,
  };
}

export function isGenerationActive(state: Pick<LessonGenerationJobState, "status">) {
  return ACTIVE_JOB_STATUSES.includes(state.status);
}

export function canResumeGeneration(
  state: Pick<LessonGenerationJobState, "status">
) {
  return state.status === "failed" || state.status === "cancelled";
}

export function isGenerationStale(
  state: Pick<LessonGenerationJobState, "status" | "updatedAt">,
  staleAfterMs = 10 * 60 * 1000
) {
  if (!isGenerationActive(state) || !state.updatedAt) {
    return false;
  }

  return Date.now() - new Date(state.updatedAt).getTime() > staleAfterMs;
}

export function getJobStageSummary(job: Pick<LessonGenerationJobState, "currentStage" | "currentStep">) {
  if (job.currentStage === "mastery" && job.currentStep) {
    const savedMatch = job.currentStep.match(/\((\d+)\/(\d+) questions saved\)/i);
    if (savedMatch) {
      return `Mastery ${savedMatch[1]}/${savedMatch[2]}`;
    }

    const questionMatch = job.currentStep.match(/question\s+(\d+)\s+of\s+(\d+)/i);
    if (questionMatch) {
      const completed = Math.max(0, Number(questionMatch[1]) - 1);
      return `Mastery ${completed}/${questionMatch[2]}`;
    }
  }

  if (job.currentStage) {
    return job.currentStage.charAt(0).toUpperCase() + job.currentStage.slice(1);
  }

  return "Queued";
}
