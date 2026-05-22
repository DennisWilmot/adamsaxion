import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureProfileForUser } from "@/lib/user-profile";
import { safeNextPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const cookieNext = cookieStore.get("auth_next")?.value ?? null;
  const next = safeNextPath(searchParams.get("next") ?? cookieNext);

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=auth`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("GET /auth/callback error:", error?.message);
    return NextResponse.redirect(`${origin}/auth?error=auth`);
  }

  try {
    await ensureProfileForUser(data.user);
  } catch (profileError) {
    console.error("GET /auth/callback profile error:", profileError);
  }

  response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
  return response;
}
