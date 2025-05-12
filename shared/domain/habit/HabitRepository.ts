import { HabitAggregate } from "./HabitAggregate";
import { HabitId } from "./HabitId";
import { UserId } from "../user/UserId";

/**
 * Repository interface for Habit Aggregate
 * Following the Repository pattern from DDD
 */
export interface HabitRepository {
  /**
   * Find a habit by its ID
   */
  findById(id: HabitId): Promise<HabitAggregate | null>;
  
  /**
   * Find all habits for a user
   */
  findByUserId(userId: UserId): Promise<HabitAggregate[]>;
  
  /**
   * Save a habit (create or update)
   */
  save(habit: HabitAggregate): Promise<void>;
  
  /**
   * Delete a habit
   */
  delete(id: HabitId): Promise<boolean>;
  
  /**
   * Generate a new habit ID
   */
  nextId(): Promise<HabitId>;
}