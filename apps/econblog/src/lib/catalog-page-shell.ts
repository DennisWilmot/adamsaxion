import { PLAY_HUB } from "@/lib/games/routes";

/** Shared main column for catalog-style pages (lessons, games hub, profile). */
export const CATALOG_PAGE_SHELL_CLASS =
  "mx-auto w-full max-w-[72rem] px-xl py-3xl";

export function isPlayHubPath(pathname: string): boolean {
  return pathname === PLAY_HUB;
}

/** Margin match UI and related routes use the wider game shell. */
export function usesWideGameShell(pathname: string): boolean {
  return pathname.startsWith("/play") && pathname !== PLAY_HUB;
}
