"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, Layers, Zap } from "lucide-react";

interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

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

  const parsedBatchLessons = parseBatchLessons(batchInput);

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

      {loading ? (
        <div className="text-center py-4xl font-body text-foreground-muted">Loading...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-4xl">
          <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-lg" />
          <p className="font-body text-foreground-muted">No lessons yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-lg p-lg rounded-xl border border-border bg-surface-raised hover:border-primary/30 transition-colors group"
            >
              <Link
                href={`/admin/lessons/${lesson.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-md mb-xs">
                  <span className={`px-sm py-[2px] rounded text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[lesson.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {lesson.status}
                  </span>
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
