import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/user-profile";

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to exchange auth code" },
        { status: 400 }
      );
    }

    await ensureProfileForUser(data.user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/callback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
