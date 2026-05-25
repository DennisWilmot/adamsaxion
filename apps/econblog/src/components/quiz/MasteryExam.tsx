"use client";

import { useState, useEffect, useCallback } from "react";
import type { MasteryQuiz, MasteryQuestion } from "@/lib/types/lesson";
import { SignInPrompt } from "@/components/auth/SignInPrompt";

interface MasteryExamProps {
  masteryQuiz: MasteryQuiz;
  lessonSlug: string;
  allSectionsAttempted: boolean;
  isAuthenticated?: boolean;
  onComplete: (passed: boolean, score: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    const swap = copy[j];
    if (current === undefined || swap === undefined) continue;
    copy[i] = swap;
    copy[j] = current;
  }
  return copy;
}

export function MasteryExam({
  masteryQuiz,
  lessonSlug,
  allSectionsAttempted,
  isAuthenticated = true,
  onComplete,
}: MasteryExamProps) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<MasteryQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [results, setResults] = useState<
    Map<string, { isCorrect: boolean; xpEarned: number }>
  >(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(masteryQuiz.timeLimitMinutes * 60);

  const finishExam = useCallback(async () => {
    setFinished(true);
    const correctCount = Array.from(results.values()).filter(
      (r) => r.isCorrect
    ).length;
    const score = Math.round(
      (correctCount / Math.max(1, questions.length)) * 100
    );
    const passed = score >= masteryQuiz.passingScore;

    if (isAuthenticated) {
      try {
        await fetch(`/api/lessons/${lessonSlug}/mastery/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passed, score }),
        });
      } catch (err) {
        console.error("Mastery persist error:", err);
      }
    }

    onComplete(passed, score);
  }, [
    results,
    questions.length,
    masteryQuiz.passingScore,
    onComplete,
    isAuthenticated,
    lessonSlug,
  ]);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      finishExam();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, finished, timeLeft, finishExam]);

  function handleStart() {
    const count = Math.min(
      masteryQuiz.questionsPerAttempt,
      masteryQuiz.questionPool.length
    );
    const selected = shuffleArray(masteryQuiz.questionPool).slice(0, count);
    setQuestions(selected);
    setStarted(true);
    setTimeLeft(masteryQuiz.timeLimitMinutes * 60);
  }

  async function handleSubmitAnswer() {
    if (selectedAnswer === null || submitting) return;
    setSubmitting(true);

    const question = questions[currentIdx];
    if (!question) return;
    answers.set(question.id, selectedAnswer);
    setAnswers(new Map(answers));

    try {
      const res = await fetch(`/api/lessons/${lessonSlug}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedAnswer }),
      });
      const data = await res.json();
      results.set(question.id, {
        isCorrect: data.isCorrect,
        xpEarned: data.xpEarned,
      });
      setResults(new Map(results));
    } catch (err) {
      console.error("Mastery submit error:", err);
    } finally {
      setSubmitting(false);
      setSelectedAnswer(null);
      if (currentIdx + 1 >= questions.length) {
        finishExam();
      } else {
        setCurrentIdx(currentIdx + 1);
      }
    }
  }

  // Locked
  if (!allSectionsAttempted) {
    return (
      <div className="my-3xl rounded-lg border border-border bg-surface-sunken p-2xl text-center">
        <p className="font-display font-bold text-xl text-foreground mb-sm">
          Mastery Exam
        </p>
        <p className="font-body text-sm text-foreground-muted">
          Complete all section quizzes to unlock.
        </p>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="my-3xl rounded-lg border-2 border-gold/30 bg-gold-subtle/30 p-2xl text-center">
        <p className="font-display font-bold text-2xl text-foreground mb-sm">
          Mastery Exam
        </p>
        <p className="font-body text-sm text-foreground-secondary mb-xl">
          {Math.min(masteryQuiz.questionsPerAttempt, masteryQuiz.questionPool.length)} questions
          {" · "}{masteryQuiz.timeLimitMinutes} minutes
          {" · "}{masteryQuiz.passingScore}% to pass
        </p>
        <p className="font-body text-xs text-foreground-muted mb-2xl max-w-sm mx-auto">
          Questions are randomly drawn from the mastery pool. Each correct
          answer earns 30 XP.
        </p>
        {!isAuthenticated ? (
          <SignInPrompt message="Sign in to take the mastery exam and save your progress." />
        ) : (
          <button
            onClick={handleStart}
            className="inline-flex items-center px-2xl py-md font-body text-sm font-semibold text-surface-raised bg-gold hover:bg-gold-hover transition-colors rounded-lg shadow-sm"
          >
            Begin Exam
          </button>
        )}
      </div>
    );
  }

  // Finished
  if (finished) {
    const correctCount = Array.from(results.values()).filter(
      (r) => r.isCorrect
    ).length;
    const score = Math.round(
      (correctCount / Math.max(1, questions.length)) * 100
    );
    const passed = score >= masteryQuiz.passingScore;
    const totalXp = Array.from(results.values()).reduce(
      (s, r) => s + Math.max(0, r.xpEarned),
      0
    );

    return (
      <div
        className={`my-3xl rounded-lg border-2 p-2xl text-center ${
          passed
            ? "border-success/30 bg-success-subtle"
            : "border-error/30 bg-error-subtle"
        }`}
      >
        <p className="font-display font-bold text-2xl text-foreground mb-md">
          {passed ? "Mastery Achieved" : "Not Yet"}
        </p>
        <p className="font-display font-bold text-4xl text-foreground mb-sm tabular-nums">
          {correctCount}/{questions.length}
        </p>
        <p className="font-body text-sm text-foreground-secondary mb-lg">
          Score: {score}% · {passed ? "Passed" : `Need ${masteryQuiz.passingScore}%`}
        </p>
        <p className="font-display text-lg font-semibold text-gold tabular-nums">
          +{totalXp} XP
        </p>
      </div>
    );
  }

  // Active exam
  const question = questions[currentIdx];
  if (!question) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="my-3xl rounded-lg border-2 border-gold/20 bg-surface-raised p-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <span className="font-body text-sm font-medium text-foreground-muted tabular-nums">
          {currentIdx + 1} / {questions.length}
        </span>
        <span
          className={`font-body text-sm font-mono font-semibold tabular-nums ${
            timeLeft < 60 ? "text-error" : "text-foreground-secondary"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-surface-sunken rounded-full mb-2xl overflow-hidden">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${(currentIdx / questions.length) * 100}%` }}
        />
      </div>

      <p className="font-display text-lg font-semibold text-foreground mb-xl leading-snug">
        {question.question}
      </p>

      <div className="space-y-sm mb-xl">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => setSelectedAnswer(i)}
            disabled={submitting}
            className={`w-full text-left rounded-md border-2 px-lg py-md font-body text-sm transition-all ${
              selectedAnswer === i
                ? "border-gold bg-gold-subtle"
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

      <button
        onClick={handleSubmitAnswer}
        disabled={selectedAnswer === null || submitting}
        className={`w-full rounded-lg py-md px-xl font-body text-sm font-semibold transition-all ${
          selectedAnswer !== null && !submitting
            ? "bg-gold text-surface-raised hover:bg-gold-hover shadow-sm"
            : "bg-border text-foreground-muted cursor-not-allowed"
        }`}
      >
        {submitting
          ? "Submitting..."
          : currentIdx + 1 >= questions.length
          ? "Finish Exam"
          : "Next Question"}
      </button>
    </div>
  );
}
