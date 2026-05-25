"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import {
  CALCULATING_MESSAGES,
  ONBOARDING_QUESTIONS,
} from "@/lib/learning/onboarding-questions";
import {
  computeOnboardingResult,
  type OnboardingAnswers,
  type OnboardingResult,
} from "@/lib/learning/onboarding-scoring";
const ADVANCE_MS = 420;
const CALCULATE_MS = 3200;

type Phase = "questions" | "calculating" | "results";

interface PathSetupModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  entryBranch?: "lesson_zero" | "manual";
}

export function PathSetupModal({
  open,
  onClose,
  onComplete,
  entryBranch = "lesson_zero",
}: PathSetupModalProps) {
  const [phase, setPhase] = useState<Phase>("questions");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [slideKey, setSlideKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [calcProgress, setCalcProgress] = useState(0);
  const [calcMessageIndex, setCalcMessageIndex] = useState(0);
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const totalQuestions = ONBOARDING_QUESTIONS.length;
  const currentQuestion = ONBOARDING_QUESTIONS[questionIndex];

  const reset = useCallback(() => {
    setPhase("questions");
    setQuestionIndex(0);
    setAnswers({});
    setSlideKey(0);
    setSubmitting(false);
    setCalcProgress(0);
    setCalcMessageIndex(0);
    setResult(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  async function runCalculation(finalAnswers: OnboardingAnswers) {
    setPhase("calculating");
    setSlideKey((k) => k + 1);
    setCalcProgress(0);
    setCalcMessageIndex(0);

    const start = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(98, (elapsed / CALCULATE_MS) * 98);
      setCalcProgress(pct);
      setCalcMessageIndex(
        Math.min(
          CALCULATING_MESSAGES.length - 1,
          Math.floor(elapsed / (CALCULATE_MS / CALCULATING_MESSAGES.length))
        )
      );
    }, 80);

    let publishedSlugs: string[] = [];
    try {
      const res = await fetch("/api/lessons");
      const data = await res.json();
      publishedSlugs = (data.lessons ?? []).map((l: { id: string }) => l.id);
    } catch {
      publishedSlugs = ["lesson-zero"];
    }

    const computed = computeOnboardingResult(finalAnswers, publishedSlugs);

    const remaining = Math.max(0, CALCULATE_MS - (Date.now() - start));
    await new Promise((r) => window.setTimeout(r, remaining));

    window.clearInterval(progressTimer);
    setCalcProgress(100);
    setResult(computed);

    window.setTimeout(() => {
      setPhase("results");
      setSlideKey((k) => k + 1);
    }, 400);
  }

  function handleAnswer(optionId: string) {
    if (!currentQuestion) return;

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(nextAnswers);

    const isLast = questionIndex >= totalQuestions - 1;

    window.setTimeout(() => {
      if (isLast) {
        void runCalculation(nextAnswers);
      } else {
        setSlideKey((k) => k + 1);
        setQuestionIndex((i) => i + 1);
      }
    }, ADVANCE_MS);
  }

  async function saveAndStart() {
    if (!result) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryInterestId: result.primaryInterestId,
          secondaryInterestIds: result.secondaryInterestIds,
          entryBranch,
        }),
      });
      if (res.ok) onComplete();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip", entryBranch }),
      });
      if (res.ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex w-full max-h-[92vh] flex-col rounded-xl border border-border bg-surface-raised shadow-lg overflow-hidden ${
          phase === "results" ? "max-w-[34rem]" : "max-w-[30rem]"
        }`}
      >
        {phase === "questions" && (
          <div className="px-2xl pt-xl pb-md border-b border-border-subtle">
            <div className="flex items-center justify-between mb-md">
              <p className="font-body text-xs font-semibold tracking-widest uppercase text-primary">
                Personalizing your path
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-foreground-muted hover:text-foreground p-xs -mr-xs"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{
                  width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
            <p className="mt-sm font-body text-[11px] text-foreground-muted tabular-nums">
              {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2xl py-xl">
          {phase === "questions" && currentQuestion && (
            <div
              key={slideKey}
              className="animate-in fade-in slide-in-from-right-3 duration-300"
            >
              <h2 className="font-display font-bold text-2xl text-foreground mb-sm leading-snug text-balance">
                {currentQuestion.title}
              </h2>
              {currentQuestion.subtitle && (
                <p className="font-body text-sm text-foreground-secondary mb-2xl">
                  {currentQuestion.subtitle}
                </p>
              )}
              {!currentQuestion.subtitle && <div className="mb-2xl" />}

              <div className="flex flex-col gap-sm">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAnswer(option.id)}
                    className="text-left rounded-xl border border-border-subtle px-lg py-md font-body text-sm text-foreground-secondary transition-all hover:border-primary/60 hover:bg-primary-subtle/40 hover:text-foreground active:scale-[0.99]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "calculating" && (
            <div
              key="calc"
              className="py-xl animate-in fade-in duration-300 text-center"
            >
              <div className="mx-auto mb-xl flex size-14 items-center justify-center rounded-full bg-primary-subtle">
                <Sparkles className="size-7 text-primary animate-pulse" />
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-sm">
                Calculating your best path
              </h2>
              <p className="font-body text-sm text-foreground-secondary mb-2xl min-h-[1.25rem] transition-all">
                {CALCULATING_MESSAGES[calcMessageIndex]}
              </p>
              <div className="h-2 rounded-full bg-surface-sunken overflow-hidden mb-sm">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-150 ease-out"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
              <p className="font-body text-xs text-foreground-muted tabular-nums">
                {Math.round(calcProgress)}%
              </p>
            </div>
          )}

          {phase === "results" && result && (
            <div
              key={slideKey}
              className="animate-in fade-in zoom-in-95 duration-500"
            >
              <p className="font-body text-xs font-semibold tracking-widest uppercase text-success mb-sm">
                Your path is ready
              </p>
              <h2 className="font-display font-bold text-2xl text-foreground mb-sm leading-snug">
                {result.headline}
              </h2>
              <p className="font-body text-sm text-foreground-secondary mb-lg">
                {result.tagline}
              </p>

              {result.focusLabels.length > 0 && (
                <div className="flex flex-wrap gap-xs mb-xl">
                  {result.focusLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-primary-subtle px-md py-xs font-body text-xs font-medium text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {result.personalNotes.length > 0 && (
                <div className="mb-xl">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-foreground-muted mb-sm">
                    What we heard from you
                  </p>
                  <ul className="space-y-sm">
                    {result.personalNotes.map((line) => (
                      <li
                        key={line}
                        className="flex gap-sm font-body text-sm text-foreground-secondary leading-relaxed"
                      >
                        <span className="text-primary shrink-0">·</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.outcomes.length > 0 && (
                <div className="mb-xl">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-foreground-muted mb-sm">
                    You&apos;ll work toward
                  </p>
                  <ul className="space-y-sm">
                    {result.outcomes.map((line) => (
                      <li
                        key={line}
                        className="flex gap-sm font-body text-sm text-foreground leading-relaxed"
                      >
                        <span className="text-success shrink-0">✓</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.pathPreview.length > 0 && (
                <div className="rounded-lg border border-border-subtle bg-surface-sunken/50 px-lg py-md mb-lg">
                  <div className="flex items-baseline justify-between gap-md mb-md">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                      Your path
                    </p>
                    <p className="font-body text-[10px] text-foreground-muted tabular-nums shrink-0">
                      {result.stats.availableNow} ready
                      {result.stats.comingSoon > 0 &&
                        ` · ${result.stats.comingSoon} coming`}
                    </p>
                  </div>
                  <ol className="space-y-md">
                    {result.pathPreview.map((lesson, i) => (
                      <li key={lesson.corpusId} className="min-w-0">
                        <div className="flex gap-sm items-start">
                          <span className="font-body text-xs text-foreground-muted tabular-nums shrink-0 pt-px">
                            {i + 1}.
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm font-medium text-foreground leading-snug">
                              {lesson.title}
                            </p>
                            <p className="font-body text-xs text-foreground-muted mt-px">
                              {lesson.reason}
                            </p>
                          </div>
                          {lesson.status === "coming_soon" && (
                            <span className="shrink-0 rounded px-xs py-px font-body text-[10px] uppercase tracking-wide text-foreground-muted bg-surface-sunken">
                              Soon
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={saveAndStart}
                className="w-full rounded-lg py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Start my path"}
              </button>
            </div>
          )}
        </div>

        {phase === "questions" && (
          <div className="border-t border-border-subtle px-2xl py-lg text-center">
            <p className="font-body text-sm text-foreground-muted">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSkip}
                className="font-medium text-foreground-muted hover:text-foreground"
              >
                Skip for now
              </button>
              <span className="text-[11px] text-foreground-muted">
                {" "}
                (
                <span className="mx-[0.15em]">
                  Update anytime from{" "}
                  <Link href="/profile" className="text-primary hover:underline">
                    profile
                  </Link>
                </span>
                )
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
