"use client";

import { CD } from "../../design-system/tokens";

export function LobbyHeader({ elo }: { elo?: number | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="serif" style={{ fontSize: 32, color: CD.ink, fontStyle: "italic" }}>
        The Price War
      </div>
      {elo != null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            background: CD.cardstock,
            border: `1px solid ${CD.rule}`,
            borderRadius: 999,
          }}
        >
          <span className="num" style={{ fontSize: 13, color: CD.ink, fontWeight: 600 }}>
            {elo.toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: CD.ink3 }}>elo</span>
        </div>
      )}
    </div>
  );
}
