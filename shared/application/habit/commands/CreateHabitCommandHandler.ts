import { CommandHandler } from "../../shared/CommandHandler";
import { CreateHabitCommand } from "./CreateHabitCommand";
import { HabitRepository } from "../../../domain/habit/HabitRepository";
import { HabitAggregate } from "../../../domain/habit/HabitAggregate";
import { HabitName } from "../../../domain/habit/HabitName";
import { HabitDescription } from "../../../domain/habit/HabitDescription";
import { HabitFrequency } from "../../../domain/habit/HabitFrequency";
import { HabitReminder } from "../../../domain/habit/HabitReminder";
import { UserId } from "../../../domain/user/UserId";
import { EventBus } from "../../shared/EventBus";

/**
 * Handler for creating a new habit
 * Following CQRS and Command Handler pattern
 */
export class CreateHabitCommandHandler implements CommandHandler<CreateHabitCommand, any> {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly eventBus?: EventBus
  ) {}

  /**
   * Execute the command to create a new habit
   */
  async execute(command: CreateHabitCommand): Promise<any> {
    // Generate a new habit ID
    const habitId = await this.habitRepository.nextId();
    
    // Create domain entities and value objects
    const userId = new UserId(command.userId);
    const name = new HabitName(command.name);
    const description = new HabitDescription(command.description);
    const frequency = new HabitFrequency(command.frequency);
    const reminder = command.reminder ? new HabitReminder(command.reminder) : null;
    
    // Create habit aggregate
    const habit = HabitAggregate.create(
      habitId,
      userId,
      name,
      description,
      frequency,
      reminder
    );
    
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