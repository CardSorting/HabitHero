import { Query } from "../../shared/Query";
import { z } from "zod";

/**
 * Query to get all habits for a user
 * Following CQRS pattern
 */
export class GetUserHabitsQuery implements Query {
  readonly type = 'GetUserHabits';
  
  constructor(
    public readonly userId: number
  ) {}
  
  // Static validation schema using zod
  static readonly schema = z.object({
    userId: z.number().int().positive()
  });
  
  // Factory method to create a validated query
  static create(data: unknown): GetUserHabitsQuery {
    const validatedData = GetUserHabitsQuery.schema.parse(data);
    return new GetUserHabitsQuery(validatedData.userId);
  }
}