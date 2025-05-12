/**
 * Domain-Driven Design Habit Aggregate Root
 * 
 * This class represents the Habit aggregate root in our domain model.
 * It encapsulates all behavior and business rules related to habits.
 */

import { HabitId } from "./HabitId";
import { UserId } from "../user/UserId";
import { HabitName } from "./HabitName";
import { HabitDescription } from "./HabitDescription";
import { HabitFrequency } from "./HabitFrequency";
import { HabitReminder } from "./HabitReminder";
import { HabitCompletion } from "./HabitCompletion";
import { DomainEvent } from "../shared/DomainEvent";
import { HabitCreatedEvent } from "./events/HabitCreatedEvent";
import { HabitCompletedEvent } from "./events/HabitCompletedEvent";

export class HabitAggregate {
  private _id: HabitId;
  private _userId: UserId;
  private _name: HabitName;
  private _description: HabitDescription;
  private _frequency: HabitFrequency;
  private _reminder: HabitReminder | null;
  private _streak: number;
  private _completions: HabitCompletion[];
  private _createdAt: Date;
  private _events: DomainEvent[] = [];

  private constructor(
    id: HabitId,
    userId: UserId,
    name: HabitName,
    description: HabitDescription,
    frequency: HabitFrequency,
    reminder: HabitReminder | null,
    streak: number,
    completions: HabitCompletion[],
    createdAt: Date
  ) {
    this._id = id;
    this._userId = userId;
    this._name = name;
    this._description = description;
    this._frequency = frequency;
    this._reminder = reminder;
    this._streak = streak;
    this._completions = completions;
    this._createdAt = createdAt;
  }

  // Factory method to create a new habit
  public static create(
    id: HabitId,
    userId: UserId,
    name: HabitName,
    description: HabitDescription,
    frequency: HabitFrequency,
    reminder: HabitReminder | null
  ): HabitAggregate {
    const habit = new HabitAggregate(
      id,
      userId,
      name,
      description,
      frequency,
      reminder,
      0,
      [],
      new Date()
    );

    // Add domain event
    habit._events.push(
      new HabitCreatedEvent(
        id.value,
        userId.value,
        name.value,
        description.value,
        frequency.value,
        reminder?.value || null
      )
    );

    return habit;
  }

  // Factory method to reconstitute a habit from persistence
  public static reconstitute(
    id: number,
    userId: number,
    name: string,
    description: string,
    frequency: string,
    reminder: string | null,
    streak: number,
    completions: Array<{ date: string; completed: boolean }>,
    createdAt: Date
  ): HabitAggregate {
    return new HabitAggregate(
      new HabitId(id),
      new UserId(userId),
      new HabitName(name),
      new HabitDescription(description),
      new HabitFrequency(frequency),
      reminder ? new HabitReminder(reminder) : null,
      streak,
      completions.map(c => HabitCompletion.create(
        new Date(c.date),
        c.completed
      )),
      createdAt
    );
  }

  // Mark a habit as complete for a specific date
  public completeForDate(date: Date, completed: boolean): void {
    const existingCompletionIndex = this._completions.findIndex(
      c => this.isSameDay(c.date, date)
    );

    if (existingCompletionIndex >= 0) {
      // Update existing completion
      this._completions[existingCompletionIndex] = 
        HabitCompletion.create(date, completed);
    } else {
      // Add new completion
      this._completions.push(HabitCompletion.create(date, completed));
    }

    // Recalculate streak
    this._streak = this.calculateStreak();

    // Add domain event
    this._events.push(
      new HabitCompletedEvent(
        this._id.value,
        this._userId.value,
        date,
        completed,
        this._streak
      )
    );
  }

  // Calculate current streak
  private calculateStreak(): number {
    if (this._completions.length === 0) return 0;
    
    // Sort completions by date, newest first
    const sortedCompletions = [...this._completions].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today);
    let streak = 0;
    
    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      
      // If the completion is not for the current date we're looking at, or it's not completed, break the streak
      if (!this.isSameDay(completionDate, currentDate) || !completion.completed) {
        break;
      }
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Domain events for eventual consistency
  public getEvents(): DomainEvent[] {
    return [...this._events];
  }

  public clearEvents(): void {
    this._events = [];
  }

  // Getters
  get id(): HabitId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get name(): HabitName {
    return this._name;
  }

  get description(): HabitDescription {
    return this._description;
  }

  get frequency(): HabitFrequency {
    return this._frequency;
  }

  get reminder(): HabitReminder | null {
    return this._reminder;
  }

  get streak(): number {
    return this._streak;
  }

  get completions(): HabitCompletion[] {
    return [...this._completions];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // To DTO for API responses
  public toDTO() {
    return {
      id: this._id.value,
      userId: this._userId.value,
      name: this._name.value,
      description: this._description.value,
      frequency: this._frequency.value,
      reminder: this._reminder?.value || null,
      streak: this._streak,
      completionRecords: this._completions.map(c => ({
        date: c.date.toISOString().split('T')[0],
        completed: c.completed
      })),
      createdAt: this._createdAt
    };
  }
}