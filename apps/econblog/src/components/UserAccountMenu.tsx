"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function avatarLabel(user: User, displayName: string | null) {
  return (
    displayName ??
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "Account"
  );
}

function avatarInitial(user: User, displayName: string | null) {
  const label = avatarLabel(user, displayName);
  return label.charAt(0).toUpperCase();
}

export function UserAccountMenu({
  user,
  displayName,
  compact = false,
}: {
  user: User;
  displayName: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const label = avatarLabel(user, displayName);
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center justify-center gap-sm rounded-lg bg-surface-sunken px-sm text-sm font-medium text-foreground-muted transition-colors hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-md"
          aria-label="Account menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {avatarInitial(user, displayName)}
            </span>
          )}
          {!compact ? (
            <span className="hidden max-w-[8rem] truncate sm:inline">{label}</span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="truncate font-normal text-foreground-muted">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserRound className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => void handleSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserAccountMenuLoader({ compact = false }: { compact?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
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

  if (!user) {
    return null;
  }

  return <UserAccountMenu user={user} displayName={displayName} compact={compact} />;
}
