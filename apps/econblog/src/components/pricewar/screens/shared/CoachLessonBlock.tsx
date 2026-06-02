"use client";

import { useState } from "react";
import Link from "next/link";
import type { CoachReportPayload } from "@adamsaxion/pricewar-engine";
import { lessonMetaForSlug } from "@/client/pricewar/lesson-slug-meta";
import { priceWarPaths } from "@/lib/games/routes";
import { AvatarCoach } from "@/components/pricewar/design-system/avatars";
import {
  Eyebrow,
  MarginBtn,
  MT,
} from "@/components/pricewar/design-system/margin-kit";

function LessonGlyph({ size = 16, color = "#6b5a1f" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-5" />
      <path d="M22 10v5" />
    </svg>
  );
}

function LessonPreviewModal({
  slug,
  topic,
  minutes,
  context,
  onClose,
}: {
  slug: string;
  topic: string;
  minutes: number;
  context: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-preview-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(11,18,32,.32)",
        display: "grid",
        placeItems: "center",
        padding: 22,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: MT.card,
          border: `1px solid ${MT.rule}`,
          borderTop: `4px solid #caa53a`,
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 30px 70px -30px rgba(11,18,32,.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#6b5a1f",
              textTransform: "uppercase",
            }}
          >
            Lesson · from Prof. Aldo
          </span>
          <MarginBtn kind="ghost" size="sm" onClick={onClose}>
            ✕
          </MarginBtn>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <AvatarCoach size={48} />
          <div>
            <h2
              id="lesson-preview-title"
              className="serif"
              style={{ fontSize: 24, color: MT.ink, fontWeight: 700, lineHeight: 1.1, margin: 0 }}
            >
              {topic}
            </h2>
            <div className="mono" style={{ fontSize: 12, color: MT.ink3, marginTop: 3 }}>
              {minutes} min · coach pick · free to start
            </div>
          </div>
        </div>
        <div
          style={{
            background: MT.coach,
            border: `1px solid ${MT.coachLine}`,
            borderRadius: 12,
            padding: 13,
            margin: "14px 0",
          }}
        >
          <span style={{ fontSize: 12.5, color: "#5c4d2a", lineHeight: 1.45 }}>
            <b style={{ color: "#2b2616" }}>Why now:</b> {context}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <MarginBtn kind="ghost" size="md" full onClick={onClose}>
            Maybe later
          </MarginBtn>
          <Link href={`/lessons/${slug}`} style={{ flex: 1, textDecoration: "none" }}>
            <MarginBtn kind="primary" size="md" full>
              Start lesson →
            </MarginBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}

export type CoachLessonMatchActions = {
  onPlayAgain: () => void;
  playAgainLoading?: boolean;
  lobbyHref?: string;
};

export type CoachLessonInput = {
  verdict: string;
  report?: CoachReportPayload | null;
  fallbackSlug?: string;
  fallbackTopic?: string;
  fallbackContext?: string;
  matchActions?: CoachLessonMatchActions;
};

export function CoachLessonBlock({
  verdict,
  report,
  fallbackSlug = "lesson-zero",
  fallbackTopic,
  fallbackContext,
  matchActions,
}: CoachLessonInput) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const slug = report?.recommendedLessonSlugs?.[0] ?? fallbackSlug;
  const meta = lessonMetaForSlug(slug);
  const topic = fallbackTopic ?? meta.title;
  const minutes = meta.minutes;
  const context =
    report?.turningPoint?.explanation ??
    report?.whatToImprove?.[0] ??
    fallbackContext ??
    verdict;

  return (
    <>
      <div
        style={{
          background: MT.coach,
          border: `1px solid ${MT.coachLine}`,
          borderRadius: 14,
          padding: 15,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div className="mtq-breathe" style={{ flex: "0 0 auto" }}>
            <AvatarCoach size={38} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow style={{ color: MT.coachInk, opacity: 0.85 }}>
              Prof. Aldo · Debrief
            </Eyebrow>
            <p
              className="serif"
              style={{
                fontSize: 15.5,
                lineHeight: 1.35,
                fontStyle: "italic",
                color: "#3a3413",
                margin: "6px 0 0",
                fontWeight: 500,
              }}
            >
              {verdict}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${MT.coachLine}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "#fbeeb8",
                border: "1px solid #ecd98f",
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
              }}
            >
              <LessonGlyph />
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#6b5a1f",
                textTransform: "uppercase",
              }}
            >
              Recommended lesson
            </span>
            <span className="mono" style={{ marginLeft: "auto", fontSize: 11.5, color: "#8a7430" }}>
              {minutes} min
            </span>
          </div>
          <h4
            className="serif"
            style={{
              fontSize: 18,
              color: "#2b2616",
              fontWeight: 700,
              marginTop: 10,
              lineHeight: 1.2,
            }}
          >
            {topic}
          </h4>
          <p style={{ fontSize: 12.5, color: "#5c4d2a", lineHeight: 1.45, margin: "5px 0 0" }}>
            {context}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <MarginBtn kind="primary" size="sm" onClick={() => setPreviewOpen(true)}>
              Start lesson →
            </MarginBtn>
            {matchActions && (
              <>
                <MarginBtn
                  kind="primary"
                  size="sm"
                  onClick={matchActions.onPlayAgain}
                  {...(matchActions.playAgainLoading ? { disabled: true } : {})}
                >
                  {matchActions.playAgainLoading ? "Starting…" : "Play again →"}
                </MarginBtn>
                <Link
                  href={matchActions.lobbyHref ?? priceWarPaths.lobby}
                  style={{ textDecoration: "none" }}
                >
                  <MarginBtn kind="ghost" size="sm">
                    Back to lobby
                  </MarginBtn>
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {}}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "#8a7430",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      {previewOpen && (
        <LessonPreviewModal
          slug={slug}
          topic={topic}
          minutes={minutes}
          context={context}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
