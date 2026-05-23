"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/client";
import { authPageUrl } from "@/lib/auth/redirect";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { label: "Lessons", href: "/lessons" },
  { label: "Leaderboard", href: "/leaderboard" },
];

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    fetch("/api/user/admin-status", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          return { isAdmin: false };
        }
        return res.json() as Promise<{ isAdmin?: boolean }>;
      })
      .then((data) => {
        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      return;
    }

    let cancelled = false;
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.username) {
          setDisplayName(data.username);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSignIn() {
    const next = searchParams.get("next") ?? pathname ?? "/lessons";
    await signInWithGoogle(next);
  }

  function handleSignUp() {
    const next = searchParams.get("next") ?? pathname ?? "/lessons";
    window.location.href = authPageUrl(next, "signup");
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-lg border-b border-border-subtle">
      <div className="max-w-[72rem] mx-auto px-xl flex items-center justify-between h-14">
        <Link href="/" className="flex items-baseline gap-[6px] group">
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            Adam&apos;s Axioms
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2xl">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  active
                    ? "text-primary"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-md">
          {loading ? (
            <div className="h-8 w-16 rounded-lg bg-surface-sunken animate-pulse" />
          ) : (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className={`hidden h-8 items-center gap-sm rounded-lg px-md text-sm font-medium transition-colors sm:inline-flex ${
                    pathname.startsWith("/admin")
                      ? "bg-primary text-surface-raised"
                      : "bg-surface-sunken text-foreground-muted hover:bg-border hover:text-foreground"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              {user ? (
                <Link
                  href="/profile"
                  className={`h-8 px-md rounded-lg flex items-center justify-center text-sm font-medium transition-colors gap-sm ${
                    pathname === "/profile"
                      ? "bg-primary text-surface-raised"
                      : "bg-surface-sunken text-foreground-muted hover:text-foreground hover:bg-border"
                  }`}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full"
                    />
                  ) : null}
                  <span className="hidden sm:inline">
                    {displayName ??
                      user.user_metadata?.full_name?.split(" ")[0] ??
                      "Profile"}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-sm">
                  <button
                    onClick={handleSignUp}
                    className="h-8 px-md rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-sunken transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="h-8 px-lg rounded-lg bg-primary text-surface-raised text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-xs"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-foreground-secondary" />
            ) : (
              <Menu className="h-5 w-5 text-foreground-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border-subtle bg-surface px-xl py-md space-y-xs">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-sm text-sm font-medium ${
                  active ? "text-primary" : "text-foreground-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`block py-sm text-sm font-medium ${
                pathname.startsWith("/admin") ? "text-primary" : "text-foreground-secondary"
              }`}
            >
              Admin
            </Link>
          ) : null}
          {!user && (
            <>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  void handleSignIn();
                }}
                className="block w-full text-left py-sm text-sm font-semibold text-primary"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignUp();
                }}
                className="block w-full text-left py-sm text-sm font-medium text-foreground-secondary"
              >
                Create account
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
