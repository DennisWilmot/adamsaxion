import { NextResponse } from "next/server";
import type { GameError, GameErrorCode } from "@adamsaxion/pricewar-types";

const STATUS: Record<GameErrorCode, number> = {
  INVALID_SUBMIT: 400,
  MATCH_NOT_FOUND: 404,
  NOT_YOUR_TURN: 403,
  CLOCK_EXPIRED: 400,
  ALREADY_SUBMITTED: 409,
  MOVE_NOT_ALLOWED: 400,
  UNIMPLEMENTED_MOVE: 501,
  INSUFFICIENT_RESOURCES: 400,
  MATCH_COMPLETED: 409,
  RATE_LIMITED: 429,
  FORBIDDEN: 403,
  INTERNAL: 500,
};

export function jsonError(error: GameError, extra?: { retryAfter?: number }) {
  const status = STATUS[error.code] ?? 500;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (extra?.retryAfter !== undefined) {
    headers["Retry-After"] = String(extra.retryAfter);
  }
  return NextResponse.json(error, { status, headers });
}

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
