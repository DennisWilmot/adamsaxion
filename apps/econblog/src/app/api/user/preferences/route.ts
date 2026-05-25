import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import {
  INTEREST_TAGS,
  MAX_INTEREST_SELECTIONS,
  type InterestTagId,
} from "@/lib/learning/interest-tags";

const VALID_IDS = new Set(INTEREST_TAGS.map((t) => t.id));

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  return NextResponse.json({
    preferences: prefs
      ? {
          primaryInterestId: prefs.primaryInterestId,
          secondaryInterestIds: prefs.secondaryInterestIds,
          pathSetupCompletedAt: prefs.pathSetupCompletedAt,
          pathSetupSkippedAt: prefs.pathSetupSkippedAt,
          entryBranch: prefs.entryBranch,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as string | undefined;

  if (action === "skip") {
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);

    if (existing) {
      await db
        .update(userPreferences)
        .set({
          pathSetupSkippedAt: new Date(),
          updatedAt: new Date(),
          entryBranch: body.entryBranch ?? existing.entryBranch,
        })
        .where(eq(userPreferences.userId, user.id));
    } else {
      await db.insert(userPreferences).values({
        userId: user.id,
        pathSetupSkippedAt: new Date(),
        entryBranch: body.entryBranch ?? "lesson_zero",
      });
    }

    return NextResponse.json({ ok: true, skipped: true });
  }

  const primaryInterestId = body.primaryInterestId as string | undefined;
  const secondaryInterestIds = (body.secondaryInterestIds ?? []) as string[];

  if (!primaryInterestId || !VALID_IDS.has(primaryInterestId as InterestTagId)) {
    return NextResponse.json(
      { error: "primaryInterestId is required and must be valid" },
      { status: 400 }
    );
  }

  const secondary = secondaryInterestIds
    .filter((id) => VALID_IDS.has(id as InterestTagId) && id !== primaryInterestId)
    .slice(0, MAX_INTEREST_SELECTIONS - 1);

  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  const values = {
    primaryInterestId,
    secondaryInterestIds: secondary,
    pathSetupCompletedAt: new Date(),
    pathSetupSkippedAt: null,
    entryBranch: (body.entryBranch as string) ?? existing?.entryBranch ?? "lesson_zero",
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(userPreferences)
      .set(values)
      .where(eq(userPreferences.userId, user.id));
  } else {
    await db.insert(userPreferences).values({
      userId: user.id,
      ...values,
    });
  }

  return NextResponse.json({ ok: true, completed: true });
}
