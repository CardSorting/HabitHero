import { Command } from "../../shared/Command";
import { z } from "zod";

/**
 * Command to toggle habit completion for a specific date
 * Following CQRS pattern
 */
export class ToggleHabitCompletionCommand implements Command {
  readonly type = 'ToggleHabitCompletion';
  
  constructor(
    public readonly habitId: number,
    public readonly date: string,
    public readonly completed: boolean
  ) {}
  
  // Static validation schema using zod
  static readonly schema = z.object({
    habitId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    completed: z.boolean()
  });
  
  // Factory method to create a validated command
  static create(data: unknown): ToggleHabitCompletionCommand {
    const validatedData = ToggleHabitCompletionCommand.schema.parse(data);
    return new ToggleHabitCompletionCommand(
      validatedData.habitId,
      validatedData.date,
      validatedData.completed
    );
  }
}