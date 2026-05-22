import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/user-profile";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/lessons";
  }
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("GET /auth/callback error:", error?.message);
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  try {
    await ensureProfileForUser(data.user);
  } catch (profileError) {
    console.error("GET /auth/callback profile error:", profileError);
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
