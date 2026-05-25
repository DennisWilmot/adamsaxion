import type { GameError } from "@adamsaxion/pricewar-types";

export class ResolveTurnError extends Error {
  constructor(public readonly gameError: GameError) {
    super(gameError.message);
    this.name = "ResolveTurnError";
  }
}
