"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame, Share2 } from "lucide-react";

export function ResultCard({
  won,
  guessCount,
  maxGuesses,
  word,
  definition,
  lessonSlug,
  lessonTitle,
  streak,
  copied,
  onShare,
}: {
  won: boolean;
  guessCount: number;
  maxGuesses: number;
  word: string;
  definition: string;
  lessonSlug: string;
  lessonTitle: string;
  streak: number;
  copied: boolean;
  onShare: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[34rem] rounded-xl border border-border bg-surface-raised p-xl shadow-sm">
      <div className="mb-lg flex items-center justify-between gap-md">
        <p className="font-display text-xl font-semibold text-foreground">
          {won ? `Solved in ${guessCount}/${maxGuesses}` : "Out of guesses"}
        </p>
        {streak > 0 && (
          <span className="inline-flex items-center gap-xs rounded-full bg-gold-subtle px-md py-xs font-body text-xs font-semibold text-gold">
            <Flame className="size-3.5" />
            {streak} day{streak === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mb-lg rounded-lg border border-border-subtle bg-surface-sunken p-lg">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          {word}
        </p>
        <p className="mt-xs font-body text-sm leading-relaxed text-foreground-secondary">
          {definition}
        </p>
      </div>

      <div className="flex flex-col gap-md sm:flex-row">
        <Link
          href={`/lessons/${lessonSlug}`}
          className="group inline-flex flex-1 items-center justify-center gap-sm rounded-lg bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
        >
          Learn this: {lessonTitle}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-sm rounded-lg border border-border px-xl py-md font-body text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken"
        >
          {copied ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
          {copied ? "Copied" : "Share"}
        </button>
      </div>

      <p className="mt-lg text-center font-body text-xs text-foreground-muted">
        New puzzle every day.{" "}
        <Link href="/auth" className="text-primary hover:underline">
          Create a free account
        </Link>{" "}
        to save your streak.
      </p>
    </div>
  );
}
