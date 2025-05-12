/**
 * Pre-defined distress tolerance challenges
 * Teaches strategies for coping with intense emotions and difficult situations, 
 * tolerating uncomfortable experiences, reducing impulsive behaviors, 
 * and finding ways to make it through crises.
 */

export interface DistressToleranceChallengeData {
  id: number;
  title: string;
  description: string;
  frequency: string;
  difficulty: string;
  duration: string;
  target: number;
  active: boolean;
}

export const distressToleranceChallenges: DistressToleranceChallengeData[] = [
  {
    id: 601,
    title: "TIPP Skills Practice",
    description: "Use Temperature, Intense exercise, Paced breathing, and Progressive relaxation to reduce distress",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 602,
    title: "Radical Acceptance",
    description: "Practice accepting painful situations that cannot be changed",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 603,
    title: "Distraction Plan",
    description: "Create and implement a distraction plan when feeling overwhelmed",
    frequency: "As needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 604,
    title: "Self-Soothing Kit",
    description: "Create a kit with items that appeal to your five senses for soothing",
    frequency: "One-time",
    difficulty: "Easy",
    duration: "60 minutes",
    target: 1,
    active: false
  },
  {
    id: 605,
    title: "Pros and Cons",
    description: "Practice listing pros and cons of tolerating vs. not tolerating distress",
    frequency: "As needed",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 1,
    active: false
  },
  {
    id: 606,
    title: "Crisis Survival Strategies",
    description: "Practice one crisis survival strategy from your list",
    frequency: "As needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 607,
    title: "Cold Water Immersion",
    description: "Use cold water to reduce emotional intensity",
    frequency: "As needed",
    difficulty: "Medium",
    duration: "1 minute",
    target: 1,
    active: false
  },
  {
    id: 608,
    title: "Wise Mind ACCEPTS",
    description: "Use activities, contributing, comparisons, emotions, pushing away, thoughts, and sensations",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 609,
    title: "Half-Smile and Willing Hands",
    description: "Practice a half-smile and willing hands posture during difficult moments",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 610,
    title: "Coping Statements",
    description: "Create and practice repeating coping statements",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 611,
    title: "Improve the Moment",
    description: "Practice IMPROVE skills (Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement)",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 612,
    title: "Opposite Action",
    description: "Act opposite to emotional urges",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 613,
    title: "Willingness vs. Willfulness",
    description: "Notice and shift from willfulness to willingness",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 614,
    title: "Distress Thermometer",
    description: "Track distress levels throughout the day",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 3,
    active: false
  },
  {
    id: 615,
    title: "Turning the Mind",
    description: "Practice consciously turning your mind toward acceptance",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 616,
    title: "Urge Delay",
    description: "Delay acting on urges for a set period of time",
    frequency: "As needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 617,
    title: "Distress Tolerance Review",
    description: "Review which distress tolerance skills are most effective for you",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 618,
    title: "Mindful Acceptance",
    description: "Mindfully observe and accept distressing thoughts without judgment",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 619,
    title: "Paced Breathing",
    description: "Practice slow, deep breathing during stressful moments",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 620,
    title: "Practicing Flexibility",
    description: "Practice mental flexibility by considering alternative perspectives",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 621,
    title: "Grounding Techniques",
    description: "Use grounding techniques to stay connected to the present moment",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 622,
    title: "Self-Compassion Break",
    description: "Practice self-compassion during moments of suffering",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 623,
    title: "Progressive Muscle Relaxation",
    description: "Tense and relax muscle groups to reduce physical tension",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 624,
    title: "Safe Place Visualization",
    description: "Visualize a safe place when feeling overwhelmed",
    frequency: "As needed",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 625,
    title: "Crisis Plan Review",
    description: "Review and update your crisis plan",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    active: false
  }
];