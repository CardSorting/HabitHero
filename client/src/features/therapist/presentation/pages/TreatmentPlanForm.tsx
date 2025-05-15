/**
 * Treatment Plan Form Page
 * Provides a dedicated page for creating and editing treatment plans
 * Following SOLID principles, DDD, Clean Architecture, and CQRS pattern
 */
import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { useTherapistContext } from '../hooks/useTherapistContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { 
  TreatmentPlan, 
  TreatmentPlanStatus, 
  GoalStatus,
  TimeFrame,
  RiskLevel
} from '../../domain/entities';

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { 
  Calendar as CalendarIcon, 
  ArrowLeft,
  Target,
  Activity,
  FileText,
  Brain,
  Clipboard,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Trash2,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(["active", "completed", "abandoned"]),
  
  // Assessment & Diagnosis
  diagnosisInfo: z.object({
    diagnosisCodes: z.array(z.string().optional()).optional(),
    presentingProblems: z.array(z.string().optional()).optional(),
    mentalStatusEvaluation: z.string().optional(),
    diagnosticFormulation: z.string().optional(),
    diagnosisDate: z.date().optional(),
  }).optional(),
  
  // Risk Assessment
  riskAssessment: z.object({
    suicideRisk: z.enum(["none", "low", "moderate", "high", "severe"]).optional(),
    suicideAssessment: z.string().optional(),
    selfHarmRisk: z.enum(["none", "low", "moderate", "high", "severe"]).optional(),
    selfHarmAssessment: z.string().optional(),
    violenceRisk: z.enum(["none", "low", "moderate", "high", "severe"]).optional(),
    violenceAssessment: z.string().optional(),
    substanceUseRisk: z.enum(["none", "low", "moderate", "high", "severe"]).optional(),
    substanceUseAssessment: z.string().optional(),
    notes: z.string().optional(),
    safetyPlan: z.string().optional(),
  }).optional(),
  
  // Goals
  goals: z.array(z.object({
    description: z.string(),
    specificMeasure: z.string(),
    achievementCriteria: z.string(),
    targetDate: z.date().optional(),
    timeFrame: z.enum(["short_term", "medium_term", "long_term"]),
    status: z.enum(["not_started", "in_progress", "achieved"]),
    objective: z.string().optional(),
    intervention: z.string().optional(),
    relevance: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  
  // Interventions
  interventions: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    frequency: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  
  // Progress Tracking
  progressTracking: z.object({
    measurementTools: z.string().optional(),
    progressMetrics: z.string().optional(),
    progressNotes: z.string().optional(),
    treatmentBarriers: z.string().optional(),
  }).optional(),
  
  // Discharge Plan
  dischargePlan: z.object({
    completionCriteria: z.string().optional(),
    expectedOutcomes: z.string().optional(),
    relapsePrevention: z.string().optional(),
    followUpPlan: z.string().optional(),
    transitionOfCare: z.string().optional(),
  }).optional(),
});

/**
 * Smart page component for creating/editing treatment plans
 */
const TreatmentPlanForm: React.FC = () => {
  const [, navigate] = useLocation();
  const { planId, clientId } = useParams<{ planId?: string, clientId: string }>();
  const { therapistId } = useTherapistContext();
  const [cancelDialog, setCancelDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const isEditMode = !!planId;
  
  const {
    getPlanById,
    isLoadingPlan,
    createTreatmentPlan,
    isCreating,
    updateTreatmentPlan,
    isUpdating
  } = useTreatmentPlans({ 
    clientId: parseInt(clientId, 10), 
    therapistId 
  });
  
  // Fetch existing plan if in edit mode
  const existingPlan = isEditMode ? getPlanById(parseInt(planId, 10)) : null;
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingPlan ? {
      title: existingPlan.title,
      description: existingPlan.description || '',
      startDate: new Date(existingPlan.startDate),
      endDate: existingPlan.endDate ? new Date(existingPlan.endDate) : undefined,
      status: existingPlan.status,
      diagnosisInfo: existingPlan.diagnosisInfo || {
        diagnosisCodes: [],
        presentingProblems: [],
        mentalStatusEvaluation: '',
        diagnosticFormulation: '',
        diagnosisDate: undefined,
      },
      riskAssessment: existingPlan.riskAssessment || {
        suicideRisk: 'none',
        selfHarmRisk: 'none',
        violenceRisk: 'none',
        substanceUseRisk: 'none',
      },
      goals: existingPlan.goals || [],
      interventions: existingPlan.interventions || [],
      progressTracking: existingPlan.progressTracking || {
        measurementTools: '',
        progressMetrics: '',
        progressNotes: '',
        treatmentBarriers: '',
      },
      dischargePlan: existingPlan.dischargePlan || {
        completionCriteria: '',
        expectedOutcomes: '',
        relapsePrevention: '',
        followUpPlan: '',
        transitionOfCare: '',
      },
    } : {
      title: '',
      description: '',
      startDate: new Date(),
      status: 'active' as TreatmentPlanStatus,
      diagnosisInfo: {
        diagnosisCodes: [''],
        presentingProblems: [''],
        mentalStatusEvaluation: '',
        diagnosticFormulation: '',
      },
      riskAssessment: {
        suicideRisk: 'none' as RiskLevel,
        selfHarmRisk: 'none' as RiskLevel,
        violenceRisk: 'none' as RiskLevel,
        substanceUseRisk: 'none' as RiskLevel,
        notes: '',
      },
      goals: [
        {
          description: '',
          specificMeasure: '',
          achievementCriteria: '',
          timeFrame: 'short_term' as TimeFrame,
          status: 'not_started' as GoalStatus,
        }
      ],
      interventions: [
        {
          name: '',
          description: '',
          frequency: '',
        }
      ],
      progressTracking: {
        measurementTools: '',
        progressMetrics: '',
        progressNotes: '',
        treatmentBarriers: '',
      },
      dischargePlan: {
        completionCriteria: '',
        expectedOutcomes: '',
        relapsePrevention: '',
        followUpPlan: '',
        transitionOfCare: '',
      },
    }
  });
  
  // Field arrays for repeatable sections
  const { 
    fields: goalFields, 
    append: appendGoal, 
    remove: removeGoal 
  } = useFieldArray({
    control: form.control,
    name: "goals",
  });
  
  const { 
    fields: interventionFields, 
    append: appendIntervention, 
    remove: removeIntervention 
  } = useFieldArray({
    control: form.control,
    name: "interventions",
  });
  
  const {
    fields: diagnosisCodeFields,
    append: appendDiagnosisCode,
    remove: removeDiagnosisCode
  } = useFieldArray({
    control: form.control,
    name: "diagnosisInfo.diagnosisCodes",
  });
  
  const {
    fields: presentingProblemFields,
    append: appendPresentingProblem,
    remove: removePresentingProblem
  } = useFieldArray({
    control: form.control,
    name: "diagnosisInfo.presentingProblems",
  });
  
  // Loading state
  if (isEditMode && isLoadingPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  // Not found state for edit mode
  if (isEditMode && !existingPlan) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Treatment Plan Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The treatment plan you're trying to edit doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate(`/therapist/clients/${clientId}/treatment-plans`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Treatment Plans
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      clientId: parseInt(clientId, 10),
      therapistId,
    };
    
    if (isEditMode && planId) {
      updateTreatmentPlan({ 
        id: parseInt(planId, 10), 
        updates: formattedValues 
      }).then(() => {
        navigate(`/therapist/clients/${clientId}/treatment-plans/${planId}`);
      });
    } else {
      createTreatmentPlan(formattedValues).then((newPlan) => {
        navigate(`/therapist/clients/${clientId}/treatment-plans/${newPlan.id}`);
      });
    }
  };
  
  // Navigate back handler
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/therapist/clients/${clientId}/treatment-plans/${planId}`);
    } else {
      navigate(`/therapist/clients/${clientId}/treatment-plans`);
    }
  };
  
  // Helper for tab navigation
  const goToNextTab = () => {
    const tabs = ['basic', 'assessment', 'goals', 'interventions', 'progress', 'discharge'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  const goToPreviousTab = () => {
    const tabs = ['basic', 'assessment', 'goals', 'interventions', 'progress', 'discharge'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCancelDialog(true)}
            className="mb-1 -ml-3 text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Plans
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit' : 'Create'} Treatment Plan</h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update this treatment plan with new information'
              : 'Create a new treatment plan for your client'}
          </p>
        </div>
      </div>
      
      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">
                <FileText className="mr-2 h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="assessment">
                <Brain className="mr-2 h-4 w-4" />
                Assessment
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Target className="mr-2 h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="interventions">
                <Activity className="mr-2 h-4 w-4" />
                Interventions
              </TabsTrigger>
              <TabsTrigger value="progress">
                <Clipboard className="mr-2 h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="discharge">
                <CheckCircle className="mr-2 h-4 w-4" />
                Discharge
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the core details of the treatment plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter treatment plan title" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this treatment plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a description of this treatment plan" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief overview of the treatment plan's purpose
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the plan begins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => 
                                  // Disable dates before start date
                                  form.getValues("startDate") && 
                                  date < form.getValues("startDate")
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the plan is expected to end (if known)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="abandoned">Abandoned</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Current status of the treatment plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancelDialog(true)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Assessment Tab */}
            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment & Diagnosis</CardTitle>
                  <CardDescription>
                    Enter assessment information and diagnostic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Diagnosis Codes */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Diagnosis Codes</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendDiagnosisCode('')}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Code
                      </Button>
                    </div>
                    
                    {diagnosisCodeFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`diagnosisInfo.diagnosisCodes.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder="Enter DSM-5/ICD-10 code or diagnosis" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDiagnosisCode(index)}
                          disabled={diagnosisCodeFields.length === 1}
                          className="mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Presenting Problems */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Presenting Problems</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPresentingProblem('')}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Problem
                      </Button>
                    </div>
                    
                    {presentingProblemFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`diagnosisInfo.presentingProblems.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder="Enter presenting problem or symptom" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePresentingProblem(index)}
                          disabled={presentingProblemFields.length === 1}
                          className="mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mental Status Evaluation */}
                  <FormField
                    control={form.control}
                    name="diagnosisInfo.mentalStatusEvaluation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mental Status Evaluation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter mental status assessment information" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Document appearance, behavior, cognition, thought processes, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Diagnostic Formulation */}
                  <FormField
                    control={form.control}
                    name="diagnosisInfo.diagnosticFormulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnostic Formulation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter diagnostic formulation and assessment summary" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Summarize diagnostic impressions and clinical reasoning
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Risk Assessment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Risk Assessment</h3>
                    
                    {/* Suicide Risk */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.suicideRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suicide Risk</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="suicide-none" />
                                <Label htmlFor="suicide-none">None</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="suicide-low" />
                                <Label htmlFor="suicide-low">Low</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderate" id="suicide-moderate" />
                                <Label htmlFor="suicide-moderate">Moderate</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="suicide-high" />
                                <Label htmlFor="suicide-high">High</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="severe" id="suicide-severe" />
                                <Label htmlFor="suicide-severe">Severe</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="riskAssessment.suicideAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suicide Risk Assessment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about suicide risk assessment" 
                              {...field} 
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Self-Harm Risk */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.selfHarmRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Self-Harm Risk</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="selfharm-none" />
                                <Label htmlFor="selfharm-none">None</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="selfharm-low" />
                                <Label htmlFor="selfharm-low">Low</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderate" id="selfharm-moderate" />
                                <Label htmlFor="selfharm-moderate">Moderate</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="selfharm-high" />
                                <Label htmlFor="selfharm-high">High</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="severe" id="selfharm-severe" />
                                <Label htmlFor="selfharm-severe">Severe</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="riskAssessment.selfHarmAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Self-Harm Risk Assessment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about self-harm risk assessment" 
                              {...field} 
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Violence Risk */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.violenceRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Violence Risk</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="violence-none" />
                                <Label htmlFor="violence-none">None</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="violence-low" />
                                <Label htmlFor="violence-low">Low</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderate" id="violence-moderate" />
                                <Label htmlFor="violence-moderate">Moderate</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="violence-high" />
                                <Label htmlFor="violence-high">High</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="severe" id="violence-severe" />
                                <Label htmlFor="violence-severe">Severe</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="riskAssessment.violenceAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Violence Risk Assessment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about violence risk assessment" 
                              {...field} 
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Substance Use Risk */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.substanceUseRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Substance Use Risk</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="substance-none" />
                                <Label htmlFor="substance-none">None</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="substance-low" />
                                <Label htmlFor="substance-low">Low</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderate" id="substance-moderate" />
                                <Label htmlFor="substance-moderate">Moderate</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="substance-high" />
                                <Label htmlFor="substance-high">High</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="severe" id="substance-severe" />
                                <Label htmlFor="substance-severe">Severe</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="riskAssessment.substanceUseAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Substance Use Risk Assessment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about substance use risk assessment" 
                              {...field} 
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* General Risk Notes */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Risk Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any additional risk assessment notes" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Safety Plan */}
                    <FormField
                      control={form.control}
                      name="riskAssessment.safetyPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Plan</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter safety plan details if applicable" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Document safety planning strategies, crisis contacts, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Goals</CardTitle>
                  <CardDescription>
                    Define SMART goals for treatment outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalFields.length > 0 ? (
                    <div className="space-y-8">
                      {goalFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Goal {index + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGoal(index)}
                              disabled={goalFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`goals.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Goal Description</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter a specific, measurable goal" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`goals.${index}.specificMeasure`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specific Measure</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="How will this goal be measured?" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`goals.${index}.achievementCriteria`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Achievement Criteria</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Criteria for goal achievement" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`goals.${index}.timeFrame`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time Frame</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select time frame" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="short_term">Short-Term</SelectItem>
                                      <SelectItem value="medium_term">Medium-Term</SelectItem>
                                      <SelectItem value="long_term">Long-Term</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`goals.${index}.targetDate`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Target Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`goals.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="achieved">Achieved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`goals.${index}.objective`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Objective</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Enter objective details" 
                                      {...field}
                                      rows={2}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`goals.${index}.intervention`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Intervention Method</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="How will this goal be addressed?" 
                                      {...field}
                                      rows={2}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`goals.${index}.relevance`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Clinical Relevance</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Why is this goal clinically relevant?" 
                                      {...field}
                                      rows={2}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`goals.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Additional notes about this goal" 
                                      {...field}
                                      rows={2}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Goals Added Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Define SMART treatment goals to track progress and provide clear direction for treatment.
                      </p>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendGoal({
                      description: '',
                      specificMeasure: '',
                      achievementCriteria: '',
                      timeFrame: 'short_term' as TimeFrame,
                      status: 'not_started' as GoalStatus,
                    })}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Interventions Tab */}
            <TabsContent value="interventions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interventions & Methods</CardTitle>
                  <CardDescription>
                    Define therapeutic techniques and interventions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interventionFields.length > 0 ? (
                    <div className="space-y-6">
                      {interventionFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Intervention {index + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIntervention(index)}
                              disabled={interventionFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`interventions.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Intervention Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter intervention name or technique" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`interventions.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this intervention in detail" 
                                    {...field}
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`interventions.${index}.frequency`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Frequency</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="How often will this intervention be used?" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`interventions.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Additional notes about this intervention" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Interventions Added Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Define therapeutic interventions and techniques that will be used in treatment.
                      </p>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendIntervention({
                      name: '',
                      description: '',
                      frequency: '',
                    })}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Intervention
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Progress Tracking Tab */}
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>
                    Define how progress will be measured and tracked
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="progressTracking.measurementTools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Measurement Tools</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List assessment tools, scales, or measures used to track progress" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify instruments and methods used to assess progress
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="progressTracking.progressMetrics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress Metrics</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe specific metrics and benchmarks for progress" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Outline how progress will be quantified and measured
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="progressTracking.progressNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Document ongoing progress and observations" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Note any observations about client progress
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="progressTracking.treatmentBarriers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Barriers</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Document any obstacles to treatment progress" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Identify factors that may impede treatment progress
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Discharge Planning Tab */}
            <TabsContent value="discharge" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Discharge Planning</CardTitle>
                  <CardDescription>
                    Define criteria for completion and follow-up
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dischargePlan.completionCriteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completion Criteria</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define specific criteria for treatment completion" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Outline concrete benchmarks that indicate treatment completion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dischargePlan.expectedOutcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Outcomes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe expected treatment outcomes at completion" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Document anticipated results of successful treatment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dischargePlan.relapsePrevention"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relapse Prevention</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Document strategies to prevent relapse after discharge" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Outline specific strategies to maintain gains and prevent relapse
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dischargePlan.followUpPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-Up Plan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe follow-up sessions and monitoring after discharge" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify post-treatment follow-up schedule and methods
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dischargePlan.transitionOfCare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transition of Care</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Document any referrals or transitions to other providers" 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Outline plans for continuity of care with other providers if applicable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="bg-primary"
                  >
                    {isEditMode ? (
                      isUpdating ? 'Updating...' : 'Update Plan'
                    ) : (
                      isCreating ? 'Creating...' : 'Create Plan'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
      
      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Label component for RadioGroup
const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
};

export default TreatmentPlanForm;