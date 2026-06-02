import { PRICE_WAR, priceWarPaths } from "@/lib/games/routes";

export const TERMINAL_MATCH_SEGMENTS = ["/postmatch", "/bankruptcy", "/abandoned"] as const;

export type MatchPathPanel = "decide" | "review" | "waiting" | "briefing" | "report";

export function isTerminalMatchPath(pathname: string): boolean {
  return TERMINAL_MATCH_SEGMENTS.some((segment) => pathname.includes(segment));
}

/** All match routes render inside MatchSessionShell (including terminal screens). */
export function isMatchSessionPath(pathname: string): boolean {
  return pathname.startsWith(`${PRICE_WAR}/match/`);
}

export type TerminalMatchVariant = "postmatch" | "bankruptcy" | "abandoned";

export function terminalVariantFromPath(pathname: string): TerminalMatchVariant | null {
  if (pathname.includes("/bankruptcy")) return "bankruptcy";
  if (pathname.includes("/abandoned")) return "abandoned";
  if (pathname.includes("/postmatch")) return "postmatch";
  return null;
}

export function isMatchRootPath(pathname: string, matchId?: string): boolean {
  if (matchId) {
    return pathname === priceWarPaths.match.root(matchId);
  }
  return pathname.match(/\/play\/price-war\/match\/[^/]+$/) != null;
}

export function panelFromMatchPath(pathname: string): MatchPathPanel | null {
  if (pathname.includes("/review")) return "review";
  if (pathname.includes("/waiting")) return "waiting";
  if (pathname.includes("/briefing")) return "briefing";
  if (pathname.includes("/report/")) return "report";
  if (pathname.includes("/decide")) return "decide";
  return null;
}

export function getReportRoundFromPath(pathname: string): number | null {
  const match = pathname.match(/\/report\/(\d+)/);
  if (!match) return null;
  const round = Number(match[1]);
  return Number.isFinite(round) ? round : null;
}

/** Pre-match and satellite routes that share ShellViewport + GameTabs framing. */
export function isMarginShellFramedPath(pathname: string): boolean {
  return (
    pathname === priceWarPaths.lobby ||
    pathname.startsWith(`${priceWarPaths.lobby}/queue`) ||
    pathname === priceWarPaths.history ||
    pathname === priceWarPaths.leaderboard ||
    pathname === priceWarPaths.notifications ||
    pathname === priceWarPaths.tutorial
  );
}

/** @deprecated use isMarginShellFramedPath */
export function isMarginShellHomePath(pathname: string): boolean {
  return (
    pathname === priceWarPaths.lobby || pathname.startsWith(`${priceWarPaths.lobby}/queue`)
  );
}
