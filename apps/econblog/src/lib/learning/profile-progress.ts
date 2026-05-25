import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface ActivityDay {
  date: string;
  count: number;
}

export interface CompletedLessonRecord {
  slug: string;
  title: string;
  completedAt: string;
  xpEarned: number;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildActivityDays(
  attemptDates: Date[],
  progressDates: Date[],
  days = 100
): ActivityDay[] {
  const counts = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    counts.set(toDateKey(d), 0);
  }

  for (const date of [...attemptDates, ...progressDates]) {
    const key = toDateKey(date);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count }));
}

export function computeStreakDays(activityDays: ActivityDay[]): number {
  let streak = 0;
  for (let i = activityDays.length - 1; i >= 0; i--) {
    if (activityDays[i].count > 0) {
      streak++;
    } else if (i < activityDays.length - 1) {
      break;
    }
  }
  return streak;
}

export async function getUserLeaderboardRank(
  userId: string,
  totalXp: number
): Promise<number | null> {
  const result = await db.execute<{ rank: string }>(sql`
    SELECT COUNT(*) + 1 AS rank
    FROM (
      SELECT total_xp FROM profiles WHERE id != ${userId} AND total_xp > ${totalXp}
      UNION ALL
      SELECT total_xp FROM leaderboard_seeds
      WHERE is_seeded = true AND total_xp > ${totalXp}
    ) AS higher
  `);

  const row = result[0] as { rank?: string | number } | undefined;
  if (row?.rank == null) return null;
  return Number(row.rank);
}

export async function fetchRecentActivityDates(userId: string, since: Date) {
  const sinceIso = since.toISOString();
  const [attemptRows, progressRows] = await Promise.all([
    db
      .select({ attemptedAt: quizAttempts.attemptedAt })
      .from(quizAttempts)
      .where(
        sql`${quizAttempts.userId} = ${userId} AND ${quizAttempts.attemptedAt} >= ${sinceIso}`
      ),
    db.execute<{ updated_at: Date; completed_at: Date | null }>(sql`
      SELECT updated_at, completed_at
      FROM lesson_progress
      WHERE user_id = ${userId}
        AND (updated_at >= ${sinceIso} OR completed_at >= ${sinceIso})
    `),
  ]);

  const attemptDates = attemptRows.map((r) => r.attemptedAt);
  const progressDates: Date[] = [];
  for (const row of progressRows as { updated_at: Date; completed_at: Date | null }[]) {
    if (row.updated_at) progressDates.push(new Date(row.updated_at));
    if (row.completed_at) progressDates.push(new Date(row.completed_at));
  }

  return { attemptDates, progressDates };
}
