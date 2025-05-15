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

export enum RiskLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export enum TimeFrame {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term'
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
  diagnosisInfo?: DiagnosisInfo;
  riskAssessments?: RiskAssessment[];
  progressTracking?: ProgressTracking[];
  dischargePlan?: DischargePlan;
  createdAt?: DateString;
  updatedAt?: DateString;
}

/**
 * DiagnosisInfo entity representing diagnostic information within a treatment plan
 */
export interface DiagnosisInfo {
  diagnosisCodes: string[]; // DSM-5 diagnosis codes
  presentingProblems: string[];
  mentalStatusEvaluation?: string;
  diagnosticFormulation?: string;
  diagnosisDate?: DateString;
}

/**
 * RiskAssessment entity representing a risk assessment within a treatment plan
 */
export interface RiskAssessment {
  assessmentDate: DateString;
  suicideRisk: RiskLevel;
  violenceRisk: RiskLevel;
  selfHarmRisk: RiskLevel;
  substanceAbuseRisk: RiskLevel;
  notes?: string;
  safetyPlan?: string;
}

/**
 * TreatmentGoal entity representing a goal within a treatment plan
 * Using SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound)
 */
export interface TreatmentGoal {
  description: string;
  specificMeasure: string; // What specifically will be measured
  achievementCriteria: string; // How achievement will be determined
  targetDate?: DateString;
  timeFrame: TimeFrame; // Short-term or long-term goal
  status: GoalStatus;
  progressMetrics?: string[]; // Metrics to track progress
  relevance?: string; // How this goal relates to overall treatment
  notes?: string;
}

/**
 * Assessment entity representing an assessment within a treatment plan
 */
export interface Assessment {
  name: string;
  type: string; // Standardized test, clinical interview, etc.
  date: DateString;
  score?: number;
  interpretation?: string;
  findings?: string[];
  recommendationsFromAssessment?: string[];
  notes?: string;
}

/**
 * Intervention entity representing an intervention within a treatment plan
 */
export interface Intervention {
  name: string;
  description: string;
  evidenceBase?: string; // Evidence basis for this intervention
  modality: string; // Individual, group, family
  frequency: string;
  duration: string;
  techniques?: string[];
  resources?: string[];
  notes?: string;
}

/**
 * ProgressTracking entity for tracking progress in treatment
 */
export interface ProgressTracking {
  date: DateString;
  goalsAddressed: string[];
  interventionsUsed: string[];
  progressRating: number; // Scale 1-10
  barriers?: string[];
  clientFeedback?: string;
  planAdjustments?: string;
  notes?: string;
}

/**
 * DischargePlan entity for planning client discharge
 */
export interface DischargePlan {
  criteria: string[];
  anticipatedDate?: DateString;
  aftercarePlan?: string;
  referrals?: string[];
  relapsePrevention?: string;
  warningSignsRecognition?: string[];
  supportResources?: string[];
  followUpSchedule?: string;
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