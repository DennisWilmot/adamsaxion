/** Pure guess-scoring + share helpers for Econ Wordle. No DOM, no storage. */

export type LetterState = "correct" | "present" | "absent";

export const MAX_GUESSES = 6;

/** Hints unlock after this many submitted guesses. */
export const HINT_UNLOCK_AFTER = 3;

export interface ScoredGuess {
  /** Letters the player submitted (may be shorter than the answer). */
  guess: string;
  states: readonly LetterState[];
  /** Wrong-length submission — shown as an all-red row, no letter scoring. */
  invalid?: boolean;
}

/**
 * Score a submission. Wrong-length guesses are invalid (all-red row, no tile scoring).
 */
export function scoreSubmission(guess: string, answer: string): ScoredGuess {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  if (g.length !== a.length) {
    return { guess: g, states: [], invalid: true };
  }
  return { guess: g, states: scoreGuess(g, a), invalid: false };
}

/**
 * Score a guess against the answer using standard Wordle rules, including
 * correct duplicate-letter handling (a letter is only marked "present" as many
 * times as it appears in the answer beyond exact matches).
 */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  const result: LetterState[] = Array.from({ length: g.length }, () => "absent");

  const remaining: Record<string, number> = {};
  for (const ch of a) remaining[ch] = (remaining[ch] ?? 0) + 1;

  for (let i = 0; i < g.length; i++) {
    const ch = g[i]!;
    if (ch === a[i]) {
      result[i] = "correct";
      remaining[ch] = (remaining[ch] ?? 0) - 1;
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    const ch = g[i]!;
    if ((remaining[ch] ?? 0) > 0) {
      result[i] = "present";
      remaining[ch] = (remaining[ch] ?? 0) - 1;
    }
  }

  return result;
}

export function isWinningRow(states: readonly LetterState[]): boolean {
  return states.length > 0 && states.every((s) => s === "correct");
}

/** Best-known state for a letter across all scored rows (correct > present > absent). */
export function deriveKeyStates(
  rows: ReadonlyArray<ScoredGuess>
): Record<string, LetterState> {
  const rank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };
  const out: Record<string, LetterState> = {};
  for (const row of rows) {
    if (row.invalid) continue;
    const g = row.guess.toUpperCase();
    for (let i = 0; i < g.length; i++) {
      const ch = g[i]!;
      const next = row.states[i] ?? "absent";
      const current = out[ch];
      if (!current || rank[next] > rank[current]) out[ch] = next;
    }
  }
  return out;
}

const EMOJI: Record<LetterState, string> = {
  correct: "\u{1F7E9}",
  present: "\u{1F7E8}",
  absent: "\u2B1C",
};

const INVALID_EMOJI = "\u{1F7E5}";

export function shareRowEmoji(row: ScoredGuess, answerLength: number): string {
  if (row.invalid) {
    return INVALID_EMOJI.repeat(answerLength);
  }
  return row.states.map((s) => EMOJI[s]).join("");
}

export function buildShareGrid(
  rows: ReadonlyArray<ScoredGuess>,
  answerLength: number
): string {
  return rows.map((row) => shareRowEmoji(row, answerLength)).join("\n");
}

export const SHARE_INTRO =
  "Hey, I just played Econ Wordle — you should try it too!";

export function buildShareText(args: {
  dayNumber: number;
  rows: ReadonlyArray<ScoredGuess>;
  answerLength: number;
  won: boolean;
  url: string;
}): string {
  const score = args.won ? `${args.rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const grid = buildShareGrid(args.rows, args.answerLength);
  return `${SHARE_INTRO}\n\nEcon Wordle #${args.dayNumber} ${score}\n\n${grid}\n\n${args.url}`;
}
