import type { PlayerView, SubmittedMove } from "@adamsaxion/pricewar-types";
import type { Rng } from "../rng/seeded";
import { MOVE_BY_ID } from "../moves/catalog";
import { getTutorialBotMoves } from "./tutorial-script";

export interface BotPersonality {
  id: string;
  label: string;
  difficultyTier: 1 | 2 | 3 | 4 | 5;
  description: string;
  chooseMoves: (view: PlayerView, rng: Rng) => SubmittedMove[];
}

function legalMoveIds(view: PlayerView): string[] {
  return [...MOVE_BY_ID.values()]
    .filter((m) => {
      if (m.id === "marketing.m01") {
        return view.me.cash >= 50;
      }
      return true;
    })
    .map((m) => m.id);
}

function defaultInputForMove(moveId: string, view: PlayerView): unknown {
  if (moveId === "sales.s01") {
    return { newPrice: view.me.currentPrice };
  }
  if (moveId === "marketing.m01") {
    return { amount: Math.min(200, view.me.cash) };
  }
  if (moveId === "procurement.p03") {
    return { units: 2 };
  }
  return { enabled: true };
}

function pickRandomMoves(view: PlayerView, rng: Rng, count: number): SubmittedMove[] {
  const ids = legalMoveIds(view);
  const picked = new Set<string>();
  const moves: SubmittedMove[] = [];
  const target = Math.min(count, ids.length);

  while (moves.length < target && picked.size < ids.length) {
    const moveId = rng.pick(ids);
    if (picked.has(moveId)) continue;
    picked.add(moveId);
    moves.push({
      moveId: moveId as SubmittedMove["moveId"],
      input: defaultInputForMove(moveId, view),
      draftedAt: new Date(0).toISOString(),
    });
  }

  return moves;
}

export const BOT_PERSONAS: BotPersonality[] = [
  {
    id: "bot.random",
    label: "Sam",
    difficultyTier: 1,
    description: "Random legal moves.",
    chooseMoves: (view, rng) => pickRandomMoves(view, rng, 1 + Math.floor(rng.next() * 3)),
  },
  {
    id: "bot.budget",
    label: "Riley",
    difficultyTier: 2,
    description: "Cash-conservative play.",
    chooseMoves: (view) => [
      {
        moveId: "sales.s01" as SubmittedMove["moveId"],
        input: { newPrice: Math.max(100, view.me.currentPrice - 25) },
        draftedAt: new Date(0).toISOString(),
      },
    ],
  },
  {
    id: "bot.aggressive",
    label: "Devon",
    difficultyTier: 3,
    description: "Marketing-heavy.",
    chooseMoves: (view) => [
      {
        moveId: "marketing.m01" as SubmittedMove["moveId"],
        input: { amount: Math.min(300, view.me.cash) },
        draftedAt: new Date(0).toISOString(),
      },
    ],
  },
  {
    id: "bot.premium",
    label: "Jordan",
    difficultyTier: 3,
    description: "Premium pricing.",
    chooseMoves: (view) => [
      {
        moveId: "sales.s01" as SubmittedMove["moveId"],
        input: { newPrice: Math.min(800, view.me.currentPrice + 50) },
        draftedAt: new Date(0).toISOString(),
      },
    ],
  },
  {
    id: "bot.efficient",
    label: "Casey",
    difficultyTier: 4,
    description: "Balanced heuristic.",
    chooseMoves: (view, rng) => pickRandomMoves(view, rng, 2),
  },
  {
    id: "bot.adaptive",
    label: "Alex",
    difficultyTier: 4,
    description: "Reacts to opponent price.",
    chooseMoves: (view) => [
      {
        moveId: "sales.s01" as SubmittedMove["moveId"],
        input: {
          newPrice:
            view.opponent.currentPrice <= view.me.currentPrice
              ? view.opponent.currentPrice - 25
              : view.me.currentPrice,
        },
        draftedAt: new Date(0).toISOString(),
      },
    ],
  },
  {
    id: "bot.savant",
    label: "Morgan",
    difficultyTier: 5,
    description: "Strong heuristic.",
    chooseMoves: (view, rng) => pickRandomMoves(view, rng, 3),
  },
  {
    id: "bot.tutorial",
    label: "Guide",
    difficultyTier: 1,
    description: "Scripted tutorial opponent.",
    chooseMoves: (view) => getTutorialBotMoves(view.market.currentRound),
  },
];

export function getBotPersona(id: string): BotPersonality | undefined {
  return BOT_PERSONAS.find((p) => p.id === id);
}
