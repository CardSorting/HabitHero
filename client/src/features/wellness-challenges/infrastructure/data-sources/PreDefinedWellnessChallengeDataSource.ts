/**
 * Implementation of WellnessChallengeDataSource for pre-defined challenges
 * This provides a clean, maintainable way to manage challenge data without hardcoding
 */

import { ChallengeCategory, WellnessChallenge, WellnessChallengeFactory } from "../../domain/models";
import { WellnessChallengeDataSource } from "../../domain/repositories";
import { emotionsChallenges } from "./data/emotions-challenges";
import { meditationChallenges } from "./data/meditation-challenges";
import { journalingChallenges } from "./data/journaling-challenges";
import { activityChallenges } from "./data/activity-challenges";
import { mindfulnessChallenges } from "./data/mindfulness-challenges";
import { distressToleranceChallenges } from "./data/distress-tolerance-challenges";
import { emotionRegulationChallenges } from "./data/emotion-regulation-challenges";
import { interpersonalEffectivenessChallenges } from "./data/interpersonal-effectiveness-challenges";

export class PreDefinedWellnessChallengeDataSource implements WellnessChallengeDataSource {
  // Map to store challenges by category for efficient lookup
  private challengesByCategory: Map<ChallengeCategory, WellnessChallenge[]>;
  
  constructor() {
    this.challengesByCategory = new Map();
    this.initializeChallenges();
  }
  
  private initializeChallenges(): void {
    // Convert raw data to domain model objects
    this.challengesByCategory.set(
      ChallengeCategory.EMOTIONS, 
      emotionsChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw, 
        category: ChallengeCategory.EMOTIONS
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.MEDITATION,
      meditationChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.MEDITATION
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.JOURNALING,
      journalingChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.JOURNALING
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.ACTIVITY,
      activityChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.ACTIVITY
      }))
    );
    
    // New categories
    this.challengesByCategory.set(
      ChallengeCategory.MINDFULNESS,
      mindfulnessChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.MINDFULNESS
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.DISTRESS_TOLERANCE,
      distressToleranceChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.DISTRESS_TOLERANCE
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.EMOTION_REGULATION,
      emotionRegulationChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.EMOTION_REGULATION
      }))
    );
    
    this.challengesByCategory.set(
      ChallengeCategory.INTERPERSONAL_EFFECTIVENESS,
      interpersonalEffectivenessChallenges.map(raw => WellnessChallengeFactory.createFromRaw({
        ...raw,
        category: ChallengeCategory.INTERPERSONAL_EFFECTIVENESS
      }))
    );
  }
  
  async getChallengesByCategory(category: ChallengeCategory): Promise<WellnessChallenge[]> {
    return this.challengesByCategory.get(category) || [];
  }
  
  async getAllChallenges(): Promise<WellnessChallenge[]> {
    // Combine all challenges from all categories
    const allChallenges: WellnessChallenge[] = [];
    
    for (const challenges of this.challengesByCategory.values()) {
      allChallenges.push(...challenges);
    }
    
    return allChallenges;
  }
}