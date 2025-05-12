import { Command } from "../../shared/Command";
import { z } from "zod";

/**
 * Command to create a new habit
 * Following CQRS pattern
 */
export class CreateHabitCommand implements Command {
  readonly type = 'CreateHabit';
  
  constructor(
    public readonly userId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly frequency: string,
    public readonly reminder: string | null
  ) {}
  
  // Static validation schema using zod
  static readonly schema = z.object({
    userId: z.number().int().positive(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().default(""),
    frequency: z.enum(["daily", "weekly", "monthly", "custom"]).default("daily"),
    reminder: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional()
  });
  
  // Factory method to create a validated command
  static create(data: unknown): CreateHabitCommand {
    const validatedData = CreateHabitCommand.schema.parse(data);
    return new CreateHabitCommand(
      validatedData.userId,
      validatedData.name,
      validatedData.description,
      validatedData.frequency,
      validatedData.reminder || null
    );
  }
}