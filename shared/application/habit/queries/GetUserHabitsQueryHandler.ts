import { QueryHandler } from "../../shared/QueryHandler";
import { GetUserHabitsQuery } from "./GetUserHabitsQuery";
import { HabitRepository } from "../../../domain/habit/HabitRepository";
import { UserId } from "../../../domain/user/UserId";

/**
 * Handler for getting all habits for a user
 * Following CQRS and Query Handler pattern
 */
export class GetUserHabitsQueryHandler implements QueryHandler<GetUserHabitsQuery, any[]> {
  constructor(
    private readonly habitRepository: HabitRepository
  ) {}

  /**
   * Execute the query to get habits for a user
   */
  async execute(query: GetUserHabitsQuery): Promise<any[]> {
    const userId = new UserId(query.userId);
    
    // Get habits from repository
    const habits = await this.habitRepository.findByUserId(userId);
    
    // Return DTOs for API response
    return habits.map(habit => habit.toDTO());
  }
}