import { CommandHandler } from "../../shared/CommandHandler";
import { ToggleHabitCompletionCommand } from "./ToggleHabitCompletionCommand";
import { HabitRepository } from "../../../domain/habit/HabitRepository";
import { HabitId } from "../../../domain/habit/HabitId";
import { EventBus } from "../../shared/EventBus";

/**
 * Handler for toggling habit completion
 * Following CQRS and Command Handler pattern
 */
export class ToggleHabitCompletionCommandHandler implements CommandHandler<ToggleHabitCompletionCommand, any> {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly eventBus?: EventBus
  ) {}

  /**
   * Execute the command to toggle habit completion
   */
  async execute(command: ToggleHabitCompletionCommand): Promise<any> {
    const habitId = new HabitId(command.habitId);
    
    // Get habit from repository
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new Error(`Habit with ID ${command.habitId} not found`);
    }
    
    // Mark habit as complete or incomplete for the date
    const date = new Date(command.date);
    habit.completeForDate(date, command.completed);
    
    // Save to repository
    await this.habitRepository.save(habit);
    
    // Publish domain events
    if (this.eventBus) {
      const events = habit.getEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }
      habit.clearEvents();
    }
    
    // Return DTO for API response
    return habit.toDTO();
  }
}