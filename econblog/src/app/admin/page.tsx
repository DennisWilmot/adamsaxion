"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus, FileText, Trash2, Layers, Zap, Search, LayoutGrid, List,
} from "lucide-react";

interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  thumbnail: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

type ViewMode = "list" | "card";

const STATUS_COLORS: Record<string, string> = {
  research: "bg-yellow-100 text-yellow-800",
  outline: "bg-orange-100 text-orange-800",
  content: "bg-blue-100 text-blue-800",
  questions: "bg-indigo-100 text-indigo-800",
  mastery: "bg-purple-100 text-purple-800",
  review: "bg-emerald-100 text-emerald-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
};

const CATEGORIES = ["Microeconomics", "Macroeconomics", "Trade", "Finance"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const STATUS_FILTERS = [
  "All",
  "research",
  "outline",
  "content",
  "questions",
  "mastery",
  "review",
  "published",
  "archived",
];

const CARD_GRADIENTS: Record<string, string> = {
  Microeconomics: "from-blue-600 to-indigo-700",
  Macroeconomics: "from-emerald-600 to-teal-700",
  Trade: "from-amber-500 to-orange-600",
  Finance: "from-violet-600 to-purple-700",
};

function parseBatchLessons(input: string) {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    return [];
  }

  const hasStructuredRows =
    normalizedInput.includes("|") || normalizedInput.includes("\t");

  if (!hasStructuredRows) {
    return normalizedInput
      .split(/[,\n]/)
      .map((title) => title.trim())
      .filter(Boolean)
      .map((title) => ({
        title,
        description: "",
        category: "",
        difficulty: "",
      }));
  }

  return normalizedInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("\t")
        ? line.split("\t")
        : line.split("|");

      const [title, description = "", category = "", difficulty = ""] = parts.map(
        (part) => part.trim()
      );

      return {
        title,
        description,
        category,
        difficulty,
      };
    })
    .filter((lesson) => lesson.title);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-sm py-[2px] rounded text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

function LessonThumbnail({
  lesson,
  className = "h-full w-full object-cover",
}: {
  lesson: LessonSummary;
  className?: string;
}) {
  if (lesson.thumbnail) {
    return (
      <img
        src={lesson.thumbnail}
        alt={`${lesson.title} thumbnail`}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${
        CARD_GRADIENTS[lesson.category] ?? "from-gray-600 to-gray-700"
      } flex items-center justify-center`}
    >
      <FileText className="h-10 w-10 text-white/30" />
    </div>
  );
}

export default function AdminPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBatchCreate, setShowBatchCreate] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Microeconomics");
  const [newDifficulty, setNewDifficulty] = useState("Intermediate");
  const [creating, setCreating] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [batchCategory, setBatchCategory] = useState("Microeconomics");
  const [batchDifficulty, setBatchDifficulty] = useState("Intermediate");
  const [batchCreating, setBatchCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const parsedBatchLessons = parseBatchLessons(batchInput);

  useEffect(() => {
    const saved = localStorage.getItem("admin-lessons-view");
    if (saved === "list" || saved === "card") {
      setViewMode(saved);
    }
  }, []);

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem("admin-lessons-view", mode);
  }

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      if (categoryFilter !== "All" && lesson.category !== categoryFilter) {
        return false;
      }
      if (difficultyFilter !== "All" && lesson.difficulty !== difficultyFilter) {
        return false;
      }
      if (statusFilter !== "All" && lesson.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          lesson.title.toLowerCase().includes(q) ||
          lesson.description.toLowerCase().includes(q) ||
          lesson.category.toLowerCase().includes(q) ||
          lesson.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lessons, search, categoryFilter, difficultyFilter, statusFilter]);

  async function loadLessons() {
    const res = await fetch("/api/admin/lessons");
    const data = await res.json();
    setLessons(data.lessons ?? []);
    setLoading(false);
  }

  useEffect(() => { loadLessons(); }, []);

  async function handleCreate() {
    if (!newTopic.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: newTopic.trim(),
        description: newDescription.trim(),
        category: newCategory,
        difficulty: newDifficulty,
      }),
    });
    if (res.ok) {
      setNewTopic("");
      setNewDescription("");
      setShowCreate(false);
      await loadLessons();
    }
    setCreating(false);
  }

  async function handleBatchCreate() {
    if (parsedBatchLessons.length === 0) return;

    setBatchCreating(true);

    const payload = parsedBatchLessons.map((lesson) => ({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category || batchCategory,
      difficulty: lesson.difficulty || batchDifficulty,
    }));

    const res = await fetch("/api/admin/lessons/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessons: payload,
        defaultCategory: batchCategory,
        defaultDifficulty: batchDifficulty,
        autoQueue: true,
      }),
    });

    if (res.ok) {
      setBatchInput("");
      setShowBatchCreate(false);
      await loadLessons();
    }

    setBatchCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    await loadLessons();
  }

  return (
    <div className="max-w-[72rem] mx-auto px-xl py-3xl">
      <div className="mb-2xl flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Lesson Generator
          </h1>
          <p className="font-body text-sm text-foreground-secondary mt-xs">
            Create, generate, and publish lessons
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => setShowBatchCreate(!showBatchCreate)}
            className="flex items-center gap-sm rounded-lg border border-border bg-surface-raised px-lg py-md font-body text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Layers className="h-4 w-4" />
            Batch Queue
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-sm rounded-lg bg-primary px-lg py-md font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            New Lesson
          </button>
        </div>
      </div>

      {showBatchCreate && (
        <div className="mb-2xl rounded-xl border border-border bg-surface-raised p-xl">
          <div className="mb-lg flex items-start justify-between gap-lg">
            <div>
              <h2 className="font-display font-semibold text-lg">
                Batch Queue Lessons
              </h2>
              <p className="mt-xs max-w-2xl font-body text-sm text-foreground-secondary">
                Paste lesson titles separated by commas and the worker will keep
                pulling jobs until the queue is empty. If you want per-lesson
                description, category, or difficulty, use
                <code className="mx-1 rounded bg-surface-sunken px-1.5 py-0.5 text-xs">Title | Description</code>
                or tab-separated rows from a spreadsheet. Category and difficulty
                can be added as the 3rd and 4th columns.
              </p>
            </div>
            <span className="inline-flex items-center gap-xs rounded-full bg-amber-50 px-sm py-xs font-body text-xs font-medium text-amber-800">
              <Zap className="h-3.5 w-3.5" />
              Auto-queues generation
            </span>
          </div>

          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 mb-lg">
            <div>
              <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                Default Category
              </label>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                Default Difficulty
              </label>
              <select
                value={batchDifficulty}
                onChange={(e) => setBatchDifficulty(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            rows={10}
            placeholder={`Game Theory, Keynesian Economics, International Trade\n\nOr use structured rows:\nGame Theory | Strategic interaction, incentives, and equilibrium across real-world decisions\nInternational Trade\tComparative advantage, tariffs, and global exchange\tTrade\tIntermediate`}
            className="mb-md w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="flex flex-wrap items-center justify-between gap-md">
            <p className="font-body text-sm text-foreground-muted">
              {parsedBatchLessons.length}{" "}
              {parsedBatchLessons.length === 1 ? "lesson" : "lessons"} ready to
              create and queue
            </p>
            <div className="flex gap-md">
              <button
                onClick={() => setShowBatchCreate(false)}
                className="rounded-lg border border-border px-xl py-md font-body text-sm transition-colors hover:bg-surface-sunken"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchCreate}
                disabled={parsedBatchLessons.length === 0 || batchCreating}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-xl py-md font-body text-sm font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
              >
                {batchCreating
                  ? "Queueing Lessons..."
                  : `Create + Queue ${parsedBatchLessons.length || ""}`.trim()}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="mb-2xl rounded-xl border border-border bg-surface-raised p-xl">
          <h2 className="font-display font-semibold text-lg mb-lg">Create New Lesson</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg mb-lg">
            <div className="sm:col-span-3">
              <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Topic</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Supply and Demand Fundamentals"
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                placeholder="Short description of what the lesson should cover"
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-lg py-md font-body text-sm"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-md">
            <button
              onClick={handleCreate}
              disabled={!newTopic.trim() || creating}
              className="px-xl py-md rounded-lg bg-primary text-surface-raised font-body text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Lesson"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-xl py-md rounded-lg border border-border font-body text-sm hover:bg-surface-sunken transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search, filters, view toggle */}
      {!loading && lessons.length > 0 && (
        <div className="mb-xl space-y-md">
          <div className="flex flex-col gap-md lg:flex-row lg:items-center">
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

            <div className="flex flex-wrap items-center gap-sm">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-md py-sm rounded-lg border border-border bg-surface-raised font-body text-xs text-foreground-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-md py-sm rounded-lg border border-border bg-surface-raised font-body text-xs text-foreground-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Levels</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-md py-sm rounded-lg border border-border bg-surface-raised font-body text-xs text-foreground-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex rounded-lg border border-border bg-surface-raised p-[2px]">
                <button
                  type="button"
                  onClick={() => changeViewMode("list")}
                  className={`flex items-center gap-xs rounded-md px-md py-xs font-body text-xs font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-surface-raised"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                  title="List view"
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => changeViewMode("card")}
                  className={`flex items-center gap-xs rounded-md px-md py-xs font-body text-xs font-medium transition-colors ${
                    viewMode === "card"
                      ? "bg-primary text-surface-raised"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                  title="Card view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Cards
                </button>
              </div>
            </div>
          </div>

          <p className="font-body text-xs text-foreground-muted">
            {filteredLessons.length} of {lessons.length} lessons
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4xl font-body text-foreground-muted">Loading...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-4xl">
          <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-lg" />
          <p className="font-body text-foreground-muted">No lessons yet. Create your first one.</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="text-center py-4xl">
          <Search className="h-12 w-12 text-foreground-muted mx-auto mb-lg" />
          <p className="font-body text-foreground-muted">No lessons match your filters.</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-xl">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-raised transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <Link href={`/admin/lessons/${lesson.id}`} className="flex flex-1 flex-col">
                <div className="relative h-40 overflow-hidden border-b border-border-subtle">
                  <LessonThumbnail lesson={lesson} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  <div className="absolute left-md top-md">
                    <StatusBadge status={lesson.status} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-lg">
                  <div className="mb-xs flex items-center gap-sm font-body text-xs text-foreground-muted">
                    <span>{lesson.category}</span>
                    <span>·</span>
                    <span>{lesson.difficulty}</span>
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>
                  {lesson.description ? (
                    <p className="mt-sm font-body text-xs text-foreground-muted line-clamp-2">
                      {lesson.description}
                    </p>
                  ) : null}
                  <p className="mt-auto pt-md font-body text-xs text-foreground-muted">
                    Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <div className="flex justify-end border-t border-border px-lg py-sm">
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="p-sm rounded-lg text-foreground-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete lesson"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-md">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-lg p-lg rounded-xl border border-border bg-surface-raised hover:border-primary/30 transition-colors group"
            >
              <Link
                href={`/admin/lessons/${lesson.id}`}
                className="flex flex-1 min-w-0 items-center gap-lg"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken">
                  <LessonThumbnail lesson={lesson} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-md mb-xs flex-wrap">
                    <StatusBadge status={lesson.status} />
                    <span className="font-body text-xs text-foreground-muted">{lesson.category}</span>
                    <span className="font-body text-xs text-foreground-muted">{lesson.difficulty}</span>
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {lesson.title}
                  </h3>
                  <p className="font-body text-xs text-foreground-muted mt-xs">
                    Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                    {lesson.publishedAt && ` · Published ${new Date(lesson.publishedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(lesson.id)}
                className="p-sm rounded-lg text-foreground-muted hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete lesson"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
