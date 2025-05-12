/**
 * Value object representing a habit name
 */
export class HabitName {
  private readonly _value: string;

  constructor(value: string) {
    this.validateHabitName(value);
    this._value = value;
  }

  private validateHabitName(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Habit name cannot be empty');
    }
    
    if (value.length > 100) {
      throw new Error('Habit name cannot exceed 100 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitName): boolean {
    return this._value === other.value;
  }
}