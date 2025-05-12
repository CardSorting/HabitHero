import { DomainEvent } from "../../shared/DomainEvent";

/**
 * Event emitted when a habit is marked as complete or incomplete
 */
export class HabitCompletedEvent extends DomainEvent {
  constructor(
    public readonly habitId: number,
    public readonly userId: number,
    public readonly date: Date,
    public readonly completed: boolean,
    public readonly currentStreak: number
  ) {
    super('HabitCompleted');
  }
}