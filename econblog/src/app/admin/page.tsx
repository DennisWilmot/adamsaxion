"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2 } from "lucide-react";

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

export default function AdminPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState("Microeconomics");
  const [newDifficulty, setNewDifficulty] = useState("Intermediate");
  const [creating, setCreating] = useState(false);

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
        category: newCategory,
        difficulty: newDifficulty,
      }),
    });
    if (res.ok) {
      setNewTopic("");
      setShowCreate(false);
      await loadLessons();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    await loadLessons();
  }

  return (
    <div className="max-w-[72rem] mx-auto px-xl py-3xl">
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Lesson Generator
          </h1>
          <p className="font-body text-sm text-foreground-secondary mt-xs">
            Create, generate, and publish lessons
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-sm px-lg py-md rounded-lg bg-primary text-surface-raised font-body text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Lesson
        </button>
      </div>

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
