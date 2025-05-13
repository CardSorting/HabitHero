/**
 * Value Object for tracking the time when emotions are recorded
 * Follows immutability principles from DDD
 */
export class EmotionTrackingTime {
  private readonly _hour: number;
  private readonly _minute: number;
  private readonly _second: number;
  private readonly _timeString: string;

  /**
   * Private constructor to ensure creation only through factory methods
   */
  private constructor(hour: number, minute: number, second: number) {
    this._hour = hour;
    this._minute = minute;
    this._second = second;
    this._timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  }

  /**
   * Create a time from the current time
   */
  public static fromCurrentTime(): EmotionTrackingTime {
    const now = new Date();
    return new EmotionTrackingTime(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
  }

  /**
   * Create a time from a string in HH:MM:SS format
   */
  public static fromString(timeString: string): EmotionTrackingTime {
    const parts = timeString.split(':');
    if (parts.length < 2) {
      throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
    }

    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    const second = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      throw new Error('Invalid time components');
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      throw new Error('Time components out of valid range');
    }

    return new EmotionTrackingTime(hour, minute, second);
  }

  /**
   * Return the time period this time belongs to
   */
  public getTimePeriod(): TimePeriod {
    const hour = this._hour;
    
    if (hour >= 5 && hour <= 11) {
      return TimePeriod.MORNING;
    } else if (hour >= 12 && hour <= 16) {
      return TimePeriod.AFTERNOON;
    } else if (hour >= 17 && hour <= 21) {
      return TimePeriod.EVENING;
    } else {
      return TimePeriod.NIGHT;
    }
  }

  /**
   * Get the hour component (0-23)
   */
  public get hour(): number {
    return this._hour;
  }

  /**
   * Get the minute component (0-59)
   */
  public get minute(): number {
    return this._minute;
  }

  /**
   * Get the second component (0-59)
   */
  public get second(): number {
    return this._second;
  }

  /**
   * Get the formatted time string (HH:MM:SS)
   */
  public toString(): string {
    return this._timeString;
  }

  /**
   * Get the formatted time string with custom format
   */
  public format(format: 'HH:MM:SS' | 'HH:MM' | 'h:MM a'): string {
    switch (format) {
      case 'HH:MM:SS':
        return this._timeString;
      case 'HH:MM':
        return `${this._hour.toString().padStart(2, '0')}:${this._minute.toString().padStart(2, '0')}`;
      case 'h:MM a':
        const hour12 = this._hour % 12 || 12;
        const ampm = this._hour < 12 ? 'am' : 'pm';
        return `${hour12}:${this._minute.toString().padStart(2, '0')} ${ampm}`;
      default:
        return this._timeString;
    }
  }
}

/**
 * Enumeration of time periods for emotion tracking analysis
 */
export enum TimePeriod {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

/**
 * Time period configuration for visualization
 */
export interface TimePeriodConfig {
  label: TimePeriod;
  start: number;
  end: number;
  color: string;
}

/**
 * Configuration for time periods visualization
 */
export const TIME_PERIOD_CONFIG: TimePeriodConfig[] = [
  { label: TimePeriod.MORNING, start: 5, end: 11, color: 'bg-amber-300' },
  { label: TimePeriod.AFTERNOON, start: 12, end: 16, color: 'bg-orange-400' },
  { label: TimePeriod.EVENING, start: 17, end: 21, color: 'bg-indigo-400' },
  { label: TimePeriod.NIGHT, start: 22, end: 4, color: 'bg-violet-500' }
];