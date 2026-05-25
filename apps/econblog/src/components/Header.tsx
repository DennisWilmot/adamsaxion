"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LANDING_NAV } from "@/lib/landing/content";
import {
  HeaderAuthActions,
  MobileAuthActions,
} from "@/components/HeaderAuthActions";
import type { User } from "@supabase/supabase-js";
import { PLAY_HUB, priceWarPaths } from "@/lib/games/routes";

const APP_NAV_ITEMS = [
  { label: "Lessons", href: "/lessons" },
  { label: "Games", href: PLAY_HUB },
  { label: "Leaderboard", href: "/leaderboard" },
] as const;

const GAME_NAV_ITEMS = [
  { label: "Lessons", href: "/lessons" },
  { label: "Games", href: PLAY_HUB },
  { label: "The Price War", href: priceWarPaths.lobby },
  { label: "Ladder", href: priceWarPaths.leaderboard },
  { label: "History", href: priceWarPaths.history },
] as const;

function navLinkActive(pathname: string, href: string) {
  if (href === PLAY_HUB) return pathname === PLAY_HUB;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const isLanding = pathname === "/";
  const isGameRoute = pathname.startsWith("/play");
  const showLandingNav = isLanding && !user;
  const showAppNav = Boolean(user);
  const navItems = isGameRoute ? GAME_NAV_ITEMS : APP_NAV_ITEMS;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, user]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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

    if (pathname.startsWith("/profile")) {
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
  }, [user, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-lg">
      <div
        className={`mx-auto flex h-14 items-center justify-between gap-lg px-xl ${
          isGameRoute ? "max-w-[1400px]" : "max-w-[72rem]"
        }`}
      >
        <Link href="/" className="group flex shrink-0 items-baseline gap-[6px]">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Adam&apos;s Axioms
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-2xl md:flex">
          {showLandingNav &&
            LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}

          {showAppNav &&
            navItems.map((item) => {
              const active = navLinkActive(pathname, item.href);
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

        <div className="flex shrink-0 items-center gap-md">
          <HeaderAuthActions
            pathname={pathname}
            user={user}
            loading={loading}
            isAdmin={isAdmin}
            displayName={displayName}
          />

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-xs md:hidden"
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

      {mobileOpen && (
        <nav className="space-y-xs border-t border-border-subtle bg-surface px-xl py-md md:hidden">
          {showLandingNav &&
            LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-sm text-sm font-medium text-foreground-secondary"
              >
                {item.label}
              </a>
            ))}

          {showAppNav &&
            navItems.map((item) => {
              const active = navLinkActive(pathname, item.href);
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
                pathname.startsWith("/admin")
                  ? "text-primary"
                  : "text-foreground-secondary"
              }`}
            >
              Admin
            </Link>
          ) : null}

          <MobileAuthActions
            pathname={pathname}
            user={user}
            loading={loading}
            onClose={() => setMobileOpen(false)}
          />
        </nav>
      )}
    </header>
  );
}
