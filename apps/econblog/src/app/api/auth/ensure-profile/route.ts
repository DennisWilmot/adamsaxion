import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/user-profile";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureProfileForUser(user);
    if (!profile) {
      return NextResponse.json({ error: "Could not create profile" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      username: profile.username,
    });
  } catch (error) {
    console.error("POST /api/auth/ensure-profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
