/**
 * Treatment Plan Detail Page
 * Displays comprehensive information about a specific treatment plan
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  Goal,
  AlertTriangle,
  Stethoscope,
  Activity,
  CheckCircle,
  ListChecks
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useTherapistContext } from '../hooks/useTherapistContext';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { useClientDetails } from '../../application/hooks/useClientDetails';
import { TreatmentPlanStatus, RiskLevel, GoalStatus, TimeFrame } from '../../domain/entities';

// Format date utility
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Not specified';
  try {
    return format(new Date(dateStr), 'PP');
  } catch (error) {
    return 'Invalid date';
  }
};

// Get risk level color
const getRiskLevelColor = (level: RiskLevel | undefined) => {
  if (!level) return 'bg-gray-100 text-gray-800';
  
  switch (level) {
    case RiskLevel.NONE:
      return 'bg-green-100 text-green-800';
    case RiskLevel.LOW:
      return 'bg-blue-100 text-blue-800';
    case RiskLevel.MODERATE:
      return 'bg-yellow-100 text-yellow-800';
    case RiskLevel.HIGH:
      return 'bg-orange-100 text-orange-800';
    case RiskLevel.SEVERE:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get goal status color
const getGoalStatusColor = (status: GoalStatus) => {
  switch (status) {
    case GoalStatus.NOT_STARTED:
      return 'bg-gray-100 text-gray-800';
    case GoalStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case GoalStatus.ACHIEVED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get time frame label
const getTimeFrameLabel = (timeFrame: TimeFrame) => {
  switch (timeFrame) {
    case TimeFrame.SHORT_TERM:
      return 'Short Term';
    case TimeFrame.MEDIUM_TERM:
      return 'Medium Term';
    case TimeFrame.LONG_TERM:
      return 'Long Term';
    default:
      return timeFrame;
  }
};

export default function TreatmentPlanDetail() {
  const [, setLocation] = useLocation();
  const { clientId, planId } = useParams<{ clientId: string; planId: string }>();
  const { therapistId } = useTherapistContext();
  const clientIdNum = parseInt(clientId, 10);
  const planIdNum = parseInt(planId, 10);
  
  // Fetch client details
  const { client, isLoading: isLoadingClient } = useClientDetails(clientIdNum);
  
  // Fetch treatment plans
  const {
    plans,
    isLoadingPlans,
    isPlansError,
    getPlanById,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ clientId: clientIdNum, therapistId });
  
  // Get the current plan
  const plan = getPlanById(planIdNum);
  
  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteTreatmentPlan(planIdNum);
      toast({
        title: "Success",
        description: "Treatment plan has been deleted.",
        variant: "default",
      });
      setLocation(`/therapist/clients/${clientId}/treatment-plans`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete treatment plan.",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    setLocation(`/therapist/clients/${clientId}/treatment-plans/${planId}/edit`);
  };
  
  // Handle back
  const handleBack = () => {
    setLocation(`/therapist/clients/${clientId}/treatment-plans`);
  };
  
  // Error state
  if (isPlansError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Error</h1>
        </div>
        <div className="p-6 bg-destructive/10 rounded-lg">
          <p>An error occurred while loading data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoadingPlans || isLoadingClient || !plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64 ml-2" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-md" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">
            {plan.title}
          </h1>
          <Badge 
            className={`ml-3 ${
              plan.status === TreatmentPlanStatus.ACTIVE 
                ? 'bg-green-100 text-green-800' 
                : plan.status === TreatmentPlanStatus.COMPLETED 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
            }`}
            variant="outline"
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the treatment plan "{plan.title}".
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Client info */}
      <div className="mb-6 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium">Client:</span> {client?.fullName || client?.username}
            </p>
            {client?.email && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span> {client.email}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium">Start Date:</span> {formatDate(plan.startDate)}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">End Date:</span> {formatDate(plan.endDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium">Created:</span> {formatDate(plan.createdAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Last Updated:</span> {formatDate(plan.updatedAt)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Plan description */}
      {plan.description && (
        <div className="mb-6 p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Overview</h2>
          <p className="text-sm">{plan.description}</p>
        </div>
      )}
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="diagnosis" className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="diagnosis" className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Assessment & Diagnosis</span>
            <span className="md:hidden">Diagnosis</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Risk Assessment</span>
            <span className="md:hidden">Risk</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <Goal className="h-4 w-4 mr-2" />
            <span>Goals</span>
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Interventions</span>
            <span className="md:hidden">Methods</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center">
            <ListChecks className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Progress & Discharge</span>
            <span className="md:hidden">Progress</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Assessment & Diagnosis */}
        <TabsContent value="diagnosis">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assessment & Diagnosis</h2>
            
            {plan.diagnosisInfo ? (
              <div className="space-y-4">
                {/* Diagnosis Codes */}
                {plan.diagnosisInfo.diagnosisCodes && plan.diagnosisInfo.diagnosisCodes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Diagnosis Codes</h3>
                    <div className="flex flex-wrap gap-2">
                      {plan.diagnosisInfo.diagnosisCodes.map((code, idx) => (
                        <Badge key={idx} variant="outline">{code}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Presenting Problems */}
                {plan.diagnosisInfo.presentingProblems && plan.diagnosisInfo.presentingProblems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Presenting Problems</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {plan.diagnosisInfo.presentingProblems.map((problem, idx) => (
                        <li key={idx}>{problem}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Mental Status Evaluation */}
                {plan.diagnosisInfo.mentalStatusEvaluation && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mental Status Evaluation</h3>
                    <p className="text-sm">{plan.diagnosisInfo.mentalStatusEvaluation}</p>
                  </div>
                )}
                
                {/* Diagnostic Formulation */}
                {plan.diagnosisInfo.diagnosticFormulation && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Diagnostic Formulation</h3>
                    <p className="text-sm">{plan.diagnosisInfo.diagnosticFormulation}</p>
                  </div>
                )}
                
                {/* Diagnosis Date */}
                {plan.diagnosisInfo.diagnosisDate && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Diagnosis Date</h3>
                    <p className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(plan.diagnosisInfo.diagnosisDate)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No diagnosis information available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Risk Assessment */}
        <TabsContent value="risk">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            
            {plan.riskAssessment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suicide Risk */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex justify-between items-center">
                        <span>Suicide Risk</span>
                        <Badge 
                          className={getRiskLevelColor(plan.riskAssessment.suicideRisk)}
                          variant="outline"
                        >
                          {plan.riskAssessment.suicideRisk || 'Not Assessed'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {plan.riskAssessment.suicideAssessment || 'No assessment details provided'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Self-Harm Risk */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex justify-between items-center">
                        <span>Self-Harm Risk</span>
                        <Badge 
                          className={getRiskLevelColor(plan.riskAssessment.selfHarmRisk)}
                          variant="outline"
                        >
                          {plan.riskAssessment.selfHarmRisk || 'Not Assessed'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {plan.riskAssessment.selfHarmAssessment || 'No assessment details provided'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Violence Risk */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex justify-between items-center">
                        <span>Violence Risk</span>
                        <Badge 
                          className={getRiskLevelColor(plan.riskAssessment.violenceRisk)}
                          variant="outline"
                        >
                          {plan.riskAssessment.violenceRisk || 'Not Assessed'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {plan.riskAssessment.violenceAssessment || 'No assessment details provided'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Substance Use Risk */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex justify-between items-center">
                        <span>Substance Use Risk</span>
                        <Badge 
                          className={getRiskLevelColor(plan.riskAssessment.substanceUseRisk)}
                          variant="outline"
                        >
                          {plan.riskAssessment.substanceUseRisk || 'Not Assessed'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {plan.riskAssessment.substanceUseAssessment || 'No assessment details provided'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Additional Risk Assessment Notes */}
                {plan.riskAssessment.notes && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
                    <p className="text-sm">{plan.riskAssessment.notes}</p>
                  </div>
                )}
                
                {/* Safety Plan */}
                {plan.riskAssessment.safetyPlan && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Safety Plan</h3>
                    <p className="text-sm">{plan.riskAssessment.safetyPlan}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No risk assessment information available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Treatment Goals */}
        <TabsContent value="goals">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Goals</h2>
            
            {plan.goals && plan.goals.length > 0 ? (
              <div className="space-y-4">
                {plan.goals.map((goal, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">Goal {idx + 1}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={getGoalStatusColor(goal.status as GoalStatus)}
                            variant="outline"
                          >
                            {goal.status === GoalStatus.NOT_STARTED ? 'Not Started' : 
                             goal.status === GoalStatus.IN_PROGRESS ? 'In Progress' : 
                             goal.status === GoalStatus.ACHIEVED ? 'Achieved' : goal.status}
                          </Badge>
                          <Badge variant="outline">
                            {getTimeFrameLabel(goal.timeFrame as TimeFrame)}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{goal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Specific Measure</h4>
                          <p className="text-sm">{goal.specificMeasure}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Achievement Criteria</h4>
                          <p className="text-sm">{goal.achievementCriteria}</p>
                        </div>
                        {goal.targetDate && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Target Date</h4>
                            <p className="text-sm flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(goal.targetDate)}
                            </p>
                          </div>
                        )}
                        {goal.objective && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Objective</h4>
                            <p className="text-sm">{goal.objective}</p>
                          </div>
                        )}
                        {goal.intervention && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Intervention</h4>
                            <p className="text-sm">{goal.intervention}</p>
                          </div>
                        )}
                        {goal.relevance && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Relevance</h4>
                            <p className="text-sm">{goal.relevance}</p>
                          </div>
                        )}
                      </div>
                      {goal.notes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          <p className="text-sm">{goal.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No treatment goals defined</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Interventions */}
        <TabsContent value="interventions">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Interventions & Methods</h2>
            
            {plan.interventions && plan.interventions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.interventions.map((intervention, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">{intervention.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {intervention.description && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm">{intervention.description}</p>
                        </div>
                      )}
                      {intervention.frequency && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium mb-1">Frequency</h4>
                          <p className="text-sm">{intervention.frequency}</p>
                        </div>
                      )}
                      {intervention.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          <p className="text-sm">{intervention.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No treatment interventions defined</p>
              </div>
            )}
            
            {/* Assessments */}
            {plan.assessments && plan.assessments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Assessments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.assessments.map((assessment, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{assessment.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {assessment.date && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Date</h4>
                              <p className="text-sm flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(assessment.date)}
                              </p>
                            </div>
                          )}
                          {assessment.score && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Score</h4>
                              <p className="text-sm">{assessment.score}</p>
                            </div>
                          )}
                        </div>
                        {assessment.notes && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p className="text-sm">{assessment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Progress & Discharge */}
        <TabsContent value="progress">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Progress Tracking & Discharge Planning</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Tracking */}
              <div>
                <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
                
                {plan.progressTracking ? (
                  <div className="space-y-4">
                    {plan.progressTracking.measurementTools && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Measurement Tools</h4>
                        <p className="text-sm">{plan.progressTracking.measurementTools}</p>
                      </div>
                    )}
                    {plan.progressTracking.progressMetrics && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Progress Metrics</h4>
                        <p className="text-sm">{plan.progressTracking.progressMetrics}</p>
                      </div>
                    )}
                    {plan.progressTracking.progressNotes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Progress Notes</h4>
                        <p className="text-sm">{plan.progressTracking.progressNotes}</p>
                      </div>
                    )}
                    {plan.progressTracking.treatmentBarriers && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Treatment Barriers</h4>
                        <p className="text-sm">{plan.progressTracking.treatmentBarriers}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No progress tracking information available</p>
                  </div>
                )}
              </div>
              
              {/* Discharge Plan */}
              <div>
                <h3 className="text-lg font-medium mb-4">Discharge Planning</h3>
                
                {plan.dischargePlan ? (
                  <div className="space-y-4">
                    {plan.dischargePlan.completionCriteria && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Completion Criteria</h4>
                        <p className="text-sm">{plan.dischargePlan.completionCriteria}</p>
                      </div>
                    )}
                    {plan.dischargePlan.expectedOutcomes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Expected Outcomes</h4>
                        <p className="text-sm">{plan.dischargePlan.expectedOutcomes}</p>
                      </div>
                    )}
                    {plan.dischargePlan.relapsePrevention && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Relapse Prevention</h4>
                        <p className="text-sm">{plan.dischargePlan.relapsePrevention}</p>
                      </div>
                    )}
                    {plan.dischargePlan.followUpPlan && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Follow-up Plan</h4>
                        <p className="text-sm">{plan.dischargePlan.followUpPlan}</p>
                      </div>
                    )}
                    {plan.dischargePlan.transitionOfCare && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Transition of Care</h4>
                        <p className="text-sm">{plan.dischargePlan.transitionOfCare}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No discharge planning information available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}