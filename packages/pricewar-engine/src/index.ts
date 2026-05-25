export { ENGINE_VERSION } from "./version";
export {
  resolveTurn,
  validateMoves,
  ResolveTurnError,
  type ResolveTurnInput,
  type ResolveTurnOutput,
} from "./engine/resolve-turn";
export { evaluateLegalMoves, type LegalMoveStatus } from "./engine/legal-moves";
export { advanceFromReportToDecide } from "./engine/advance-from-report";
export { hasActionHandler } from "./actions/handlers/registry";
export { toPlayerView } from "./visibility/to-player-view";
export { createRng, roundRngSeed } from "./rng/seeded";
export { PLAY_MODES, getPlayMode, listPlayModes, isE2ePlayMode } from "./play-modes/registry";
export {
  COFFEE_SHOP_SCENARIO,
  createInitialMatchState,
} from "./scenarios/coffee-shop";
export { COFFEE_SHOP_MOVES, MOVE_BY_ID, COFFEE_SHOP_ACTIONS, ACTION_BY_ID, getActionCatalogEntry, lockForecastForAction, lockForecastForMoves } from "./moves/catalog";
export { staticForecastForMoves, reviewForecastForDraft } from "./actions/review-forecast";
export type { LockForecastLine } from "./actions/catalog-types";
export { normalizeMatchState, createNormalizedInitialPrivate } from "./state/normalize";
export { getSim, writeSim, COSTS, SPREADSHEET_COSTS, estimateActionCost, hiringCost, severanceCost } from "./simulation/player-sim";
export { COFFEE_SHOP_SIM } from "./simulation/config";
export {
  expectedScore,
  kFactor,
  computeRatingDelta,
  applyRatingDelta,
} from "./rating/elo";
export { BOT_PERSONAS, getBotPersona } from "./bots/registry";
export {
  getTutorialBotMoves,
  getTutorialBotScriptRounds,
  TUTORIAL_BOT_SCRIPT,
} from "./bots/tutorial-script";
export {
  TUTORIAL_NARRATION,
  getTutorialNarration,
  getTutorialReportNarration,
  type TutorialNarrationStep,
} from "./tutorial/narration";
export { extractFacts, type MatchFacts } from "./coach/extract-facts";
export {
  renderTemplateCoach,
  type CoachReportPayload,
} from "./coach/render-template";
export {
  replayMatchFromSubmissions,
  diffMatchStates,
} from "./replay/replay-match";
export {
  ABANDONMENT_GRACE_MS,
  defaultTimerMeta,
  ensureTimerMeta,
  beginRoundClocks,
  freezeClock,
  tickClocks,
  startAbandonmentGrace,
  clearAbandonmentGrace,
  gracePeriodExpired,
  incrementClockTimeoutCount,
  incrementZeroMoveCount,
  buildForfeitState,
  shouldAutopassOnClockExpiry,
  shouldForfeitOnZeroMoves,
} from "./engine/clock";
