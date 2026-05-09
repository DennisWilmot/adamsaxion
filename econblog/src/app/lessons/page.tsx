"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { FloatingIcons } from "@/components/FloatingIcons";
import type { LessonMeta } from "@/lib/types/lesson";

const CATEGORIES = ["All", "Microeconomics", "Macroeconomics", "Trade", "Finance"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const PER_PAGE = 9;

const CARD_GRADIENTS: Record<string, string> = {
  Microeconomics: "from-blue-600 to-indigo-700",
  Macroeconomics: "from-emerald-600 to-teal-700",
  Trade: "from-amber-500 to-orange-600",
  Finance: "from-violet-600 to-purple-700",
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((data) => setLessons(data.lessons ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      {/* Header */}
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-md mb-2xl">
        {/* Search */}
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

        {/* Category Filter */}
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

        {/* Difficulty Filter */}
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

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface-raised overflow-hidden animate-pulse"
            >
              <div className="h-44 bg-surface-sunken" />
              <div className="p-xl space-y-sm">
                <div className="h-4 bg-surface-sunken rounded w-1/3" />
                <div className="h-5 bg-surface-sunken rounded w-3/4" />
                <div className="h-4 bg-surface-sunken rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-xl">
          {paginated.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="group rounded-xl border border-border bg-surface-raised overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all"
            >
              {/* Thumbnail Area */}
              <div
                className={`relative h-44 bg-gradient-to-br ${
                  CARD_GRADIENTS[lesson.category] ?? "from-gray-600 to-gray-700"
                } flex items-center justify-center overflow-hidden`}
              >
                {/* Category Badge */}
                <span className="absolute top-md left-md bg-surface-raised/90 backdrop-blur-sm text-foreground font-body text-[10px] font-semibold tracking-widest uppercase px-sm py-[3px] rounded-md">
                  {lesson.category}
                </span>

                {/* Placeholder content — replaced with real images later */}
                <div className="text-center text-white/90">
                  <p className="font-display font-bold text-4xl opacity-20">
                    {lesson.id.match(/lesson-(\d+)/)?.[1] ?? "?"}
                  </p>
                </div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`grid-${lesson.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="currentColor" className="text-white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#grid-${lesson.id})`} />
                  </svg>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-xl">
                <div className="flex items-center gap-md mb-sm">
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

                <h2 className="font-display font-bold text-lg text-foreground mb-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {lesson.title}
                </h2>

                <p className="font-body text-sm text-foreground-muted leading-relaxed line-clamp-2 mb-lg">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-foreground-muted">
                    {lesson.sectionCount} sections · {lesson.subsectionCount} parts
                  </span>
                  <span className="flex items-center gap-xs font-body text-xs font-semibold text-primary group-hover:gap-sm transition-all">
                    Start <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
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

      {/* Pagination */}
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

      {/* Results count */}
      <p className="font-body text-xs text-foreground-muted text-center mt-lg">
        {filtered.length} lesson{filtered.length !== 1 ? "s" : ""} available
      </p>
    </div>
  );
}
