"use client";

import type { PlayerView } from "@adamsaxion/pricewar-types";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { AvatarOpponent, AvatarPlayer } from "../design-system/avatars";
import { CoffeeBackdrop } from "../design-system/CoffeeBackdrop";
import { CD } from "../design-system/tokens";

export function CafeMatchLobbyScreen({ view }: { view: PlayerView }) {
  const graceSec = view.playModeId === "rapid" ? 120 : 60;

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: CD.cardstock,
          border: `1px solid ${CD.rule}`,
          borderRadius: 18,
          padding: "40px 32px",
          textAlign: "center",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <CoffeeBackdrop opacity={0.04} height={120} />
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <AvatarPlayer size={88} ring={CD.primary} />
            <div
              className="cd-pulse"
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: 16,
                border: `2px solid ${CD.primary}`,
                opacity: 0.5,
              }}
            />
          </div>
          <div className="tab">Waiting for opponent</div>
          <h1 className="serif" style={{ fontSize: 32, color: CD.ink, marginTop: 8, lineHeight: 1.1 }}>
            Match lobby
          </h1>
          <p style={{ fontSize: 14, color: CD.ink2, marginTop: 10, lineHeight: 1.5 }}>
            Match starts when both players connect. No-show after {graceSec}s is a forfeit.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            <AvatarPlayer size={48} ring={CD.primary} />
            <span className="serif" style={{ fontSize: 24, color: CD.ink3, fontStyle: "italic" }}>
              vs
            </span>
            <AvatarOpponent size={48} ring={CD.ink4} />
          </div>
          <p style={{ fontSize: 15, color: CD.ink, marginTop: 16, fontWeight: 600 }}>
            {view.opponent.displayName}
          </p>
        </div>
      </div>
    </CafeDuelRoot>
  );
}
