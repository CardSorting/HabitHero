import { HabitRepository } from "../../../shared/domain/habit/HabitRepository";
import { HabitAggregate } from "../../../shared/domain/habit/HabitAggregate";
import { HabitId } from "../../../shared/domain/habit/HabitId";
import { UserId } from "../../../shared/domain/user/UserId";
import { db } from "../../db";
import { habits, habitCompletions } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Implementation of HabitRepository using Drizzle ORM
 */
export class DrizzleHabitRepository implements HabitRepository {
  /**
   * Find a habit by ID
   */
  async findById(id: HabitId): Promise<HabitAggregate | null> {
    // Get habit from database
    const [habitData] = await db.select().from(habits).where(eq(habits.id, id.value));
    
    if (!habitData) {
      return null;
    }
    
    // Get completions for this habit
    const completionsData = await db
      .select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, id.value))
      .orderBy(desc(habitCompletions.date));
    
    // Reconstruct the aggregate from data
    return HabitAggregate.reconstitute(
      habitData.id,
      habitData.userId,
      habitData.name,
      habitData.description || "",
      habitData.frequency,
      habitData.reminder,
      habitData.streak,
      completionsData.map(c => ({
        date: new Date(c.date).toISOString().split('T')[0],
        completed: c.completed
      })),
      habitData.createdAt
    );
  }
  
  /**
   * Find all habits for a user
   */
  async findByUserId(userId: UserId): Promise<HabitAggregate[]> {
    // Get habits from database
    const habitsData = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId.value));
    
    // Get completions for each habit and reconstruct aggregates
    const habitsWithCompletions = await Promise.all(
      habitsData.map(async (habitData) => {
        const completionsData = await db
          .select()
          .from(habitCompletions)
          .where(eq(habitCompletions.habitId, habitData.id))
          .orderBy(desc(habitCompletions.date));
        
        return HabitAggregate.reconstitute(
          habitData.id,
          habitData.userId,
          habitData.name,
          habitData.description || "",
          habitData.frequency,
          habitData.reminder,
          habitData.streak,
          completionsData.map(c => ({
            date: new Date(c.date).toISOString().split('T')[0],
            completed: c.completed
          })),
          habitData.createdAt
        );
      })
    );
    
    return habitsWithCompletions;
  }
  
  /**
   * Save a habit (create or update)
   */
  async save(habit: HabitAggregate): Promise<void> {
    const habitData = habit.toDTO();
    
    // Check if habit exists
    const [existingHabit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitData.id));
    
    if (existingHabit) {
      // Update existing habit
      await db
        .update(habits)
        .set({
          name: habitData.name,
          description: habitData.description,
          frequency: habitData.frequency,
          reminder: habitData.reminder,
          streak: habitData.streak
        })
        .where(eq(habits.id, habitData.id));
    } else {
      // Create new habit
      await db
        .insert(habits)
        .values({
          id: habitData.id,
          userId: habitData.userId,
          name: habitData.name,
          description: habitData.description,
          frequency: habitData.frequency,
          reminder: habitData.reminder,
          streak: habitData.streak,
          createdAt: habitData.createdAt
        });
    }
    
    // Handle completions - this is simplified; a more robust implementation would
    // compare existing completions and only update what's changed
    const completions = habit.completions;
    
    for (const completion of completions) {
      const date = completion.date;
      const completed = completion.completed;
      
      // Check if completion exists
      const [existingCompletion] = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habitData.id),
            eq(habitCompletions.date, date)
          )
        );
      
      if (existingCompletion) {
        // Update existing completion
        await db
          .update(habitCompletions)
          .set({ completed })
          .where(eq(habitCompletions.id, existingCompletion.id));
      } else {
        // Create new completion
        await db
          .insert(habitCompletions)
          .values({
            habitId: habitData.id,
            date,
            completed
          });
      }
    }
  }
  
  /**
   * Delete a habit
   */
  async delete(id: HabitId): Promise<boolean> {
    // First, delete all completions for this habit
    await db
      .delete(habitCompletions)
      .where(eq(habitCompletions.habitId, id.value));
    
    // Then delete the habit
    const [deletedHabit] = await db
      .delete(habits)
      .where(eq(habits.id, id.value))
      .returning();
    
    return !!deletedHabit;
  }
  
  /**
   * Generate a new habit ID
   */
  async nextId(): Promise<HabitId> {
    // Simple implementation: get max ID and increment
    // In a production system, you might use a sequence or UUID
    const [result] = await db
      .select({ maxId: habits.id })
      .from(habits)
      .orderBy(desc(habits.id))
      .limit(1);
    
    const nextId = result ? result.maxId + 1 : 1;
    return new HabitId(nextId);
  }
}