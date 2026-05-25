import { db } from "@/db";
import { lessonProgress, profiles, userPreferences } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { STATIC_CAROUSEL_LESSONS } from "@/lib/landing/carousel-manifest";
import { getPublishedLessonSlugs } from "@/lib/learning/published-lesson-slugs";
import { loadLessonMetaBySlugs } from "@/lib/lesson-loader";
import { canonicalLessonId, isLessonZeroSlug } from "@/lib/constants/lessons";
import { getUserSubscriptionView } from "@/lib/subscription/service";
import {
  buildLearningPath,
  getDefaultFundamentalsPath,
  type PathLessonItem,
} from "./path-engine";
import { getInterestTag, type InterestTagId } from "./interest-tags";
import {
  computeStreakDays,
  fetchActivityDays,
  getUserLeaderboardRank,
  type ActivityDay,
  type CompletedLessonRecord,
} from "./profile-progress";

export type PathTimelineState = "completed" | "current" | "upcoming" | "coming_soon";

export interface PathTimelineItem {
  corpusId: number;
  slug: string | null;
  title: string;
  state: PathTimelineState;
}

export type PathLessonListState =
  | "completed"
  | "in_progress"
  | "up_next"
  | "locked"
  | "coming_soon";

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

export interface UserProgressSection {
  completedLessons: CompletedLessonRecord[];
  activityDays: ActivityDay[];
  streakDays: number;
  rank: number | null;
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
    timeline: PathTimelineItem[];
    /** Published lessons in path order (UI source of truth). */
    lessons: PathLessonListItem[];
    completedCount: number;
    totalCount: number;
    /** Full curriculum slots including not-yet-published. */
    plannedCount: number;
  };
}

type ProfileRow = typeof profiles.$inferSelect;

function activitySinceDate() {
  const since = new Date();
  since.setDate(since.getDate() - 99);
  since.setHours(0, 0, 0, 0);
  return since;
}

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

function buildContinueCard(
  slug: string,
  listIndex: number
): ContinueLessonCard | null {
  const canonical = canonicalLessonId(slug);
  const meta = STATIC_CAROUSEL_LESSONS.find((lesson) => lesson.id === canonical);
  if (!meta) return null;

  return {
    slug: meta.id,
    title: meta.title,
    estimatedMinutes: meta.estimatedMinutes,
    totalXp: meta.totalXp,
    thumbnail: meta.thumbnail,
    listIndex,
  };
}

export async function getUserPathDashboard(
  userId: string,
  profile?: Pick<ProfileRow, "username" | "totalXp" | "currentLevel">,
  options?: { hasLessonAccess?: boolean; userEmail?: string | null }
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

  const publishedSlugs = getPublishedLessonSlugs();

  const [prefsRows, progressRows, subscription] = await Promise.all([
    db
      .select({
        primaryInterestId: userPreferences.primaryInterestId,
        secondaryInterestIds: userPreferences.secondaryInterestIds,
        pathSetupCompletedAt: userPreferences.pathSetupCompletedAt,
        pathSetupSkippedAt: userPreferences.pathSetupSkippedAt,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
    db
      .select({
        lessonId: lessonProgress.lessonId,
        masteryPassed: lessonProgress.masteryPassed,
        hasProgress: sql<boolean>`COALESCE(array_length(${lessonProgress.completedSubsections}, 1), 0) > 0`,
      })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
    options?.hasLessonAccess != null
      ? Promise.resolve({ hasAccess: options.hasLessonAccess })
      : getUserSubscriptionView(userId, options?.userEmail),
  ]);

  const hasLessonAccess = subscription.hasAccess;

  const prefs = prefsRows[0];

  const completedSlugs = progressRows
    .filter((p) => p.masteryPassed)
    .map((p) => canonicalLessonId(p.lessonId));

  const inProgressSlugs = new Set(
    progressRows
      .filter((p) => !p.masteryPassed && p.hasProgress)
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

  const continueListIndex =
    continueItem != null
      ? (pathLessons.find((l) => l.corpusId === continueItem.corpusId)?.listIndex ?? 1)
      : 1;

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

  const continueCard =
    continueItem?.slug != null
      ? buildContinueCard(continueItem.slug, continueListIndex)
      : null;

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
      timeline,
      lessons: pathLessons,
      completedCount: pathCompletedCount,
      totalCount: pathLessons.length,
      plannedCount: path.lessons.length,
    },
  };
}

export async function getUserProgressSection(
  userId: string,
  totalXp: number
): Promise<UserProgressSection> {
  const since = activitySinceDate();

  const [completedRows, activityDays, rank] = await Promise.all([
    db
      .select({
        lessonId: lessonProgress.lessonId,
        totalXpEarned: lessonProgress.totalXpEarned,
        completedAt: lessonProgress.completedAt,
        updatedAt: lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.masteryPassed, true)
        )
      ),
    fetchActivityDays(userId, since),
    getUserLeaderboardRank(userId, totalXp),
  ]);

  const slugs = completedRows.map((row) => canonicalLessonId(row.lessonId));
  const metaBySlug = await loadLessonMetaBySlugs(slugs);

  const completedLessons: CompletedLessonRecord[] = completedRows
    .map((row) => {
      const slug = canonicalLessonId(row.lessonId);
      return {
        slug,
        title: metaBySlug.get(slug)?.title ?? slug,
        completedAt: (row.completedAt ?? row.updatedAt).toISOString(),
        xpEarned: row.totalXpEarned,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  return {
    completedLessons,
    activityDays,
    streakDays: computeStreakDays(activityDays),
    rank,
  };
}

/** @deprecated Use getUserPathDashboard for initial profile load. */
export async function getUserDashboard(
  userId: string,
  profile?: ProfileRow,
  options?: { hasLessonAccess?: boolean }
): Promise<(UserDashboard & { progress: UserProgressSection }) | null> {
  const pathDashboard = await getUserPathDashboard(userId, profile, options);
  if (!pathDashboard) return null;

  const progress = await getUserProgressSection(
    userId,
    pathDashboard.profile.totalXp
  );

  return { ...pathDashboard, progress };
}
