/**
 * Value object representing a user ID
 */
export class UserId {
  private readonly _value: number;

  constructor(value: number) {
    this.validateUserId(value);
    this._value = value;
  }

  private validateUserId(value: number): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('User ID must be a positive integer');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other.value;
  }
}