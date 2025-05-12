/**
 * Value object representing a habit reminder time
 */
export class HabitReminder {
  private readonly _value: string;

  constructor(value: string) {
    this.validateHabitReminder(value);
    this._value = value;
  }

  private validateHabitReminder(value: string): void {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      throw new Error('Habit reminder must be in HH:MM format');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitReminder): boolean {
    return this._value === other.value;
  }

  getHours(): number {
    return parseInt(this._value.split(':')[0], 10);
  }

  getMinutes(): number {
    return parseInt(this._value.split(':')[1], 10);
  }
}