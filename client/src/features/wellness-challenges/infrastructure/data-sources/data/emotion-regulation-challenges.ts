/**
 * Pre-defined emotion regulation challenges
 * Helps individuals identify and manage their emotions effectively, 
 * reducing emotional reactivity and increasing positive emotional experiences.
 */

export interface EmotionRegulationChallengeData {
  id: number;
  title: string;
  description: string;
  frequency: string;
  difficulty: string;
  duration: string;
  target: number;
  active: boolean;
}

export const emotionRegulationChallenges: EmotionRegulationChallengeData[] = [
  {
    id: 701,
    title: "Emotion Identification",
    description: "Practice identifying and naming your emotions throughout the day",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All day",
    target: 3,
    active: false
  },
  {
    id: 702,
    title: "Emotion Log",
    description: "Track emotions, triggers, and responses in a structured log",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 703,
    title: "Opposite Action",
    description: "Act opposite to unhelpful emotion urges",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 704,
    title: "ABC PLEASE Skills",
    description: "Accumulate positive experiences, Build mastery, Cope ahead with emotion, treat Physical illness, Low vulnerability to emotion with balance Eating, Avoiding drugs, Sleep, and Exercise",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 705,
    title: "Checking the Facts",
    description: "Identify and challenge thoughts that intensify negative emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 706,
    title: "Positive Experience Building",
    description: "Intentionally engage in activities that create positive emotions",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "30 minutes",
    target: 30,
    active: false
  },
  {
    id: 707,
    title: "Vulnerability Reduction",
    description: "Identify and address factors that make you emotionally vulnerable",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 708,
    title: "Emotion Function Analysis",
    description: "Analyze what function your emotions serve in different situations",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "20 minutes",
    target: 20,
    active: false
  },
  {
    id: 709,
    title: "Non-Judgment Practice",
    description: "Practice observing emotions without judging them as good or bad",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 710,
    title: "Mindfulness of Current Emotion",
    description: "Practice mindfully observing emotions as they arise",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 711,
    title: "Self-Validation",
    description: "Practice validating your own emotional experiences",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 712,
    title: "Coping Ahead",
    description: "Prepare for emotionally difficult situations in advance",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 713,
    title: "Emotion Wave Surfing",
    description: "Practice riding the wave of emotion without acting on it",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 714,
    title: "Problem Solving",
    description: "Apply structured problem-solving to situations that trigger emotions",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    active: false
  },
  {
    id: 715,
    title: "Emotion Regulation Review",
    description: "Review which emotion regulation strategies work best for you",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 716,
    title: "Emotional Awareness Practice",
    description: "Practice noticing the physical sensations of emotions in your body",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 717,
    title: "Values Clarification",
    description: "Identify values to guide emotional responses and actions",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    active: false
  },
  {
    id: 718,
    title: "Emotion Effectiveness",
    description: "Evaluate whether your emotions are effective in different situations",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 719,
    title: "Self-Soothing Practice",
    description: "Practice self-soothing techniques when emotions are intense",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 720,
    title: "Emotional Vocabulary Building",
    description: "Expand your emotional vocabulary to describe feelings more precisely",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 721,
    title: "Primary vs. Secondary Emotions",
    description: "Practice identifying primary emotions versus secondary reactions",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 722,
    title: "Building Mastery",
    description: "Do something difficult each day that creates a sense of accomplishment",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    active: false
  },
  {
    id: 723,
    title: "Emotion Intensity Scale",
    description: "Use a 0-10 scale to rate emotion intensity and track changes",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 3,
    active: false
  },
  {
    id: 724,
    title: "Emotion Regulation Crisis Plan",
    description: "Create a step-by-step plan for managing emotional crises",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    active: false
  },
  {
    id: 725,
    title: "Positive Emotion Cultivation",
    description: "Deliberately cultivate positive emotions through activities and practices",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  }
];