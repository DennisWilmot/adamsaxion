import { db } from "@/db";
import { sql } from "drizzle-orm";

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
    const day = activityDays[i];
    if (!day) break;
    if (day.count > 0) {
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

/** Aggregates activity in SQL instead of pulling every attempt/progress row. */
export async function fetchActivityDays(
  userId: string,
  since: Date,
  days = 100
): Promise<ActivityDay[]> {
  const sinceIso = since.toISOString();
  const rows = await db.execute<{ activity_date: string; event_count: string }>(sql`
    SELECT activity_date::text AS activity_date, COUNT(*)::text AS event_count
    FROM (
      SELECT DATE(attempted_at) AS activity_date
      FROM quiz_attempts
      WHERE user_id = ${userId}
        AND attempted_at >= ${sinceIso}::timestamptz
      UNION ALL
      SELECT DATE(updated_at) AS activity_date
      FROM lesson_progress
      WHERE user_id = ${userId}
        AND updated_at >= ${sinceIso}::timestamptz
      UNION ALL
      SELECT DATE(completed_at) AS activity_date
      FROM lesson_progress
      WHERE user_id = ${userId}
        AND completed_at IS NOT NULL
        AND completed_at >= ${sinceIso}::timestamptz
    ) AS events
    GROUP BY activity_date
  `);

  const counts = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    counts.set(toDateKey(d), 0);
  }

  for (const row of rows as { activity_date?: string; event_count?: string }[]) {
    if (!row.activity_date) continue;
    const key = row.activity_date.slice(0, 10);
    if (counts.has(key)) {
      counts.set(key, Number(row.event_count ?? 0));
    }
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count }));
}
