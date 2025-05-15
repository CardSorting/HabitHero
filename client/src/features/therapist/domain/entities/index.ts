/**
 * Domain entities for the Therapist feature
 */

// Type definitions
export type ID = number;
export type DateString = string;
export type TimeString = string;

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated'
}

export enum TreatmentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum GoalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved'
}

/**
 * TherapistClient entity representing the relationship between a therapist and a client
 */
export interface TherapistClient {
  id: ID;
  therapistId: ID;
  clientId: ID;
  startDate: DateString;
  endDate?: DateString;
  status: ClientStatus;
  notes?: string;
  createdAt?: DateString;
  updatedAt?: DateString;
  // Navigation properties (populated by repositories as needed)
  client?: Client;
}

/**
 * Client entity representing a user who is a client
 */
export interface Client {
  id: ID;
  username: string;
  email?: string;
  fullName?: string;
  role: 'client';
  createdAt?: DateString;
  // Summary statistics - populated by repositories when needed
  emotionsCount?: number;
  crisisEventsCount?: number;
  lastEmotionEntryDate?: DateString;
  lastCrisisEventDate?: DateString;
}

/**
 * TherapistNote entity representing a note created by a therapist about a client
 */
export interface TherapistNote {
  id: ID;
  therapistId: ID;
  clientId: ID;
  sessionDate: DateString;
  content: string;
  mood?: string;
  progress?: string;
  goalCompletion?: number;
  isPrivate: boolean;
  createdAt?: DateString;
  updatedAt?: DateString;
}

/**
 * TreatmentPlan entity representing a treatment plan created by a therapist for a client
 */
export interface TreatmentPlan {
  id: ID;
  therapistId: ID;
  clientId: ID;
  title: string;
  description?: string;
  startDate: DateString;
  endDate?: DateString;
  status: TreatmentPlanStatus;
  goals?: TreatmentGoal[];
  assessments?: Assessment[];
  interventions?: Intervention[];
  createdAt?: DateString;
  updatedAt?: DateString;
}

/**
 * TreatmentGoal entity representing a goal within a treatment plan
 */
export interface TreatmentGoal {
  description: string;
  targetDate?: DateString;
  status: GoalStatus;
  notes?: string;
}

/**
 * Assessment entity representing an assessment within a treatment plan
 */
export interface Assessment {
  name: string;
  date: DateString;
  score?: number;
  notes?: string;
}

/**
 * Intervention entity representing an intervention within a treatment plan
 */
export interface Intervention {
  name: string;
  description: string;
  frequency: string;
  notes?: string;
}

/**
 * ClientSummary entity providing a summary of a client for the therapist dashboard
 */
export interface ClientSummary {
  id: ID;
  username: string;
  fullName?: string;
  email?: string;
  startDate: DateString;
  status: ClientStatus;
  lastActivity?: DateString;
  notes?: string;
  emotionsCount: number;
  crisisEventsCount: number;
  wellnessChallengesCount: number;
}

/**
 * ClientAnalytics entity providing analytics data about a client for the therapist
 */
export interface ClientAnalytics {
  clientId: ID;
  emotionTrends: EmotionTrend[];
  crisisEvents: CrisisEventSummary;
  treatmentProgress: TreatmentProgressSummary;
  wellnessChallenges: WellnessChallengeSummary;
}

/**
 * EmotionTrend entity representing trends of emotions over time
 */
export interface EmotionTrend {
  date: DateString;
  emotions: Array<{
    name: string;
    intensity: number;
    categoryId: string;
  }>;
  averageIntensity: number;
}

/**
 * CrisisEvent entity representing a crisis event
 */
export interface CrisisEvent {
  id: ID;
  userId: ID;
  date: DateString;
  time?: TimeString;
  type: string;
  intensity: string;
  duration?: number;
  location?: string;
  triggers?: string[];
  symptoms?: string[];
  copingStrategiesUsed?: string[];
  copingStrategyEffectiveness?: number;
  notes?: string;
  createdAt?: DateString;
  updatedAt?: DateString;
}

/**
 * CrisisEventSummary entity providing a summary of crisis events
 */
export interface CrisisEventSummary {
  count: number;
  byType: Record<string, number>;
  byIntensity: Record<string, number>;
  recentEvents: CrisisEvent[];
  events?: CrisisEvent[]; // All crisis events, not just recent ones
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * TreatmentProgressSummary entity providing a summary of treatment plan progress
 */
export interface TreatmentProgressSummary {
  activePlans: number;
  completedPlans: number;
  goalsAchieved: number;
  totalGoals: number;
}

/**
 * WellnessChallengeSummary entity providing a summary of wellness challenges
 */
export interface WellnessChallengeSummary {
  active: number;
  completed: number;
  abandonedCount: number;
  completionRate: number;
}