import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
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
  date: date("date").notNull(),
  emotion: varchar("emotion", { length: 50 }).notNull(),
  intensity: varchar("intensity", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - urges
export const dbtUrges = pgTable("dbt_urges", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  urgeType: varchar("urge_type", { length: 50 }).notNull(),
  level: varchar("level", { length: 10 }),
  action: varchar("action", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - skills used
export const dbtSkills = pgTable("dbt_skills", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  skill: varchar("skill", { length: 100 }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// New table for DBT diary card - events
export const dbtEvents = pgTable("dbt_events", {
  id: serial("id").primaryKey(), 
  date: date("date").notNull(),
  eventDescription: text("event_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define relationships
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCompletions.habitId],
    references: [habits.id],
  }),
}));

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
