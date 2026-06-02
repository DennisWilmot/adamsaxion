import { CD } from "./tokens";

/** Margin shell chrome — viewport, tabs, frames, cards, typography, icon sizes. */
export const SHELL = {
  viewportGradient: "linear-gradient(135deg, #eef1f6, #f7f9fc 36%, #eef1f6)",
  tabBarGradient: "linear-gradient(#f7f9fc, #eef1f6)",
  tabBorder: "#9eb5c8",
  tabInactiveBg: "oklch(0.95 0.02 245)",
  tabAddBg: "oklch(0.98 0.01 250)",
  pageWash: "#eef1f6",
  /** White gap below global site header, before Margin shell (px) */
  belowGlobalHeaderGap: 16,
  content: {
    bg: CD.paper,
    border: "#e4e8ef",
  },
  turnLog: {
    bg: "#f4f7fb",
  },
  frame: {
    bg: CD.cardstock,
    border: "#e4e8ef",
    radius: 12,
    pad: 22,
    maxWidth: 980,
  },
  card: {
    bg: CD.cardstock,
    border: CD.rule,
    radius: 14,
    pad: 18,
  },
  hero: {
    ink: "#0f172a",
    inkMuted: "#475569",
    accent: "#1d4ed8",
    overlay:
      "linear-gradient(180deg, oklch(0.97 0.02 250 / 0.35) 0%, oklch(0.92 0.03 250 / 0.15) 40%, oklch(0.45 0.07 250 / 0.35) 100%)",
    glass: "oklch(1 0 0 / 0.78)",
    glassBorder: "oklch(1 0 0 / 0.65)",
  },
  type: {
    tab: { fontSize: 12, letterSpacing: "0.12em" as const },
    h1Home: "clamp(32px, 4vw, 46px)",
    h1Terminal: 42,
    h2Panel: 22,
  },
  icon: {
    mode: 48,
    lobby: 40,
    domain: 32,
  },
  /** Lobby sidebar card accents — aligned with shell blue family */
  lobby: {
    cardMuted: "#f3f8ff",
    cardBorder: "#c8daf4",
    tickerBg: "oklch(0.42 0.09 250 / 0.82)",
    winRow: "#ecfdf3",
    winBorder: "#86efac",
    lossRow: "#fef2f2",
    lossBorder: "#fca5a5",
    liveRow: "#eff6ff",
    winPill: "#15803d",
    lossPill: "#b91c1c",
    livePill: "#1d4ed8",
    gold: "#ca8a04",
    goldSoft: "#fef9c3",
  },
} as const;
