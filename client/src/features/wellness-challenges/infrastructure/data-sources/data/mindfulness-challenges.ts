/**
 * Pre-defined mindfulness challenges
 * Focuses on developing awareness of the present moment, accepting thoughts and feelings without judgment, 
 * and improving emotional regulation.
 */

export interface MindfulnessChallengeData {
  id: number;
  title: string;
  description: string;
  frequency: string;
  difficulty: string;
  duration: string;
  target: number;
  active: boolean;
}

export const mindfulnessChallenges: MindfulnessChallengeData[] = [
  {
    id: 501,
    title: "Mindful Breathing",
    description: "Focus on your breath for 5 minutes, noticing the sensation of breathing",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 502,
    title: "Body Scan Practice",
    description: "Progressively focus attention on different parts of your body",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 503,
    title: "Mindful Eating",
    description: "Eat one meal without distractions, focusing on taste, texture, and sensations",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    active: false
  },
  {
    id: 504,
    title: "Mindful Walking",
    description: "Walk slowly and deliberately, paying attention to each step and movement",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 505,
    title: "Thought Observation",
    description: "Observe your thoughts without judgment, noticing patterns",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 506,
    title: "Five Senses Exercise",
    description: "Notice five things you can see, hear, feel, smell, and taste",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 507,
    title: "Mindful Listening",
    description: "Listen to music or sounds with complete attention to detail",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 508,
    title: "STOP Practice",
    description: "Stop, Take a breath, Observe, Proceed mindfully",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "1 minute",
    target: 5,
    active: false
  },
  {
    id: 509,
    title: "Mindful Technology Use",
    description: "Use technology intentionally and with awareness",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All day",
    target: 1,
    active: false
  },
  {
    id: 510,
    title: "Loving-Kindness Meditation",
    description: "Cultivate feelings of compassion for yourself and others",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 511,
    title: "Mindful Showering",
    description: "Pay attention to the sensations of water, temperature, and cleaning",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 512,
    title: "Mindful Gratitude",
    description: "Consciously notice and appreciate positive aspects of your day",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    active: false
  },
  {
    id: 513,
    title: "Mindful Communication",
    description: "Practice fully present and conscious conversations",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 514,
    title: "Reality Acceptance",
    description: "Practice accepting reality as it is without judgment",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 515,
    title: "Mindful Cleaning",
    description: "Turn cleaning into a meditative practice",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    active: false
  },
  {
    id: 516,
    title: "Thought Defusion",
    description: "Practice separating yourself from your thoughts",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 517,
    title: "Mindful Waiting",
    description: "Use waiting time as an opportunity to practice mindfulness",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 518,
    title: "Sky Gazing",
    description: "Mindfully watch clouds or stars to expand awareness",
    frequency: "Weekly",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 519,
    title: "Mindful Tea Ceremony",
    description: "Prepare and drink tea with full awareness",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 520,
    title: "Mindful Stretching",
    description: "Stretch while paying attention to body sensations",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 521,
    title: "Mindful Breaks",
    description: "Take short mindful breaks throughout your workday",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "3 minutes",
    target: 5,
    active: false
  },
  {
    id: 522,
    title: "Urge Surfing",
    description: "Observe cravings or urges without acting on them",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    active: false
  },
  {
    id: 523,
    title: "Environmental Awareness",
    description: "Notice the details of your surroundings with curiosity",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    active: false
  },
  {
    id: 524,
    title: "Beginner's Mind Practice",
    description: "Approach familiar situations as if experiencing them for the first time",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    active: false
  },
  {
    id: 525,
    title: "Conscious Transitions",
    description: "Bring awareness to transitions between activities",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "2 minutes",
    target: 5,
    active: false
  }
];