/**
 * Value object representing a habit completion record
 */
export class HabitCompletion {
  private readonly _date: Date;
  private readonly _completed: boolean;

  private constructor(date: Date, completed: boolean) {
    this._date = date;
    this._completed = completed;
  }

  // Factory method to create a HabitCompletion
  public static create(date: Date, completed: boolean): HabitCompletion {
    return new HabitCompletion(date, completed);
  }

  get date(): Date {
    return new Date(this._date);
  }

  get completed(): boolean {
    return this._completed;
  }

  equals(other: HabitCompletion): boolean {
    return (
      this.isSameDay(this._date, other.date) &&
      this._completed === other.completed
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}