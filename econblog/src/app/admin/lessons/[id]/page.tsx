"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Search, FileText, Check, Loader2,
  ChevronRight, AlertCircle, Eye, Send,
} from "lucide-react";
import Link from "next/link";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import type { LessonData } from "@/lib/types/lesson";

interface LessonRecord {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  thumbnail: string;
  sortOrder: number;
  status: string;
  sections: any[];
  masteryQuiz: any;
  outlineData: any;
  researchNotes: string | null;
  contentProgress: { completedSections: string[] };
  questionsProgress: { completedSections: string[] };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface Source {
  id: string;
  type: string;
  title: string;
  content: string;
  sourceUrl: string | null;
  approved: boolean;
  createdAt: string;
}

type Tab = "sources" | "outline" | "sections" | "questions" | "mastery" | "preview";

const TABS: { id: Tab; label: string; minStatus: string[] }[] = [
  { id: "sources", label: "Sources", minStatus: ["research", "outline", "content", "questions", "mastery", "review", "published", "archived"] },
  { id: "outline", label: "Outline", minStatus: ["outline", "content", "questions", "mastery", "review", "published", "archived"] },
  { id: "sections", label: "Sections", minStatus: ["content", "questions", "mastery", "review", "published", "archived"] },
  { id: "questions", label: "Questions", minStatus: ["questions", "mastery", "review", "published", "archived"] },
  { id: "mastery", label: "Mastery", minStatus: ["mastery", "review", "published", "archived"] },
  { id: "preview", label: "Preview", minStatus: ["content", "questions", "mastery", "review", "published", "archived"] },
];

export default function LessonWorkspace() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("sources");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [error, setError] = useState("");

  const loadLesson = useCallback(async () => {
    const res = await fetch(`/api/admin/lessons/${id}`);
    const data = await res.json();
    setLesson(data.lesson);
    setLoading(false);
  }, [id]);

  const loadSources = useCallback(async () => {
    const res = await fetch(`/api/admin/lessons/${id}/sources`);
    const data = await res.json();
    setSources(data.sources ?? []);
  }, [id]);

  useEffect(() => {
    loadLesson();
    loadSources();
  }, [loadLesson, loadSources]);

  async function generate(stage: string, sectionIndex?: number) {
    setGenerating(true);
    setError("");
    setGenStatus(`Generating ${stage}${sectionIndex !== undefined ? ` (section ${sectionIndex + 1})` : ""}...`);

    try {
      const res = await fetch(`/api/admin/lessons/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, sectionIndex }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      await loadLesson();
      setGenStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenStatus("");
    } finally {
      setGenerating(false);
    }
  }

  async function updateLesson(updates: Partial<LessonRecord>) {
    await fetch(`/api/admin/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    await loadLesson();
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/admin/lessons/${id}/sources`, {
      method: "POST",
      body: formData,
    });
    await loadSources();
  }

  async function addTextSource(title: string, content: string) {
    await fetch(`/api/admin/lessons/${id}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", title, content }),
    });
    await loadSources();
  }

  async function deleteSource(sourceId: string) {
    await fetch(`/api/admin/lessons/${id}/sources?sourceId=${sourceId}`, {
      method: "DELETE",
    });
    await loadSources();
  }

  async function publish() {
    const res = await fetch(`/api/admin/lessons/${id}/publish`, { method: "POST" });
    if (res.ok) await loadLesson();
    else {
      const data = await res.json();
      setError(data.error || "Publish failed");
    }
  }

  if (loading || !lesson) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-[72rem] mx-auto px-xl py-2xl">
      {/* Header */}
      <div className="flex items-center gap-lg mb-xl">
        <Link href="/admin" className="p-sm rounded-lg hover:bg-surface-sunken transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground-muted" />
        </Link>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
            onBlur={() => updateLesson({ title: lesson.title })}
            className="font-display font-bold text-xl text-foreground bg-transparent border-none focus:outline-none w-full"
          />
          <div className="flex items-center gap-md mt-xs">
            <span className="font-body text-xs text-foreground-muted">{lesson.category} · {lesson.difficulty}</span>
            <span className={`px-sm py-[2px] rounded text-[10px] font-semibold uppercase tracking-wider ${
              lesson.status === "published" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            }`}>{lesson.status}</span>
          </div>
        </div>
        {lesson.status === "review" && (
          <button onClick={publish} className="flex items-center gap-sm px-lg py-md rounded-lg bg-green-600 text-white font-body text-sm font-semibold hover:bg-green-700 transition-colors">
            <Send className="h-4 w-4" /> Publish
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-xl overflow-x-auto">
        {TABS.map((tab) => {
          const enabled = tab.minStatus.includes(lesson.status) || tab.id === "sources";
          return (
            <button
              key={tab.id}
              onClick={() => enabled && setActiveTab(tab.id)}
              disabled={!enabled}
              className={`px-xl py-md font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : enabled
                    ? "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
                    : "border-transparent text-foreground-muted/40 cursor-not-allowed"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Status bar */}
      {(generating || error) && (
        <div className={`mb-lg rounded-lg p-md flex items-center gap-md ${error ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
          <span className="font-body text-sm">{error || genStatus}</span>
          {error && <button onClick={() => setError("")} className="ml-auto text-xs underline">Dismiss</button>}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "sources" && (
        <SourcesTab
          sources={sources}
          onUpload={uploadFile}
          onAddText={addTextSource}
          onDelete={deleteSource}
          onRunResearch={() => generate("research")}
          researchNotes={lesson.researchNotes}
          generating={generating}
          onApproveResearch={() => updateLesson({ status: "outline" as any })}
        />
      )}
      {activeTab === "outline" && (
        <OutlineTab
          outline={lesson.outlineData}
          title={lesson.title}
          description={lesson.description}
          estimatedMinutes={lesson.estimatedMinutes}
          onGenerate={() => generate("outline")}
          onUpdate={(updates) => updateLesson(updates)}
          generating={generating}
        />
      )}
      {activeTab === "sections" && (
        <SectionsTab
          sections={lesson.sections}
          outline={lesson.outlineData}
          contentProgress={lesson.contentProgress}
          onGenerate={(idx) => generate("content", idx)}
          onUpdateSections={(sections) => updateLesson({ sections })}
          generating={generating}
        />
      )}
      {activeTab === "questions" && (
        <QuestionsTab
          sections={lesson.sections}
          questionsProgress={lesson.questionsProgress}
          onGenerate={(idx) => generate("questions", idx)}
          generating={generating}
        />
      )}
      {activeTab === "mastery" && (
        <MasteryTab
          mastery={lesson.masteryQuiz}
          onGenerate={() => generate("mastery")}
          generating={generating}
        />
      )}
      {activeTab === "preview" && (
        <PreviewTab lesson={lesson} />
      )}
    </div>
  );
}

/* ==================== Sources Tab ==================== */
function SourcesTab({
  sources, onUpload, onAddText, onDelete, onRunResearch, researchNotes, generating, onApproveResearch,
}: {
  sources: Source[];
  onUpload: (f: File) => void;
  onAddText: (title: string, content: string) => void;
  onDelete: (id: string) => void;
  onRunResearch: () => void;
  researchNotes: string | null;
  generating: boolean;
  onApproveResearch: () => void;
}) {
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  const manualSources = sources.filter((s) => s.type !== "web_research");
  const webSources = sources.filter((s) => s.type === "web_research");

  return (
    <div className="space-y-xl">
      <div className="rounded-xl border border-border bg-surface-raised p-xl">
        <h3 className="font-display font-semibold text-lg mb-lg">Upload Sources</h3>
        <div className="flex flex-wrap gap-md mb-lg">
          <label className="flex items-center gap-sm px-lg py-md rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
            <Upload className="h-4 w-4 text-foreground-muted" />
            <span className="font-body text-sm">Upload PDF / Text file</span>
            <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }} />
          </label>
          <button
            onClick={() => setShowPaste(!showPaste)}
            className="flex items-center gap-sm px-lg py-md rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <FileText className="h-4 w-4 text-foreground-muted" />
            <span className="font-body text-sm">Paste Text</span>
          </button>
        </div>

        {showPaste && (
          <div className="space-y-md mb-lg p-lg rounded-lg bg-surface-sunken">
            <input
              type="text"
              placeholder="Source title"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              placeholder="Paste article text, notes, or excerpts..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
            <button
              onClick={() => {
                if (pasteTitle && pasteContent) {
                  onAddText(pasteTitle, pasteContent);
                  setPasteTitle("");
                  setPasteContent("");
                  setShowPaste(false);
                }
              }}
              disabled={!pasteTitle || !pasteContent}
              className="px-lg py-md rounded-lg bg-primary text-surface-raised font-body text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              Add Source
            </button>
          </div>
        )}

        {manualSources.length > 0 && (
          <div className="space-y-sm">
            {manualSources.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-md rounded-lg bg-surface-sunken">
                <div className="flex items-center gap-md min-w-0">
                  <FileText className="h-4 w-4 text-foreground-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium truncate">{s.title}</p>
                    <p className="font-body text-xs text-foreground-muted">{s.type.toUpperCase()} · {s.content.length.toLocaleString()} chars</p>
                  </div>
                </div>
                <button onClick={() => onDelete(s.id)} className="text-xs text-foreground-muted hover:text-red-600 transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-xl">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="font-display font-semibold text-lg">AI Web Research</h3>
          <button
            onClick={onRunResearch}
            disabled={generating}
            className="flex items-center gap-sm px-lg py-md rounded-lg bg-primary text-surface-raised font-body text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {generating ? "Researching..." : "Run Research"}
          </button>
        </div>

        {webSources.length > 0 && (
          <div className="mb-lg">
            <h4 className="font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary mb-md">Web Sources Found</h4>
            <div className="space-y-sm">
              {webSources.map((s) => (
                <div key={s.id} className="p-md rounded-lg bg-surface-sunken">
                  <a href={s.sourceUrl || "#"} target="_blank" rel="noopener" className="font-body text-sm font-medium text-primary hover:underline">{s.title}</a>
                  <p className="font-body text-xs text-foreground-muted mt-xs line-clamp-2">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {researchNotes && (
          <div>
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Research Synthesis</h4>
              <button
                onClick={onApproveResearch}
                className="flex items-center gap-sm px-md py-xs rounded-lg bg-green-600 text-white font-body text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <Check className="h-3 w-3" /> Approve & Continue
              </button>
            </div>
            <div className="rounded-lg bg-surface-sunken p-lg font-body text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
              {researchNotes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== Outline Tab ==================== */
function OutlineTab({
  outline, title, description, estimatedMinutes, onGenerate, onUpdate, generating,
}: {
  outline: any;
  title: string;
  description: string;
  estimatedMinutes: number;
  onGenerate: () => void;
  onUpdate: (updates: any) => void;
  generating: boolean;
}) {
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);
  const [editMins, setEditMins] = useState(estimatedMinutes);

  useEffect(() => {
    setEditTitle(title);
    setEditDesc(description);
    setEditMins(estimatedMinutes);
  }, [title, description, estimatedMinutes]);

  return (
    <div className="space-y-xl">
      <div className="rounded-xl border border-border bg-surface-raised p-xl">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="font-display font-semibold text-lg">Lesson Outline</h3>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-sm px-lg py-md rounded-lg bg-primary text-surface-raised font-body text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {generating ? "Generating..." : outline ? "Regenerate Outline" : "Generate Outline"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg mb-xl">
          <div className="sm:col-span-2">
            <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => onUpdate({ title: editTitle })}
              className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Est. Minutes</label>
            <input
              type="number"
              value={editMins}
              onChange={(e) => setEditMins(Number(e.target.value))}
              onBlur={() => onUpdate({ estimatedMinutes: editMins })}
              className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-body text-xs font-semibold text-foreground-secondary mb-xs uppercase tracking-wide">Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onBlur={() => onUpdate({ description: editDesc })}
              rows={2}
              className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>
        </div>

        {outline?.sections && (
          <div className="space-y-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-body text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                {outline.sections.length} Sections · {outline.sections.reduce((sum: number, s: any) => sum + (s.subsections?.length ?? 0), 0)} Subsections
              </h4>
              <button
                onClick={() => onUpdate({ status: "content" })}
                className="flex items-center gap-sm px-md py-xs rounded-lg bg-green-600 text-white font-body text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <Check className="h-3 w-3" /> Approve Outline
              </button>
            </div>
            {outline.sections.map((section: any, sIdx: number) => (
              <div key={section.id} className="rounded-lg border border-border p-lg">
                <h4 className="font-display font-semibold text-foreground mb-md">
                  Section {sIdx + 1}: {section.title}
                </h4>
                <div className="space-y-sm">
                  {section.subsections?.map((sub: any) => (
                    <div key={sub.id} className="pl-lg border-l-2 border-border">
                      <p className="font-body text-sm font-medium">{sub.title}</p>
                      <p className="font-body text-xs text-foreground-muted mt-xs">{sub.contentSummary}</p>
                      <div className="flex items-center gap-md mt-xs">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-sm py-[1px] rounded ${
                          sub.quizType === "intuition" ? "bg-yellow-100 text-yellow-700" :
                          sub.quizType === "recap" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{sub.quizType}</span>
                        <span className="font-body text-[11px] text-foreground-muted">{sub.quizHint}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== Sections Tab ==================== */
function SectionsTab({
  sections, outline, contentProgress, onGenerate, onUpdateSections, generating,
}: {
  sections: any[];
  outline: any;
  contentProgress: { completedSections: string[] };
  onGenerate: (idx: number) => void;
  onUpdateSections: (sections: any[]) => void;
  generating: boolean;
}) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<{ sIdx: number; subIdx: number; content: string } | null>(null);

  const outlineSections = outline?.sections ?? [];

  return (
    <div className="space-y-lg">
      {outlineSections.map((os: any, sIdx: number) => {
        const hasContent = sections[sIdx]?.subsections?.length > 0;
        const isCompleted = contentProgress.completedSections.includes(os.id);
        const isExpanded = expandedSection === sIdx;

        return (
          <div key={os.id} className="rounded-xl border border-border bg-surface-raised overflow-hidden">
            <div
              className="flex items-center justify-between p-lg cursor-pointer hover:bg-surface-sunken/50 transition-colors"
              onClick={() => setExpandedSection(isExpanded ? null : sIdx)}
            >
              <div className="flex items-center gap-md">
                {isCompleted ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center text-[10px] font-semibold text-foreground-muted">
                    {sIdx + 1}
                  </span>
                )}
                <h4 className="font-display font-semibold text-foreground">
                  Section {sIdx + 1}: {os.title}
                </h4>
              </div>
              <div className="flex items-center gap-md">
                {!hasContent && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onGenerate(sIdx); }}
                    disabled={generating}
                    className="px-md py-xs rounded-lg bg-primary text-surface-raised font-body text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {generating ? "Generating..." : "Generate"}
                  </button>
                )}
                <ChevronRight className={`h-4 w-4 text-foreground-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </div>
            </div>

            {isExpanded && hasContent && (
              <div className="border-t border-border p-lg space-y-xl">
                {sections[sIdx].subsections.map((sub: any, subIdx: number) => (
                  <div key={sub.id}>
                    <div className="flex items-center justify-between mb-md">
                      <h5 className="font-body text-sm font-semibold text-foreground">{sub.title}</h5>
                      <button
                        onClick={() => {
                          if (editingContent?.sIdx === sIdx && editingContent?.subIdx === subIdx) {
                            const updated = [...sections];
                            updated[sIdx].subsections[subIdx].content = editingContent.content;
                            onUpdateSections(updated);
                            setEditingContent(null);
                          } else {
                            setEditingContent({ sIdx, subIdx, content: sub.content });
                          }
                        }}
                        className="font-body text-xs text-primary hover:underline"
                      >
                        {editingContent?.sIdx === sIdx && editingContent?.subIdx === subIdx ? "Save" : "Edit"}
                      </button>
                    </div>
                    {editingContent?.sIdx === sIdx && editingContent?.subIdx === subIdx ? (
                      <textarea
                        value={editingContent.content}
                        onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                        rows={12}
                        className="w-full rounded-lg border border-border px-lg py-md font-body text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
                      />
                    ) : (
                      <div className="rounded-lg bg-surface-sunken p-lg font-body text-sm text-foreground whitespace-pre-wrap max-h-72 overflow-y-auto">
                        {sub.content}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => onGenerate(sIdx)}
                  disabled={generating}
                  className="font-body text-xs text-foreground-muted hover:text-primary transition-colors"
                >
                  Regenerate this section
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ==================== Questions Tab ==================== */
function QuestionsTab({
  sections, questionsProgress, onGenerate, generating,
}: {
  sections: any[];
  questionsProgress: { completedSections: string[] };
  onGenerate: (idx: number) => void;
  generating: boolean;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-lg">
      {sections.map((section: any, sIdx: number) => {
        const hasQuestions = section.subsections?.some((sub: any) => sub.quiz);
        const isCompleted = questionsProgress.completedSections.includes(section.id);
        const isExpanded = expanded === sIdx;

        return (
          <div key={section.id} className="rounded-xl border border-border bg-surface-raised overflow-hidden">
            <div
              className="flex items-center justify-between p-lg cursor-pointer hover:bg-surface-sunken/50 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : sIdx)}
            >
              <div className="flex items-center gap-md">
                {isCompleted ? <Check className="h-5 w-5 text-green-600" /> : (
                  <span className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center text-[10px] font-semibold text-foreground-muted">{sIdx + 1}</span>
                )}
                <h4 className="font-display font-semibold text-foreground">Section {sIdx + 1}: {section.title}</h4>
              </div>
              <div className="flex items-center gap-md">
                <button
                  onClick={(e) => { e.stopPropagation(); onGenerate(sIdx); }}
                  disabled={generating}
                  className="px-md py-xs rounded-lg bg-primary text-surface-raised font-body text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {hasQuestions ? "Regenerate" : "Generate"} Questions
                </button>
                <ChevronRight className={`h-4 w-4 text-foreground-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-lg space-y-lg">
                {section.subsections?.map((sub: any) => (
                  <div key={sub.id} className="rounded-lg border border-border p-lg">
                    <p className="font-body text-xs font-semibold text-foreground-secondary mb-sm">{sub.title}</p>
                    {sub.quiz ? (
                      <div>
                        <div className="flex items-center gap-md mb-md">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-sm py-[1px] rounded ${
                            sub.quiz.type === "intuition" ? "bg-yellow-100 text-yellow-700" :
                            sub.quiz.type === "recap" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{sub.quiz.type}</span>
                          <span className="font-body text-xs text-foreground-muted">+{sub.quiz.xpReward} XP</span>
                          {sub.quiz.xpPenalties[0] > 0 && (
                            <span className="font-body text-xs text-red-600">-{sub.quiz.xpPenalties[0]}/{sub.quiz.xpPenalties[1]} penalty</span>
                          )}
                        </div>
                        <p className="font-body text-sm font-medium text-foreground mb-md">{sub.quiz.question}</p>
                        <div className="space-y-sm">
                          {sub.quiz.options.map((opt: string, oIdx: number) => (
                            <div
                              key={oIdx}
                              className={`p-md rounded-lg border text-sm font-body ${
                                sub.quiz.correctAnswer === oIdx
                                  ? "border-green-300 bg-green-50"
                                  : sub.quiz.correctAnswer === null
                                    ? "border-border bg-surface-sunken"
                                    : "border-border bg-surface-sunken"
                              }`}
                            >
                              <span className="font-semibold mr-sm">{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <p className="font-body text-xs text-foreground-muted mt-md italic">{sub.quiz.explanation}</p>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-foreground-muted italic">No quiz generated yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ==================== Mastery Tab ==================== */
function MasteryTab({
  mastery, onGenerate, generating,
}: {
  mastery: any;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-xl">
      <div className="flex items-center justify-between mb-xl">
        <h3 className="font-display font-semibold text-lg">Mastery Quiz Pool</h3>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-sm px-lg py-md rounded-lg bg-gold text-white font-body text-sm font-semibold hover:bg-gold-hover transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {mastery ? "Regenerate Pool" : "Generate Pool"}
        </button>
      </div>

      {mastery ? (
        <div>
          <div className="flex gap-xl mb-xl font-body text-sm">
            <span>Pool: <strong>{mastery.questionPool?.length ?? 0}</strong> questions</span>
            <span>Per attempt: <strong>{mastery.questionsPerAttempt}</strong></span>
            <span>Passing: <strong>{mastery.passingScore}%</strong></span>
            <span>Time limit: <strong>{mastery.timeLimitMinutes} min</strong></span>
          </div>
          <div className="space-y-lg">
            {mastery.questionPool?.map((q: any, idx: number) => (
              <div key={q.id || idx} className="rounded-lg border border-border p-lg">
                <div className="flex items-center gap-md mb-md">
                  <span className="font-body text-xs font-semibold text-gold">Q{idx + 1}</span>
                  <span className="font-body text-xs text-foreground-muted">+{q.xpReward} XP · -{q.xpPenalties?.[0]}/{q.xpPenalties?.[1]} penalty</span>
                </div>
                <p className="font-body text-sm font-medium mb-md">{q.question}</p>
                <div className="space-y-sm">
                  {q.options?.map((opt: string, oIdx: number) => (
                    <div key={oIdx} className={`p-md rounded-lg border text-sm font-body ${
                      q.correctAnswer === oIdx ? "border-green-300 bg-green-50" : "border-border bg-surface-sunken"
                    }`}>
                      <span className="font-semibold mr-sm">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                    </div>
                  ))}
                </div>
                <p className="font-body text-xs text-foreground-muted mt-md italic">{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-foreground-muted">Generate questions for all sections first, then generate the mastery pool.</p>
      )}
    </div>
  );
}

/* ==================== Preview Tab ==================== */
function PreviewTab({ lesson }: { lesson: LessonRecord }) {
  const previewData: LessonData = {
    id: lesson.slug,
    title: lesson.title,
    category: lesson.category,
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
    description: lesson.description,
    thumbnail: lesson.thumbnail,
    sections: (lesson.sections || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      subsections: (s.subsections || []).map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        content: sub.content || "",
        quiz: sub.quiz ? {
          ...sub.quiz,
          type: sub.quiz.type || "in-lesson",
        } : undefined,
      })),
    })),
    masteryQuiz: lesson.masteryQuiz || {
      questionsPerAttempt: 5,
      passingScore: 70,
      timeLimitMinutes: 15,
      questionPool: [],
    },
  };

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-xl">
      <div className="flex items-center gap-md mb-lg">
        <Eye className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Student Preview</h3>
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-surface">
        <LessonPlayer lesson={previewData} isAuthenticated={false} />
      </div>
    </div>
  );
}
