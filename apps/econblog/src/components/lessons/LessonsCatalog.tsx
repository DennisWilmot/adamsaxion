"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowRight, Lock } from "lucide-react";
import { FloatingIcons } from "@/components/FloatingIcons";
import { LessonsPageExtras } from "@/components/lessons/LessonsPageExtras";
import { isLessonZeroSlug } from "@/lib/constants/lessons";
import type { UserDashboard } from "@/lib/learning/user-dashboard";
import type { LessonMeta } from "@/lib/types/lesson";

const CATEGORIES = ["All", "Microeconomics", "Macroeconomics", "Trade", "Finance"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const PER_PAGE = 6;

const CARD_GRADIENTS: Record<string, string> = {
  Microeconomics: "from-blue-600 to-indigo-700",
  Macroeconomics: "from-emerald-600 to-teal-700",
  Trade: "from-amber-500 to-orange-600",
  Finance: "from-violet-600 to-purple-700",
};

interface LessonsCatalogProps {
  lessons: LessonMeta[];
  initialDashboard: UserDashboard | null;
  initialHasAccess: boolean | null;
}

export function LessonsCatalog({
  lessons,
  initialDashboard,
  initialHasAccess,
}: LessonsCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [page, setPage] = useState(1);
  const hasAccess = initialHasAccess;

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (category !== "All" && l.category !== category) return false;
      if (difficulty !== "All" && l.difficulty !== difficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lessons, search, category, difficulty]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, category, difficulty]);

  return (
    <div className="max-w-[72rem] mx-auto px-xl py-3xl">
      <div className="relative mb-2xl overflow-hidden rounded-xl bg-surface-sunken p-xl">
        <FloatingIcons count={18} />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-3xl text-foreground mb-sm">
            Lessons
          </h1>
          <p className="font-body text-base text-foreground-secondary max-w-lg">
            Choose a topic. Each lesson has gated sections, quizzes, and a
            mastery exam.
          </p>
        </div>
      </div>

      <LessonsPageExtras initialDashboard={initialDashboard} />

      <div className="flex flex-col sm:flex-row gap-md mb-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-md top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-2xl pr-lg py-sm rounded-lg border border-border bg-surface-raised font-body text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="flex gap-xs overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-md py-xs rounded-md font-body text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-primary text-surface-raised"
                  : "bg-surface-sunken text-foreground-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-md py-sm rounded-lg border border-border bg-surface-raised font-body text-xs text-foreground-secondary focus:outline-none focus:border-primary cursor-pointer"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Levels" : d}
            </option>
          ))}
        </select>
      </div>

      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-xl">
          {paginated.map((lesson) => {
            const isFree = isLessonZeroSlug(lesson.id);
            const isLocked = hasAccess === false && !isFree;
            const lessonHref = `/lessons/${lesson.id}`;

            return (
              <Link
                key={lesson.id}
                href={lessonHref}
                className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-surface-raised transition-all hover:shadow-lg ${
                  isLocked
                    ? "border-border-subtle hover:border-border"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="relative h-44 overflow-hidden border-b border-border-subtle">
                  {lesson.thumbnail ? (
                    <img
                      src={lesson.thumbnail}
                      alt={`${lesson.title} thumbnail`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        CARD_GRADIENTS[lesson.category] ?? "from-gray-600 to-gray-700"
                      }`}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/8" />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}

                  {isFree && (
                    <span className="absolute left-md top-md flex items-center gap-xs rounded-md border border-white/25 bg-surface-raised/95 px-sm py-[3px] font-body text-[10px] font-semibold tracking-widest uppercase text-success shadow-md backdrop-blur-sm">
                      Free
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute left-md top-md flex items-center gap-xs rounded-md border border-white/25 bg-surface-raised/95 px-sm py-[3px] font-body text-[10px] font-semibold tracking-widest uppercase text-foreground shadow-md backdrop-blur-sm">
                      <Lock className="size-3" />
                      Subscribe
                    </span>
                  )}

                  <span className="absolute right-md top-md rounded-md border border-white/25 bg-surface-raised/95 px-sm py-[3px] font-body text-[10px] font-semibold tracking-widest uppercase text-foreground shadow-md backdrop-blur-sm">
                    {lesson.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-xl">
                  <div className="mb-sm flex flex-wrap items-center gap-x-md gap-y-xs">
                    <span className="font-body text-xs text-foreground-muted">
                      {lesson.difficulty}
                    </span>
                    <span className="text-border">·</span>
                    <span className="font-body text-xs text-foreground-muted">
                      {lesson.estimatedMinutes} min
                    </span>
                    <span className="text-border">·</span>
                    <span className="font-body text-xs font-semibold text-gold tabular-nums">
                      {lesson.totalXp.toLocaleString()} XP
                    </span>
                  </div>

                  <h2
                    className={`font-display font-bold text-lg mb-sm leading-snug line-clamp-2 transition-colors ${
                      isLocked
                        ? "text-foreground-secondary"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {lesson.title}
                  </h2>

                  <p className="mb-lg flex-1 font-body text-sm leading-relaxed text-foreground-muted line-clamp-3">
                    {lesson.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-md border-t border-border-subtle pt-md">
                    <span className="font-body text-xs text-foreground-muted">
                      {lesson.sectionCount} sections · {lesson.subsectionCount} parts
                    </span>
                    <span
                      className={`flex items-center gap-xs font-body text-xs font-semibold group-hover:gap-sm transition-all ${
                        isLocked ? "text-foreground-muted" : "text-primary"
                      }`}
                    >
                      {isLocked ? "Unlock" : "Start"}{" "}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-5xl text-center">
          <p className="font-display text-xl text-foreground-muted mb-sm">
            No lessons found
          </p>
          <p className="font-body text-sm text-foreground-muted">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-sm mt-3xl">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-sm rounded-md border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-md font-body text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-surface-raised"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-sunken"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-sm rounded-md border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="font-body text-xs text-foreground-muted text-center mt-lg">
        {filtered.length} {filtered.length === 1 ? "lesson" : "lessons"} available
      </p>
    </div>
  );
}
