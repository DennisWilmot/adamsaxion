import type { Metadata } from "next";
import { getDailyPuzzle } from "@/lib/econwordle/daily";
import { EconWordleGame } from "@/components/econwordle/EconWordleGame";

// Recompute per request so "today" follows server time, not the client clock.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Econ Wordle — Daily Economics Puzzle",
  description:
    "Guess the daily economics term in six tries. A free puzzle from Adam's Axioms — every word is a doorway to a lesson.",
  alternates: { canonical: "/play/econ-wordle" },
  openGraph: {
    title: "Econ Wordle — Daily Economics Puzzle",
    description:
      "Guess the daily economics term in six tries. Free, new every day.",
    url: "/play/econ-wordle",
  },
};

export default function EconWordlePage() {
  const puzzle = getDailyPuzzle();
  return <EconWordleGame puzzle={puzzle} />;
}
