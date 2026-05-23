"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Check, ChevronRight, Trophy, Settings2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuizGate } from "@/components/quiz/QuizGate";
import { MasteryExam } from "@/components/quiz/MasteryExam";
import { PathSetupModal } from "@/components/learning/PathSetupModal";
import { LessonPreviewBanner } from "@/components/lesson/LessonPreviewBanner";
import { lessonMarkdownComponents } from "@/lib/lesson/markdown-components";
import { isLessonZeroSlug } from "@/lib/constants/lessons";
import type { LessonData, Section } from "@/lib/types/lesson";

export type LessonAccessMode = "full" | "preview";

function ProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 4.5,
  color = "var(--color-primary)",
  label,
  sublabel,
  layout = "row",
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel: string;
  layout?: "row" | "stack";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? value / max : 0;
  const offset = circumference * (1 - fraction);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  const ring = (
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
  );

  if (layout === "stack") {
    return (
      <div className="flex flex-col items-center text-center gap-xs">
        {ring}
        <div className="flex flex-col">
          <span className="font-body text-[11px] font-medium text-foreground-secondary leading-tight">
            {label}
          </span>
          <span className="font-body text-[10px] text-foreground-muted leading-tight">
            {sublabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-md">
      {ring}
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
  accessMode: LessonAccessMode;
  adminEditHref?: string | null;
}

function normalizeLessonMarkdown(content: string, subsectionTitle: string) {
  const escapedTitle = subsectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let normalized = content
    .replace(
      new RegExp(`^\\s{0,3}#{1,6}\\s+${escapedTitle}\\s*\\n+`, "i"),
      ""
    )
    .replace(/^\|\|/gm, "| |");

  // Recap hook when a subsection references a prior A/B choice without local context
  if (
    /\byou chose Option [AB]\b/i.test(normalized) &&
    !/\b(?:quick recap|previously|in the opening|earlier)\b/i.test(normalized)
  ) {
    normalized = normalized.replace(
      /^(Back in Zimbabwe, let's say you chose Option A \(food and medicine\)\.)/m,
      "> **Quick recap:** In the opening scenario, Option A meant importing food and medical supplies; Option B meant importing fuel and industrial equipment.\n\n$1"
    );
  }

  return normalized;
}

export function LessonPlayer({
  lesson,
  isAuthenticated,
  accessMode,
  adminEditHref,
}: LessonPlayerProps) {
  const isPreview = accessMode === "preview";
  const hasLessonAccess = accessMode === "full";
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
  const [loading, setLoading] = useState(isAuthenticated && hasLessonAccess);
  const [pathSetupOpen, setPathSetupOpen] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated || !hasLessonAccess) {
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
  }, [hasLessonAccess, isAuthenticated, lesson.id, lesson.sections]);

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
    if (isPreview) {
      return sectionId === lesson.sections[0]?.id;
    }
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
    if (isPreview) {
      return sectionIdx === 0;
    }
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
    } else if (!isPreview && activeSection < lesson.sections.length - 1) {
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

  const sectionSubsTotal =
    currentSection?.subsections.filter((s) => s.quiz).length ?? 0;
  const sectionSubsDone = currentSection
    ? currentSection.subsections.filter(
        (s) => s.quiz && progress.completedSubsections.includes(s.id)
      ).length
    : 0;
  const totalSections = lesson.sections.length;
  const completedSections = lesson.sections.filter((sec) =>
    sec.subsections
      .filter((s) => s.quiz)
      .every((s) => progress.completedSubsections.includes(s.id))
  ).length;
  const totalSubs = lesson.sections.reduce(
    (sum, sec) => sum + sec.subsections.filter((s) => s.quiz).length,
    0
  );
  const doneSubs = progress.completedSubsections.length;

  function selectSection(idx: number) {
    const section = lesson.sections[idx];
    if (!isSectionUnlocked(section.id)) return;
    setShowMastery(false);
    setActiveSection(idx);
    setActiveSubsection(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderSubsectionDots(className = "") {
    if (showMastery || !currentSection) return null;

    return (
      <div className={`flex items-center gap-[3px] ${className}`}>
        {currentSection.subsections.map((sub, idx) => {
          const accessible = canAccessSub(activeSection, idx);
          const completed = isSubCompleted(sub.id);
          const active = idx === activeSubsection;

          return (
            <button
              key={sub.id}
              onClick={() => accessible && setActiveSubsection(idx)}
              disabled={!accessible}
              aria-label={`Part ${idx + 1}${active ? ", current" : completed ? ", completed" : ""}`}
              className={`h-1.5 rounded-full transition-all ${
                active
                  ? "w-5 bg-primary"
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
    );
  }

  function renderSectionButton(section: Section, idx: number) {
    const unlocked = isSectionUnlocked(section.id);
    const completed = isSectionCompleted(section);
    const active = idx === activeSection && !showMastery;

    return (
      <button
        key={section.id}
        onClick={() => selectSection(idx)}
        disabled={!unlocked}
        className={`flex w-full items-center gap-xs rounded-md px-xs py-[6px] text-left font-body text-xs transition-colors ${
          active
            ? "bg-primary/10 text-primary font-medium"
            : unlocked
            ? "text-foreground-secondary hover:bg-surface-sunken hover:text-foreground"
            : "text-foreground-muted/40 cursor-not-allowed"
        }`}
      >
        {completed ? (
          <Check className="size-3 shrink-0 text-success" />
        ) : !unlocked ? (
          <Lock className="size-2.5 shrink-0" />
        ) : (
          <span className="size-3 shrink-0 rounded-full border border-border" />
        )}
        <span className="truncate">{idx + 1}. {section.title}</span>
      </button>
    );
  }

  const leftSidebarPanel = (
    <div className="rounded-lg border border-border/80 bg-surface-raised/40 p-md space-y-md">
      {!isPreview && (
        <>
          <div className="flex flex-col items-center gap-sm pb-md border-b border-border/60">
            <ProgressRing
              value={sectionSubsDone}
              max={sectionSubsTotal}
              size={72}
              strokeWidth={5}
              layout="stack"
              color="var(--color-primary)"
              label="This section"
              sublabel={`${sectionSubsDone} of ${sectionSubsTotal} parts`}
            />
            <div className="flex w-full justify-center gap-lg text-[10px] text-foreground-muted/80 tabular-nums">
              <span>{completedSections}/{totalSections} sections</span>
              <span>{doneSubs}/{totalSubs} overall</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-xs py-xs rounded-md bg-surface-sunken/60">
            <span className="font-body text-[10px] text-foreground-muted">XP earned</span>
            <span className="font-display font-semibold text-gold text-sm">
              {progress.totalXpEarned}
            </span>
          </div>
          <div className="border-t border-border/60" />
        </>
      )}

      {!showMastery && currentSection ? (
        <div className="space-y-sm">
          <div>
            <p className="font-body text-[9px] font-semibold uppercase tracking-widest text-primary mb-xs">
              Section {activeSection + 1}
            </p>
            <p className="font-display font-semibold text-sm text-foreground leading-snug">
              {currentSection.title}
            </p>
          </div>
          {renderSubsectionDots()}
        </div>
      ) : showMastery ? (
        <p className="font-body text-xs font-medium text-gold">Mastery Exam</p>
      ) : null}

      <div className="border-t border-border/60 pt-md space-y-[2px]">
        <p className="font-body text-[9px] font-semibold uppercase tracking-widest text-foreground-muted mb-xs px-xs">
          All sections
        </p>
        {lesson.sections.map((section, idx) => renderSectionButton(section, idx))}
        <button
          onClick={() => {
            if (!isPreview && allSectionsAttempted) {
              setShowMastery(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={isPreview || !allSectionsAttempted}
          className={`flex w-full items-center gap-xs rounded-md px-xs py-[6px] text-left font-body text-xs transition-colors ${
            showMastery
              ? "bg-gold/10 text-gold font-medium"
              : !isPreview && allSectionsAttempted
              ? "text-gold/70 hover:bg-surface-sunken"
              : "text-foreground-muted/40 cursor-not-allowed"
          }`}
        >
          <Trophy className="size-3 shrink-0" />
          <span>Mastery</span>
        </button>
      </div>
    </div>
  );

  const mobileSectionTabs = (
    <div className="flex gap-xs overflow-x-auto pb-sm mb-lg border-b border-border xl:hidden">
      {lesson.sections.map((section, idx) => {
        const unlocked = isSectionUnlocked(section.id);
        const completed = isSectionCompleted(section);
        const active = idx === activeSection && !showMastery;

        return (
          <button
            key={section.id}
            onClick={() => selectSection(idx)}
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
            <span>Section {idx + 1}</span>
          </button>
        );
      })}
      <button
        onClick={() => {
          if (!isPreview && allSectionsAttempted) {
            setShowMastery(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        disabled={isPreview}
        className={`flex items-center gap-xs px-lg py-sm font-body text-sm font-medium whitespace-nowrap rounded-t-md transition-all ${
          showMastery
            ? "text-gold border-b-2 border-gold -mb-[1px]"
            : !isPreview && allSectionsAttempted
            ? "text-gold/60 hover:text-gold"
            : "text-border cursor-not-allowed"
        }`}
      >
        <Trophy className="size-3.5" />
        <span>Mastery</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-3xl">
      <div className="mx-auto max-w-[72rem] px-lg lg:px-xl pt-lg lg:pt-xl">
        {adminEditHref ? (
          <div className="flex justify-end mb-sm">
            <Link
              href={adminEditHref}
              className="inline-flex items-center gap-xs rounded-md border border-border/70 bg-surface-raised/60 px-sm py-[5px] font-body text-[10px] font-medium text-foreground-muted transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Settings2 className="h-3 w-3" />
              Generator
            </Link>
          </div>
        ) : null}

        <div className="flex gap-lg xl:gap-xl items-start">
          {/* Left — progress + sections */}
          <aside
            className="hidden xl:block w-[14rem] shrink-0 sticky top-16 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto"
            aria-label="Lesson progress and sections"
          >
            {leftSidebarPanel}
          </aside>

          {/* Center — reading column */}
          <main className="flex-1 min-w-0 max-w-[42rem] mx-auto w-full">
            <div className="mb-lg lg:mb-xl">
              <p className="font-body text-[11px] text-foreground-muted mb-xs">
                <span className="text-primary font-medium">{lesson.category}</span>
                {" · "}
                {lesson.difficulty}
                {" · "}
                {lesson.estimatedMinutes} min
              </p>
              <h1 className="font-display font-bold text-2xl text-foreground leading-snug tracking-tight">
                {lesson.title}
              </h1>
              {isPreview ? (
                <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-primary mt-sm">
                  Preview — Section 1
                </p>
              ) : null}
            </div>

            {!isPreview && (
              <div className="xl:hidden mb-lg rounded-lg border border-border/80 bg-surface-raised/40 p-md space-y-sm">
                <div className="flex flex-col items-center gap-sm pb-sm border-b border-border/60">
                  <ProgressRing
                    value={sectionSubsDone}
                    max={sectionSubsTotal}
                    size={64}
                    strokeWidth={4.5}
                    layout="stack"
                    color="var(--color-primary)"
                    label="This section"
                    sublabel={`${sectionSubsDone} of ${sectionSubsTotal} parts`}
                  />
                  <div className="flex justify-center gap-lg text-[10px] text-foreground-muted/80 tabular-nums">
                    <span>{completedSections}/{totalSections} sections</span>
                    <span>{doneSubs}/{totalSubs} overall</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-xs">
                  <span className="font-display font-semibold text-gold text-base">
                    {progress.totalXpEarned}
                  </span>
                  <span className="font-body text-[10px] text-foreground-muted">XP earned</span>
                </div>
                {!showMastery && currentSection ? (
                  <div className="pt-sm border-t border-border/60 space-y-xs">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-primary">
                      Section {activeSection + 1}
                    </p>
                    <p className="font-display font-semibold text-sm text-foreground leading-snug">
                      {currentSection.title}
                    </p>
                    {renderSubsectionDots()}
                  </div>
                ) : null}
              </div>
            )}

            {mobileSectionTabs}

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
              {currentSub && (
                <div key={currentSub.id}>
                  <h2 className="font-display font-bold text-xl text-foreground mb-xl pb-md border-b border-border/50 tracking-tight">
                    {currentSub.title}
                  </h2>

                  <div className="prose-custom font-body text-[17px] text-foreground-secondary leading-[1.8]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={lessonMarkdownComponents}
                    >
                      {normalizeLessonMarkdown(currentSub.content, currentSub.title)}
                    </ReactMarkdown>
                  </div>

                  {currentSub.quiz ? (
                    <QuizGate
                      quiz={currentSub.quiz}
                      lessonSlug={lesson.id}
                      status={quizStatuses[currentSub.quiz.id]}
                      isAuthenticated={isAuthenticated}
                      hasLessonAccess={hasLessonAccess}
                      onComplete={handleQuizComplete}
                    />
                  ) : null}

                  {isPreview &&
                  activeSection === 0 &&
                  activeSubsection === currentSection.subsections.length - 1 ? (
                    <LessonPreviewBanner sectionCount={lesson.sections.length} />
                  ) : null}

                  {(() => {
                    const canGoNext =
                      activeSubsection < currentSection.subsections.length - 1 ||
                      (!isPreview && activeSection < lesson.sections.length - 1);
                    const nextDisabled =
                      !isPreview &&
                      isAuthenticated &&
                      !!currentSub.quiz &&
                      !isSubCompleted(currentSub.id) &&
                      !quizStatuses[currentSub.quiz.id]?.isCorrect &&
                      !quizStatuses[currentSub.quiz.id]?.locked;

                    if (!canGoNext) return null;

                    return (
                      <div className="flex justify-end mt-xl mb-3xl">
                        <button
                          onClick={goToNextSubsection}
                          disabled={nextDisabled}
                          className={`flex items-center gap-sm px-xl py-md rounded-lg font-body text-sm font-semibold transition-all ${
                            nextDisabled
                              ? "bg-border text-foreground-muted cursor-not-allowed"
                              : "bg-primary text-surface-raised hover:bg-primary-hover shadow-sm"
                          }`}
                        >
                          Next <ChevronRight className="size-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
          </main>
        </div>
      </div>

      <PathSetupModal
        open={pathSetupOpen}
        onClose={() => setPathSetupOpen(false)}
        onComplete={() => setPathSetupOpen(false)}
        entryBranch="lesson_zero"
      />
    </div>
  );
}
