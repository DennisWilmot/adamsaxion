import { SHELL } from "../../design-system/shell-tokens";

/** Lobby palette — references SHELL tokens for cross-screen cohesion. */
export const LOBBY = {
  pageBg: SHELL.pageWash,
  cardBg: SHELL.card.bg,
  cardBorder: SHELL.lobby.cardBorder,
  cardMuted: SHELL.lobby.cardMuted,
  heroInk: SHELL.hero.ink,
  heroInkMuted: SHELL.hero.inkMuted,
  heroAccent: SHELL.hero.accent,
  heroOverlay: SHELL.hero.overlay,
  heroGlass: SHELL.hero.glass,
  heroGlassBorder: SHELL.hero.glassBorder,
  tickerBg: SHELL.lobby.tickerBg,
  winRow: SHELL.lobby.winRow,
  winBorder: SHELL.lobby.winBorder,
  lossRow: SHELL.lobby.lossRow,
  lossBorder: SHELL.lobby.lossBorder,
  liveRow: SHELL.lobby.liveRow,
  winPill: SHELL.lobby.winPill,
  lossPill: SHELL.lobby.lossPill,
  livePill: SHELL.lobby.livePill,
  gold: SHELL.lobby.gold,
  goldSoft: SHELL.lobby.goldSoft,
} as const;
