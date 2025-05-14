import { pgTable, text, serial, integer, boolean, timestamp, date, varchar, unique, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums for wellness challenge system
export const challengeFrequencyEnum = pgEnum('challenge_frequency', ['daily', 'weekly', 'monthly']);
export const challengeStatusEnum = pgEnum('challenge_status', ['active', 'completed', 'abandoned']);
export const challengeTypeEnum = pgEnum('challenge_type', ['emotions', 'meditation', 'journaling', 'activity', 'custom']);
export const emotionIntensityEnum = pgEnum('emotion_intensity', ['very_low', 'low', 'medium', 'high', 'very_high']);
export const crisisIntensityEnum = pgEnum('crisis_intensity', ['mild', 'moderate', 'severe', 'extreme']);
export const crisisTypeEnum = pgEnum('crisis_type', ['panic_attack', 'emotional_crisis', 'suicidal_thoughts', 'self_harm_urge', 'substance_urge', 'other']);

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 100 }),
  fullName: varchar("full_name", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    unqUsername: unique().on(table.username),
  };
});

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull().default("daily"),
  reminder: text("reminder"),
  streak: integer("streak").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for daily goals tracking
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  todayGoal: text("today_goal"),
  tomorrowGoal: text("tomorrow_goal"),
  todayHighlight: text("today_highlight"),
  gratitude: text("gratitude"),
  dbtSkillUsed: varchar("dbt_skill_used", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// New table for DBT diary card - sleep data
export const dbtSleep = pgTable("dbt_sleep", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  hoursSlept: varchar("hours_slept", { length: 10 }),
  troubleFalling: varchar("trouble_falling", { length: 10 }),
  troubleStaying: varchar("trouble_staying", { length: 10 }),
  troubleWaking: varchar("trouble_waking", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - emotions
export const dbtEmotions = pgTable("dbt_emotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  emotion: varchar("emotion", { length: 50 }).notNull(),
  intensity: varchar("intensity", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - urges
export const dbtUrges = pgTable("dbt_urges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  urgeType: varchar("urge_type", { length: 50 }).notNull(),
  level: varchar("level", { length: 10 }),
  action: varchar("action", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - skills used
export const dbtSkills = pgTable("dbt_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  skill: varchar("skill", { length: 100 }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - events
export const dbtEvents = pgTable("dbt_events", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  eventDescription: text("event_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for enhanced emotions tracking
export const emotionTrackingEntries = pgTable("emotion_tracking_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 8 }),  // Store time as HH:MM:SS
  emotionId: varchar("emotion_id", { length: 50 }).notNull(),
  emotionName: varchar("emotion_name", { length: 100 }).notNull(),
  categoryId: varchar("category_id", { length: 50 }).notNull(),
  intensity: integer("intensity").notNull(),
  notes: text("notes"),
  triggers: jsonb("triggers"),
  copingMechanisms: jsonb("coping_mechanisms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Emotion Categories - For organizing emotions
export const emotionCategories = pgTable("emotion_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Predefined Emotions - System emotions
export const emotions = pgTable("emotions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Defined Emotions - Custom emotions created by user
export const userEmotions = pgTable("user_emotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wellness Challenges - Main challenge definition
export const wellnessChallenges = pgTable("wellness_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  type: challengeTypeEnum("type").notNull(),
  frequency: challengeFrequencyEnum("frequency").notNull().default('daily'),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  targetValue: integer("target_value").notNull().default(1),
  status: challengeStatusEnum("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wellness Challenge Goals - Specific goals within a challenge
export const wellnessChallengeGoals = pgTable("wellness_challenge_goals", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wellness Challenge Progress - Daily/weekly/monthly progress entries
export const wellnessChallengeProgress = pgTable("wellness_challenge_progress", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  date: date("date").notNull(),
  value: integer("value").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crisis Events - Track crisis/panic attacks and related details
export const crisisEvents = pgTable("crisis_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: crisisTypeEnum("type").notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 8 }),  // Store time as HH:MM:SS
  intensity: crisisIntensityEnum("intensity").notNull(),
  duration: integer("duration"),  // Duration in minutes
  notes: text("notes"),
  symptoms: jsonb("symptoms"),  // Array of physical and emotional symptoms
  triggers: jsonb("triggers"),  // Array of potential triggers
  copingStrategiesUsed: jsonb("coping_strategies_used"),  // Array of coping strategies used
  copingStrategyEffectiveness: integer("coping_strategy_effectiveness"),  // Rating 1-10
  helpSought: boolean("help_sought").notNull().default(false),  // Whether professional help was sought
  medication: boolean("medication").notNull().default(false),  // Whether medication was used
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  dailyGoals: many(dailyGoals),
  dbtSleep: many(dbtSleep),
  dbtEmotions: many(dbtEmotions),
  dbtUrges: many(dbtUrges),
  dbtSkills: many(dbtSkills),
  dbtEvents: many(dbtEvents),
  emotionTrackingEntries: many(emotionTrackingEntries),
  wellnessChallenges: many(wellnessChallenges),
  userEmotions: many(userEmotions),
  crisisEvents: many(crisisEvents),
}));

export const habitsRelations = relations(habits, ({ many, one }) => ({
  completions: many(habitCompletions),
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCompletions.habitId],
    references: [habits.id],
  }),
}));

export const dailyGoalsRelations = relations(dailyGoals, ({ one }) => ({
  user: one(users, {
    fields: [dailyGoals.userId],
    references: [users.id],
  }),
}));

export const dbtSleepRelations = relations(dbtSleep, ({ one }) => ({
  user: one(users, {
    fields: [dbtSleep.userId],
    references: [users.id],
  }),
}));

export const dbtEmotionsRelations = relations(dbtEmotions, ({ one }) => ({
  user: one(users, {
    fields: [dbtEmotions.userId],
    references: [users.id],
  }),
}));

export const dbtUrgesRelations = relations(dbtUrges, ({ one }) => ({
  user: one(users, {
    fields: [dbtUrges.userId],
    references: [users.id],
  }),
}));

export const dbtSkillsRelations = relations(dbtSkills, ({ one }) => ({
  user: one(users, {
    fields: [dbtSkills.userId],
    references: [users.id],
  }),
}));

export const dbtEventsRelations = relations(dbtEvents, ({ one }) => ({
  user: one(users, {
    fields: [dbtEvents.userId],
    references: [users.id],
  }),
}));

export const emotionTrackingEntriesRelations = relations(emotionTrackingEntries, ({ one }) => ({
  user: one(users, {
    fields: [emotionTrackingEntries.userId],
    references: [users.id],
  }),
}));

export const emotionCategoriesRelations = relations(emotionCategories, ({ many }) => ({
  emotions: many(emotions),
  userEmotions: many(userEmotions),
}));

export const emotionsRelations = relations(emotions, ({ one }) => ({
  category: one(emotionCategories, {
    fields: [emotions.categoryId],
    references: [emotionCategories.id],
  }),
}));

export const userEmotionsRelations = relations(userEmotions, ({ one }) => ({
  user: one(users, {
    fields: [userEmotions.userId],
    references: [users.id],
  }),
  category: one(emotionCategories, {
    fields: [userEmotions.categoryId],
    references: [emotionCategories.id],
  }),
}));

export const wellnessChallengesRelations = relations(wellnessChallenges, ({ one, many }) => ({
  user: one(users, {
    fields: [wellnessChallenges.userId],
    references: [users.id],
  }),
  goals: many(wellnessChallengeGoals),
  progress: many(wellnessChallengeProgress),
}));

export const wellnessChallengeGoalsRelations = relations(wellnessChallengeGoals, ({ one }) => ({
  challenge: one(wellnessChallenges, {
    fields: [wellnessChallengeGoals.challengeId],
    references: [wellnessChallenges.id],
  }),
}));

export const wellnessChallengeProgressRelations = relations(wellnessChallengeProgress, ({ one }) => ({
  challenge: one(wellnessChallenges, {
    fields: [wellnessChallengeProgress.challengeId],
    references: [wellnessChallenges.id],
  }),
}));

export const crisisEventsRelations = relations(crisisEvents, ({ one }) => ({
  user: one(users, {
    fields: [crisisEvents.userId],
    references: [users.id],
  }),
}));

// Create insert schemas
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  streak: true,
  createdAt: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email().nullable().optional(),
  fullName: z.string().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertDailyGoalSchema = createInsertSchema(dailyGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDbtSleepSchema = createInsertSchema(dbtSleep).omit({
  id: true,
  createdAt: true,
});

export const insertDbtEmotionSchema = createInsertSchema(dbtEmotions).omit({
  id: true,
  createdAt: true,
});

export const insertDbtUrgeSchema = createInsertSchema(dbtUrges).omit({
  id: true,
  createdAt: true,
});

export const insertDbtSkillSchema = createInsertSchema(dbtSkills).omit({
  id: true, 
  createdAt: true,
});

export const insertDbtEventSchema = createInsertSchema(dbtEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionTrackingEntrySchema = createInsertSchema(emotionTrackingEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Wellness challenge insert schemas
export const insertWellnessChallengeSchema = createInsertSchema(wellnessChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWellnessChallengeGoalSchema = createInsertSchema(wellnessChallengeGoals).omit({
  id: true,
  createdAt: true,
});

export const insertWellnessChallengeProgressSchema = createInsertSchema(wellnessChallengeProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmotionCategorySchema = createInsertSchema(emotionCategories).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionSchema = createInsertSchema(emotions).omit({
  id: true,
  createdAt: true,
});

export const insertUserEmotionSchema = createInsertSchema(userEmotions).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;

export type DbtSleep = typeof dbtSleep.$inferSelect;
export type InsertDbtSleep = z.infer<typeof insertDbtSleepSchema>;

export type DbtEmotion = typeof dbtEmotions.$inferSelect;
export type InsertDbtEmotion = z.infer<typeof insertDbtEmotionSchema>;

export type DbtUrge = typeof dbtUrges.$inferSelect;
export type InsertDbtUrge = z.infer<typeof insertDbtUrgeSchema>;

export type DbtSkill = typeof dbtSkills.$inferSelect;
export type InsertDbtSkill = z.infer<typeof insertDbtSkillSchema>;

export type DbtEvent = typeof dbtEvents.$inferSelect;
export type InsertDbtEvent = z.infer<typeof insertDbtEventSchema>;

export type EmotionTrackingEntry = typeof emotionTrackingEntries.$inferSelect;
export type InsertEmotionTrackingEntry = z.infer<typeof insertEmotionTrackingEntrySchema>;

// Additional types for wellness challenge system
export type WellnessChallenge = typeof wellnessChallenges.$inferSelect;
export type InsertWellnessChallenge = z.infer<typeof insertWellnessChallengeSchema>;

export type WellnessChallengeGoal = typeof wellnessChallengeGoals.$inferSelect;
export type InsertWellnessChallengeGoal = z.infer<typeof insertWellnessChallengeGoalSchema>;

export type WellnessChallengeProgress = typeof wellnessChallengeProgress.$inferSelect;
export type InsertWellnessChallengeProgress = z.infer<typeof insertWellnessChallengeProgressSchema>;

export type EmotionCategory = typeof emotionCategories.$inferSelect;
export type InsertEmotionCategory = z.infer<typeof insertEmotionCategorySchema>;

export type Emotion = typeof emotions.$inferSelect;
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;

export type UserEmotion = typeof userEmotions.$inferSelect;
export type InsertUserEmotion = z.infer<typeof insertUserEmotionSchema>;