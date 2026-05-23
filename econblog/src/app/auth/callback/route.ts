import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileForUser } from "@/lib/user-profile";
import {
  getRequestOrigin,
  readAuthNextCookie,
  safeNextPath,
} from "@/lib/auth/redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = safeNextPath(
    searchParams.get("next") ?? readAuthNextCookie(request)
  );

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth?error=auth&next=${encodeURIComponent(next)}`
    );
  }

  let response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.redirect(`${origin}${next}`);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const hasVerifier = request.cookies
      .getAll()
      .some((c) => c.name.includes("code-verifier"));
    console.error(
      "GET /auth/callback error:",
      error?.message,
      hasVerifier ? "(verifier cookie present)" : "(no verifier cookie — PKCE mismatch)"
    );
    return NextResponse.redirect(
      `${origin}/auth?error=auth&next=${encodeURIComponent(next)}`
    );
  }

  try {
    await ensureProfileForUser(data.user);
  } catch (profileError) {
    console.error("GET /auth/callback profile error:", profileError);
  }

  response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
  return response;
}
