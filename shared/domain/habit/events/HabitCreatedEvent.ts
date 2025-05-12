import { DomainEvent } from "../../shared/DomainEvent";

/**
 * Event emitted when a new habit is created
 */
export class HabitCreatedEvent extends DomainEvent {
  constructor(
    public readonly habitId: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly frequency: string,
    public readonly reminder: string | null
  ) {
    super('HabitCreated');
  }
}