/**
 * Enum for time periods of the day
 * Following Domain-Driven Design principles - Using enums for value objects with predefined values
 */
export enum TimePeriod {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

/**
 * Time period configuration with additional metadata
 */
export const TIME_PERIOD_CONFIG = [
  { 
    label: TimePeriod.MORNING, 
    color: 'bg-amber-400',
    icon: '🌅',
    description: '5am - 11am'
  },
  { 
    label: TimePeriod.AFTERNOON, 
    color: 'bg-yellow-500',
    icon: '☀️',
    description: '12pm - 4pm'
  },
  { 
    label: TimePeriod.EVENING, 
    color: 'bg-orange-500',
    icon: '🌆',
    description: '5pm - 9pm'
  },
  { 
    label: TimePeriod.NIGHT, 
    color: 'bg-indigo-600',
    icon: '🌙',
    description: '10pm - 4am'
  }
];

/**
 * Class representing time tracking for emotions
 * Following Domain-Driven Design principles for entities
 */
export class EmotionTrackingTime {
  private _hour: number;
  private _minute: number;
  
  constructor(time: string) {
    // Parse time string (format: HH:MM or HH:MM:SS)
    const [hourStr, minuteStr] = time.split(':');
    this._hour = parseInt(hourStr, 10);
    this._minute = parseInt(minuteStr, 10);
    
    // Validate parsed values
    if (isNaN(this._hour) || isNaN(this._minute)) {
      throw new Error(`Invalid time format: ${time}. Expected format: HH:MM or HH:MM:SS`);
    }
    
    if (this._hour < 0 || this._hour > 23) {
      throw new Error(`Invalid hour: ${this._hour}. Must be between 0 and 23`);
    }
    
    if (this._minute < 0 || this._minute > 59) {
      throw new Error(`Invalid minute: ${this._minute}. Must be between 0 and 59`);
    }
  }
  
  /**
   * Get the formatted time string (HH:MM)
   */
  get formattedTime(): string {
    return `${this._hour.toString().padStart(2, '0')}:${this._minute.toString().padStart(2, '0')}`;
  }
  
  /**
   * Get the time period for this time
   */
  get timePeriod(): TimePeriod {
    if (this._hour >= 5 && this._hour <= 11) {
      return TimePeriod.MORNING;
    } else if (this._hour >= 12 && this._hour <= 16) {
      return TimePeriod.AFTERNOON;
    } else if (this._hour >= 17 && this._hour <= 21) {
      return TimePeriod.EVENING;
    } else {
      return TimePeriod.NIGHT;
    }
  }
  
  /**
   * Get the icon for this time period
   */
  get periodIcon(): string {
    const config = TIME_PERIOD_CONFIG.find(cfg => cfg.label === this.timePeriod);
    return config?.icon || '⏰';
  }
  
  /**
   * Get the color class for this time period
   */
  get periodColorClass(): string {
    const config = TIME_PERIOD_CONFIG.find(cfg => cfg.label === this.timePeriod);
    return config?.color || 'bg-gray-400';
  }
  
  /**
   * Get the hour
   */
  get hour(): number {
    return this._hour;
  }
  
  /**
   * Get the minute
   */
  get minute(): number {
    return this._minute;
  }
  
  /**
   * Create an EmotionTrackingTime object from a time string
   * @param timeStr Time string in format HH:MM or HH:MM:SS
   * @returns EmotionTrackingTime object
   */
  static fromString(timeStr: string): EmotionTrackingTime {
    return new EmotionTrackingTime(timeStr);
  }
  
  /**
   * Create an EmotionTrackingTime object from the current time
   * @returns EmotionTrackingTime object
   */
  static fromCurrentTime(): EmotionTrackingTime {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return new EmotionTrackingTime(timeStr);
  }
}