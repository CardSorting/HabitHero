import { eq, sql, and, desc } from 'drizzle-orm';
import { db, pool } from './db';
import { 
  habits, 
  habitCompletions, 
  dailyGoals, 
  dbtSleep, 
  dbtEmotions, 
  dbtUrges, 
  dbtSkills, 
  dbtEvents,
  users,
  Habit, 
  HabitCompletion, 
  InsertHabit, 
  InsertHabitCompletion,
  DailyGoal,
  InsertDailyGoal,
  DbtSleep,
  DbtEmotion,
  DbtUrge,
  DbtSkill,
  DbtEvent,
  User,
  InsertUser
} from '@shared/schema';
import { IStorage, HabitWithCompletions } from './storage';

export class DatabaseStorage implements IStorage {
  pool: any;

  constructor() {
    this.pool = pool;
  }

  // User authentication methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  private async getCompletionsForHabit(habitId: number): Promise<HabitCompletion[]> {
    return await db.select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, habitId))
      .orderBy(desc(habitCompletions.date));
  }

  private calculateStreak(completions: HabitCompletion[]): number {
    if (completions.length === 0) return 0;
    
    let streak = 0;
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today);
    
    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      
      // If the completion is not for the current date we're looking at, or it's not completed, break the streak
      if (completionDate.getTime() !== currentDate.getTime() || !completion.completed) {
        break;
      }
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  private async habitToHabitWithCompletions(habit: Habit): Promise<HabitWithCompletions> {
    const completions = await this.getCompletionsForHabit(habit.id);
    const completionRecords = completions.map(completion => ({
      date: new Date(completion.date).toISOString().split('T')[0],
      completed: completion.completed
    }));
    
    const streak = this.calculateStreak(completions);
    
    return {
      ...habit,
      streak,
      completionRecords
    };
  }

  async getHabits(userId?: number): Promise<HabitWithCompletions[]> {
    const habitsData = userId 
      ? await db.select().from(habits).where(eq(habits.userId, userId))
      : await db.select().from(habits);
    
    const habitsWithCompletions = await Promise.all(
      habitsData.map(habit => this.habitToHabitWithCompletions(habit))
    );
    
    return habitsWithCompletions;
  }

  async getHabit(id: number): Promise<HabitWithCompletions | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    if (!habit) return undefined;
    
    return this.habitToHabitWithCompletions(habit);
  }

  async createHabit(insertHabit: InsertHabit): Promise<HabitWithCompletions> {
    const [habit] = await db.insert(habits).values(insertHabit).returning();
    return this.habitToHabitWithCompletions(habit);
  }

  async updateHabit(id: number, habitUpdate: Partial<Habit>): Promise<HabitWithCompletions> {
    const [updatedHabit] = await db
      .update(habits)
      .set(habitUpdate)
      .where(eq(habits.id, id))
      .returning();
    
    return this.habitToHabitWithCompletions(updatedHabit);
  }

  async deleteHabit(id: number): Promise<boolean> {
    // First, delete all completions for this habit
    await db.delete(habitCompletions).where(eq(habitCompletions.habitId, id));
    
    // Then delete the habit
    const [deletedHabit] = await db
      .delete(habits)
      .where(eq(habits.id, id))
      .returning();
    
    return !!deletedHabit;
  }

  async toggleHabitCompletion(habitId: number, dateStr: string, completed: boolean): Promise<HabitWithCompletions> {
    const date = new Date(dateStr);
    
    // Check if a completion record already exists for this habit and date
    const [existingCompletion] = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          sql`DATE(${habitCompletions.date}) = DATE(${date})`
        )
      );
    
    if (existingCompletion) {
      // Update the existing completion
      await db
        .update(habitCompletions)
        .set({ completed })
        .where(eq(habitCompletions.id, existingCompletion.id));
    } else {
      // Create a new completion record
      await db
        .insert(habitCompletions)
        .values({
          habitId,
          date,
          completed
        });
    }
    
    // Update the habit's streak
    const habit = await this.getHabit(habitId);
    if (!habit) throw new Error(`Habit with ID ${habitId} not found`);
    
    const completions = await this.getCompletionsForHabit(habitId);
    const streak = this.calculateStreak(completions);
    
    await db
      .update(habits)
      .set({ streak })
      .where(eq(habits.id, habitId));
    
    return {
      ...habit,
      streak
    };
  }

  async clearAllHabits(): Promise<boolean> {
    await db.delete(habitCompletions);
    await db.delete(habits);
    return true;
  }

  async clearHabitCompletions(dateStr: string): Promise<boolean> {
    const date = new Date(dateStr);
    
    await db
      .delete(habitCompletions)
      .where(sql`DATE(${habitCompletions.date}) = DATE(${date})`);
    
    // Reset streaks for all habits
    const habitsData = await db.select().from(habits);
    
    for (const habit of habitsData) {
      const completions = await this.getCompletionsForHabit(habit.id);
      const streak = this.calculateStreak(completions);
      
      await db
        .update(habits)
        .set({ streak })
        .where(eq(habits.id, habit.id));
    }
    
    return true;
  }

  // Daily goals methods
  async getDailyGoal(dateStr: string, userId: number): Promise<DailyGoal | undefined> {
    const date = new Date(dateStr);
    
    const [goal] = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          sql`DATE(${dailyGoals.date}) = DATE(${date})`
        )
      );
    
    return goal;
  }

  async saveDailyGoal(dateStr: string, userId: number, goalData: Omit<InsertDailyGoal, "date" | "userId">): Promise<DailyGoal> {
    const date = new Date(dateStr);
    
    // Check if a goal already exists for this date
    const [existingGoal] = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          sql`DATE(${dailyGoals.date}) = DATE(${date})`
        )
      );
    
    if (existingGoal) {
      // Update the existing goal
      const [updatedGoal] = await db
        .update(dailyGoals)
        .set({
          ...goalData,
          updatedAt: new Date()
        })
        .where(eq(dailyGoals.id, existingGoal.id))
        .returning();
      
      return updatedGoal;
    } else {
      // Create a new goal
      const [newGoal] = await db
        .insert(dailyGoals)
        .values({
          userId,
          date,
          ...goalData
        })
        .returning();
      
      return newGoal;
    }
  }

  // DBT diary card methods - sleep
  async getDbtSleepData(dateStr: string, userId: number): Promise<DbtSleep | undefined> {
    const date = new Date(dateStr);
    
    const [sleepData] = await db
      .select()
      .from(dbtSleep)
      .where(
        and(
          eq(dbtSleep.userId, userId),
          sql`DATE(${dbtSleep.date}) = DATE(${date})`
        )
      );
    
    return sleepData;
  }

  async saveDbtSleepData(dateStr: string, userId: number, data: {
    hoursSlept?: string,
    troubleFalling?: string,
    troubleStaying?: string,
    troubleWaking?: string
  }): Promise<DbtSleep> {
    const date = new Date(dateStr);
    
    // Check if sleep data already exists for this date
    const [existingSleepData] = await db
      .select()
      .from(dbtSleep)
      .where(
        and(
          eq(dbtSleep.userId, userId),
          sql`DATE(${dbtSleep.date}) = DATE(${date})`
        )
      );
    
    if (existingSleepData) {
      // Update the existing sleep data
      const [updatedSleepData] = await db
        .update(dbtSleep)
        .set(data)
        .where(eq(dbtSleep.id, existingSleepData.id))
        .returning();
      
      return updatedSleepData;
    } else {
      // Create new sleep data
      const [newSleepData] = await db
        .insert(dbtSleep)
        .values({
          userId,
          date,
          ...data
        })
        .returning();
      
      return newSleepData;
    }
  }

  // DBT diary card methods - emotions
  async getDbtEmotionsForDate(dateStr: string, userId: number): Promise<DbtEmotion[]> {
    const date = new Date(dateStr);
    
    return await db
      .select()
      .from(dbtEmotions)
      .where(
        and(
          eq(dbtEmotions.userId, userId),
          sql`DATE(${dbtEmotions.date}) = DATE(${date})`
        )
      );
  }

  async saveDbtEmotion(dateStr: string, userId: number, emotion: string, intensity: string): Promise<DbtEmotion> {
    const date = new Date(dateStr);
    
    // Check if this emotion already exists for this date
    const [existingEmotion] = await db
      .select()
      .from(dbtEmotions)
      .where(
        and(
          eq(dbtEmotions.userId, userId),
          sql`DATE(${dbtEmotions.date}) = DATE(${date})`,
          eq(dbtEmotions.emotion, emotion)
        )
      );
    
    if (existingEmotion) {
      // Update the existing emotion
      const [updatedEmotion] = await db
        .update(dbtEmotions)
        .set({ intensity })
        .where(eq(dbtEmotions.id, existingEmotion.id))
        .returning();
      
      return updatedEmotion;
    } else {
      // Create a new emotion
      const [newEmotion] = await db
        .insert(dbtEmotions)
        .values({
          userId,
          date,
          emotion,
          intensity
        })
        .returning();
      
      return newEmotion;
    }
  }

  // DBT diary card methods - urges
  async getDbtUrgesForDate(dateStr: string, userId: number): Promise<DbtUrge[]> {
    const date = new Date(dateStr);
    
    return await db
      .select()
      .from(dbtUrges)
      .where(
        and(
          eq(dbtUrges.userId, userId),
          sql`DATE(${dbtUrges.date}) = DATE(${date})`
        )
      );
  }

  async saveDbtUrge(dateStr: string, userId: number, urgeType: string, level: string, action: string): Promise<DbtUrge> {
    const date = new Date(dateStr);
    
    // Check if this urge already exists for this date
    const [existingUrge] = await db
      .select()
      .from(dbtUrges)
      .where(
        and(
          eq(dbtUrges.userId, userId),
          sql`DATE(${dbtUrges.date}) = DATE(${date})`,
          eq(dbtUrges.urgeType, urgeType)
        )
      );
    
    if (existingUrge) {
      // Update the existing urge
      const [updatedUrge] = await db
        .update(dbtUrges)
        .set({ level, action })
        .where(eq(dbtUrges.id, existingUrge.id))
        .returning();
      
      return updatedUrge;
    } else {
      // Create a new urge
      const [newUrge] = await db
        .insert(dbtUrges)
        .values({
          userId,
          date,
          urgeType,
          level,
          action
        })
        .returning();
      
      return newUrge;
    }
  }

  // DBT diary card methods - skills
  async getDbtSkillsForDate(dateStr: string, userId: number): Promise<DbtSkill[]> {
    const date = new Date(dateStr);
    
    return await db
      .select()
      .from(dbtSkills)
      .where(
        and(
          eq(dbtSkills.userId, userId),
          sql`DATE(${dbtSkills.date}) = DATE(${date})`
        )
      );
  }

  async toggleDbtSkill(dateStr: string, userId: number, category: string, skill: string, used: boolean): Promise<DbtSkill> {
    const date = new Date(dateStr);
    
    // Check if this skill already exists for this date
    const [existingSkill] = await db
      .select()
      .from(dbtSkills)
      .where(
        and(
          eq(dbtSkills.userId, userId),
          sql`DATE(${dbtSkills.date}) = DATE(${date})`,
          eq(dbtSkills.category, category),
          eq(dbtSkills.skill, skill)
        )
      );
    
    if (existingSkill) {
      // Update the existing skill
      const [updatedSkill] = await db
        .update(dbtSkills)
        .set({ used })
        .where(eq(dbtSkills.id, existingSkill.id))
        .returning();
      
      return updatedSkill;
    } else {
      // Create a new skill
      const [newSkill] = await db
        .insert(dbtSkills)
        .values({
          userId,
          date,
          category,
          skill,
          used
        })
        .returning();
      
      return newSkill;
    }
  }

  // DBT diary card methods - events
  async getDbtEventForDate(dateStr: string, userId: number): Promise<DbtEvent | undefined> {
    const date = new Date(dateStr);
    
    const [event] = await db
      .select()
      .from(dbtEvents)
      .where(
        and(
          eq(dbtEvents.userId, userId),
          sql`DATE(${dbtEvents.date}) = DATE(${date})`
        )
      );
    
    return event;
  }

  async saveDbtEvent(dateStr: string, userId: number, eventDescription: string): Promise<DbtEvent> {
    const date = new Date(dateStr);
    
    // Check if an event already exists for this date
    const [existingEvent] = await db
      .select()
      .from(dbtEvents)
      .where(
        and(
          eq(dbtEvents.userId, userId),
          sql`DATE(${dbtEvents.date}) = DATE(${date})`
        )
      );
    
    if (existingEvent) {
      // Update the existing event
      const [updatedEvent] = await db
        .update(dbtEvents)
        .set({ eventDescription })
        .where(eq(dbtEvents.id, existingEvent.id))
        .returning();
      
      return updatedEvent;
    } else {
      // Create a new event
      const [newEvent] = await db
        .insert(dbtEvents)
        .values({
          userId,
          date,
          eventDescription
        })
        .returning();
      
      return newEvent;
    }
  }
}