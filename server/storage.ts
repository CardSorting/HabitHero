import { 
  habits as habitsTable, 
  habitCompletions as habitCompletionsTable,
  users,
  type Habit, 
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type User,
  type InsertUser,
  type WellnessChallenge,
  type InsertWellnessChallenge,
  type WellnessChallengeGoal,
  type InsertWellnessChallengeGoal,
  type WellnessChallengeProgress,
  type InsertWellnessChallengeProgress,
  type CrisisEvent,
  type InsertCrisisEvent
} from "@shared/schema";
import { startOfDay, subDays, format, addDays } from "date-fns";

// Extended habit type with completion records
export interface HabitWithCompletions extends Habit {
  completionRecords: {
    date: string;
    completed: boolean;
  }[];
}

// Extended wellness challenge type with goals and progress
export interface WellnessChallengeWithDetails extends WellnessChallenge {
  goals: WellnessChallengeGoal[];
  progressEntries: WellnessChallengeProgress[];
}

// Challenge summary statistics
export interface ChallengeSummary {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  abandonedChallenges: number;
  averageCompletionRate: number;
}

// Challenge streak information
export interface ChallengeStreak {
  challengeId: number;
  currentStreak: number;
  longestStreak: number;
}

// Crisis event analytics
export interface CrisisAnalytics {
  totalEvents: number;
  byType: { [key: string]: number };
  byIntensity: { [key: string]: number };
  commonTriggers: string[];
  commonSymptoms: string[];
  effectiveCopingStrategies: string[];
  averageDuration: number;
}

// Crisis event time period summary
export interface CrisisTimePeriodSummary {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  count: number;
  averageIntensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface IStorage {
  pool: any;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getHabits(userId?: number): Promise<HabitWithCompletions[]>;
  getHabit(id: number): Promise<HabitWithCompletions | undefined>;
  createHabit(habit: InsertHabit): Promise<HabitWithCompletions>;
  updateHabit(id: number, habit: Partial<Habit>): Promise<HabitWithCompletions>;
  deleteHabit(id: number): Promise<boolean>;
  toggleHabitCompletion(habitId: number, date: string, completed: boolean): Promise<HabitWithCompletions>;
  clearAllHabits(): Promise<boolean>;
  clearHabitCompletions(date: string): Promise<boolean>;
  
  // Wellness Challenge methods
  getWellnessChallenges(userId?: number): Promise<WellnessChallenge[]>;
  getWellnessChallengesByStatus(status: string): Promise<WellnessChallenge[]>;
  getWellnessChallengesByType(type: string): Promise<WellnessChallenge[]>;
  getWellnessChallenge(id: number): Promise<WellnessChallengeWithDetails | undefined>;
  createWellnessChallenge(challenge: InsertWellnessChallenge): Promise<WellnessChallenge>;
  updateWellnessChallenge(id: number, challenge: Partial<WellnessChallenge>): Promise<WellnessChallenge>;
  deleteWellnessChallenge(id: number): Promise<boolean>;
  updateWellnessChallengeStatus(id: number, status: string): Promise<WellnessChallenge>;
  
  // Challenge goals methods
  getWellnessChallengeGoals(challengeId: number): Promise<WellnessChallengeGoal[]>;
  createWellnessChallengeGoal(goal: InsertWellnessChallengeGoal): Promise<WellnessChallengeGoal>;
  
  // Challenge progress methods
  getWellnessChallengeProgress(challengeId: number): Promise<WellnessChallengeProgress[]>;
  getWellnessChallengeProgressForDate(challengeId: number, date: string): Promise<WellnessChallengeProgress[]>;
  recordWellnessChallengeProgress(progress: InsertWellnessChallengeProgress): Promise<WellnessChallengeProgress>;
  
  // Challenge analytics methods
  getChallengeSummary(userId: number): Promise<ChallengeSummary>;
  getChallengeStreak(challengeId: number): Promise<ChallengeStreak>;
  
  // Crisis events methods
  getCrisisEvents(userId: number): Promise<CrisisEvent[]>;
  getCrisisEventsByDateRange(userId: number, startDate: string, endDate: string): Promise<CrisisEvent[]>;
  getCrisisEventById(id: number): Promise<CrisisEvent | undefined>;
  createCrisisEvent(crisisEvent: InsertCrisisEvent): Promise<CrisisEvent>;
  updateCrisisEvent(id: number, crisisEvent: Partial<CrisisEvent>): Promise<CrisisEvent>;
  deleteCrisisEvent(id: number): Promise<boolean>;
  
  // Crisis analytics methods
  getCrisisAnalytics(userId: number, startDate?: string, endDate?: string): Promise<CrisisAnalytics>;
  getCrisisTimePeriodSummary(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<CrisisTimePeriodSummary>;
}

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion[]>;
  private users: Map<number, User>;
  private usernameToId: Map<string, number>;
  pool: any;
  
  currentHabitId: number;
  currentCompletionId: number;
  currentUserId: number;

  constructor() {
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.users = new Map();
    this.usernameToId = new Map();
    this.pool = null;
    
    this.currentHabitId = 1;
    this.currentCompletionId = 1;
    this.currentUserId = 1;
    
    // Add some sample habits for testing
    this.initializeSampleHabits();
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = this.usernameToId.get(username);
    if (!userId) return undefined;
    return this.users.get(userId);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      createdAt: now
    };
    
    this.users.set(id, newUser);
    this.usernameToId.set(user.username, id);
    
    return newUser;
  }
  
  private initializeSampleHabits() {
    const sampleHabits: InsertHabit[] = [
      {
        name: "Meditation",
        description: "10 minutes every day",
        frequency: "daily",
        reminder: "08:00",
      },
      {
        name: "Read",
        description: "20 pages every day",
        frequency: "daily",
        reminder: "20:00",
      },
      {
        name: "Exercise",
        description: "30 minutes every day",
        frequency: "daily",
        reminder: "17:00",
      },
      {
        name: "Drink Water",
        description: "8 glasses every day",
        frequency: "daily",
        reminder: "10:00",
      },
      {
        name: "Journal",
        description: "Write every day",
        frequency: "daily",
        reminder: "21:00",
      }
    ];
    
    sampleHabits.forEach(habit => {
      this.createHabit(habit);
    });
    
    // Add some sample completions for the past week
    const today = new Date();
    
    const sampleCompletionPatterns = [
      // Meditation - 4 day streak
      [true, true, true, true, false, false],
      // Read - 7 day streak 
      [true, true, true, true, true, true, true],
      // Exercise - 3 day streak
      [false, false, true, true, true, false, false],
      // Drink Water - 6 out of 7 days
      [true, true, true, true, true, false, true],
      // Journal - 5 days
      [true, true, false, false, true, true, true]
    ];
    
    // Create completions for each habit
    for (let habitId = 1; habitId <= sampleHabits.length; habitId++) {
      const patternIndex = habitId - 1;
      if (patternIndex < sampleCompletionPatterns.length) {
        const pattern = sampleCompletionPatterns[patternIndex];
        
        pattern.forEach((completed, index) => {
          const date = format(subDays(today, pattern.length - 1 - index), "yyyy-MM-dd");
          this.toggleHabitCompletion(habitId, date, completed);
        });
        
        // Update streak
        const habit = this.habits.get(habitId);
        if (habit) {
          const completions = this.habitCompletions.get(habitId) || [];
          const streakDays = this.calculateStreak(completions);
          this.habits.set(habitId, { ...habit, streak: streakDays });
        }
      }
    }
    
    // Make some completed for today based on the design
    this.toggleHabitCompletion(2, format(today, "yyyy-MM-dd"), true); // Read
    this.toggleHabitCompletion(4, format(today, "yyyy-MM-dd"), true); // Drink Water
    this.toggleHabitCompletion(5, format(today, "yyyy-MM-dd"), true); // Journal
  }
  
  private calculateStreak(completions: HabitCompletion[]): number {
    if (!completions || completions.length === 0) return 0;
    
    const sortedCompletions = [...completions]
      .filter(completion => completion.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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

  private getHabitWithCompletions(habit: Habit): HabitWithCompletions {
    const completions = this.habitCompletions.get(habit.id) || [];
    return {
      ...habit,
      completionRecords: completions.map(completion => ({
        date: format(new Date(completion.date), "yyyy-MM-dd"),
        completed: completion.completed
      }))
    };
  }

  async getHabits(): Promise<HabitWithCompletions[]> {
    return Array.from(this.habits.values()).map(habit => 
      this.getHabitWithCompletions(habit)
    );
  }

  async getHabit(id: number): Promise<HabitWithCompletions | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    return this.getHabitWithCompletions(habit);
  }

  async createHabit(insertHabit: InsertHabit): Promise<HabitWithCompletions> {
    const id = this.currentHabitId++;
    const now = new Date();
    
    const habit: Habit = {
      id,
      userId: insertHabit.userId,
      name: insertHabit.name,
      description: insertHabit.description || "",
      frequency: insertHabit.frequency || "daily",
      reminder: insertHabit.reminder || null,
      streak: 0,
      createdAt: now
    };
    
    this.habits.set(id, habit);
    this.habitCompletions.set(id, []);
    
    return this.getHabitWithCompletions(habit);
  }

  async updateHabit(id: number, habitUpdate: Partial<Habit>): Promise<HabitWithCompletions> {
    const habit = this.habits.get(id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    
    const updatedHabit = { ...habit, ...habitUpdate };
    this.habits.set(id, updatedHabit);
    
    return this.getHabitWithCompletions(updatedHabit);
  }

  async deleteHabit(id: number): Promise<boolean> {
    const deleted = this.habits.delete(id);
    this.habitCompletions.delete(id);
    return deleted;
  }

  async toggleHabitCompletion(habitId: number, dateStr: string, completed: boolean): Promise<HabitWithCompletions> {
    const habit = this.habits.get(habitId);
    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found`);
    }
    
    const date = new Date(dateStr);
    const completions = this.habitCompletions.get(habitId) || [];
    
    // Check if there's already a record for this date
    const existingIndex = completions.findIndex(
      c => startOfDay(new Date(c.date)).getTime() === startOfDay(date).getTime()
    );
    
    if (existingIndex >= 0) {
      // Update existing record
      completions[existingIndex] = {
        ...completions[existingIndex],
        completed
      };
    } else {
      // Create new record
      completions.push({
        id: this.currentCompletionId++,
        habitId,
        date,
        completed
      });
    }
    
    this.habitCompletions.set(habitId, completions);
    
    // Update streak count
    const streak = this.calculateStreak(completions);
    this.habits.set(habitId, { ...habit, streak });
    
    return this.getHabitWithCompletions({ ...habit, streak });
  }

  async clearAllHabits(): Promise<boolean> {
    this.habits.clear();
    this.habitCompletions.clear();
    return true;
  }

  async clearHabitCompletions(dateStr: string): Promise<boolean> {
    const date = startOfDay(new Date(dateStr));
    
    for (const [habitId, completions] of this.habitCompletions.entries()) {
      const updatedCompletions = completions.filter(
        c => startOfDay(new Date(c.date)).getTime() !== date.getTime()
      );
      this.habitCompletions.set(habitId, updatedCompletions);
    }
    
    return true;
  }
}

import { DatabaseStorage } from "./DatabaseStorage";

// Use DatabaseStorage for persistence
export const storage = new DatabaseStorage();
