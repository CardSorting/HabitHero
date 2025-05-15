/**
 * Form component for creating and editing treatment plans
 * Following SOLID principles, DDD, and Clean Architecture
 */
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  TreatmentPlan, 
  TreatmentGoal, 
  ID, 
  DateString,
  TreatmentPlanStatus,
  Assessment,
  Intervention,
  GoalStatus
} from '../../domain/entities';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  CalendarIcon,
  Plus,
  Trash2,
  Target,
  ClipboardList,
  Activity,
  KeyRound,
} from 'lucide-react';

// Form schema validation
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['active', 'completed', 'abandoned']),
  
  // Diagnosis Information
  diagnosisInfo: z.object({
    diagnosisCodes: z.array(z.string()).min(1, 'At least one diagnosis code is required'),
    presentingProblems: z.array(z.string()).min(1, 'At least one presenting problem is required'),
    mentalStatusEvaluation: z.string().optional(),
    diagnosticFormulation: z.string().optional(),
    diagnosisDate: z.date().optional(),
  }).optional(),
  
  // Risk Assessments
  riskAssessments: z.array(
    z.object({
      assessmentDate: z.date(),
      suicideRisk: z.enum(['none', 'low', 'moderate', 'high', 'extreme']),
      violenceRisk: z.enum(['none', 'low', 'moderate', 'high', 'extreme']),
      selfHarmRisk: z.enum(['none', 'low', 'moderate', 'high', 'extreme']),
      substanceAbuseRisk: z.enum(['none', 'low', 'moderate', 'high', 'extreme']),
      notes: z.string().optional(),
      safetyPlan: z.string().optional(),
    })
  ).optional(),
  
  // SMART Treatment Goals
  goals: z.array(
    z.object({
      description: z.string().min(3, 'Goal description must be at least 3 characters'),
      specificMeasure: z.string().min(3, 'Specify how this goal will be measured'),
      achievementCriteria: z.string().min(3, 'Define criteria for achievement'),
      targetDate: z.date().optional(),
      timeFrame: z.enum(['short_term', 'long_term']),
      status: z.enum(['pending', 'in_progress', 'achieved']),
      progressMetrics: z.array(z.string()).optional(),
      relevance: z.string().optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  
  // Assessments
  assessments: z.array(
    z.object({
      name: z.string().min(2, 'Assessment name must be at least 2 characters'),
      type: z.string(),
      date: z.date(),
      score: z.coerce.number().optional(),
      interpretation: z.string().optional(),
      findings: z.array(z.string()).optional(),
      recommendationsFromAssessment: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  
  // Evidence-based Interventions
  interventions: z.array(
    z.object({
      name: z.string().min(2, 'Intervention name must be at least 2 characters'),
      description: z.string().min(3, 'Intervention description must be at least 3 characters'),
      evidenceBase: z.string().optional(),
      modality: z.string(),
      frequency: z.string(),
      duration: z.string(),
      techniques: z.array(z.string()).optional(),
      resources: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  
  // Progress Tracking
  progressTracking: z.array(
    z.object({
      date: z.date(),
      goalsAddressed: z.array(z.string()),
      interventionsUsed: z.array(z.string()),
      progressRating: z.number().min(1).max(10),
      barriers: z.array(z.string()).optional(),
      clientFeedback: z.string().optional(),
      planAdjustments: z.string().optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  
  // Discharge Planning
  dischargePlan: z.object({
    criteria: z.array(z.string()).min(1, 'At least one discharge criterion is required'),
    anticipatedDate: z.date().optional(),
    aftercarePlan: z.string().optional(),
    referrals: z.array(z.string()).optional(),
    relapsePrevention: z.string().optional(),
    warningSignsRecognition: z.array(z.string()).optional(),
    supportResources: z.array(z.string()).optional(),
    followUpSchedule: z.string().optional(),
  }).optional(),
});

interface TreatmentPlanFormProps {
  clientId: ID;
  therapistId: ID;
  initialData?: TreatmentPlan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form component for creating and editing treatment plans
 */
const TreatmentPlanForm: React.FC<TreatmentPlanFormProps> = ({
  clientId,
  therapistId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  // Set default form values
  const defaultValues = initialData
    ? {
        ...initialData,
        startDate: new Date(initialData.startDate),
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        goals: initialData.goals?.map(goal => ({
          ...goal,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined
        })) || [],
        assessments: initialData.assessments?.map(assessment => ({
          ...assessment,
          date: new Date(assessment.date)
        })) || [],
        interventions: initialData.interventions || []
      }
    : {
        title: '',
        description: '',
        startDate: new Date(),
        status: 'active' as TreatmentPlanStatus,
        goals: [],
        assessments: [],
        interventions: []
      };
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Field arrays for dynamic fields
  const { 
    fields: goalFields, 
    append: appendGoal, 
    remove: removeGoal 
  } = useFieldArray({
    control: form.control,
    name: 'goals',
  });
  
  const { 
    fields: assessmentFields, 
    append: appendAssessment, 
    remove: removeAssessment 
  } = useFieldArray({
    control: form.control,
    name: 'assessments',
  });
  
  const { 
    fields: interventionFields, 
    append: appendIntervention, 
    remove: removeIntervention 
  } = useFieldArray({
    control: form.control,
    name: 'interventions',
  });
  
  // Add a new goal
  const handleAddGoal = () => {
    appendGoal({
      description: '',
      status: GoalStatus.PENDING,
      notes: '',
    });
  };
  
  // Add a new assessment
  const handleAddAssessment = () => {
    appendAssessment({
      name: '',
      date: new Date(),
      notes: '',
    });
  };
  
  // Add a new intervention
  const handleAddIntervention = () => {
    appendIntervention({
      name: '',
      description: '',
      frequency: 'daily',
      notes: '',
    });
  };
  
  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Transform dates to ISO strings for API
    const transformedData = {
      ...values,
      clientId,
      therapistId,
      startDate: values.startDate.toISOString().split('T')[0],
      endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined,
      goals: values.goals?.map(goal => ({
        ...goal,
        targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : undefined,
      })),
      assessments: values.assessments?.map(assessment => ({
        ...assessment,
        date: assessment.date.toISOString().split('T')[0],
      }))
    };
    
    onSubmit(transformedData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
          </TabsList>
          
          {/* Basic Details Tab */}
          <TabsContent value="details" className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Treatment Plan Title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for the treatment plan
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
                      placeholder="Detailed description of the treatment plan" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive description of the treatment plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-3">
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
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
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
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
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
                          disabled={(date) =>
                            date < new Date(form.getValues("startDate"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="abandoned">Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Treatment Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Define specific goals for this treatment plan
                </p>
              </div>
              <Button 
                type="button" 
                onClick={handleAddGoal} 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Goal
              </Button>
            </div>
            
            {goalFields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No goals added yet. Click "Add Goal" to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goalFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeGoal(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`goals.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Goal Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Describe the goal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`goals.${index}.targetDate`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Target Date (Optional)</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full pl-3 text-left font-normal"
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
                                      disabled={(date) =>
                                        date < new Date(form.getValues("startDate"))
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
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
                                      <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="achieved">Achieved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`goals.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional notes about this goal" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Assessments</h3>
                <p className="text-sm text-muted-foreground">
                  Add assessments to track progress
                </p>
              </div>
              <Button 
                type="button" 
                onClick={handleAddAssessment} 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Assessment
              </Button>
            </div>
            
            {assessmentFields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No assessments added yet. Click "Add Assessment" to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessmentFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeAssessment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`assessments.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assessment Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Name of the assessment" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`assessments.${index}.date`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Assessment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full pl-3 text-left font-normal"
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
                          
                          <FormField
                            control={form.control}
                            name={`assessments.${index}.score`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Score (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Assessment score" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`assessments.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional notes about this assessment" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Interventions</h3>
                <p className="text-sm text-muted-foreground">
                  Define interventions to be used in this treatment plan
                </p>
              </div>
              <Button 
                type="button" 
                onClick={handleAddIntervention} 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Intervention
              </Button>
            </div>
            
            {interventionFields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No interventions added yet. Click "Add Intervention" to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interventionFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeIntervention(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`interventions.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Intervention Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Name of the intervention" {...field} />
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
                                  placeholder="Describe the intervention" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`interventions.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="as_needed">As needed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`interventions.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional notes about this intervention" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TreatmentPlanForm;