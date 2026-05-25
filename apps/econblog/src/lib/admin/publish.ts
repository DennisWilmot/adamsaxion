type PublishableLesson = {
  status: string;
  masteryQuiz?: unknown;
};

export function isLessonReadyToPublish(lesson: PublishableLesson) {
  if (lesson.status === "review" || lesson.status === "archived") {
    return true;
  }

  if (lesson.status === "mastery") {
    const mastery = lesson.masteryQuiz as
      | {
          generationProgress?: { complete?: boolean };
          questionPool?: unknown[];
        }
      | null
      | undefined;

    return Boolean(
      mastery?.generationProgress?.complete ||
        (mastery?.questionPool?.length ?? 0) > 0
    );
  }

  return false;
}
