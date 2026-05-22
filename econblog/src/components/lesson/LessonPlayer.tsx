"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Check, ChevronRight, Trophy, Settings2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuizGate } from "@/components/quiz/QuizGate";
import { MasteryExam } from "@/components/quiz/MasteryExam";
import { FloatingIcons } from "@/components/FloatingIcons";
import { PathSetupModal } from "@/components/learning/PathSetupModal";
import { isLessonZeroSlug } from "@/lib/constants/lessons";
import type { LessonData, Section } from "@/lib/types/lesson";

function ProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 4.5,
  color = "var(--color-primary)",
  label,
  sublabel,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? value / max : 0;
  const offset = circumference * (1 - fraction);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex items-center gap-md">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground font-display font-bold"
          style={{ fontSize: size * 0.22 }}
        >
          {pct}%
        </text>
      </svg>
      <div className="flex flex-col">
        <span className="font-body text-xs font-semibold text-foreground leading-tight">{label}</span>
        <span className="font-body text-[11px] text-foreground-muted leading-tight">{sublabel}</span>
      </div>
    </div>
  );
}

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
  adminEditHref?: string | null;
}

function normalizeLessonMarkdown(content: string, subsectionTitle: string) {
  const escapedTitle = subsectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return content
    .replace(
      new RegExp(`^\\s{0,3}#{1,6}\\s+${escapedTitle}\\s*\\n+`, "i"),
      ""
    )
    .replace(/^\|\|/gm, "| |");
}

export function LessonPlayer({ lesson, isAuthenticated, adminEditHref }: LessonPlayerProps) {
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
  const [pathSetupOpen, setPathSetupOpen] = useState(false);

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
      {adminEditHref ? (
        <div className="mb-lg flex justify-end">
          <Link
            href={adminEditHref}
            className="inline-flex items-center gap-sm rounded-lg border border-border bg-surface-raised px-md py-sm font-body text-xs font-semibold text-foreground-secondary transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Open in Lesson Generator
          </Link>
        </div>
      ) : null}

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
          <h1 className="font-display font-semibold text-2xl text-foreground mb-md leading-tight">
            {lesson.title}
          </h1>
          {(() => {
            const sectionSubsTotal = currentSection?.subsections.filter((s) => s.quiz).length ?? 0;
            const sectionSubsDone = currentSection
              ? currentSection.subsections.filter((s) => s.quiz && progress.completedSubsections.includes(s.id)).length
              : 0;

            const totalSections = lesson.sections.length;
            const completedSections = lesson.sections.filter((sec) =>
              sec.subsections.filter((s) => s.quiz).every((s) => progress.completedSubsections.includes(s.id))
            ).length;

            const totalSubs = lesson.sections.reduce((sum, sec) => sum + sec.subsections.filter((s) => s.quiz).length, 0);
            const doneSubs = progress.completedSubsections.length;

            return (
              <div className="flex flex-wrap items-center gap-lg mt-md">
                <ProgressRing
                  value={sectionSubsDone}
                  max={sectionSubsTotal}
                  color="var(--color-primary)"
                  label="This Section"
                  sublabel={`${sectionSubsDone} of ${sectionSubsTotal} parts done`}
                />
                <div className="h-10 w-px bg-border hidden sm:block" />
                <ProgressRing
                  value={completedSections}
                  max={totalSections}
                  color="var(--color-gold, #d4a017)"
                  label="Sections Complete"
                  sublabel={`${completedSections} of ${totalSections} sections`}
                />
                <div className="h-10 w-px bg-border hidden sm:block" />
                <ProgressRing
                  value={doneSubs}
                  max={totalSubs}
                  color="#22c55e"
                  label="Overall Lesson"
                  sublabel={`${doneSubs} of ${totalSubs} total`}
                />
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-display font-semibold text-gold text-lg leading-tight">{progress.totalXpEarned}</span>
                  <span className="font-body text-[11px] text-foreground-muted leading-tight">XP earned</span>
                </div>
              </div>
            );
          })()}
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
                <Check className="size-3.5 text-success" />
              ) : !unlocked ? (
                <Lock className="size-3" />
              ) : null}
              <span className="hidden sm:inline">Section {idx + 1}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </button>
          );
        })}

        {/* Mastery Tab — visible to all; sign-in required to start exam */}
        <button
          onClick={() => {
            if (allSectionsAttempted) {
              setShowMastery(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`flex items-center gap-xs px-lg py-sm font-body text-sm font-medium whitespace-nowrap rounded-t-md transition-all ${
            showMastery
              ? "text-gold border-b-2 border-gold -mb-[1px]"
              : allSectionsAttempted
              ? "text-gold/60 hover:text-gold"
              : "text-border cursor-not-allowed"
          }`}
        >
          <Trophy className="size-3.5" />
          <span className="hidden sm:inline">Mastery</span>
        </button>
      </div>

      {/* Mastery View */}
      {showMastery ? (
        <MasteryExam
          masteryQuiz={lesson.masteryQuiz}
          lessonSlug={lesson.id}
          allSectionsAttempted={allSectionsAttempted}
          isAuthenticated={isAuthenticated}
          onComplete={(passed) => {
            setProgress((prev) => ({
              ...prev,
              masteryAttempted: true,
              masteryPassed: passed,
            }));
            fetchProgress();
            if (passed && isLessonZeroSlug(lesson.id) && isAuthenticated) {
              setPathSetupOpen(true);
            }
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

              <div className="prose-custom font-body text-base text-foreground-secondary leading-relaxed max-w-[52rem]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {normalizeLessonMarkdown(currentSub.content, currentSub.title)}
                </ReactMarkdown>
              </div>

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
                    Next <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <PathSetupModal
        open={pathSetupOpen}
        onClose={() => setPathSetupOpen(false)}
        onComplete={() => setPathSetupOpen(false)}
        entryBranch="lesson_zero"
      />
    </div>
  );
}
