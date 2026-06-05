"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flame, Lightbulb, RotateCcw } from "lucide-react";
import type { DailyPuzzle } from "@/lib/econwordle/daily";
import {
  HINT_UNLOCK_AFTER,
  MAX_GUESSES,
  buildShareText,
  deriveKeyStates,
  isWinningRow,
  scoreSubmission,
} from "@/lib/econwordle/engine";
import { MAX_WORD_LENGTH } from "@/lib/econwordle/words";
import {
  type GameStatus,
  clearProgress,
  loadGame,
  loadStreak,
  recordResult,
  saveGame,
} from "@/lib/econwordle/storage";
import { Board } from "./Board";
import { BACK_KEY, ENTER_KEY, Keyboard } from "./Keyboard";
import { ResultCard } from "./ResultCard";
import { StreakAuthPrompt } from "./StreakAuthPrompt";

export function EconWordleGame({
  puzzle,
  isAuthenticated,
  isAdmin,
}: {
  puzzle: DailyPuzzle;
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lengthRevealed, setLengthRevealed] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const messageTimer = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadGame(puzzle.dayNumber);
    if (saved) {
      setGuesses(saved.guesses);
      setStatus(saved.status);
      setLengthRevealed(saved.lengthRevealed ?? saved.guesses.length > 0);
      setHintRevealed(saved.hintRevealed ?? false);
    } else {
      setLengthRevealed(false);
      setHintRevealed(false);
    }
    setCurrent("");
    setStreak(loadStreak().count);
  }, [puzzle.dayNumber]);

  const scoredRows = useMemo(
    () => guesses.map((guess) => scoreSubmission(guess, puzzle.word)),
    [guesses, puzzle.word]
  );

  const keyStates = useMemo(() => deriveKeyStates(scoredRows), [scoredRows]);
  const attemptsLeft = MAX_GUESSES - guesses.length;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/econ-wordle`
      : "/play/econ-wordle";

  const shareText = useMemo(
    () =>
      buildShareText({
        dayNumber: puzzle.dayNumber + 1,
        rows: scoredRows,
        answerLength: puzzle.length,
        won: status === "won",
        url: shareUrl,
      }),
    [puzzle.dayNumber, puzzle.length, scoredRows, status, shareUrl]
  );

  const persistGame = useCallback(
    (next: {
      guesses: string[];
      status: GameStatus;
      lengthRevealed: boolean;
      hintRevealed?: boolean;
    }) => {
      saveGame({
        dayNumber: puzzle.dayNumber,
        guesses: next.guesses,
        status: next.status,
        lengthRevealed: next.lengthRevealed,
        hintRevealed: next.hintRevealed ?? hintRevealed,
      });
    },
    [puzzle.dayNumber, hintRevealed]
  );

  const flashMessage = useCallback((text: string) => {
    setMessage(text);
    setShake(true);
    if (messageTimer.current) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => {
      setMessage(null);
      setShake(false);
    }, 1100);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === ENTER_KEY) {
        if (current.length === 0) {
          flashMessage("Type something first");
          return;
        }

        const guess = current.toUpperCase();
        const row = scoreSubmission(guess, puzzle.word);
        const nextGuesses = [...guesses, guess];
        const won = !row.invalid && isWinningRow(row.states);
        const lost = !won && nextGuesses.length >= MAX_GUESSES;
        const nextStatus: GameStatus = won ? "won" : lost ? "lost" : "playing";

        setGuesses(nextGuesses);
        setCurrent("");
        setLengthRevealed(true);
        setStatus(nextStatus);
        persistGame({
          guesses: nextGuesses,
          status: nextStatus,
          lengthRevealed: true,
          hintRevealed,
        });

        if (won || lost) {
          setStreak(recordResult(puzzle.dayNumber, won).count);
        }
        return;
      }

      if (key === BACK_KEY) {
        setCurrent((c) => c.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key)) {
        setCurrent((c) => {
          const limit = lengthRevealed ? puzzle.length : MAX_WORD_LENGTH;
          return c.length < limit ? c + key : c;
        });
      }
    },
    [current, guesses, puzzle, status, flashMessage, lengthRevealed, hintRevealed, persistGame]
  );

  const hintUnlocked = guesses.length >= HINT_UNLOCK_AFTER;

  const handleHint = useCallback(() => {
    if (status !== "playing") return;
    if (!hintUnlocked) {
      flashMessage(`Hint available after ${HINT_UNLOCK_AFTER}${HINT_UNLOCK_AFTER === 3 ? "rd" : "th"} attempt`);
      return;
    }
    setHintRevealed(true);
    persistGame({
      guesses,
      status,
      lengthRevealed,
      hintRevealed: true,
    });
  }, [
    status,
    hintUnlocked,
    flashMessage,
    guesses,
    lengthRevealed,
    persistGame,
  ]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") handleKey(ENTER_KEY);
      else if (e.key === "Backspace") handleKey(BACK_KEY);
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const resetGame = useCallback(() => {
    clearProgress();
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setLengthRevealed(false);
    setHintRevealed(false);
    setStreak(0);
    setMessage(null);
    setShake(false);
  }, []);

  const done = status !== "playing";
  return (
    <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-xl px-md py-xl sm:px-xl">
      <header className="text-center">
        <h1 className="flex items-center justify-center gap-sm font-display text-3xl font-bold text-foreground">
          Econ Wordle
          <span className="font-bold">#{puzzle.dayNumber}</span>
          {!done && (
            <button
              type="button"
              onClick={handleHint}
              aria-label={
                hintRevealed
                  ? "Hint revealed"
                  : hintUnlocked
                    ? "Reveal hint"
                    : `Hint available after ${HINT_UNLOCK_AFTER} attempts`
              }
              className={`inline-flex size-9 items-center justify-center rounded-full border transition-colors ${
                hintUnlocked
                  ? hintRevealed
                    ? "border-gold bg-gold-subtle text-gold"
                    : "border-border bg-surface-raised text-gold hover:bg-gold-subtle"
                  : "cursor-pointer border-border-subtle bg-surface-sunken text-foreground-muted opacity-50"
              }`}
            >
              <Lightbulb className="size-4" aria-hidden />
            </button>
          )}
        </h1>
        {!done && (
          <p className="mt-xs font-body text-sm text-foreground-muted">
            {lengthRevealed ? `${puzzle.length} letters` : "Length hidden until your first guess"}
            {" · "}
            {attemptsLeft} {attemptsLeft === 1 ? "try" : "tries"} left
          </p>
        )}
        {!done && (
          <p className="mt-xs font-body text-xs text-foreground-muted">
            Guess the economics term.
          </p>
        )}
        {!done && isAuthenticated && streak > 0 && (
          <p className="mt-sm inline-flex items-center justify-center gap-xs rounded-full bg-gold-subtle px-md py-xs font-body text-xs font-semibold text-gold">
            <Flame className="size-3.5" aria-hidden />
            {streak} day{streak === 1 ? "" : "s"} streak
          </p>
        )}
      </header>

      <div className="relative">
        {message && (
          <div className="absolute inset-x-0 -top-3 z-10 flex justify-center">
            <span className="rounded-md bg-foreground px-md py-sm font-body text-xs font-semibold text-surface-raised shadow-md">
              {message}
            </span>
          </div>
        )}
        <Board
          length={puzzle.length}
          rows={scoredRows}
          currentGuess={current}
          maxGuesses={MAX_GUESSES}
          shake={shake}
          lengthRevealed={lengthRevealed}
          hiddenLength={MAX_WORD_LENGTH}
        />
      </div>

      {!done && hintRevealed && (
        <p className="rounded-md border border-gold/30 bg-gold-subtle px-md py-sm text-center font-body text-sm text-foreground">
          <span className="font-semibold text-gold">Hint: </span>
          {puzzle.hint}
        </p>
      )}

      <div>
        {done ? (
          <ResultCard
            won={status === "won"}
            guessCount={guesses.length}
            maxGuesses={MAX_GUESSES}
            word={puzzle.word}
            definition={puzzle.definition}
            lessonSlug={puzzle.lessonSlug}
            lessonTitle={puzzle.lessonTitle}
            streak={streak}
            shareText={shareText}
            shareUrl={shareUrl}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <div className="flex flex-col gap-lg">
            {!isAuthenticated && <StreakAuthPrompt />}
            <Keyboard keyStates={keyStates} disabled={false} onKey={handleKey} />
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-xs rounded-md border border-dashed border-border px-md py-xs font-body text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-sunken"
          >
            <RotateCcw className="size-3.5" />
            Reset (dev)
          </button>
        </div>
      )}
    </div>
  );
}
