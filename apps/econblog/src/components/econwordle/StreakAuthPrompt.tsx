"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { authPageUrl } from "@/lib/auth/redirect";

const GAME_PATH = "/play/econ-wordle";

export function StreakAuthPrompt({ variant = "banner" }: { variant?: "banner" | "inline" }) {
  const href = authPageUrl(GAME_PATH, "signup");

  if (variant === "inline") {
    return (
      <p className="text-center font-body text-xs text-foreground-muted">
        <Link href={href} className="font-semibold text-primary hover:underline">
          Sign in to track your streak
        </Link>
      </p>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-sm rounded-lg border border-border bg-surface-sunken px-lg py-md font-body text-sm text-foreground-secondary transition-colors hover:border-primary/30 hover:bg-surface-raised"
    >
      <Flame className="size-4 shrink-0 text-gold" aria-hidden />
      <span>
        <span className="font-semibold text-foreground">Sign in to track your streak</span>
      </span>
    </Link>
  );
}
