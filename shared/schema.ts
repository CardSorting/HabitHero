import { pgTable, text, serial, integer, boolean, timestamp, date, varchar, unique, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  streak: true,
  createdAt: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
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

// Create user insert schema
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email().nullable().optional(),
  fullName: z.string().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Create insert schemas for new tables
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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

// Types for new tables
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
