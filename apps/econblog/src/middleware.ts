import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmails } from "@/lib/admin/auth";
import { isPriceWarEnabled } from "@/server/pricewar/feature-flag";

const PROTECTED_ROUTES = ["/profile", "/play"];
const ADMIN_ROUTES = ["/admin", "/api/admin", "/api/pricewar/admin"];
const PRICEWAR_API_PUBLIC = ["/api/pricewar/play-modes"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth code exchange happens only in /auth/callback/route.ts — never run session logic here.
  if (pathname === "/auth/callback") {
    return NextResponse.next({ request });
  }

  // Supabase sometimes redirects to Site URL (/) instead of /auth/callback.
  // Forward before getUser() so we never double-exchange the PKCE code.
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdmin) {
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const adminEmails = getAdminEmails();
    const userEmail = (user.email ?? "").toLowerCase();

    if (adminEmails.length === 0) {
      console.error("[admin] ADMIN_EMAILS is not configured");
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Admin access is not configured" },
          { status: 503 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin_forbidden");
      return NextResponse.redirect(url);
    }

    if (!adminEmails.includes(userEmail)) {
      console.log(
        `[admin] Access denied for email: "${userEmail}" — allowed: ${JSON.stringify(adminEmails)}`
      );
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin_forbidden");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isPricewarApi =
    pathname === "/api/pricewar" || pathname.startsWith("/api/pricewar/");
  const isPublicPricewarApi = PRICEWAR_API_PUBLIC.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isMetricsRoute = pathname === "/api/pricewar/metrics";

  if (isPricewarApi && !isPublicPricewarApi && !isMetricsRoute && !isPriceWarEnabled()) {
    return NextResponse.json(
      { code: "SERVICE_UNAVAILABLE", message: "The Price War is temporarily unavailable." },
      { status: 503 }
    );
  }

  if (
    !isPriceWarEnabled() &&
    (pathname === "/play" || pathname.startsWith("/play/"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/lessons";
    url.searchParams.set("notice", "pricewar_disabled");
    return NextResponse.redirect(url);
  }

  if (!user && isPricewarApi && !isPublicPricewarApi) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Sign in required." }, { status: 401 });
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
