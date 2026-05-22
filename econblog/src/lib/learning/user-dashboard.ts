import { db } from "@/db";
import { lessonProgress, profiles, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadAllLessonMeta } from "@/lib/lesson-loader";
import { canonicalLessonId } from "@/lib/constants/lessons";
import {
  buildLearningPath,
  getDefaultFundamentalsPath,
  type PathLessonItem,
} from "./path-engine";
import { getInterestTag, type InterestTagId } from "./interest-tags";

export type PathTimelineState = "completed" | "current" | "upcoming" | "coming_soon";

export interface PathTimelineItem {
  corpusId: number;
  slug: string | null;
  title: string;
  state: PathTimelineState;
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
    tagline: string;
    continue: PathLessonItem | null;
    upNext: PathLessonItem[];
    timeline: PathTimelineItem[];
    completedCount: number;
    totalCount: number;
  };
}

export async function getUserDashboard(userId: string): Promise<UserDashboard | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) return null;

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  const publishedMeta = await loadAllLessonMeta();
  const publishedSlugs = publishedMeta.map((l) => l.id);

  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));

  const completedSlugs = progressRows
    .filter((p) => p.masteryPassed)
    .map((p) => canonicalLessonId(p.lessonId));

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

  const pathSetupComplete = !!prefs?.pathSetupCompletedAt;
  const pathSetupSkipped = !!prefs?.pathSetupSkippedAt && !pathSetupComplete;

  return {
    profile: {
      username: profile.username,
      totalXp: profile.totalXp,
      currentLevel: profile.currentLevel,
    },
    preferences: {
      primaryInterestId: prefs?.primaryInterestId ?? null,
      primaryInterestLabel: primaryId
        ? (getInterestTag(primaryId)?.label ?? null)
        : null,
      secondaryInterestIds: secondaryIds,
      pathSetupComplete,
      pathSetupSkipped,
      needsPathSetup: !pathSetupComplete,
    },
    path: {
      tagline: path.tagline,
      continue: continueItem,
      upNext,
      timeline,
      completedCount: pathCompletedCount,
      totalCount: pathPublished.length,
    },
  };
}
