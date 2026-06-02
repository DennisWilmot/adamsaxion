export const LOBBY_ICONS = {
  coffee: "/pricewar/icons/lobby-coffee.webp",
  blitz: "/pricewar/icons/mode-blitz.webp",
  rapid: "/pricewar/icons/mode-rapid.webp",
  tutorial: "/pricewar/icons/mode-tutorial.webp",
} as const;

export type LobbyIconId = keyof typeof LOBBY_ICONS;

export function lobbyModeIcon(modeId: string): string {
  switch (modeId) {
    case "blitz":
    case "blitz-e2e":
      return LOBBY_ICONS.blitz;
    case "rapid":
      return LOBBY_ICONS.rapid;
    case "tutorial":
      return LOBBY_ICONS.tutorial;
    default:
      return LOBBY_ICONS.blitz;
  }
}
