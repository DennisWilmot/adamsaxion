"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { PillBtn, Segmented } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";

const NOTIFS = [
  {
    id: "1",
    kind: "match" as const,
    title: "Match resolved",
    body: "Check your latest post-match debrief for coach notes.",
    time: "Today",
    unread: true,
  },
  {
    id: "2",
    kind: "system" as const,
    title: "Coffee Shop scenario live",
    body: "Food Truck and Bookshop scenarios unlock in future seasons.",
    time: "This week",
  },
];

function NotifIcon({ kind }: { kind: "match" | "system" | "social" | "season" }) {
  const map = {
    match: { bg: CD.primarySoft, fg: CD.primary, glyph: "⌖" },
    social: { bg: "oklch(0.94 0.04 230)", fg: "oklch(0.52 0.07 230)", glyph: "☺" },
    system: { bg: CD.greenSoft, fg: CD.green, glyph: "◐" },
    season: { bg: CD.cream, fg: CD.yellow, glyph: "☼" },
  };
  const m = map[kind];
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: m.bg,
        color: m.fg,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-cd-serif), serif",
        fontStyle: "italic",
        fontSize: 22,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {m.glyph}
    </div>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const unread = NOTIFS.filter((n) => n.unread).length;

  const visible = filter === "all" ? NOTIFS : NOTIFS.filter((n) => n.kind === filter);

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm" onClick={() => router.push(priceWarPaths.lobby)}>
        ← Lobby
      </PillBtn>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: 16,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="tab">Inbox · {unread} unread</div>
          <h1
            className="serif"
            style={{ fontSize: 44, color: CD.ink, marginTop: 4, lineHeight: 1.05, fontStyle: "italic" }}
          >
            Word from the floor.
          </h1>
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "match", label: "Matches" },
            { value: "system", label: "System" },
          ]}
        />
      </div>

      <div
        style={{
          marginTop: 24,
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {visible.map((n, i) => (
          <div
            key={n.id}
            style={{
              display: "flex",
              gap: 14,
              padding: "16px 18px",
              borderBottom: i < visible.length - 1 ? `1px solid ${CD.rule}` : "none",
              background: n.unread ? CD.cardstockHi : "transparent",
              position: "relative",
            }}
          >
            {n.unread && (
              <span
                style={{
                  position: "absolute",
                  left: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: CD.primary,
                }}
              />
            )}
            <NotifIcon kind={n.kind} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <span className="serif" style={{ fontSize: 19, color: CD.ink, lineHeight: 1.2 }}>
                  {n.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: CD.ink3,
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.time}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: CD.ink2, marginTop: 4, lineHeight: 1.5 }}>{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </CafeDuelRoot>
  );
}
