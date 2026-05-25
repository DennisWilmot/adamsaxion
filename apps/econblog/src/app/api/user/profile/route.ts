import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      username: profile.username,
      email: user.email,
      totalXp: profile.totalXp,
      currentLevel: profile.currentLevel,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      createdAt: profile.createdAt,
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, trimmed))
      .limit(1);

    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Username is taken" }, { status: 409 });
    }

    await db
      .update(profiles)
      .set({ username: trimmed, updatedAt: new Date() })
      .where(eq(profiles.id, user.id));

    return NextResponse.json({ success: true, username: trimmed });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
