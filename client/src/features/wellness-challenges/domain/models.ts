/**
 * Domain models for the wellness challenges feature
 * Following Domain-Driven Design principles
 */

export type ChallengeId = string | number;
export type UserId = string | number;

export enum ChallengeCategory {
  EMOTIONS = "emotions",
  MEDITATION = "meditation",
  JOURNALING = "journaling",
  ACTIVITY = "activity"
}

export enum ChallengeFrequency {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  AS_NEEDED = "As needed",
  ONE_TIME = "One-time"
}

export enum ChallengeDifficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export enum ChallengeStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
  NOT_STARTED = "not_started"
}

// Value Objects
export class ChallengeDuration {
  constructor(
    public readonly value: number,
    public readonly unit: "minutes" | "hours" | "all_day" | "varies"
  ) {}

  toString(): string {
    if (this.unit === "all_day") return "All day";
    if (this.unit === "varies") return "Varies";
    return `${this.value} ${this.unit}`;
  }

  static fromString(durationStr: string): ChallengeDuration {
    if (durationStr === "All day") return new ChallengeDuration(0, "all_day");
    if (durationStr === "Varies") return new ChallengeDuration(0, "varies");

    const minutesMatch = durationStr.match(/(\d+) minutes?/);
    if (minutesMatch) return new ChallengeDuration(parseInt(minutesMatch[1]), "minutes");

    const hoursMatch = durationStr.match(/(\d+) hours?/);
    if (hoursMatch) return new ChallengeDuration(parseInt(hoursMatch[1]), "hours");

    return new ChallengeDuration(0, "varies");
  }
}

// Aggregate Root
export class WellnessChallenge {
  constructor(
    public readonly id: ChallengeId,
    public readonly title: string,
    public readonly description: string,
    public readonly category: ChallengeCategory,
    public readonly frequency: ChallengeFrequency,
    public readonly difficulty: ChallengeDifficulty,
    public readonly duration: ChallengeDuration,
    public readonly target: number,
    public readonly active: boolean = false,
    public status: ChallengeStatus = ChallengeStatus.NOT_STARTED,
    public progress: number = 0
  ) {}

  // Business logic and invariants
  activate(): void {
    this.status = ChallengeStatus.ACTIVE;
  }

  abandon(): void {
    this.status = ChallengeStatus.ABANDONED;
  }

  complete(): void {
    if (this.progress >= this.target) {
      this.status = ChallengeStatus.COMPLETED;
    }
  }

  updateProgress(newProgress: number): void {
    this.progress = Math.min(newProgress, this.target);
    if (this.progress >= this.target) {
      this.complete();
    }
  }
}

// Factory for creating challenges
export class WellnessChallengeFactory {
  static createFromRaw(data: any): WellnessChallenge {
    return new WellnessChallenge(
      data.id,
      data.title,
      data.description,
      data.category || this.determineCategoryFromRaw(data),
      data.frequency as ChallengeFrequency,
      data.difficulty as ChallengeDifficulty,
      typeof data.duration === "string" 
        ? ChallengeDuration.fromString(data.duration)
        : data.duration,
      data.target,
      data.active || false,
      data.status as ChallengeStatus || ChallengeStatus.NOT_STARTED,
      data.progress || 0
    );
  }

  private static determineCategoryFromRaw(data: any): ChallengeCategory {
    if (data.type) {
      switch (data.type.toLowerCase()) {
        case "emotions": return ChallengeCategory.EMOTIONS;
        case "meditation": return ChallengeCategory.MEDITATION;
        case "journaling": return ChallengeCategory.JOURNALING;
        case "activity": return ChallengeCategory.ACTIVITY;
        default: return ChallengeCategory.EMOTIONS;
      }
    }
    return ChallengeCategory.EMOTIONS;
  }
}

// Entity for tracking user's challenge progress
export class UserChallengeProgress {
  constructor(
    public readonly userId: UserId,
    public readonly challengeId: ChallengeId,
    public readonly date: Date,
    public progress: number
  ) {}

  updateProgress(newProgress: number): void {
    this.progress = newProgress;
  }
}

// Value Object for challenge analytics
export class ChallengeStreak {
  constructor(
    public readonly challengeId: ChallengeId,
    public readonly currentStreak: number,
    public readonly longestStreak: number
  ) {}
}

// Value Object for challenge summary
export class ChallengeSummary {
  constructor(
    public readonly totalChallenges: number,
    public readonly activeChallenges: number,
    public readonly completedChallenges: number,
    public readonly abandonedChallenges: number,
    public readonly averageCompletionRate: number
  ) {}
}