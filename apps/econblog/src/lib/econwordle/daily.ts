import { CORPUS_LESSONS } from "@/lib/learning/corpus-lessons";
import { ECON_WORDS } from "./words";

/**
 * Day 0 of Econ Wordle. The puzzle for a given calendar date (in TIME_ZONE) is
 * `ECON_WORDS[dayNumber % length]`, where dayNumber counts days since EPOCH.
 */
export const EPOCH = "2026-05-28";

/** Authoritative timezone for "today". Keeps the daily consistent for everyone. */
export const TIME_ZONE = "America/New_York";

const TITLE_BY_SLUG = new Map(CORPUS_LESSONS.map((l) => [l.slug, l.title]));

/** Calendar date (YYYY-MM-DD) in TIME_ZONE for the given instant. */
function dateKey(now: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function dayNumberFor(now: Date, timeZone: string = TIME_ZONE): number {
  const today = Date.parse(`${dateKey(now, timeZone)}T00:00:00Z`);
  const epoch = Date.parse(`${EPOCH}T00:00:00Z`);
  return Math.max(0, Math.floor((today - epoch) / 86_400_000));
}

export interface DailyPuzzle {
  dayNumber: number;
  word: string;
  length: number;
  definition: string;
  hint: string;
  lessonSlug: string;
  lessonTitle: string;
}

/**
 * Resolve today's puzzle. Pass an explicit instant for tests; in production the
 * page computes this on the server so the day is determined by server time.
 */
export function getDailyPuzzle(now: Date = new Date()): DailyPuzzle {
  const dayNumber = dayNumberFor(now);
  const entry = ECON_WORDS[dayNumber % ECON_WORDS.length]!;
  const word = entry.word.toUpperCase();
  return {
    dayNumber,
    word,
    length: word.length,
    definition: entry.definition,
    hint: entry.hint,
    lessonSlug: entry.lessonSlug,
    lessonTitle: TITLE_BY_SLUG.get(entry.lessonSlug) ?? "this concept",
  };
}
