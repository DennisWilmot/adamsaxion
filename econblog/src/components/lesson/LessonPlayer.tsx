"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Check, ChevronRight, Trophy } from "lucide-react";
import { QuizGate } from "@/components/quiz/QuizGate";
import { MasteryExam } from "@/components/quiz/MasteryExam";
import { FloatingIcons } from "@/components/FloatingIcons";
import type { LessonData, Section } from "@/lib/types/lesson";

interface LessonProgress {
  completedSubsections: string[];
  unlockedSections: string[];
  totalXpEarned: number;
  masteryAttempted: boolean;
  masteryPassed: boolean;
}

interface QuizStatuses {
  [questionId: string]: {
    answered: boolean;
    isCorrect: boolean;
    attemptsUsed: number;
    attemptsRemaining: number;
    locked: boolean;
    lockedUntil: string | null;
    xpEarned: number;
  };
}

interface LessonPlayerProps {
  lesson: LessonData;
  isAuthenticated: boolean;
}

export function LessonPlayer({ lesson, isAuthenticated }: LessonPlayerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState(0);
  const [showMastery, setShowMastery] = useState(false);
  const [progress, setProgress] = useState<LessonProgress>({
    completedSubsections: [],
    unlockedSections: [lesson.sections[0]?.id],
    totalXpEarned: 0,
    masteryAttempted: false,
    masteryPassed: false,
  });
  const [quizStatuses, setQuizStatuses] = useState<QuizStatuses>({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const [progressRes, statusRes] = await Promise.all([
        fetch(`/api/lessons/${lesson.id}/progress`),
        fetch(`/api/lessons/${lesson.id}/quiz/status`),
      ]);
      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress({
          completedSubsections: data.completedSubsections ?? [],
          unlockedSections: data.unlockedSections?.length
            ? data.unlockedSections
            : [lesson.sections[0]?.id],
          totalXpEarned: data.totalXpEarned ?? 0,
          masteryAttempted: data.masteryAttempted ?? false,
          masteryPassed: data.masteryPassed ?? false,
        });
      }
      if (statusRes.ok) {
        const data = await statusRes.json();
        setQuizStatuses(data.statuses ?? {});
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, lesson.id, lesson.sections]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const currentSection = lesson.sections[activeSection];
  const currentSub = currentSection?.subsections[activeSubsection];

  const allSectionsAttempted = lesson.sections.every((section) =>
    section.subsections
      .filter((sub) => sub.quiz)
      .every((sub) => {
        const status = quizStatuses[sub.quiz!.id];
        return status?.answered;
      })
  );

  function isSectionUnlocked(sectionId: string) {
    if (!isAuthenticated) return true;
    if (sectionId === lesson.sections[0]?.id) return true;
    return progress.unlockedSections.includes(sectionId);
  }

  function isSectionCompleted(section: Section) {
    return section.subsections
      .filter((s) => s.quiz)
      .every((s) => progress.completedSubsections.includes(s.id));
  }

  function isSubCompleted(subId: string) {
    return progress.completedSubsections.includes(subId);
  }

  function canAccessSub(sectionIdx: number, subIdx: number) {
    if (!isAuthenticated) return true;
    if (subIdx === 0) return true;
    const prevSub = lesson.sections[sectionIdx].subsections[subIdx - 1];
    if (!prevSub.quiz) return true;
    const status = quizStatuses[prevSub.quiz.id];
    return status?.isCorrect || status?.locked || isSubCompleted(prevSub.id);
  }

  function handleQuizComplete(correct: boolean, xpEarned: number) {
    if (correct && currentSub) {
      setProgress((prev) => ({
        ...prev,
        completedSubsections: prev.completedSubsections.includes(currentSub.id)
          ? prev.completedSubsections
          : [...prev.completedSubsections, currentSub.id],
        totalXpEarned: prev.totalXpEarned + Math.max(0, xpEarned),
      }));
    }
    fetchProgress();
  }

  function goToNextSubsection() {
    const section = lesson.sections[activeSection];
    if (activeSubsection < section.subsections.length - 1) {
      setActiveSubsection(activeSubsection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeSection < lesson.sections.length - 1) {
      const nextSectionId = lesson.sections[activeSection + 1].id;
      if (isSectionUnlocked(nextSectionId)) {
        setActiveSection(activeSection + 1);
        setActiveSubsection(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-body text-foreground-muted animate-pulse">
          Loading lesson...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[56rem] mx-auto px-xl py-2xl">
      {/* Lesson Header */}
      <div className="relative mb-2xl overflow-hidden rounded-xl bg-surface-sunken p-xl">
        <FloatingIcons count={16} />
        <div className="relative z-10">
          <div className="flex items-center gap-md font-body text-xs mb-sm">
            <span className="font-semibold tracking-widest uppercase text-primary">
              {lesson.category}
            </span>
            <span className="text-foreground-muted">{lesson.difficulty}</span>
            <span className="text-foreground-muted">{lesson.estimatedMinutes} min</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-sm leading-tight">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-xl font-body text-sm text-foreground-muted">
            <span className="tabular-nums">
              <span className="font-display font-semibold text-gold">
                {progress.totalXpEarned}
              </span>{" "}
              XP earned
            </span>
            <span className="tabular-nums">
              {progress.completedSubsections.length} /{" "}
              {lesson.sections.reduce(
                (s, sec) => s + sec.subsections.filter((sub) => sub.quiz).length,
                0
              )}{" "}
              completed
            </span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-xs overflow-x-auto pb-sm mb-2xl border-b border-border">
        {lesson.sections.map((section, idx) => {
          const unlocked = isSectionUnlocked(section.id);
          const completed = isSectionCompleted(section);
          const active = idx === activeSection && !showMastery;

          return (
            <button
              key={section.id}
              onClick={() => {
                if (unlocked) {
                  setShowMastery(false);
                  setActiveSection(idx);
                  setActiveSubsection(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              disabled={!unlocked}
              className={`flex items-center gap-xs px-lg py-sm font-body text-sm font-medium whitespace-nowrap rounded-t-md transition-all ${
                active
                  ? "text-primary border-b-2 border-primary -mb-[1px]"
                  : unlocked
                  ? "text-foreground-muted hover:text-foreground"
                  : "text-border cursor-not-allowed"
              }`}
            >
              {completed ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : !unlocked ? (
                <Lock className="h-3 w-3" />
              ) : null}
              <span className="hidden sm:inline">Section {idx + 1}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </button>
          );
        })}

        {/* Mastery Tab */}
        {isAuthenticated && (
          <button
            onClick={() => {
              setShowMastery(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex items-center gap-xs px-lg py-sm font-body text-sm font-medium whitespace-nowrap rounded-t-md transition-all ${
              showMastery
                ? "text-gold border-b-2 border-gold -mb-[1px]"
                : allSectionsAttempted
                ? "text-gold/60 hover:text-gold"
                : "text-border cursor-not-allowed"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mastery</span>
          </button>
        )}
      </div>

      {/* Mastery View */}
      {showMastery ? (
        <MasteryExam
          masteryQuiz={lesson.masteryQuiz}
          lessonSlug={lesson.id}
          allSectionsAttempted={allSectionsAttempted}
          onComplete={(passed, score) => {
            setProgress((prev) => ({
              ...prev,
              masteryAttempted: true,
              masteryPassed: passed,
            }));
            fetchProgress();
          }}
        />
      ) : (
        <>
          {/* Section Title */}
          <h2 className="font-display font-bold text-xl text-foreground mb-sm">
            {currentSection.title}
          </h2>

          {/* Subsection Progress Dots */}
          <div className="flex items-center gap-[3px] mb-2xl">
            {currentSection.subsections.map((sub, idx) => {
              const accessible = canAccessSub(activeSection, idx);
              const completed = isSubCompleted(sub.id);
              const active = idx === activeSubsection;

              return (
                <button
                  key={sub.id}
                  onClick={() => accessible && setActiveSubsection(idx)}
                  disabled={!accessible}
                  className={`h-1.5 rounded-full transition-all ${
                    active
                      ? "w-6 bg-primary"
                      : completed
                      ? "w-1.5 bg-success"
                      : accessible
                      ? "w-1.5 bg-border hover:bg-foreground-muted"
                      : "w-1.5 bg-border-subtle"
                  }`}
                />
              );
            })}
          </div>

          {/* Subsection Content */}
          {currentSub && (
            <div key={currentSub.id}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-lg">
                {currentSub.title}
              </h3>

              <div
                className="prose-custom font-body text-base text-foreground-secondary leading-relaxed max-w-[52rem]"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(currentSub.content),
                }}
              />

              {currentSub.quiz ? (
                <QuizGate
                  quiz={currentSub.quiz}
                  lessonSlug={lesson.id}
                  status={quizStatuses[currentSub.quiz.id]}
                  isAuthenticated={isAuthenticated}
                  onComplete={handleQuizComplete}
                />
              ) : null}

              {/* Navigation */}
              <div className="flex justify-end mt-xl mb-3xl">
                {(activeSubsection < currentSection.subsections.length - 1 ||
                  activeSection < lesson.sections.length - 1) && (
                  <button
                    onClick={goToNextSubsection}
                    disabled={
                      !!(
                        isAuthenticated &&
                        currentSub.quiz &&
                        !isSubCompleted(currentSub.id) &&
                        !quizStatuses[currentSub.quiz.id]?.isCorrect &&
                        !quizStatuses[currentSub.quiz.id]?.locked
                      )
                    }
                    className={`flex items-center gap-sm px-xl py-md rounded-lg font-body text-sm font-semibold transition-all ${
                      isAuthenticated &&
                      currentSub.quiz &&
                      !isSubCompleted(currentSub.id) &&
                      !quizStatuses[currentSub.quiz.id]?.isCorrect &&
                      !quizStatuses[currentSub.quiz.id]?.locked
                        ? "bg-border text-foreground-muted cursor-not-allowed"
                        : "bg-primary text-surface-raised hover:bg-primary-hover shadow-sm"
                    }`}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  html = `<p>${html}</p>`;
  html = html
    .replace(/<p><h([1-4])>/g, "<h$1>")
    .replace(/<\/h([1-4])><\/p>/g, "</h$1>");
  html = html
    .replace(/<p><ul>/g, "<ul>")
    .replace(/<\/ul><\/p>/g, "</ul>");
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
