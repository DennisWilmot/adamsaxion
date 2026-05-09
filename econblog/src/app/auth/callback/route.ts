import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/lessons";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, data.user.id))
        .limit(1);

      if (existing.length === 0) {
        const username =
          data.user.user_metadata?.full_name?.replace(/\s+/g, "") ??
          data.user.email?.split("@")[0] ??
          `user_${data.user.id.slice(0, 8)}`;

        await db.insert(profiles).values({
          id: data.user.id,
          username,
          totalXp: 0,
          currentLevel: 1,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
