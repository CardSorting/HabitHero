import { QueryHandler } from "../../shared/QueryHandler";
import { GetHabitByIdQuery } from "./GetHabitByIdQuery";
import { HabitRepository } from "../../../domain/habit/HabitRepository";
import { HabitId } from "../../../domain/habit/HabitId";

/**
 * Handler for getting a habit by ID
 * Following CQRS and Query Handler pattern
 */
export class GetHabitByIdQueryHandler implements QueryHandler<GetHabitByIdQuery, any> {
  constructor(
    private readonly habitRepository: HabitRepository
  ) {}

  /**
   * Execute the query to get a habit by ID
   */
  async execute(query: GetHabitByIdQuery): Promise<any> {
    const habitId = new HabitId(query.habitId);
    
    // Get habit from repository
    const habit = await this.habitRepository.findById(habitId);
    
    if (!habit) {
      return null;
    }
    
    // Return DTO for API response
    return habit.toDTO();
  }
}