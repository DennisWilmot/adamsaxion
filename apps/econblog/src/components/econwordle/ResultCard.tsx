"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { authPageUrl } from "@/lib/auth/redirect";
import { EconWordleShare } from "./EconWordleShare";
import { StreakAuthPrompt } from "./StreakAuthPrompt";

export function ResultCard({
  won,
  guessCount,
  maxGuesses,
  word,
  definition,
  lessonSlug,
  lessonTitle,
  streak,
  shareText,
  shareUrl,
  isAuthenticated,
}: {
  won: boolean;
  guessCount: number;
  maxGuesses: number;
  word: string;
  definition: string;
  lessonSlug: string;
  lessonTitle: string;
  streak: number;
  shareText: string;
  shareUrl: string;
  isAuthenticated: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[34rem] rounded-xl border border-border bg-surface-raised p-xl shadow-sm">
      <div className="mb-lg flex items-center justify-between gap-md">
        <p
          className={`font-display text-xl font-semibold ${won ? "text-success" : "text-error"}`}
        >
          {won ? `Solved in ${guessCount}/${maxGuesses} :)` : "Out of guesses :("}
        </p>
        {streak > 0 && (
          <span className="inline-flex items-center gap-xs rounded-full bg-gold-subtle px-md py-xs font-body text-xs font-semibold text-gold">
            <Flame className="size-3.5" />
            {streak} day{streak === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mb-lg rounded-lg border border-border-subtle bg-surface-sunken p-lg">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">
          Today&apos;s term
        </p>
        <p className="mt-xs font-display text-2xl font-bold uppercase tracking-wide text-primary">
          {word}
        </p>
        <p className="mt-md font-body text-sm leading-relaxed text-foreground-secondary">
          {definition}
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-lg">
          <StreakAuthPrompt />
        </div>
      )}

      <div className="flex flex-col gap-md sm:flex-row">
        <Link
          href={`/lessons/${lessonSlug}`}
          className="group inline-flex flex-1 items-center justify-center gap-sm rounded-lg bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
        >
          Learn this: {lessonTitle}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <EconWordleShare text={shareText} url={shareUrl} />
      </div>

      <p className="mt-lg text-center font-body text-xs text-foreground-muted">
        {isAuthenticated ? (
          <>New puzzle every day.</>
        ) : (
          <>
            New puzzle every day. Already have an account?{" "}
            <Link href={authPageUrl("/play/econ-wordle", "signin")} className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
