/**
 * Domain models for the Crisis Tracker feature
 */

// Type definitions

export enum CrisisType {
  PANIC_ATTACK = 'panic_attack',
  EMOTIONAL_CRISIS = 'emotional_crisis',
  SUICIDAL_THOUGHTS = 'suicidal_thoughts',
  SELF_HARM_URGE = 'self_harm_urge',
  SUBSTANCE_URGE = 'substance_urge',
  OTHER = 'other'
}

export enum CrisisIntensity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  EXTREME = 'extreme'
}

// Common symptoms experienced during crisis events
export const CommonPanicSymptoms = [
  'Chest pain',
  'Racing heart',
  'Shortness of breath',
  'Choking sensation',
  'Dizziness/lightheadedness',
  'Sweating',
  'Nausea',
  'Trembling/shaking',
  'Chills or hot flashes',
  'Numbness/tingling sensations',
  'Feeling of unreality',
  'Fear of losing control',
  'Fear of dying'
];

// Common triggers for crisis events
export const CommonCrisisTriggers = [
  'Social situation',
  'Conflict',
  'Rejection',
  'Work stress',
  'Financial stress',
  'Health concerns',
  'Criticism',
  'Trauma reminder',
  'Substance use',
  'Isolation',
  'Physical discomfort',
  'Sleep deprivation',
  'Environmental (noise, crowds, etc.)'
];

// Common coping strategies for crisis management
export const CommonCopingStrategies = [
  'Deep breathing',
  'Grounding techniques',
  'Progressive muscle relaxation',
  'Mindfulness meditation',
  'Crisis hotline call',
  'Talking to a friend/family member',
  'Distraction activities',
  'Self-soothing techniques',
  'TIPP skills (DBT)',
  'Physical exercise',
  'Opposite action (DBT)',
  'Radical acceptance (DBT)',
  'Medication use'
];

// Domain Entities

/**
 * Crisis Event entity representing a panic attack or emotional crisis.
 */
export interface CrisisEvent {
  id?: number;
  userId: number;
  type: CrisisType;
  date: string;
  time?: string;
  intensity: CrisisIntensity;
  duration?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  helpSought: boolean;
  medication: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Crisis Analytics data structure for statistics and insights
 */
export interface CrisisAnalytics {
  totalEvents: number;
  eventsPerType: {[key: string]: number};
  eventsPerIntensity: {[key: string]: number};
  commonTriggers: {trigger: string, count: number}[];
  commonSymptoms: {symptom: string, count: number}[];
  effectiveCopingStrategies: {strategy: string, averageEffectiveness: number}[];
  timeOfDayDistribution: {timeRange: string, count: number}[];
  intensityTrend: {date: string, averageIntensity: number}[];
}

/**
 * Crisis Summary data representing period-based statistics (day/week/month/year)
 */
export interface CrisisTimePeriodSummary {
  period: 'day' | 'week' | 'month' | 'year';
  totalEvents: number;
  averageIntensity: number;
  mostCommonType: string;
  mostCommonTriggers: string[];
  mostEffectiveStrategies: string[];
  comparedToPrevious: {
    percentChange: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }
}