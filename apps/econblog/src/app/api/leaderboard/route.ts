import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, leaderboardSeeds } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") ?? "50", 10);
    const limit = Math.max(1, Math.min(100, isNaN(limitParam) ? 50 : limitParam));

    const result: any[] = await db.execute(sql`
      (
        SELECT id, username, total_xp, current_level, false as is_seed
        FROM profiles
      )
      UNION ALL
      (
        SELECT id, username, total_xp, current_level, true as is_seed
        FROM leaderboard_seeds
        WHERE is_seeded = true
      )
      ORDER BY total_xp DESC
      LIMIT ${limit}
    `);

    const leaders = result.map((row: any, index: number) => ({
      rank: index + 1,
      id: row.id,
      username: row.username,
      totalXp: row.total_xp,
      currentLevel: row.current_level,
      isSeed: row.is_seed,
    }));

    return NextResponse.json({ leaders });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
