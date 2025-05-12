/**
 * Value object representing a habit description
 */
export class HabitDescription {
  private readonly _value: string;

  constructor(value: string) {
    this.validateHabitDescription(value);
    this._value = value;
  }

  private validateHabitDescription(value: string): void {
    if (value && value.length > 500) {
      throw new Error('Habit description cannot exceed 500 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitDescription): boolean {
    return this._value === other.value;
  }
}