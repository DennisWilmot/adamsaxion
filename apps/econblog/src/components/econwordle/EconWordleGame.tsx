"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { DailyPuzzle } from "@/lib/econwordle/daily";
import {
  MAX_GUESSES,
  buildShareText,
  deriveKeyStates,
  isWinningRow,
  scoreGuess,
} from "@/lib/econwordle/engine";
import {
  type GameStatus,
  clearProgress,
  loadGame,
  loadStreak,
  recordResult,
  saveGame,
} from "@/lib/econwordle/storage";
import { Board, type ScoredRow } from "./Board";
import { BACK_KEY, ENTER_KEY, Keyboard } from "./Keyboard";
import { ResultCard } from "./ResultCard";

export function EconWordleGame({ puzzle }: { puzzle: DailyPuzzle }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadGame(puzzle.dayNumber);
    if (saved) {
      setGuesses(saved.guesses);
      setStatus(saved.status);
    }
    setStreak(loadStreak().count);
  }, [puzzle.dayNumber]);

  const scoredRows = useMemo<ScoredRow[]>(
    () => guesses.map((guess) => ({ guess, states: scoreGuess(guess, puzzle.word) })),
    [guesses, puzzle.word]
  );

  const keyStates = useMemo(() => deriveKeyStates(scoredRows), [scoredRows]);

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
        if (current.length !== puzzle.length) {
          flashMessage(`Needs ${puzzle.length} letters`);
          return;
        }
        const nextGuesses = [...guesses, current];
        const states = scoreGuess(current, puzzle.word);
        const won = isWinningRow(states);
        const lost = !won && nextGuesses.length >= MAX_GUESSES;
        const nextStatus: GameStatus = won ? "won" : lost ? "lost" : "playing";

        setGuesses(nextGuesses);
        setCurrent("");
        setStatus(nextStatus);
        saveGame({ dayNumber: puzzle.dayNumber, guesses: nextGuesses, status: nextStatus });

        if (won || lost) {
          setStreak(recordResult(puzzle.dayNumber, won).count);
        }
        return;
      }

      if (key === BACK_KEY) {
        setCurrent((c) => c.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key) && current.length < puzzle.length) {
        setCurrent((c) => c + key);
      }
    },
    [current, guesses, puzzle, status, flashMessage]
  );

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

  const handleShare = useCallback(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/play/econ-wordle`
        : "";
    const text = buildShareText({
      dayNumber: puzzle.dayNumber + 1,
      rows: scoredRows.map((r) => r.states),
      won: status === "won",
      url,
    });
    void navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => flashMessage("Couldn't copy"));
  }, [puzzle.dayNumber, scoredRows, status, flashMessage]);

  const resetGame = useCallback(() => {
    clearProgress();
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setStreak(0);
    setCopied(false);
    setMessage(null);
    setShake(false);
  }, []);

  const done = status !== "playing";
  const showDevReset = process.env.NODE_ENV !== "production";

  return (
    <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-xl px-md py-xl sm:px-xl">
      <header className="text-center">
        <h1 className="flex items-baseline justify-center gap-sm font-display text-3xl font-bold text-foreground">
          Econ Wordle
          <span className="font-bold">#{puzzle.dayNumber}</span>
        </h1>
        <p className="mt-xs font-body text-sm text-foreground-muted">
          {puzzle.length} letters
        </p>
        {!done && (
          <p className="mt-xs font-body text-xs text-foreground-muted">
            Guess the economics term in {MAX_GUESSES} tries.
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
        />
      </div>

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
            copied={copied}
            onShare={handleShare}
          />
        ) : (
          <Keyboard keyStates={keyStates} disabled={false} onKey={handleKey} />
        )}
      </div>

      {showDevReset && (
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
