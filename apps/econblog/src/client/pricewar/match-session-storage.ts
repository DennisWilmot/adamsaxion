import type { SubmittedMove } from "@adamsaxion/pricewar-types";

const DRAFT_PREFIX = "pricewar:draft:";
const LOCKED_PREFIX = "pricewar:locked:";
const BRIEFING_PREFIX = "pricewar:briefing:";
const PRIVATE_REPORT_PREFIX = "pricewar:lastPrivateReport:";
const CASH_TREND_PREFIX = "pricewar:cash-trend:";

interface RoundEnvelope<T> {
  round: number;
  savedAt: string;
  payload: T;
}

function readEnvelope<T>(raw: string | null): RoundEnvelope<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RoundEnvelope<T> | T;
    if (parsed && typeof parsed === "object" && "round" in parsed && "payload" in parsed) {
      return parsed as RoundEnvelope<T>;
    }
    return null;
  } catch {
    return null;
  }
}

function writeEnvelope<T>(round: number, payload: T): string {
  return JSON.stringify({
    round,
    savedAt: new Date().toISOString(),
    payload,
  } satisfies RoundEnvelope<T>);
}

export function saveDraft(matchId: string, round: number, moves: SubmittedMove[]) {
  sessionStorage.setItem(`${DRAFT_PREFIX}${matchId}`, writeEnvelope(round, moves));
}

export function loadDraft(matchId: string, round: number): SubmittedMove[] {
  const envelope = readEnvelope<SubmittedMove[]>(
    sessionStorage.getItem(`${DRAFT_PREFIX}${matchId}`)
  );
  if (!envelope || envelope.round !== round) {
    sessionStorage.removeItem(`${DRAFT_PREFIX}${matchId}`);
    return [];
  }
  return envelope.payload ?? [];
}

export function clearDraft(matchId: string) {
  sessionStorage.removeItem(`${DRAFT_PREFIX}${matchId}`);
}

export function saveLockedMoves(matchId: string, round: number, moves: SubmittedMove[]) {
  sessionStorage.setItem(`${LOCKED_PREFIX}${matchId}`, writeEnvelope(round, moves));
}

export function loadLockedMoves(matchId: string, round: number): SubmittedMove[] {
  const envelope = readEnvelope<SubmittedMove[]>(
    sessionStorage.getItem(`${LOCKED_PREFIX}${matchId}`)
  );
  if (!envelope || envelope.round !== round) {
    sessionStorage.removeItem(`${LOCKED_PREFIX}${matchId}`);
    return [];
  }
  return envelope.payload ?? [];
}

export function clearLockedMoves(matchId: string) {
  sessionStorage.removeItem(`${LOCKED_PREFIX}${matchId}`);
}

export function markBriefingSeen(matchId: string) {
  sessionStorage.setItem(`${BRIEFING_PREFIX}${matchId}`, "1");
}

export function hasSeenBriefing(matchId: string): boolean {
  return sessionStorage.getItem(`${BRIEFING_PREFIX}${matchId}`) === "1";
}

export function clearBriefingSeen(matchId: string) {
  sessionStorage.removeItem(`${BRIEFING_PREFIX}${matchId}`);
}

export function saveLastPrivateReport(matchId: string, line: string) {
  sessionStorage.setItem(`${PRIVATE_REPORT_PREFIX}${matchId}`, line);
}

export function loadLastPrivateReport(matchId: string): string | null {
  return sessionStorage.getItem(`${PRIVATE_REPORT_PREFIX}${matchId}`);
}

const PANEL_PREFIX = "pricewar:requestedPanel:";

export type MatchShellPanel = "review" | "decide";

export function saveRequestedPanel(matchId: string, panel: MatchShellPanel) {
  sessionStorage.setItem(`${PANEL_PREFIX}${matchId}`, panel);
}

export function consumeRequestedPanel(matchId: string): MatchShellPanel | null {
  const raw = sessionStorage.getItem(`${PANEL_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${PANEL_PREFIX}${matchId}`);
  if (raw === "review" || raw === "decide") return raw;
  return null;
}

/** Drop all client-side match session keys (call when entering a fresh match). */
export function clearMatchSessionStorage(matchId: string) {
  sessionStorage.removeItem(`${DRAFT_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${LOCKED_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${BRIEFING_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${PRIVATE_REPORT_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${CASH_TREND_PREFIX}${matchId}`);
  sessionStorage.removeItem(`${PANEL_PREFIX}${matchId}`);
}
