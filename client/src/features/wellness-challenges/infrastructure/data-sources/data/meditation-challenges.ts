/**
 * Pre-defined meditation challenges
 */

export interface MeditationChallengeData {
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
export const meditationChallenges: MeditationChallengeData[] = [
  {
    id: 201,
    title: "Breath Focus",
    description: "Focus on your breath for a set period of time",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  }
  // Additional challenges will be loaded from the existing UI
];