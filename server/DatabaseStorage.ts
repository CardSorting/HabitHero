import { eq, sql, and, desc, between, count, avg, gte, lte } from 'drizzle-orm';
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
  wellnessChallenges,
  wellnessChallengeGoals,
  wellnessChallengeProgress,
  crisisEvents,
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
  InsertUser,
  WellnessChallenge,
  WellnessChallengeGoal,
  WellnessChallengeProgress,
  InsertWellnessChallenge,
  InsertWellnessChallengeGoal,
  InsertWellnessChallengeProgress,
  CrisisEvent,
  InsertCrisisEvent
} from '@shared/schema';
import { IStorage, HabitWithCompletions, WellnessChallengeWithDetails, ChallengeSummary, ChallengeStreak, CrisisAnalytics, CrisisTimePeriodSummary } from './storage';

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

  // Wellness Challenge methods
  
  async getWellnessChallenges(userId?: number): Promise<WellnessChallenge[]> {
    let query = db.select().from(wellnessChallenges);
    
    if (userId) {
      query = query.where(eq(wellnessChallenges.userId, userId));
    }
    
    return await query;
  }

  async getWellnessChallengesByStatus(status: string): Promise<WellnessChallenge[]> {
    return await db
      .select()
      .from(wellnessChallenges)
      .where(eq(wellnessChallenges.status, status));
  }

  async getWellnessChallengesByType(type: string): Promise<WellnessChallenge[]> {
    return await db
      .select()
      .from(wellnessChallenges)
      .where(eq(wellnessChallenges.type, type));
  }

  async getWellnessChallenge(id: number): Promise<WellnessChallengeWithDetails | undefined> {
    const [challenge] = await db
      .select()
      .from(wellnessChallenges)
      .where(eq(wellnessChallenges.id, id));

    if (!challenge) {
      return undefined;
    }

    const goals = await this.getWellnessChallengeGoals(id);
    const progressEntries = await this.getWellnessChallengeProgress(id);

    return {
      ...challenge,
      goals,
      progressEntries
    };
  }

  async createWellnessChallenge(challenge: InsertWellnessChallenge): Promise<WellnessChallenge> {
    const [newChallenge] = await db
      .insert(wellnessChallenges)
      .values(challenge)
      .returning();
    
    return newChallenge;
  }

  async updateWellnessChallenge(id: number, challenge: Partial<WellnessChallenge>): Promise<WellnessChallenge> {
    const [updatedChallenge] = await db
      .update(wellnessChallenges)
      .set(challenge)
      .where(eq(wellnessChallenges.id, id))
      .returning();
    
    return updatedChallenge;
  }

  async deleteWellnessChallenge(id: number): Promise<boolean> {
    // First delete related goals and progress entries
    await db
      .delete(wellnessChallengeGoals)
      .where(eq(wellnessChallengeGoals.challengeId, id));
    
    await db
      .delete(wellnessChallengeProgress)
      .where(eq(wellnessChallengeProgress.challengeId, id));
    
    // Then delete the challenge
    const result = await db
      .delete(wellnessChallenges)
      .where(eq(wellnessChallenges.id, id))
      .returning();
    
    return result.length > 0;
  }

  async updateWellnessChallengeStatus(id: number, status: string): Promise<WellnessChallenge> {
    const [updatedChallenge] = await db
      .update(wellnessChallenges)
      .set({ status })
      .where(eq(wellnessChallenges.id, id))
      .returning();
    
    return updatedChallenge;
  }

  // Challenge goals methods
  
  async getWellnessChallengeGoals(challengeId: number): Promise<WellnessChallengeGoal[]> {
    return await db
      .select()
      .from(wellnessChallengeGoals)
      .where(eq(wellnessChallengeGoals.challengeId, challengeId));
  }

  async createWellnessChallengeGoal(goal: InsertWellnessChallengeGoal): Promise<WellnessChallengeGoal> {
    const [newGoal] = await db
      .insert(wellnessChallengeGoals)
      .values(goal)
      .returning();
    
    return newGoal;
  }

  // Challenge progress methods
  
  async getWellnessChallengeProgress(challengeId: number): Promise<WellnessChallengeProgress[]> {
    return await db
      .select()
      .from(wellnessChallengeProgress)
      .where(eq(wellnessChallengeProgress.challengeId, challengeId))
      .orderBy(desc(wellnessChallengeProgress.date));
  }

  async getWellnessChallengeProgressForDate(challengeId: number, dateStr: string): Promise<WellnessChallengeProgress[]> {
    const date = new Date(dateStr);
    
    return await db
      .select()
      .from(wellnessChallengeProgress)
      .where(and(
        eq(wellnessChallengeProgress.challengeId, challengeId),
        eq(wellnessChallengeProgress.date, date)
      ));
  }

  async recordWellnessChallengeProgress(progress: InsertWellnessChallengeProgress): Promise<WellnessChallengeProgress> {
    // Check if there's already a progress entry for this date
    const existingProgress = await this.getWellnessChallengeProgressForDate(
      progress.challengeId, 
      progress.date.toString()
    );
    
    if (existingProgress.length > 0) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(wellnessChallengeProgress)
        .set({ 
          value: progress.value,
          notes: progress.notes
        })
        .where(eq(wellnessChallengeProgress.id, existingProgress[0].id))
        .returning();
      
      return updatedProgress;
    } else {
      // Create new progress entry
      const [newProgress] = await db
        .insert(wellnessChallengeProgress)
        .values(progress)
        .returning();
      
      return newProgress;
    }
  }

  // Challenge analytics methods
  
  async getChallengeSummary(userId: number): Promise<ChallengeSummary> {
    const challenges = await this.getWellnessChallenges(userId);
    
    // Calculate summary statistics
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const abandonedChallenges = challenges.filter(c => c.status === 'abandoned').length;
    
    // Calculate average completion rate (for completed challenges)
    let averageCompletionRate = 0;
    if (completedChallenges > 0) {
      // This would normally involve more complex calculation looking at progress entries
      // For now, use a simpler calculation
      averageCompletionRate = 100;
    }
    
    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      abandonedChallenges,
      averageCompletionRate
    };
  }

  async getChallengeStreak(challengeId: number): Promise<ChallengeStreak> {
    const progress = await this.getWellnessChallengeProgress(challengeId);
    
    // Sort progress by date (newest first)
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    
    // For simplicity, consider a streak as consecutive days with any progress value > 0
    // In a real application, this would be more complex, considering the challenge's frequency
    if (sortedProgress.length > 0) {
      // Start with 1 if the most recent entry has a value > 0
      currentStreak = sortedProgress[0].value > 0 ? 1 : 0;
      let streakCount = currentStreak;
      
      for (let i = 0; i < sortedProgress.length - 1; i++) {
        const currentDate = new Date(sortedProgress[i].date);
        const nextDate = new Date(sortedProgress[i + 1].date);
        
        // Check if dates are consecutive by checking if they're 1 day apart
        const daysDifference = Math.floor(
          (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDifference === 1 && sortedProgress[i + 1].value > 0) {
          streakCount++;
        } else {
          // Break in streak
          if (streakCount > longestStreak) {
            longestStreak = streakCount;
          }
          
          // Reset streak if we're still counting current streak
          if (i < currentStreak) {
            currentStreak = 0;
          }
          
          streakCount = sortedProgress[i + 1].value > 0 ? 1 : 0;
        }
      }
      
      // Update longest streak if needed
      if (streakCount > longestStreak) {
        longestStreak = streakCount;
      }
    }
    
    return {
      challengeId,
      currentStreak,
      longestStreak
    };
  }
  
  // Crisis Events methods
  async getCrisisEvents(userId: number): Promise<CrisisEvent[]> {
    return await db.select()
      .from(crisisEvents)
      .where(eq(crisisEvents.userId, userId))
      .orderBy(desc(crisisEvents.date), desc(crisisEvents.time));
  }

  async getCrisisEventsByDateRange(userId: number, startDate: string, endDate: string): Promise<CrisisEvent[]> {
    return await db.select()
      .from(crisisEvents)
      .where(
        and(
          eq(crisisEvents.userId, userId),
          gte(crisisEvents.date, startDate),
          lte(crisisEvents.date, endDate)
        )
      )
      .orderBy(desc(crisisEvents.date), desc(crisisEvents.time));
  }

  async getCrisisEventById(id: number): Promise<CrisisEvent | undefined> {
    const [event] = await db.select()
      .from(crisisEvents)
      .where(eq(crisisEvents.id, id));
    return event;
  }

  async createCrisisEvent(crisisEvent: InsertCrisisEvent): Promise<CrisisEvent> {
    const [event] = await db.insert(crisisEvents).values(crisisEvent).returning();
    return event;
  }

  async updateCrisisEvent(id: number, crisisEvent: Partial<CrisisEvent>): Promise<CrisisEvent> {
    const [updatedEvent] = await db.update(crisisEvents)
      .set(crisisEvent)
      .where(eq(crisisEvents.id, id))
      .returning();
    
    if (!updatedEvent) {
      throw new Error(`Crisis event with id ${id} not found`);
    }
    
    return updatedEvent;
  }

  async deleteCrisisEvent(id: number): Promise<boolean> {
    const [deletedEvent] = await db.delete(crisisEvents)
      .where(eq(crisisEvents.id, id))
      .returning();
    
    return !!deletedEvent;
  }

  // Crisis analytics methods
  async getCrisisAnalytics(userId: number, startDate?: string, endDate?: string): Promise<CrisisAnalytics> {
    let query = db.select({
      id: crisisEvents.id,
      type: crisisEvents.type,
      intensity: crisisEvents.intensity,
      duration: crisisEvents.duration,
      symptoms: crisisEvents.symptoms,
      triggers: crisisEvents.triggers,
      copingStrategiesUsed: crisisEvents.copingStrategiesUsed,
      copingStrategyEffectiveness: crisisEvents.copingStrategyEffectiveness
    })
    .from(crisisEvents)
    .where(eq(crisisEvents.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(crisisEvents.date, startDate),
          lte(crisisEvents.date, endDate)
        )
      );
    }
    
    const events = await query;
    
    if (events.length === 0) {
      return {
        totalEvents: 0,
        byType: {},
        byIntensity: {},
        commonTriggers: [],
        commonSymptoms: [],
        effectiveCopingStrategies: [],
        averageDuration: 0
      };
    }
    
    // Calculate analytics
    const byType: { [key: string]: number } = {};
    const byIntensity: { [key: string]: number } = {};
    const triggerCounts: { [key: string]: number } = {};
    const symptomCounts: { [key: string]: number } = {};
    const copingStrategyCounts: { [key: string]: { count: number, effectiveness: number } } = {};
    let totalDuration = 0;
    let durationCount = 0;
    
    events.forEach(event => {
      // Count by type
      byType[event.type] = (byType[event.type] || 0) + 1;
      
      // Count by intensity
      byIntensity[event.intensity] = (byIntensity[event.intensity] || 0) + 1;
      
      // Count triggers
      if (event.triggers) {
        const triggers = event.triggers as string[];
        triggers.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
      
      // Count symptoms
      if (event.symptoms) {
        const symptoms = event.symptoms as string[];
        symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
      
      // Track coping strategies and their effectiveness
      if (event.copingStrategiesUsed) {
        const strategies = event.copingStrategiesUsed as string[];
        strategies.forEach(strategy => {
          if (!copingStrategyCounts[strategy]) {
            copingStrategyCounts[strategy] = { count: 0, effectiveness: 0 };
          }
          
          copingStrategyCounts[strategy].count += 1;
          if (event.copingStrategyEffectiveness) {
            copingStrategyCounts[strategy].effectiveness += event.copingStrategyEffectiveness;
          }
        });
      }
      
      // Sum durations
      if (event.duration) {
        totalDuration += event.duration;
        durationCount++;
      }
    });
    
    // Sort triggers by frequency
    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger]) => trigger);
    
    // Sort symptoms by frequency
    const commonSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom]) => symptom);
    
    // Sort coping strategies by effectiveness
    const effectiveCopingStrategies = Object.entries(copingStrategyCounts)
      .map(([strategy, data]) => ({
        strategy,
        effectiveness: data.count > 0 ? data.effectiveness / data.count : 0
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5)
      .map(item => item.strategy);
    
    // Calculate average duration
    const averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;
    
    return {
      totalEvents: events.length,
      byType,
      byIntensity,
      commonTriggers,
      commonSymptoms,
      effectiveCopingStrategies,
      averageDuration
    };
  }

  async getCrisisTimePeriodSummary(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary> {
    const today = new Date();
    let startDate: Date;
    let endDate = today;
    
    // Calculate start date based on period
    switch (period) {
      case 'day':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }
    
    // Format dates for SQL query
    const formattedStartDate = startDate.toISOString().slice(0, 10);
    const formattedEndDate = endDate.toISOString().slice(0, 10);
    
    // Get current period events
    const events = await this.getCrisisEventsByDateRange(userId, formattedStartDate, formattedEndDate);
    
    // Calculate previous period for trend comparison
    const previousPeriodStartDate = new Date(startDate);
    const previousPeriodEndDate = new Date(startDate);
    
    switch (period) {
      case 'day':
        previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 1);
        break;
      case 'week':
        previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 7);
        break;
      case 'month':
        previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 1);
        break;
      case 'year':
        previousPeriodStartDate.setFullYear(previousPeriodStartDate.getFullYear() - 1);
        break;
    }
    
    // Format dates for previous period query
    const formattedPrevStartDate = previousPeriodStartDate.toISOString().slice(0, 10);
    const formattedPrevEndDate = previousPeriodEndDate.toISOString().slice(0, 10);
    
    // Get previous period events
    const previousEvents = await this.getCrisisEventsByDateRange(userId, formattedPrevStartDate, formattedPrevEndDate);
    
    // Calculate summary data
    const count = events.length;
    let averageIntensity = 0;
    
    if (count > 0) {
      // Map intensity levels to numeric values for average calculation
      const intensityValues: { [key: string]: number } = {
        'mild': 1,
        'moderate': 2,
        'severe': 3,
        'extreme': 4
      };
      
      const totalIntensity = events.reduce((sum, event) => {
        return sum + (intensityValues[event.intensity] || 0);
      }, 0);
      
      averageIntensity = totalIntensity / count;
    }
    
    // Determine trend by comparing with previous period
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (count > previousEvents.length) {
      trend = 'increasing';
    } else if (count < previousEvents.length) {
      trend = 'decreasing';
    }
    
    return {
      period,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      count,
      averageIntensity,
      trend
    };
  }
}