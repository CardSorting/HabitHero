/**
 * Treatment Plan Detail Page
 * Provides comprehensive view of a single treatment plan
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useTherapistService } from '../hooks';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { 
  TreatmentPlan, 
  TreatmentPlanStatus, 
  GoalStatus, 
  ID 
} from '../../domain/entities';

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

// Icons
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  Brain,
  FileText,
  Target,
  AlertCircle,
  Home,
  Pencil,
  Trash2,
  Check,
  BarChart4,
  Stethoscope,
  Lightbulb,
  ClipboardCheck,
  Activity,
  TimerReset
} from 'lucide-react';

const TreatmentPlanDetail: React.FC = () => {
  const params = useParams<{ clientId: string, planId: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : 0;
  const planId = params.planId ? parseInt(params.planId, 10) : 0;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const therapistService = useTherapistService();
  
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    plans,
    isLoadingPlans,
    updateTreatmentPlan,
    isUpdating,
    deleteTreatmentPlan,
    isDeleting
  } = useTreatmentPlans({ 
    clientId, 
    therapistId: user?.id || 0 
  });
  
  // Current plan data
  const plan = plans?.find(p => p.id === planId);
  
  // Fetch client details on component mount
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!user?.id || !clientId) return;
      
      try {
        setIsLoadingClient(true);
        setErrorMessage(null);
        
        // Verify authorization for this client
        const isAuthorized = await therapistService.isAuthorizedForClient(user.id, clientId);
        
        if (!isAuthorized) {
          setErrorMessage('You are not authorized to view this client.');
          setIsLoadingClient(false);
          return;
        }
        
        // Fetch client details
        const clientData = await therapistService.getClientById(user.id, clientId);
        
        if (!clientData) {
          setErrorMessage('Client not found.');
          setIsLoadingClient(false);
          return;
        }
        
        setClientDetails(clientData);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setErrorMessage('An error occurred while fetching client details.');
      } finally {
        setIsLoadingClient(false);
      }
    };
    
    fetchClientDetails();
  }, [clientId, user?.id, therapistService]);
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };
  
  // Calculate completion percentage based on goals
  const calculateCompletionPercentage = (plan?: TreatmentPlan) => {
    if (!plan?.goals || plan.goals.length === 0) return 0;
    
    const achievedGoals = plan.goals.filter(goal => goal.status === GoalStatus.ACHIEVED).length;
    return Math.round((achievedGoals / plan.goals.length) * 100);
  };
  
  // Handle plan deletion 
  const handleDeletePlan = () => {
    if (planId) {
      deleteTreatmentPlan(planId);
      navigate(`/therapist/clients/${clientId}/treatment-plans`);
    }
  };
  
  // Handle plan edit
  const handleEditPlan = () => {
    navigate(`/therapist/clients/${clientId}/treatment-plans/${planId}/edit`);
  };
  
  // Handle back to plans list
  const handleBackToPlans = () => {
    navigate(`/therapist/clients/${clientId}/treatment-plans`);
  };
  
  // Get status badge styling
  const getStatusBadge = (status?: TreatmentPlanStatus) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case TreatmentPlanStatus.ACTIVE:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case TreatmentPlanStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case TreatmentPlanStatus.ABANDONED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Abandoned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get goal status badge
  const getGoalStatusBadge = (status?: GoalStatus) => {
    if (!status) return <Badge variant="outline">Not Started</Badge>;
    
    switch (status) {
      case GoalStatus.ACHIEVED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Achieved</Badge>;
      case GoalStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case GoalStatus.NOT_STARTED:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/therapist">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href="/therapist/clients">
                Clients
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {clientDetails && (
              <>
                <BreadcrumbItem>
                  <Link href={`/therapist/clients/${clientId}`}>
                    {clientDetails.fullName || clientDetails.username}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <Link href={`/therapist/clients/${clientId}/treatment-plans`}>
                Treatment Plans
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{plan?.title || 'Plan Details'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Back Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-6"
        onClick={handleBackToPlans}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> 
        Back to Treatment Plans
      </Button>
      
      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading State */}
      {(isLoadingClient || isLoadingPlans) ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : plan ? (
        <>
          {/* Plan Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {plan.title}
                  </h1>
                  <div className="ml-3">
                    {getStatusBadge(plan.status)}
                  </div>
                </div>
                <p className="text-muted-foreground mt-1">
                  {plan.description || 'No description provided'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditPlan}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit Plan
                </Button>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
              </div>
            </div>
          </div>
          
          {/* Plan Data */}
          <div className="mb-6">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(plan.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(plan.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Goals</p>
                      <p className="text-sm text-muted-foreground">{plan.goals?.length || 0} goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Progress</p>
                      <p className="text-sm text-muted-foreground">{calculateCompletionPercentage(plan)}% complete</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Progress 
                    value={calculateCompletionPercentage(plan)} 
                    className="h-2.5"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="overview" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="diagnosis" className="flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  <span>Diagnosis</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  <span>Goals</span>
                </TabsTrigger>
                <TabsTrigger value="interventions" className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  <span>Interventions</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  <span>Progress</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Plan Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Description</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.description || 'No description provided.'}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Status</h3>
                          <div>
                            {getStatusBadge(plan.status)}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Timeline</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(plan.startDate)} to {formatDate(plan.endDate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Progress Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Goals Progress</h3>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Progress 
                              value={calculateCompletionPercentage(plan)} 
                              className="h-2 flex-1 mr-2"
                            />
                            <span>{calculateCompletionPercentage(plan)}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Goals Breakdown</h3>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex flex-col items-center justify-center p-2 bg-green-50 rounded-md">
                              <span className="font-medium text-green-700">
                                {plan.goals?.filter(g => g.status === GoalStatus.ACHIEVED).length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">Achieved</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-blue-50 rounded-md">
                              <span className="font-medium text-blue-700">
                                {plan.goals?.filter(g => g.status === GoalStatus.IN_PROGRESS).length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">In Progress</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-yellow-50 rounded-md">
                              <span className="font-medium text-yellow-700">
                                {plan.goals?.filter(g => g.status === GoalStatus.NOT_STARTED).length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">Not Started</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Recent Activity</h3>
                          <p className="text-sm text-muted-foreground">
                            No recent activity recorded.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Diagnosis Tab */}
              <TabsContent value="diagnosis">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnosis & Assessment</CardTitle>
                    <CardDescription>
                      Client diagnosis information and assessment findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plan.diagnosisInfo ? (
                      <div className="space-y-6">
                        {/* Diagnosis Codes */}
                        <div>
                          <h3 className="text-md font-medium mb-2">Diagnosis Codes</h3>
                          {plan.diagnosisInfo.diagnosisCodes && plan.diagnosisInfo.diagnosisCodes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {plan.diagnosisInfo.diagnosisCodes.map((code, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No diagnosis codes provided.</p>
                          )}
                        </div>
                        
                        {/* Presenting Problems */}
                        <div>
                          <h3 className="text-md font-medium mb-2">Presenting Problems</h3>
                          {plan.diagnosisInfo.presentingProblems && plan.diagnosisInfo.presentingProblems.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {plan.diagnosisInfo.presentingProblems.map((problem, index) => (
                                <li key={index} className="text-sm">
                                  {problem}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No presenting problems provided.</p>
                          )}
                        </div>
                        
                        {/* Mental Status Evaluation */}
                        <div>
                          <h3 className="text-md font-medium mb-2">Mental Status Evaluation</h3>
                          <p className="text-sm">
                            {plan.diagnosisInfo.mentalStatusEvaluation || 'No mental status evaluation provided.'}
                          </p>
                        </div>
                        
                        {/* Diagnostic Formulation */}
                        <div>
                          <h3 className="text-md font-medium mb-2">Diagnostic Formulation</h3>
                          <p className="text-sm">
                            {plan.diagnosisInfo.diagnosticFormulation || 'No diagnostic formulation provided.'}
                          </p>
                        </div>
                        
                        {/* Risk Assessments */}
                        {plan.riskAssessments && plan.riskAssessments.length > 0 && (
                          <div>
                            <h3 className="text-md font-medium mb-2">Risk Assessment</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Risk Type</TableHead>
                                  <TableHead>Level</TableHead>
                                  <TableHead>Date Assessed</TableHead>
                                  <TableHead>Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {plan.riskAssessments.map((assessment, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{assessment.riskType}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={
                                        assessment.level === 'none' ? 'bg-green-50 text-green-700 border-green-200' : 
                                        assessment.level === 'low' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        assessment.level === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        assessment.level === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-red-50 text-red-700 border-red-200'
                                      }>
                                        {assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                                    <TableCell>{assessment.notes || 'No notes'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No diagnosis information available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Goals Tab */}
              <TabsContent value="goals">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Goals</CardTitle>
                    <CardDescription>
                      SMART goals for this treatment plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plan.goals && plan.goals.length > 0 ? (
                      <div className="space-y-4">
                        {plan.goals.map((goal, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className={`h-1 w-full ${
                              goal.status === GoalStatus.ACHIEVED ? 'bg-green-500' :
                              goal.status === GoalStatus.IN_PROGRESS ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Target className="h-5 w-5 text-primary mr-2" />
                                      <h3 className="font-medium">{goal.description}</h3>
                                    </div>
                                    <div>
                                      {getGoalStatusBadge(goal.status)}
                                    </div>
                                  </div>
                                  
                                  <div className="pl-7 space-y-3">
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Specific Measure</h4>
                                      <p className="text-sm">{goal.specificMeasure || 'Not specified'}</p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Achievement Criteria</h4>
                                      <p className="text-sm">{goal.achievementCriteria || 'Not specified'}</p>
                                    </div>
                                    
                                    {goal.notes && (
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                                        <p className="text-sm">{goal.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="md:min-w-[180px] flex flex-row md:flex-col gap-4 md:gap-2">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Target Date</h4>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                                      <span className="text-sm">{formatDate(goal.targetDate)}</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Time Frame</h4>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {goal.timeFrame === 'short_term' ? 'Short-term' : 'Long-term'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No goals have been set for this treatment plan.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Interventions Tab */}
              <TabsContent value="interventions">
                <Card>
                  <CardHeader>
                    <CardTitle>Interventions & Methods</CardTitle>
                    <CardDescription>
                      Therapeutic interventions and methods used in treatment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plan.interventions && plan.interventions.length > 0 ? (
                      <div className="space-y-4">
                        {plan.interventions.map((intervention, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center">
                                    <Lightbulb className="h-5 w-5 text-primary mr-2" />
                                    <h3 className="font-medium">{intervention.name}</h3>
                                  </div>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {intervention.frequency || 'As needed'}
                                  </Badge>
                                </div>
                                
                                {intervention.description && (
                                  <div className="pl-7">
                                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                    <p className="text-sm">{intervention.description}</p>
                                  </div>
                                )}
                                
                                {intervention.notes && (
                                  <div className="pl-7">
                                    <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                                    <p className="text-sm">{intervention.notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No interventions have been defined for this treatment plan.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Progress Tab */}
              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Tracking</CardTitle>
                    <CardDescription>
                      Monitor client progress over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plan.progressTracking && plan.progressTracking.length > 0 ? (
                      <div className="space-y-6">
                        {plan.progressTracking.map((progress, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Progress Entry #{index + 1}</CardTitle>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {formatDate(progress.date)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Progress Rating */}
                              <div>
                                <h3 className="text-sm font-medium mb-1">Progress Rating</h3>
                                <div className="flex items-center">
                                  <div className="relative w-full max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden mr-2">
                                    <div 
                                      className="absolute inset-y-0 left-0 bg-primary" 
                                      style={{ width: `${(progress.progressRating / 10) * 100}%` }} 
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{progress.progressRating}/10</span>
                                </div>
                              </div>
                              
                              {/* Goals Addressed */}
                              {progress.goalsAddressed && progress.goalsAddressed.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Goals Addressed</h3>
                                  <div className="flex flex-wrap gap-1">
                                    {progress.goalsAddressed.map((goal, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {goal}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Interventions Used */}
                              {progress.interventionsUsed && progress.interventionsUsed.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Interventions Used</h3>
                                  <div className="flex flex-wrap gap-1">
                                    {progress.interventionsUsed.map((intervention, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-secondary text-secondary-foreground border-secondary/20">
                                        {intervention}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Barriers */}
                              {progress.barriers && progress.barriers.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Barriers to Progress</h3>
                                  <div className="flex flex-wrap gap-1">
                                    {progress.barriers.map((barrier, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                        {barrier}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Client Feedback */}
                              {progress.clientFeedback && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Client Feedback</h3>
                                  <p className="text-sm text-muted-foreground">{progress.clientFeedback}</p>
                                </div>
                              )}
                              
                              {/* Plan Adjustments */}
                              {progress.planAdjustments && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Plan Adjustments</h3>
                                  <p className="text-sm text-muted-foreground">{progress.planAdjustments}</p>
                                </div>
                              )}
                              
                              {/* Notes */}
                              {progress.notes && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Additional Notes</h3>
                                  <p className="text-sm text-muted-foreground">{progress.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No progress tracking entries have been recorded yet.</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={handleEditPlan}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Progress Entry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Treatment Plan</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this treatment plan? This action cannot be undone and all plan data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeletePlan}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Treatment plan not found.</p>
            <Button
              variant="outline"
              onClick={handleBackToPlans}
              className="mt-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Treatment Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreatmentPlanDetail;