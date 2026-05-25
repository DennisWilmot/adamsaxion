import {
  pgSchema,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./content";

export const pricewar = pgSchema("pricewar");

export const match = pricewar.table(
  "match",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scenarioId: text("scenario_id").notNull(),
    scenarioVersion: text("scenario_version").notNull(),
    engineVersion: text("engine_version").notNull(),
    playModeId: text("play_mode_id").notNull(),
    playModeOverride: jsonb("play_mode_override"),
    rngSeed: text("rng_seed").notNull(),
    phase: text("phase").notNull(),
    outcomeKind: text("outcome_kind").notNull().default("in_progress"),
    outcomeWinnerSlot: text("outcome_winner_slot"),
    outcomeReason: text("outcome_reason"),
    state: jsonb("state").notNull(),
    eventsCount: integer("events_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("match_phase_idx").on(table.phase),
    index("match_completed_at_idx").on(table.completedAt),
  ]
);

export const matchPlayers = pricewar.table(
  "match_players",
  {
    matchId: uuid("match_id")
      .references(() => match.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    botPersonalityId: text("bot_personality_id"),
    slot: text("slot").notNull(),
    isBot: boolean("is_bot").notNull(),
    ratingAtStart: integer("rating_at_start"),
    ratingAfter: integer("rating_after"),
    ratingDelta: integer("rating_delta"),
    abandonedAt: timestamp("abandoned_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("match_players_match_slot_idx").on(table.matchId, table.slot),
    index("match_players_user_idx").on(table.userId),
  ]
);

export const turnSubmissions = pricewar.table(
  "turn_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .references(() => match.id, { onDelete: "cascade" })
      .notNull(),
    round: integer("round").notNull(),
    slot: text("slot").notNull(),
    moves: jsonb("moves").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    submittedByEngineAutopass: boolean("by_autopass").default(false).notNull(),
    clockAtSubmitMs: integer("clock_at_submit_ms"),
  },
  (table) => [
    uniqueIndex("turn_submissions_match_round_slot_idx").on(
      table.matchId,
      table.round,
      table.slot
    ),
  ]
);

export const roundReports = pricewar.table(
  "round_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .references(() => match.id, { onDelete: "cascade" })
      .notNull(),
    round: integer("round").notNull(),
    publicReport: jsonb("public_report").notNull(),
    privateReportA: jsonb("private_report_a").notNull(),
    privateReportB: jsonb("private_report_b").notNull(),
    eventsSlice: jsonb("events_slice").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("round_reports_match_round_idx").on(table.matchId, table.round),
  ]
);

export const ratings = pricewar.table(
  "ratings",
  {
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    scenarioId: text("scenario_id").notNull(),
    playModeId: text("play_mode_id").notNull(),
    rating: integer("rating").notNull().default(1200),
    ratingDeviation: integer("rating_deviation").notNull().default(0),
    gamesPlayed: integer("games_played").notNull().default(0),
    highestRating: integer("highest_rating").notNull().default(1200),
    lastMatchAt: timestamp("last_match_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("ratings_user_scenario_mode_idx").on(
      table.userId,
      table.scenarioId,
      table.playModeId
    ),
    index("ratings_leaderboard_idx").on(
      table.scenarioId,
      table.playModeId,
      table.rating
    ),
  ]
);

export const matchmakingQueue = pricewar.table(
  "matchmaking_queue",
  {
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .primaryKey(),
    scenarioId: text("scenario_id").notNull(),
    playModeId: text("play_mode_id").notNull(),
    ratingAtEnqueue: integer("rating_at_enqueue"),
    enqueuedAt: timestamp("enqueued_at", { withTimezone: true }).defaultNow().notNull(),
    botFallbackAfterSec: integer("bot_fallback_after_sec").notNull().default(60),
  },
  (table) => [
    index("matchmaking_scenario_mode_enqueued_idx").on(
      table.scenarioId,
      table.playModeId,
      table.enqueuedAt
    ),
  ]
);

export const matchCoachReports = pricewar.table(
  "match_coach_reports",
  {
    matchId: uuid("match_id")
      .references(() => match.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    generatedBy: text("generated_by").notNull(),
    payload: jsonb("payload").notNull(),
    costUsd: text("cost_usd").notNull().default("0"),
    model: text("model"),
    promptHash: text("prompt_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("match_coach_reports_match_user_idx").on(table.matchId, table.userId),
  ]
);

export const llmSpendLedger = pricewar.table(
  "llm_spend_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),
    matchId: uuid("match_id"),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    costUsd: text("cost_usd").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("llm_spend_user_day_idx").on(table.userId, table.createdAt),
    index("llm_spend_feature_day_idx").on(table.feature, table.createdAt),
  ]
);

export const playerFlags = pricewar.table(
  "player_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    reason: text("reason").notNull(),
    severity: text("severity").notNull(),
    notes: text("notes"),
    flaggedByAdminEmail: text("flagged_by_admin_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [index("player_flags_user_idx").on(table.userId)]
);

export const rateLimits = pricewar.table(
  "rate_limits",
  {
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    bucket: text("bucket").notNull(),
    tokensRemaining: integer("tokens_remaining").notNull(),
    lastRefill: timestamp("last_refill", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rate_limits_user_bucket_idx").on(table.userId, table.bucket),
  ]
);
