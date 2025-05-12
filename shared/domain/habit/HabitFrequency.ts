/**
 * Value object representing a habit frequency
 */
export class HabitFrequency {
  private readonly _value: string;
  
  // Valid frequency values
  private static readonly VALID_FREQUENCIES = ['daily', 'weekly', 'monthly', 'custom'];

  constructor(value: string) {
    this.validateHabitFrequency(value);
    this._value = value;
  }

  private validateHabitFrequency(value: string): void {
    if (!value || !HabitFrequency.VALID_FREQUENCIES.includes(value)) {
      throw new Error(`Habit frequency must be one of: ${HabitFrequency.VALID_FREQUENCIES.join(', ')}`);
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitFrequency): boolean {
    return this._value === other.value;
  }

  isDaily(): boolean {
    return this._value === 'daily';
  }

  isWeekly(): boolean {
    return this._value === 'weekly';
  }

  isMonthly(): boolean {
    return this._value === 'monthly';
  }

  isCustom(): boolean {
    return this._value === 'custom';
  }
}