/**
 * Crisis Tracker Form Component
 * Allows users to log crisis/panic events with detailed information
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCrisisTracker } from '../hooks/useCrisisTracker';
import { 
  CrisisType, 
  CrisisIntensity, 
  CommonPanicSymptoms, 
  CommonCrisisTriggers, 
  CommonCopingStrategies 
} from '../../domain/models';

// UI Components
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, AlertCircle } from 'lucide-react';

// Form validation schema
const crisisFormSchema = z.object({
  type: z.nativeEnum(CrisisType, {
    required_error: "Please select a crisis type",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().optional(),
  intensity: z.nativeEnum(CrisisIntensity, {
    required_error: "Please select an intensity level",
  }),
  duration: z.number().min(1).max(1440).optional(),
  notes: z.string().max(1000).optional(),
  symptoms: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  copingStrategiesUsed: z.array(z.string()).optional(),
  copingStrategyEffectiveness: z.number().min(1).max(10).optional(),
  helpSought: z.boolean().default(false),
  medication: z.boolean().default(false),
});

type CrisisFormValues = z.infer<typeof crisisFormSchema>;

interface CrisisTrackerFormProps {
  userId: number;
  onSuccess?: () => void;
}

export function CrisisTrackerForm({ userId, onSuccess }: CrisisTrackerFormProps) {
  const { createCrisis, isCreating } = useCrisisTracker(userId);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Default form values
  const defaultValues: Partial<CrisisFormValues> = {
    date: new Date(),
    type: CrisisType.PANIC_ATTACK,
    intensity: CrisisIntensity.MODERATE,
    helpSought: false,
    medication: false,
    symptoms: [],
    triggers: [],
    copingStrategiesUsed: [],
  };

  const form = useForm<CrisisFormValues>({
    resolver: zodResolver(crisisFormSchema),
    defaultValues,
  });

  function onSubmit(data: CrisisFormValues) {
    createCrisis({
      crisisType: data.type,
      date: format(data.date, 'yyyy-MM-dd'),
      time: data.time,
      intensity: data.intensity,
      duration: data.duration,
      notes: data.notes,
      symptoms: data.symptoms,
      triggers: data.triggers,
      copingStrategiesUsed: data.copingStrategiesUsed,
      copingStrategyEffectiveness: data.copingStrategyEffectiveness,
      helpSought: data.helpSought,
      medication: data.medication,
    }, {
      onSuccess: () => {
        form.reset(defaultValues);
        if (onSuccess) onSuccess();
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <AlertCircle className="mr-2 h-6 w-6 text-red-500" />
          Record Crisis/Panic Event
        </CardTitle>
        <CardDescription>
          Track crisis events to identify patterns and develop effective coping strategies.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="coping">Coping & Response</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Crisis</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type of crisis" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CrisisType.PANIC_ATTACK}>Panic Attack</SelectItem>
                            <SelectItem value={CrisisType.EMOTIONAL_CRISIS}>Emotional Crisis</SelectItem>
                            <SelectItem value={CrisisType.SUICIDAL_THOUGHTS}>Suicidal Thoughts</SelectItem>
                            <SelectItem value={CrisisType.SELF_HARM_URGE}>Self-Harm Urge</SelectItem>
                            <SelectItem value={CrisisType.SUBSTANCE_URGE}>Substance Use Urge</SelectItem>
                            <SelectItem value={CrisisType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date Picker */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button 
                                variant={"outline"} 
                                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            placeholder="Select time" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            value={field.value || ""}
                            min={1}
                            max={1440}
                            placeholder="Duration in minutes"
                          />
                        </FormControl>
                        <FormDescription>
                          How long did the episode last?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Intensity */}
                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Intensity Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={CrisisIntensity.MILD} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Mild
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={CrisisIntensity.MODERATE} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Moderate
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={CrisisIntensity.SEVERE} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Severe
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={CrisisIntensity.EXTREME} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Extreme
                              </FormLabel>
                            </FormItem>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("details")}
                  >
                    Next: Details
                  </Button>
                </div>
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what happened during this episode..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Symptoms */}
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms Experienced</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {CommonPanicSymptoms.map((symptom) => (
                          <FormItem
                            key={symptom}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(symptom)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, symptom]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== symptom)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {symptom}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Triggers */}
                <FormField
                  control={form.control}
                  name="triggers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possible Triggers</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {CommonCrisisTriggers.map((trigger) => (
                          <FormItem
                            key={trigger}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(trigger)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, trigger]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== trigger)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {trigger}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("basic")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("coping")}
                  >
                    Next: Coping Strategies
                  </Button>
                </div>
              </TabsContent>
              
              {/* Coping Strategies Tab */}
              <TabsContent value="coping" className="space-y-4">
                {/* Coping Strategies Used */}
                <FormField
                  control={form.control}
                  name="copingStrategiesUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coping Strategies Used</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {CommonCopingStrategies.map((strategy) => (
                          <FormItem
                            key={strategy}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(strategy)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, strategy]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== strategy)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {strategy}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Coping Strategy Effectiveness */}
                <FormField
                  control={form.control}
                  name="copingStrategyEffectiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effectiveness of Coping Strategies (1-10)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Not Effective</span>
                            <span>Very Effective</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Help Sought & Medication */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="helpSought"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Professional Help Sought
                          </FormLabel>
                          <FormDescription>
                            Did you contact a therapist, crisis line, or other professional?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medication"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Medication Used
                          </FormLabel>
                          <FormDescription>
                            Did you take any PRN or as-needed medication?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("details")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Saving..." : "Save Crisis Event"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground mb-2">
          <AlertCircle className="inline-block h-4 w-4 mr-1" />
          If you're currently experiencing a mental health emergency, please contact emergency services or a crisis hotline immediately.
        </p>
        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">
          Your data is private and will only be used to help identify patterns and develop personalized coping strategies.
        </p>
      </CardFooter>
    </Card>
  );
}