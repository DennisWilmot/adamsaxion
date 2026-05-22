import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmails } from "@/lib/admin/auth";

const PROTECTED_ROUTES = ["/profile"];
const ADMIN_ROUTES = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase sometimes redirects to Site URL (/) instead of /auth/callback
  // when the callback URL isn't allowlisted. Forward the code to the handler.
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && pathname !== "/auth/callback") {
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
