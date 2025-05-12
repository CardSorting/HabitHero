/**
 * Pre-defined activity challenges
 */

export interface ActivityChallengeData {
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
export const activityChallenges: ActivityChallengeData[] = [
  {
    id: 401,
    title: "Daily Walking",
    description: "Take a short walk to improve physical and mental health",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    active: false
  }
  // Additional challenges will be loaded from the existing UI
];