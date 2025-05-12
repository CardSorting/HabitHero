/**
 * Domain Services for Wellness Challenge system
 * Contains pure business logic that doesn't fit into entities
 */

import { 
  ChallengeProgress, 
  DateString, 
  WellnessChallenge, 
  ChallengeFrequency,
  ChallengeStatus,
  ChallengeStreak
} from './models';

/**
 * Progress Calculation Service
 * Handles complex calculations related to challenge progress
 */
export class ProgressCalculationService {
  /**
   * Calculate the current completion percentage for a challenge
   */
  calculateCompletionPercentage(
    challenge: WellnessChallenge, 
    progressEntries: ChallengeProgress[]
  ): number {
    if (progressEntries.length === 0) return 0;
    
    const totalDays = this.calculateTotalDaysInChallenge(challenge);
    if (totalDays === 0) return 0;
    
    const completedDays = progressEntries.filter(entry => entry.value >= challenge.targetValue).length;
    return Math.round((completedDays / totalDays) * 100);
  }
  
  /**
   * Calculate the number of days in a challenge
   */
  calculateTotalDaysInChallenge(challenge: WellnessChallenge): number {
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    // Calculate days difference
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // Adjust based on frequency
    switch (challenge.frequency) {
      case ChallengeFrequency.DAILY:
        return diffDays;
      case ChallengeFrequency.WEEKLY:
        return Math.ceil(diffDays / 7);
      case ChallengeFrequency.MONTHLY:
        // Approximate months based on 30-day periods
        return Math.ceil(diffDays / 30);
      default:
        return diffDays;
    }
  }
  
  /**
   * Calculate days remaining in challenge
   */
  calculateDaysRemaining(challenge: WellnessChallenge): number {
    const currentDate = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (currentDate > endDate) return 0;
    
    const diffTime = Math.abs(endDate.getTime() - currentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Calculate the streak for a challenge
   */
  calculateStreak(progressEntries: ChallengeProgress[], targetValue: number): ChallengeStreak {
    if (progressEntries.length === 0) {
      return { challengeId: 0, currentStreak: 0, longestStreak: 0 };
    }
    
    // Sort by date in descending order (newest first)
    const sortedEntries = [...progressEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date();
    let lastCompletedDate: DateString | undefined;
    
    // Calculate current streak (consecutive days from present)
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const entryDate = new Date(entry.date);
      
      // For first entry
      if (i === 0) {
        // Check if the most recent entry is from today or yesterday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (!(entryDate >= yesterday && entryDate <= today)) {
          // The streak is broken if the most recent entry is not from today or yesterday
          break;
        }
        
        if (entry.value >= targetValue) {
          currentStreak = 1;
          lastCompletedDate = entry.date;
        }
        
        lastDate = entryDate;
        continue;
      }
      
      // Check for streak continuity
      const diffDays = this.daysBetween(lastDate, entryDate);
      
      if (diffDays === 1) {
        // Consecutive day
        if (entry.value >= targetValue) {
          currentStreak++;
          if (!lastCompletedDate) {
            lastCompletedDate = entry.date;
          }
        } else {
          // Target not met, streak broken
          break;
        }
      } else if (diffDays > 1) {
        // Gap in days, streak broken
        break;
      }
      
      lastDate = entryDate;
    }
    
    // Calculate longest streak
    sortedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      if (sortedEntries[i].value >= targetValue) {
        tempStreak++;
        
        if (i + 1 < sortedEntries.length) {
          const currentDate = new Date(sortedEntries[i].date);
          const nextDate = new Date(sortedEntries[i + 1].date);
          const diffDays = this.daysBetween(currentDate, nextDate);
          
          if (diffDays > 1) {
            // Gap in days, current streak ends
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        }
      } else {
        // Target not met, current streak ends
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    
    // Check final temp streak
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      challengeId: sortedEntries[0]?.challengeId || 0,
      currentStreak,
      longestStreak,
      lastCompletedDate
    };
  }
  
  /**
   * Calculate the number of days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    // Normalize dates to midnight
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    return Math.abs(Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)));
  }
}

/**
 * Challenge Status Service
 * Handles status transitions and validations
 */
export class ChallengeStatusService {
  /**
   * Check if a challenge can transition to a given status
   */
  canTransitionTo(currentStatus: ChallengeStatus, newStatus: ChallengeStatus): boolean {
    switch (currentStatus) {
      case ChallengeStatus.ACTIVE:
        // Active can transition to completed or abandoned
        return newStatus === ChallengeStatus.COMPLETED || newStatus === ChallengeStatus.ABANDONED;
      case ChallengeStatus.COMPLETED:
        // Completed can only go back to active
        return newStatus === ChallengeStatus.ACTIVE;
      case ChallengeStatus.ABANDONED:
        // Abandoned can be resumed to active
        return newStatus === ChallengeStatus.ACTIVE;
      default:
        return false;
    }
  }
  
  /**
   * Determine if a challenge should be auto-completed
   */
  shouldAutoComplete(challenge: WellnessChallenge, completionPercentage: number): boolean {
    // Auto-complete if end date has passed and completion percentage is 100%
    const currentDate = new Date();
    const endDate = new Date(challenge.endDate);
    
    return (
      challenge.status === ChallengeStatus.ACTIVE &&
      currentDate > endDate &&
      completionPercentage === 100
    );
  }
  
  /**
   * Check if a challenge should be marked as abandoned
   */
  shouldMarkAbandoned(challenge: WellnessChallenge, lastProgressDate?: DateString): boolean {
    if (challenge.status !== ChallengeStatus.ACTIVE) return false;
    
    const currentDate = new Date();
    const abandonmentThresholdDays = 14; // Two weeks of inactivity
    
    // Check if challenge has ended
    const endDate = new Date(challenge.endDate);
    if (currentDate > endDate) return true;
    
    // Check last activity
    if (lastProgressDate) {
      const lastActivityDate = new Date(lastProgressDate);
      const diffTime = currentDate.getTime() - lastActivityDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > abandonmentThresholdDays;
    }
    
    // If no progress at all, check creation date
    const creationDate = new Date(challenge.createdAt);
    const diffTime = currentDate.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > abandonmentThresholdDays;
  }
}