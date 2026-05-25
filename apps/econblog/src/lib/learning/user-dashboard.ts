import { db } from "@/db";
import { lessonProgress, profiles, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadLessonMetaBySlug, loadPublishedLessonSlugs } from "@/lib/lesson-loader";
import { canonicalLessonId, isLessonZeroSlug } from "@/lib/constants/lessons";
import {
  buildLearningPath,
  getDefaultFundamentalsPath,
  type PathLessonItem,
} from "./path-engine";
import { getInterestTag, type InterestTagId } from "./interest-tags";
import {
  buildActivityDays,
  computeStreakDays,
  fetchRecentActivityDates,
  getUserLeaderboardRank,
  type ActivityDay,
  type CompletedLessonRecord,
} from "./profile-progress";

export type PathTimelineState = "completed" | "current" | "upcoming" | "coming_soon";

export type PathLessonListState =
  | "completed"
  | "in_progress"
  | "up_next"
  | "locked"
  | "coming_soon";

export interface PathTimelineItem {
  corpusId: number;
  slug: string | null;
  title: string;
  state: PathTimelineState;
}

export interface PathLessonListItem {
  corpusId: number;
  slug: string | null;
  title: string;
  state: PathLessonListState;
  listIndex: number;
}

export interface ContinueLessonCard {
  slug: string;
  title: string;
  estimatedMinutes: number;
  totalXp: number;
  thumbnail: string;
  listIndex: number;
}

export interface UserDashboard {
  profile: {
    username: string;
    totalXp: number;
    currentLevel: number;
  };
  preferences: {
    primaryInterestId: string | null;
    primaryInterestLabel: string | null;
    secondaryInterestIds: string[];
    pathSetupComplete: boolean;
    pathSetupSkipped: boolean;
    needsPathSetup: boolean;
  };
  path: {
    title: string;
    tagline: string;
    whyDescription: string;
    continue: PathLessonItem | null;
    continueCard: ContinueLessonCard | null;
    upNext: PathLessonItem[];
    timeline: PathTimelineItem[];
    /** Published lessons in path order (UI source of truth). */
    lessons: PathLessonListItem[];
    completedCount: number;
    totalCount: number;
    /** Full curriculum slots including not-yet-published. */
    plannedCount: number;
  };
  progress: {
    completedLessons: CompletedLessonRecord[];
    activityDays: ActivityDay[];
    streakDays: number;
    rank: number | null;
  };
}

type ProfileRow = typeof profiles.$inferSelect;

function buildWhyDescription(
  primaryId: InterestTagId | null,
  lessonCount: number
): string {
  const primary = primaryId ? getInterestTag(primaryId) : null;
  if (primary) {
    return `You said you wanted ${primary.label.toLowerCase()}. We've sequenced ${lessonCount} lessons from foundations through your focus areas.`;
  }
  return `We've sequenced ${lessonCount} lessons from inflation through markets and behavior.`;
}

function resolvePathLessonState(
  lesson: PathLessonItem,
  input: {
    completedSlugs: string[];
    continueCorpusId: number | null;
    inProgressSlugs: Set<string>;
    hasLessonAccess: boolean;
  }
): PathLessonListState {
  if (lesson.status !== "published" || !lesson.slug) {
    return "coming_soon";
  }

  const slug = canonicalLessonId(lesson.slug);
  if (input.completedSlugs.includes(slug)) {
    return "completed";
  }

  if (
    lesson.corpusId === input.continueCorpusId ||
    input.inProgressSlugs.has(slug)
  ) {
    return "in_progress";
  }

  if (!input.hasLessonAccess && !isLessonZeroSlug(slug)) {
    return "locked";
  }

  return "up_next";
}

export async function getUserDashboard(
  userId: string,
  profile?: ProfileRow,
  options?: { hasLessonAccess?: boolean }
): Promise<UserDashboard | null> {
  const resolvedProfile =
    profile ??
    (
      await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1)
    )[0];

  if (!resolvedProfile) return null;

  const hasLessonAccess = options?.hasLessonAccess ?? false;

  const since = new Date();
  since.setDate(since.getDate() - 99);
  since.setHours(0, 0, 0, 0);

  const [prefsRows, publishedSlugs, progressRows, activityDates, rank] =
    await Promise.all([
      db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1),
      loadPublishedLessonSlugs(),
      db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId)),
      fetchRecentActivityDates(userId, since),
      getUserLeaderboardRank(userId, resolvedProfile.totalXp),
    ]);

  const prefs = prefsRows[0];

  const completedSlugs = progressRows
    .filter((p) => p.masteryPassed)
    .map((p) => canonicalLessonId(p.lessonId));

  const inProgressSlugs = new Set(
    progressRows
      .filter((p) => !p.masteryPassed && p.completedSubsections.length > 0)
      .map((p) => canonicalLessonId(p.lessonId))
  );

  const primaryId = (prefs?.primaryInterestId ?? null) as InterestTagId | null;
  const secondaryIds = (prefs?.secondaryInterestIds ?? []) as InterestTagId[];

  const path =
    primaryId && getInterestTag(primaryId)
      ? buildLearningPath({
          primaryInterestId: primaryId,
          secondaryInterestIds: secondaryIds,
          completedLessonSlugs: completedSlugs,
          publishedSlugs,
        })
      : getDefaultFundamentalsPath(publishedSlugs);

  const continueItem =
    path.lessons.find(
      (l) =>
        l.status === "published" &&
        l.slug &&
        !completedSlugs.includes(canonicalLessonId(l.slug))
    ) ?? null;

  const upNext = path.lessons
    .filter(
      (l) =>
        l.status === "published" &&
        l.slug &&
        l.corpusId !== continueItem?.corpusId &&
        !completedSlugs.includes(canonicalLessonId(l.slug))
    )
    .slice(0, 5);

  const timeline: PathTimelineItem[] = path.lessons.slice(0, 10).map((lesson) => {
    const slug = lesson.slug;
    const completed =
      slug != null && completedSlugs.includes(canonicalLessonId(slug));
    const isCurrent = lesson.corpusId === continueItem?.corpusId;

    let state: PathTimelineState = "coming_soon";
    if (completed) state = "completed";
    else if (isCurrent) state = "current";
    else if (lesson.status === "published" && slug) state = "upcoming";

    return {
      corpusId: lesson.corpusId,
      slug,
      title: lesson.title,
      state,
    };
  });

  const pathPublished = path.lessons.filter((l) => l.status === "published" && l.slug);
  const pathCompletedCount = pathPublished.filter((l) =>
    completedSlugs.includes(canonicalLessonId(l.slug!))
  ).length;

  const pathLessons: PathLessonListItem[] = pathPublished.map((lesson, index) => ({
    corpusId: lesson.corpusId,
    slug: lesson.slug,
    title: lesson.title,
    listIndex: index + 1,
    state: resolvePathLessonState(lesson, {
      completedSlugs,
      continueCorpusId: continueItem?.corpusId ?? null,
      inProgressSlugs,
      hasLessonAccess,
    }),
  }));

  const pathSetupComplete = !!prefs?.pathSetupCompletedAt;
  const pathSetupSkipped = !!prefs?.pathSetupSkippedAt && !pathSetupComplete;

  const primaryLabel = primaryId
    ? (getInterestTag(primaryId)?.label ?? null)
    : null;

  let continueCard: ContinueLessonCard | null = null;
  if (continueItem?.slug) {
    const meta = await loadLessonMetaBySlug(continueItem.slug);
    if (meta) {
      continueCard = {
        slug: meta.id,
        title: meta.title,
        estimatedMinutes: meta.estimatedMinutes,
        totalXp: meta.totalXp,
        thumbnail: meta.thumbnail,
        listIndex:
          pathLessons.find((l) => l.corpusId === continueItem.corpusId)?.listIndex ??
          1,
      };
    }
  }

  const completedProgress = progressRows.filter((p) => p.masteryPassed);
  const completedSlugSet = completedProgress.map((p) => canonicalLessonId(p.lessonId));
  const titleBySlug = new Map(
    pathPublished.map((l) => [canonicalLessonId(l.slug!), l.title])
  );

  const missingSlugs = completedSlugSet.filter((slug) => !titleBySlug.has(slug));
  if (missingSlugs.length > 0) {
    const metaRows = await Promise.all(
      missingSlugs.map((slug) => loadLessonMetaBySlug(slug))
    );
    for (const meta of metaRows) {
      if (meta) titleBySlug.set(meta.id, meta.title);
    }
  }

  const completedLessons: CompletedLessonRecord[] = completedProgress
    .map((row) => ({
      slug: canonicalLessonId(row.lessonId),
      title: titleBySlug.get(canonicalLessonId(row.lessonId)) ?? row.lessonId,
      completedAt: (row.completedAt ?? row.updatedAt).toISOString(),
      xpEarned: row.totalXpEarned,
    }))
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  const activityDays = buildActivityDays(
    activityDates.attemptDates,
    activityDates.progressDates
  );

  return {
    profile: {
      username: resolvedProfile.username,
      totalXp: resolvedProfile.totalXp,
      currentLevel: resolvedProfile.currentLevel,
    },
    preferences: {
      primaryInterestId: prefs?.primaryInterestId ?? null,
      primaryInterestLabel: primaryLabel,
      secondaryInterestIds: secondaryIds,
      pathSetupComplete,
      pathSetupSkipped,
      needsPathSetup: !pathSetupComplete,
    },
    path: {
      title: primaryLabel ?? "Your learning path",
      tagline: path.tagline,
      whyDescription: buildWhyDescription(primaryId, pathLessons.length),
      continue: continueItem,
      continueCard,
      upNext,
      timeline,
      lessons: pathLessons,
      completedCount: pathCompletedCount,
      totalCount: pathLessons.length,
      plannedCount: path.lessons.length,
    },
    progress: {
      completedLessons,
      activityDays,
      streakDays: computeStreakDays(activityDays),
      rank,
    },
  };
}
