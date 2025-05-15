import { eq, sql, and, desc, between, count, avg, gte, lte, like, or, isNull, isNotNull } from 'drizzle-orm';
import { db, pool } from './db';
import { format, subDays } from 'date-fns';
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
  therapistClients,
  therapistNotes,
  treatmentPlans,
  emotionTrackingEntries,
  Habit, 
  HabitCompletion, 
  InsertHabit, 
  InsertHabitCompletion,
  DailyGoal,
  InsertDailyGoal,
  DbtSleep,
  DbtEmotion,
  DbtUrge,
  TherapistClient,
  InsertTherapistClient,
  TherapistNote,
  InsertTherapistNote,
  TreatmentPlan,
  InsertTreatmentPlan,
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

  // =====================================================
  // THERAPIST FEATURE METHODS
  // =====================================================

  /**
   * Checks if a therapist is assigned to a specific client
   */
  async isTherapistForClient(therapistId: number, clientId: number): Promise<boolean> {
    // Validate inputs to make sure they're valid integers
    if (isNaN(therapistId) || isNaN(clientId) || !Number.isInteger(Number(therapistId)) || !Number.isInteger(Number(clientId))) {
      console.warn(`Invalid parameters passed to isTherapistForClient: therapistId=${therapistId}, clientId=${clientId}`);
      return false;
    }
    
    try {
      const relationship = await db.query.therapistClients.findFirst({
        where: and(
          eq(therapistClients.therapistId, Number(therapistId)),
          eq(therapistClients.clientId, Number(clientId))
        )
      });

      return !!relationship;
    } catch (error) {
      console.error('Error in isTherapistForClient:', error);
      return false;
    }
  }

  /**
   * Gets all clients assigned to a therapist
   */
  async getTherapistClients(therapistId: number): Promise<ClientSummary[]> {
    // Get all therapist-client relationships for this therapist
    const relationships = await db.query.therapistClients.findMany({
      where: eq(therapistClients.therapistId, therapistId),
      with: {
        client: true
      },
      orderBy: desc(therapistClients.startDate)
    });

    // For each client, get additional analytics data
    const clientSummaries: ClientSummary[] = [];

    for (const rel of relationships) {
      const client = rel.client;

      // Get counts for analytics
      const emotionsCount = await db.select({ count: count() })
        .from(emotionTrackingEntries)
        .where(eq(emotionTrackingEntries.userId, client.id))
        .execute()
        .then(result => result[0]?.count || 0);

      const crisisEventsCount = await db.select({ count: count() })
        .from(crisisEvents)
        .where(eq(crisisEvents.userId, client.id))
        .execute()
        .then(result => result[0]?.count || 0);

      const wellnessChallengesCount = await db.select({ count: count() })
        .from(wellnessChallenges)
        .where(eq(wellnessChallenges.userId, client.id))
        .execute()
        .then(result => result[0]?.count || 0);

      // Get last activity timestamp (could be from any table)
      // For simplicity, we're using the most recent emotion entry as a proxy for activity
      const lastActivity = await db.query.emotionTrackingEntries.findFirst({
        where: eq(emotionTrackingEntries.userId, client.id),
        orderBy: desc(emotionTrackingEntries.createdAt)
      }).then(entry => entry?.createdAt?.toISOString().split('T')[0] || undefined);

      clientSummaries.push({
        id: client.id,
        username: client.username,
        fullName: client.fullName || undefined,
        email: client.email || undefined,
        startDate: rel.startDate,
        status: rel.status || 'active',
        lastActivity,
        notes: rel.notes || undefined,
        emotionsCount,
        crisisEventsCount,
        wellnessChallengesCount
      });
    }

    return clientSummaries;
  }

  /**
   * Gets all therapists assigned to a client
   */
  async getClientTherapists(clientId: number): Promise<User[]> {
    const relationships = await db.query.therapistClients.findMany({
      where: eq(therapistClients.clientId, clientId),
      with: {
        therapist: true
      }
    });

    return relationships.map(rel => rel.therapist);
  }

  /**
   * Assigns a client to a therapist
   */
  async assignClientToTherapist(
    therapistId: number, 
    clientId: number, 
    data: Omit<InsertTherapistClient, 'therapistId' | 'clientId'>
  ): Promise<TherapistClient> {
    // Check if relationship already exists
    const existing = await this.isTherapistForClient(therapistId, clientId);
    
    if (existing) {
      throw new Error('Client is already assigned to this therapist');
    }

    // Create the relationship
    const result = await db.insert(therapistClients)
      .values({
        therapistId,
        clientId,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        notes: data.notes,
        status: 'active'
      })
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Removes a client from a therapist
   */
  async removeClientFromTherapist(therapistId: number, clientId: number): Promise<boolean> {
    // Find the relationship ID first
    const relationship = await db.query.therapistClients.findFirst({
      where: and(
        eq(therapistClients.therapistId, therapistId),
        eq(therapistClients.clientId, clientId)
      )
    });

    if (!relationship) {
      return false;
    }

    // Delete the relationship
    await db.delete(therapistClients)
      .where(eq(therapistClients.id, relationship.id))
      .execute();

    return true;
  }

  /**
   * Updates a therapist-client relationship
   */
  async updateClientTherapistRelationship(
    id: number, 
    data: Partial<TherapistClient>
  ): Promise<TherapistClient> {
    // Find the relationship
    const relationship = await db.query.therapistClients.findFirst({
      where: eq(therapistClients.id, id)
    });

    if (!relationship) {
      throw new Error(`Relationship with ID ${id} not found`);
    }

    // Update the relationship
    const result = await db.update(therapistClients)
      .set({
        status: data.status || relationship.status,
        endDate: data.endDate || relationship.endDate,
        notes: data.notes !== undefined ? data.notes : relationship.notes
      })
      .where(eq(therapistClients.id, id))
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Gets all therapy notes for a client
   */
  async getTherapistNotes(therapistId: number, clientId: number): Promise<TherapistNote[]> {
    const notes = await db.query.therapistNotes.findMany({
      where: and(
        eq(therapistNotes.therapistId, therapistId),
        eq(therapistNotes.clientId, clientId)
      ),
      orderBy: desc(therapistNotes.sessionDate)
    });

    return notes;
  }

  /**
   * Gets a specific therapy note by ID
   */
  async getTherapistNoteById(id: number): Promise<TherapistNote | undefined> {
    const note = await db.query.therapistNotes.findFirst({
      where: eq(therapistNotes.id, id)
    });

    return note || undefined;
  }

  /**
   * Creates a new therapy note
   */
  async createTherapistNote(note: InsertTherapistNote): Promise<TherapistNote> {
    const result = await db.insert(therapistNotes)
      .values({
        therapistId: note.therapistId,
        clientId: note.clientId,
        sessionDate: note.sessionDate,
        content: note.content,
        mood: note.mood,
        progress: note.progress,
        goalCompletion: note.goalCompletion,
        isPrivate: note.isPrivate !== undefined ? note.isPrivate : true,
        createdAt: new Date()
      })
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Updates a therapy note
   */
  async updateTherapistNote(id: number, note: Partial<TherapistNote>): Promise<TherapistNote> {
    const existingNote = await this.getTherapistNoteById(id);
    
    if (!existingNote) {
      throw new Error(`Note with ID ${id} not found`);
    }

    const result = await db.update(therapistNotes)
      .set({
        content: note.content !== undefined ? note.content : existingNote.content,
        mood: note.mood !== undefined ? note.mood : existingNote.mood,
        progress: note.progress !== undefined ? note.progress : existingNote.progress,
        goalCompletion: note.goalCompletion !== undefined ? note.goalCompletion : existingNote.goalCompletion,
        isPrivate: note.isPrivate !== undefined ? note.isPrivate : existingNote.isPrivate,
        updatedAt: new Date()
      })
      .where(eq(therapistNotes.id, id))
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Deletes a therapy note
   */
  async deleteTherapistNote(id: number): Promise<boolean> {
    await db.delete(therapistNotes)
      .where(eq(therapistNotes.id, id))
      .execute();

    return true;
  }

  /**
   * Gets all treatment plans for a client
   */
  async getTreatmentPlans(therapistId: number, clientId?: number): Promise<TreatmentPlan[]> {
    let query = db.select().from(treatmentPlans).where(eq(treatmentPlans.therapistId, therapistId));
    
    if (clientId) {
      query = query.where(eq(treatmentPlans.clientId, clientId));
    }
    
    const plans = await query.orderBy(desc(treatmentPlans.startDate)).execute();
    
    return plans;
  }

  /**
   * Gets a treatment plan by ID
   */
  async getTreatmentPlanById(id: number): Promise<TreatmentPlan | undefined> {
    const plan = await db.query.treatmentPlans.findFirst({
      where: eq(treatmentPlans.id, id)
    });

    return plan || undefined;
  }

  /**
   * Creates a new treatment plan
   */
  async createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const result = await db.insert(treatmentPlans)
      .values({
        therapistId: plan.therapistId,
        clientId: plan.clientId,
        title: plan.title,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals,
        status: plan.status || 'active',
        createdAt: new Date()
      })
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Updates a treatment plan
   */
  async updateTreatmentPlan(id: number, plan: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    const existingPlan = await this.getTreatmentPlanById(id);
    
    if (!existingPlan) {
      throw new Error(`Treatment plan with ID ${id} not found`);
    }

    const result = await db.update(treatmentPlans)
      .set({
        title: plan.title || existingPlan.title,
        description: plan.description !== undefined ? plan.description : existingPlan.description,
        startDate: plan.startDate || existingPlan.startDate,
        endDate: plan.endDate !== undefined ? plan.endDate : existingPlan.endDate,
        goals: plan.goals !== undefined ? plan.goals : existingPlan.goals,
        status: plan.status || existingPlan.status,
        updatedAt: new Date()
      })
      .where(eq(treatmentPlans.id, id))
      .returning()
      .execute();

    return result[0];
  }

  /**
   * Deletes a treatment plan
   */
  async deleteTreatmentPlan(id: number): Promise<boolean> {
    await db.delete(treatmentPlans)
      .where(eq(treatmentPlans.id, id))
      .execute();

    return true;
  }

  /**
   * Gets client analytics for therapist view
   */
  async getClientAnalytics(
    therapistId: number, 
    clientId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<ClientAnalytics> {
    // Verify therapist has access to this client
    const hasAccess = await this.isTherapistForClient(therapistId, clientId);
    
    if (!hasAccess) {
      throw new Error('Therapist does not have access to this client');
    }

    // Determine date range
    const today = new Date();
    const defaultEndDate = format(today, 'yyyy-MM-dd');
    const defaultStartDate = format(subDays(today, 30), 'yyyy-MM-dd');
    
    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Get emotion tracking data
    const emotions = await db.query.emotionTrackingEntries.findMany({
      where: and(
        eq(emotionTrackingEntries.userId, clientId),
        gte(emotionTrackingEntries.date, queryStartDate),
        lte(emotionTrackingEntries.date, queryEndDate)
      ),
      orderBy: emotionTrackingEntries.date
    });

    // Group emotions by date
    const emotionsByDate: Record<string, any[]> = {};
    
    for (const emotion of emotions) {
      if (!emotionsByDate[emotion.date]) {
        emotionsByDate[emotion.date] = [];
      }
      emotionsByDate[emotion.date].push(emotion);
    }

    // Format emotion trends data
    const emotionTrends = Object.entries(emotionsByDate).map(([date, dateEmotions]) => {
      const totalIntensity = dateEmotions.reduce((sum, emotion) => sum + emotion.intensity, 0);
      const averageIntensity = totalIntensity / dateEmotions.length;
      
      return {
        date,
        emotions: dateEmotions.map(e => ({
          name: e.emotionName,
          intensity: e.intensity,
          categoryId: e.categoryId
        })),
        averageIntensity
      };
    });

    // Get crisis events data
    const crisisAnalytics = await this.getCrisisAnalytics(clientId, queryStartDate, queryEndDate);
    
    // Get recent crisis events
    const recentEvents = await db.query.crisisEvents.findMany({
      where: and(
        eq(crisisEvents.userId, clientId),
        gte(crisisEvents.date, queryStartDate),
        lte(crisisEvents.date, queryEndDate)
      ),
      orderBy: desc(crisisEvents.date),
      limit: 5
    });
    
    // Determine trend by comparing with previous period
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    const previousStartDate = format(subDays(new Date(queryStartDate), 30), 'yyyy-MM-dd');
    const previousEndDate = format(subDays(new Date(queryEndDate), 30), 'yyyy-MM-dd');
    
    const previousCount = await db.select({ count: count() })
      .from(crisisEvents)
      .where(and(
        eq(crisisEvents.userId, clientId),
        gte(crisisEvents.date, previousStartDate),
        lte(crisisEvents.date, previousEndDate)
      ))
      .execute()
      .then(result => result[0]?.count || 0);
    
    if (crisisAnalytics.totalEvents > previousCount) {
      trend = 'increasing';
    } else if (crisisAnalytics.totalEvents < previousCount) {
      trend = 'decreasing';
    }

    // Get wellness challenge data
    const challenges = await db.query.wellnessChallenges.findMany({
      where: eq(wellnessChallenges.userId, clientId)
    });
    
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const abandonedChallenges = challenges.filter(c => c.status === 'abandoned').length;
    
    // Calculate completion rate
    const completionRate = challenges.length > 0 
      ? (completedChallenges / challenges.length) * 100 
      : 0;

    // Get treatment plan data
    const treatmentPlans = await this.getTreatmentPlans(therapistId, clientId);
    
    const activePlans = treatmentPlans.filter(p => p.status === 'active').length;
    const completedPlans = treatmentPlans.filter(p => p.status === 'completed').length;
    
    // Count goals (from all plans)
    const allGoals = treatmentPlans.reduce((total, plan) => {
      const planGoals = plan.goals?.length || 0;
      return total + planGoals;
    }, 0);
    
    // For now, mock achieved goals as 50% of total
    // In a real implementation, we would have a separate table to track goal progress
    const goalsAchieved = Math.floor(allGoals / 2);

    // Build the complete analytics object
    return {
      clientId,
      emotionTrends,
      crisisEvents: {
        count: crisisAnalytics.totalEvents,
        byType: crisisAnalytics.byType,
        byIntensity: crisisAnalytics.byIntensity,
        recentEvents,
        trend
      },
      treatmentProgress: {
        activePlans,
        completedPlans,
        goalsAchieved,
        totalGoals: allGoals
      },
      wellnessChallenges: {
        active: activeChallenges,
        completed: completedChallenges,
        abandonedCount: abandonedChallenges,
        completionRate
      }
    };
  }
}