import { 
  habits as habitsTable, 
  habitCompletions as habitCompletionsTable, 
  dailyGoals as dailyGoalsTable,
  dbtSleep as dbtSleepTable,
  dbtEmotions as dbtEmotionsTable,
  dbtUrges as dbtUrgesTable,
  dbtSkills as dbtSkillsTable,
  dbtEvents as dbtEventsTable,
  type Habit, 
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type DailyGoal,
  type InsertDailyGoal,
  type DbtSleep,
  type DbtEmotion,
  type DbtUrge,
  type DbtSkill,
  type DbtEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, between } from "drizzle-orm";
import { startOfDay, subDays, format, addDays, parseISO, isAfter, isBefore } from "date-fns";
import { IStorage, HabitWithCompletions } from "./storage";

export class DatabaseStorage implements IStorage {
  // Helper function to get completions for a habit
  private async getCompletionsForHabit(habitId: number): Promise<HabitCompletion[]> {
    return db.select().from(habitCompletionsTable).where(eq(habitCompletionsTable.habitId, habitId));
  }

  // Helper function to calculate streak
  private calculateStreak(completions: HabitCompletion[]): number {
    if (!completions || completions.length === 0) return 0;
    
    const sortedCompletions = [...completions]
      .filter(completion => completion.completed)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    
    if (sortedCompletions.length === 0) return 0;
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mostRecentDate = new Date(sortedCompletions[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // If the most recent completion is not today or yesterday, streak is broken
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0;
    
    // Count consecutive days
    for (let i = 0; i < sortedCompletions.length - 1; i++) {
      const currentDate = new Date(sortedCompletions[i].date);
      const nextDate = new Date(sortedCompletions[i + 1].date);
      
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Helper function to convert habit to HabitWithCompletions
  private async habitToHabitWithCompletions(habit: Habit): Promise<HabitWithCompletions> {
    const completions = await this.getCompletionsForHabit(habit.id);
    return {
      ...habit,
      completionRecords: completions.map(completion => ({
        date: format(new Date(completion.date), "yyyy-MM-dd"),
        completed: completion.completed
      }))
    };
  }

  async getHabits(): Promise<HabitWithCompletions[]> {
    const habits = await db.select().from(habitsTable);
    
    // Get completions and convert to HabitWithCompletions
    const habitsWithCompletions: HabitWithCompletions[] = await Promise.all(
      habits.map(habit => this.habitToHabitWithCompletions(habit))
    );
    
    return habitsWithCompletions;
  }

  async getHabit(id: number): Promise<HabitWithCompletions | undefined> {
    const [habit] = await db.select().from(habitsTable).where(eq(habitsTable.id, id));
    if (!habit) return undefined;
    
    return this.habitToHabitWithCompletions(habit);
  }

  async createHabit(insertHabit: InsertHabit): Promise<HabitWithCompletions> {
    const [habit] = await db.insert(habitsTable).values({
      name: insertHabit.name,
      description: insertHabit.description || "",
      frequency: insertHabit.frequency || "daily",
      reminder: insertHabit.reminder,
      streak: 0
    }).returning();
    
    return this.habitToHabitWithCompletions(habit);
  }

  async updateHabit(id: number, habitUpdate: Partial<Habit>): Promise<HabitWithCompletions> {
    const [updatedHabit] = await db.update(habitsTable)
      .set(habitUpdate)
      .where(eq(habitsTable.id, id))
      .returning();
    
    if (!updatedHabit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    
    return this.habitToHabitWithCompletions(updatedHabit);
  }

  async deleteHabit(id: number): Promise<boolean> {
    // Delete related completions first
    await db.delete(habitCompletionsTable).where(eq(habitCompletionsTable.habitId, id));
    
    // Delete the habit
    const result = await db.delete(habitsTable).where(eq(habitsTable.id, id)).returning();
    return result.length > 0;
  }

  async toggleHabitCompletion(habitId: number, dateStr: string, completed: boolean): Promise<HabitWithCompletions> {
    // Check if habit exists
    const [habit] = await db.select().from(habitsTable).where(eq(habitsTable.id, habitId));
    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found`);
    }
    
    const date = new Date(dateStr);
    
    // Check if there's already a record for this date
    const existingCompletions = await db.select()
      .from(habitCompletionsTable)
      .where(and(
        eq(habitCompletionsTable.habitId, habitId),
        sql`DATE(${habitCompletionsTable.date}) = DATE(${date})`
      ));
    
    if (existingCompletions.length > 0) {
      // Update existing record
      await db.update(habitCompletionsTable)
        .set({ completed })
        .where(eq(habitCompletionsTable.id, existingCompletions[0].id));
    } else {
      // Create new record - parse date as Date object since the schema expects Date
      await db.insert(habitCompletionsTable)
        .values({
          habitId,
          date: new Date(format(date, "yyyy-MM-dd")),
          completed
        });
    }
    
    // Get all completions to calculate streak
    const completions = await this.getCompletionsForHabit(habitId);
    const streak = this.calculateStreak(completions);
    
    // Update streak count
    const [updatedHabit] = await db.update(habitsTable)
      .set({ streak })
      .where(eq(habitsTable.id, habitId))
      .returning();
    
    return this.habitToHabitWithCompletions(updatedHabit);
  }

  async clearAllHabits(): Promise<boolean> {
    // Delete all completions first due to foreign key constraints
    await db.delete(habitCompletionsTable);
    
    // Delete all habits
    await db.delete(habitsTable);
    
    return true;
  }

  async clearHabitCompletions(dateStr: string): Promise<boolean> {
    const date = new Date(dateStr);
    
    // Delete completions for the specified date
    await db.delete(habitCompletionsTable)
      .where(sql`DATE(${habitCompletionsTable.date}) = DATE(${date})`);
    
    return true;
  }

  // Daily Goals methods
  async getDailyGoal(dateStr: string): Promise<DailyGoal | undefined> {
    const date = new Date(dateStr);
    
    const [goal] = await db.select().from(dailyGoalsTable)
      .where(sql`DATE(${dailyGoalsTable.date}) = DATE(${date})`);
    
    return goal;
  }

  async saveDailyGoal(dateStr: string, goalData: Omit<InsertDailyGoal, "date">): Promise<DailyGoal> {
    const date = new Date(dateStr);
    
    // Check if goal for this date already exists
    const existingGoal = await this.getDailyGoal(dateStr);
    
    if (existingGoal) {
      // Update existing goal
      const [updatedGoal] = await db.update(dailyGoalsTable)
        .set({
          ...goalData,
          updatedAt: new Date()
        })
        .where(eq(dailyGoalsTable.id, existingGoal.id))
        .returning();
      
      return updatedGoal;
    } else {
      // Create new goal
      const [newGoal] = await db.insert(dailyGoalsTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          ...goalData
        })
        .returning();
      
      return newGoal;
    }
  }

  // DBT Diary Card methods
  async getDbtSleepData(dateStr: string): Promise<DbtSleep | undefined> {
    const date = new Date(dateStr);
    
    const [sleepData] = await db.select().from(dbtSleepTable)
      .where(sql`DATE(${dbtSleepTable.date}) = DATE(${date})`);
    
    return sleepData;
  }

  async saveDbtSleepData(dateStr: string, data: {
    hoursSlept?: string;
    troubleFalling?: string;
    troubleStaying?: string;
    troubleWaking?: string;
  }): Promise<DbtSleep> {
    const date = new Date(dateStr);
    
    // Check if data for this date already exists
    const existingData = await this.getDbtSleepData(dateStr);
    
    if (existingData) {
      // Update existing data
      const [updatedData] = await db.update(dbtSleepTable)
        .set(data)
        .where(eq(dbtSleepTable.id, existingData.id))
        .returning();
      
      return updatedData;
    } else {
      // Create new data
      const [newData] = await db.insert(dbtSleepTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          ...data
        })
        .returning();
      
      return newData;
    }
  }

  async getDbtEmotionsForDate(dateStr: string): Promise<DbtEmotion[]> {
    const date = new Date(dateStr);
    
    return db.select().from(dbtEmotionsTable)
      .where(sql`DATE(${dbtEmotionsTable.date}) = DATE(${date})`);
  }

  async saveDbtEmotion(dateStr: string, emotion: string, intensity: string): Promise<DbtEmotion> {
    const date = new Date(dateStr);
    
    // Check if this emotion already exists for this date
    const existingEmotions = await db.select().from(dbtEmotionsTable)
      .where(and(
        sql`DATE(${dbtEmotionsTable.date}) = DATE(${date})`,
        eq(dbtEmotionsTable.emotion, emotion)
      ));
    
    if (existingEmotions.length > 0) {
      // Update existing emotion
      const [updatedEmotion] = await db.update(dbtEmotionsTable)
        .set({ intensity })
        .where(eq(dbtEmotionsTable.id, existingEmotions[0].id))
        .returning();
      
      return updatedEmotion;
    } else {
      // Create new emotion
      const [newEmotion] = await db.insert(dbtEmotionsTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          emotion,
          intensity
        })
        .returning();
      
      return newEmotion;
    }
  }

  async getDbtUrgesForDate(dateStr: string): Promise<DbtUrge[]> {
    const date = new Date(dateStr);
    
    return db.select().from(dbtUrgesTable)
      .where(sql`DATE(${dbtUrgesTable.date}) = DATE(${date})`);
  }

  async saveDbtUrge(dateStr: string, urgeType: string, level: string, action: string): Promise<DbtUrge> {
    const date = new Date(dateStr);
    
    // Check if this urge already exists for this date
    const existingUrges = await db.select().from(dbtUrgesTable)
      .where(and(
        sql`DATE(${dbtUrgesTable.date}) = DATE(${date})`,
        eq(dbtUrgesTable.urgeType, urgeType)
      ));
    
    if (existingUrges.length > 0) {
      // Update existing urge
      const [updatedUrge] = await db.update(dbtUrgesTable)
        .set({ level, action })
        .where(eq(dbtUrgesTable.id, existingUrges[0].id))
        .returning();
      
      return updatedUrge;
    } else {
      // Create new urge
      const [newUrge] = await db.insert(dbtUrgesTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          urgeType,
          level,
          action
        })
        .returning();
      
      return newUrge;
    }
  }

  async getDbtSkillsForDate(dateStr: string): Promise<DbtSkill[]> {
    const date = new Date(dateStr);
    
    return db.select().from(dbtSkillsTable)
      .where(sql`DATE(${dbtSkillsTable.date}) = DATE(${date})`);
  }

  async toggleDbtSkill(dateStr: string, category: string, skill: string, used: boolean): Promise<DbtSkill> {
    const date = new Date(dateStr);
    
    // Check if this skill already exists for this date
    const existingSkills = await db.select().from(dbtSkillsTable)
      .where(and(
        sql`DATE(${dbtSkillsTable.date}) = DATE(${date})`,
        eq(dbtSkillsTable.category, category),
        eq(dbtSkillsTable.skill, skill)
      ));
    
    if (existingSkills.length > 0) {
      // Update existing skill
      const [updatedSkill] = await db.update(dbtSkillsTable)
        .set({ used })
        .where(eq(dbtSkillsTable.id, existingSkills[0].id))
        .returning();
      
      return updatedSkill;
    } else {
      // Create new skill
      const [newSkill] = await db.insert(dbtSkillsTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          category,
          skill,
          used
        })
        .returning();
      
      return newSkill;
    }
  }

  async getDbtEventForDate(dateStr: string): Promise<DbtEvent | undefined> {
    const date = new Date(dateStr);
    
    const [event] = await db.select().from(dbtEventsTable)
      .where(sql`DATE(${dbtEventsTable.date}) = DATE(${date})`);
    
    return event;
  }

  async saveDbtEvent(dateStr: string, eventDescription: string): Promise<DbtEvent> {
    const date = new Date(dateStr);
    
    // Check if event for this date already exists
    const existingEvent = await this.getDbtEventForDate(dateStr);
    
    if (existingEvent) {
      // Update existing event
      const [updatedEvent] = await db.update(dbtEventsTable)
        .set({ eventDescription })
        .where(eq(dbtEventsTable.id, existingEvent.id))
        .returning();
      
      return updatedEvent;
    } else {
      // Create new event
      const [newEvent] = await db.insert(dbtEventsTable)
        .values({
          date: new Date(format(date, "yyyy-MM-dd")),
          eventDescription
        })
        .returning();
      
      return newEvent;
    }
  }
}