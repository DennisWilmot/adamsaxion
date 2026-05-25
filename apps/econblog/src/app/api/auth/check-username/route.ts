import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { sanitizeUsername, validateUsername } from "@/lib/auth/username";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username") ?? "";
  const username = sanitizeUsername(raw);

  const formatError = validateUsername(username);
  if (formatError) {
    return NextResponse.json({ available: false, username, error: formatError });
  }

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  return NextResponse.json({
    available: !existing,
    username,
    error: existing ? "Username is already taken." : null,
  });
}
