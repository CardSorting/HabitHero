import { Query } from "../../shared/Query";
import { z } from "zod";

/**
 * Query to get a habit by ID
 * Following CQRS pattern
 */
export class GetHabitByIdQuery implements Query {
  readonly type = 'GetHabitById';
  
  constructor(
    public readonly habitId: number
  ) {}
  
  // Static validation schema using zod
  static readonly schema = z.object({
    habitId: z.number().int().positive()
  });
  
  // Factory method to create a validated query
  static create(data: unknown): GetHabitByIdQuery {
    const validatedData = GetHabitByIdQuery.schema.parse(data);
    return new GetHabitByIdQuery(validatedData.habitId);
  }
}