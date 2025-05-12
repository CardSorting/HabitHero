/**
 * Pre-defined journaling challenges
 */

export interface JournalingChallengeData {
  id: number;
  title: string;
  description: string;
  frequency: string;
  difficulty: string;
  duration: string;
  target: number;
  active: boolean;
}

// The challenge data is already defined in the WellnessChallengeCategory.tsx file
// This is a placeholder to integrate with our new architecture
export const journalingChallenges: JournalingChallengeData[] = [
  {
    id: 301,
    title: "Gratitude Journal",
    description: "Write down three things you're grateful for each day",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 1,
    active: false
  }
  // Additional challenges will be loaded from the existing UI
];