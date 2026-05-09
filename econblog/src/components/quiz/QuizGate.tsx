"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types/lesson";

interface QuizStatus {
  answered: boolean;
  isCorrect: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  locked: boolean;
  lockedUntil: string | null;
  xpEarned: number;
}

interface QuizGateProps {
  quiz: QuizQuestion;
  lessonSlug: string;
  status?: QuizStatus;
  isAuthenticated?: boolean;
  onComplete: (correct: boolean, xpEarned: number) => void;
}

export function QuizGate({ quiz, lessonSlug, status, isAuthenticated = true, onComplete }: QuizGateProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    xpEarned: number;
    explanation: string;
    attemptsRemaining: number;
    lockedUntil: string | null;
  } | null>(null);

  const alreadyCorrect = status?.isCorrect ?? false;
  const isLocked = status?.locked ?? false;

  // Completed state
  if (alreadyCorrect) {
    return (
      <div className="my-2xl rounded-lg border border-success/30 bg-success-subtle p-xl">
        <div className="flex items-center gap-sm mb-md">
          <span className="h-5 w-5 rounded-full bg-success flex items-center justify-center text-surface-raised text-xs font-bold">
            ✓
          </span>
          <span className="font-body text-sm font-semibold text-success">
            Completed
          </span>
          <span className="ml-auto font-display text-sm font-semibold text-success tabular-nums">
            +{status?.xpEarned ?? quiz.xpReward} XP
          </span>
        </div>
        <p className="font-body text-sm text-foreground-secondary leading-relaxed">
          {quiz.explanation}
        </p>
      </div>
    );
  }

  // Locked state
  if (isLocked && status?.lockedUntil) {
    const unlockTime = new Date(status.lockedUntil);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.ceil((unlockTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
    const minutesLeft = Math.max(0, Math.ceil((unlockTime.getTime() - now.getTime()) / (1000 * 60)) % 60);

    return (
      <div className="my-2xl rounded-lg border border-gold/30 bg-gold-subtle p-xl">
        <div className="flex items-center gap-sm mb-md">
          <span className="font-body text-sm font-semibold text-gold-hover">
            Locked
          </span>
        </div>
        <p className="font-display text-base font-semibold text-foreground mb-sm">
          {quiz.question}
        </p>
        <p className="font-body text-sm text-foreground-secondary">
          Come back in {hoursLeft}h {minutesLeft}m. You can continue to the next section.
        </p>
      </div>
    );
  }

  // Result state
  if (result) {
    return (
      <div
        className={`my-2xl rounded-lg border p-xl ${
          result.isCorrect
            ? "border-success/30 bg-success-subtle"
            : "border-error/30 bg-error-subtle"
        }`}
      >
        <div className="flex items-center gap-sm mb-lg">
          <span
            className={`h-5 w-5 rounded-full flex items-center justify-center text-surface-raised text-xs font-bold ${
              result.isCorrect ? "bg-success" : "bg-error"
            }`}
          >
            {result.isCorrect ? "✓" : "✗"}
          </span>
          <span
            className={`font-body text-sm font-semibold ${
              result.isCorrect ? "text-success" : "text-error"
            }`}
          >
            {result.isCorrect ? "Correct" : "Incorrect"}
          </span>
          <span
            className={`ml-auto font-display text-sm font-semibold tabular-nums ${
              result.xpEarned >= 0 ? "text-success" : "text-error"
            }`}
          >
            {result.xpEarned >= 0 ? "+" : ""}{result.xpEarned} XP
          </span>
        </div>

        <p className="font-display text-base font-semibold text-foreground mb-lg">
          {quiz.question}
        </p>

        <div className="space-y-sm mb-lg">
          {quiz.options.map((option, i) => (
            <div
              key={i}
              className={`rounded-md border px-lg py-md font-body text-sm ${
                i === quiz.correctAnswer
                  ? "border-success/40 bg-success-subtle text-foreground"
                  : i === selectedAnswer && !result.isCorrect
                  ? "border-error/40 bg-error-subtle text-foreground"
                  : "border-border-subtle text-foreground-muted opacity-60"
              }`}
            >
              <span className="font-semibold mr-sm text-foreground-muted">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </div>
          ))}
        </div>

        <p className="font-body text-sm text-foreground-secondary leading-relaxed bg-surface-sunken rounded-md p-lg">
          {result.explanation}
        </p>

        {!result.isCorrect && result.attemptsRemaining > 0 && (
          <p className="mt-md font-body text-xs text-foreground-muted">
            {result.attemptsRemaining} attempt{result.attemptsRemaining !== 1 ? "s" : ""} remaining
          </p>
        )}

        {!result.isCorrect && result.lockedUntil && (
          <p className="mt-md font-body text-xs text-gold-hover font-medium">
            Locked for 24 hours. You can continue to the next section.
          </p>
        )}
      </div>
    );
  }

  // Active quiz state
  async function handleSubmit() {
    if (selectedAnswer === null || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/lessons/${lessonSlug}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: quiz.id, selectedAnswer }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setResult({
          isCorrect: true, xpEarned: 0, explanation: quiz.explanation,
          attemptsRemaining: 0, lockedUntil: null,
        });
        onComplete(true, 0);
        return;
      }

      if (!res.ok && res.status !== 423) {
        throw new Error(data.error || "Submission failed");
      }

      setResult({
        isCorrect: data.isCorrect,
        xpEarned: data.xpEarned,
        explanation: data.explanation ?? quiz.explanation,
        attemptsRemaining: data.attemptsRemaining ?? 0,
        lockedUntil: data.lockedUntil ?? null,
      });

      onComplete(data.isCorrect, data.xpEarned);
    } catch (err) {
      console.error("Quiz submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const attemptsUsed = status?.attemptsUsed ?? 0;

  return (
    <div className="my-2xl rounded-lg border border-border bg-surface-raised p-xl">
      <div className="flex items-center gap-md mb-lg">
        <span className="font-body text-xs font-semibold tracking-widest uppercase text-primary">
          Quick Check
        </span>
        <span className="ml-auto font-display text-sm font-semibold text-gold tabular-nums">
          +{quiz.xpReward} XP
        </span>
        {attemptsUsed > 0 && (
          <span className="font-body text-xs text-foreground-muted tabular-nums">
            Attempt {attemptsUsed + 1}/3
          </span>
        )}
      </div>

      <p className="font-display text-lg font-semibold text-foreground mb-xl leading-snug">
        {quiz.question}
      </p>

      <div className="space-y-sm mb-xl">
        {quiz.options.map((option, i) => (
          <button
            key={i}
            onClick={() => setSelectedAnswer(i)}
            disabled={submitting}
            className={`w-full text-left rounded-md border-2 px-lg py-md font-body text-sm transition-all ${
              selectedAnswer === i
                ? "border-primary bg-primary-subtle"
                : "border-border-subtle bg-surface hover:border-border"
            }`}
          >
            <span className="font-semibold text-foreground-muted mr-md">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-foreground">{option}</span>
          </button>
        ))}
      </div>

      {!isAuthenticated ? (
        <div className="rounded-lg bg-surface-sunken p-lg text-center">
          <p className="font-body text-sm text-foreground-secondary mb-sm">
            Sign in to submit answers and track your progress.
          </p>
          <button
            onClick={() => {
              import("@/lib/supabase/client").then(({ createClient }) => {
                const supabase = createClient();
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
              });
            }}
            className="font-body text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null || submitting}
          className={`w-full rounded-lg py-md px-xl font-body text-sm font-semibold transition-all ${
            selectedAnswer !== null && !submitting
              ? "bg-primary text-surface-raised hover:bg-primary-hover shadow-sm"
              : "bg-border text-foreground-muted cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Answer"}
        </button>
      )}
    </div>
  );
}
