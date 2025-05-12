/**
 * Pre-defined emotions challenges
 */

export interface EmotionsChallengeData {
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
export const emotionsChallenges: EmotionsChallengeData[] = [
  {
    id: 101,
    title: "Emotion Tracking",
    description: "Track your emotions daily to increase emotional awareness",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  }
  // Additional challenges will be loaded from the existing UI
];