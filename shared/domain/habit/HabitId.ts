/**
 * Value object representing a habit ID
 */
export class HabitId {
  private readonly _value: number;

  constructor(value: number) {
    this.validateHabitId(value);
    this._value = value;
  }

  private validateHabitId(value: number): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Habit ID must be a positive integer');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: HabitId): boolean {
    return this._value === other.value;
  }
}