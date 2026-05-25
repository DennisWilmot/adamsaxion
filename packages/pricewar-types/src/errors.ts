export type GameErrorCode =
  | "INVALID_SUBMIT"
  | "MATCH_NOT_FOUND"
  | "NOT_YOUR_TURN"
  | "CLOCK_EXPIRED"
  | "ALREADY_SUBMITTED"
  | "MOVE_NOT_ALLOWED"
  | "INSUFFICIENT_RESOURCES"
  | "MATCH_COMPLETED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "INTERNAL";

export interface GameError {
  code: GameErrorCode;
  message: string;
}
