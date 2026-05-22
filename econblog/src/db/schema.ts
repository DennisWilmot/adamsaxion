import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username").unique().notNull(),
  totalXp: integer("total_xp").default(0).notNull(),
  currentLevel: integer("current_level").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  primaryInterestId: text("primary_interest_id"),
  secondaryInterestIds: text("secondary_interest_ids").array().default([]).notNull(),
  pathSetupCompletedAt: timestamp("path_setup_completed_at", { withTimezone: true }),
  pathSetupSkippedAt: timestamp("path_setup_skipped_at", { withTimezone: true }),
  entryBranch: text("entry_branch"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  lessonId: text("lesson_id").notNull(),
  questionId: text("question_id").notNull(),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  lessonId: text("lesson_id").notNull(),
  completedSubsections: text("completed_subsections").array().default([]).notNull(),
  unlockedSections: text("unlocked_sections").array().default([]).notNull(),
  masteryAttempted: boolean("mastery_attempted").default(false).notNull(),
  masteryPassed: boolean("mastery_passed").default(false).notNull(),
  masteryBestScore: integer("mastery_best_score"),
  totalXpEarned: integer("total_xp_earned").default(0).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leaderboardSeeds = pgTable("leaderboard_seeds", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  totalXp: integer("total_xp").notNull(),
  currentLevel: integer("current_level").notNull(),
  isSeeded: boolean("is_seeded").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedMinutes: integer("estimated_minutes").default(30).notNull(),
  description: text("description").default("").notNull(),
  thumbnail: text("thumbnail").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status").default("research").notNull(),
  sections: jsonb("sections").default([]).notNull(),
  masteryQuiz: jsonb("mastery_quiz"),
  outlineData: jsonb("outline_data"),
  researchNotes: text("research_notes"),
  contentProgress: jsonb("content_progress").default({ completedSections: [] }).notNull(),
  questionsProgress: jsonb("questions_progress").default({ completedSections: [] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const lessonGenerationJobs = pgTable("lesson_generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status").default("queued").notNull(),
  currentStage: text("current_stage"),
  currentStep: text("current_step"),
  progress: integer("progress").default(0).notNull(),
  total: integer("total").default(0).notNull(),
  error: text("error"),
  cancelRequested: boolean("cancel_requested").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const generationCache = pgTable("generation_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(),
  cacheKey: text("cache_key").unique().notNull(),
  value: jsonb("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessonSources = pgTable("lesson_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").default("").notNull(),
  fileUrl: text("file_url"),
  sourceUrl: text("source_url"),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
