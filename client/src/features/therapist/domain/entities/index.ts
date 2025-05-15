/**
 * Domain entities for therapist features
 * Following SOLID principles, DDD, and Clean Architecture
 */

// Common types
export type ID = number;

// Treatment Plan Status
export enum TreatmentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

// Goal Status
export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved'
}

// Time Frame
export enum TimeFrame {
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term'
}

// Risk Level
export enum RiskLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe'
}

// Goal Entity
export interface Goal {
  description: string;
  specificMeasure: string;
  achievementCriteria: string;
  targetDate?: string;
  timeFrame: TimeFrame;
  status: GoalStatus;
  objective?: string;
  intervention?: string;
  relevance?: string;
  notes?: string;
}

// Intervention Entity
export interface Intervention {
  name: string;
  description?: string;
  frequency?: string;
  notes?: string;
}

// Assessment Entity
export interface Assessment {
  name: string;
  date?: string;
  score?: string;
  notes?: string;
}

// Diagnosis Info Entity
export interface DiagnosisInfo {
  diagnosisCodes?: string[];
  presentingProblems?: string[];
  mentalStatusEvaluation?: string;
  diagnosticFormulation?: string;
  diagnosisDate?: string;
}

// Risk Assessment Entity
export interface RiskAssessment {
  suicideRisk?: RiskLevel;
  suicideAssessment?: string;
  selfHarmRisk?: RiskLevel;
  selfHarmAssessment?: string;
  violenceRisk?: RiskLevel;
  violenceAssessment?: string;
  substanceUseRisk?: RiskLevel;
  substanceUseAssessment?: string;
  notes?: string;
  safetyPlan?: string;
}

// Progress Tracking Entity
export interface ProgressTracking {
  measurementTools?: string;
  progressMetrics?: string;
  progressNotes?: string;
  treatmentBarriers?: string;
}

// Discharge Plan Entity
export interface DischargePlan {
  completionCriteria?: string;
  expectedOutcomes?: string;
  relapsePrevention?: string;
  followUpPlan?: string;
  transitionOfCare?: string;
}

// Treatment Plan Aggregate Root
export interface TreatmentPlan {
  id: ID;
  clientId: ID;
  therapistId: ID;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: TreatmentPlanStatus;
  
  // Components
  diagnosisInfo?: DiagnosisInfo;
  riskAssessment?: RiskAssessment;
  goals?: Goal[];
  interventions?: Intervention[];
  assessments?: Assessment[];
  progressTracking?: ProgressTracking;
  dischargePlan?: DischargePlan;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Client Summary Entity
export interface ClientSummary {
  id: ID;
  userId: ID;
  username: string;
  email?: string;
  fullName?: string;
  lastActivity?: string;
}

// Therapist Note Entity
export interface TherapistNote {
  id: ID;
  therapistId: ID;
  clientId: ID;
  title: string;
  content: string;
  sessionDate: string;
  visibility: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}