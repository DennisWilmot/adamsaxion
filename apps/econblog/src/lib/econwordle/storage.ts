/** localStorage persistence for Econ Wordle. v1 has no backend (see scope doc). */

export type GameStatus = "playing" | "won" | "lost";

export interface SavedGame {
  dayNumber: number;
  guesses: string[];
  status: GameStatus;
  /** Set after the first submit attempt so length stays visible on reload. */
  lengthRevealed?: boolean;
  /** Player opened the hint after unlocking it. */
  hintRevealed?: boolean;
}

export interface StreakState {
  /** Day number of the most recent finished puzzle. */
  lastDay: number;
  count: number;
}

const GAME_KEY = "econ-wordle:game";
const STREAK_KEY = "econ-wordle:streak";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / private-mode failures — the game still works in-memory.
  }
}

/** Saved game for the given day, or null if none (or it's from a previous day). */
export function loadGame(dayNumber: number): SavedGame | null {
  const saved = read<SavedGame>(GAME_KEY);
  if (!saved || saved.dayNumber !== dayNumber) return null;
  return saved;
}

export function saveGame(state: SavedGame): void {
  write(GAME_KEY, state);
}

export function loadStreak(): StreakState {
  return read<StreakState>(STREAK_KEY) ?? { lastDay: -1, count: 0 };
}

/** Testing helper: wipe saved game + streak so the puzzle can be replayed. */
export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GAME_KEY);
    window.localStorage.removeItem(STREAK_KEY);
  } catch {
    // ignore
  }
}

/**
 * Apply a finished result to the streak exactly once. Returns the new streak.
 * Safe to skip on reload by only calling at the win/loss transition.
 */
export function recordResult(dayNumber: number, won: boolean): StreakState {
  const prev = loadStreak();
  if (prev.lastDay === dayNumber) return prev;

  let count: number;
  if (!won) {
    count = 0;
  } else if (prev.lastDay === dayNumber - 1) {
    count = prev.count + 1;
  } else {
    count = 1;
  }

  const next: StreakState = { lastDay: dayNumber, count };
  write(STREAK_KEY, next);
  return next;
}
