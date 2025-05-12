import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWellnessChallenge } from '../context/WellnessChallengeContext';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { ChallengeFrequency, ChallengeType } from '../../domain/models';

const challengeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['emotions', 'meditation', 'journaling', 'activity', 'custom']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.date(),
  endDate: z.date(),
  targetValue: z.number().min(1, 'Target value must be at least 1')
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
});

type FormValues = z.infer<typeof challengeFormSchema>;

interface CreateChallengeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { service } = useWellnessChallenge();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: Partial<FormValues> = {
    title: '',
    description: '',
    type: 'emotions',
    frequency: 'daily',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    targetValue: 1
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!service) {
      toast({
        title: 'Service Not Ready',
        description: 'Please try again in a moment',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Format dates as YYYY-MM-DD strings
      const startDateStr = format(values.startDate, 'yyyy-MM-dd');
      const endDateStr = format(values.endDate, 'yyyy-MM-dd');

      await service.createChallenge(
        values.title,
        values.type as ChallengeType,
        values.frequency as ChallengeFrequency,
        startDateStr,
        endDateStr,
        values.targetValue,
        values.description
      );

      toast({
        title: 'Challenge Created',
        description: 'Your wellness challenge has been created successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error Creating Challenge',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update end date based on frequency
  const updateEndDate = (frequency: string) => {
    const startDate = form.getValues('startDate');
    let endDate;

    switch (frequency) {
      case 'daily':
        endDate = addDays(startDate, 30); // 1 month for daily challenges
        break;
      case 'weekly':
        endDate = addWeeks(startDate, 12); // 3 months for weekly challenges
        break;
      case 'monthly':
        endDate = addMonths(startDate, 6); // 6 months for monthly challenges
        break;
      default:
        endDate = addDays(startDate, 30);
    }

    form.setValue('endDate', endDate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Daily Mindfulness Practice" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your challenge..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Challenge Type</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a challenge type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="emotions">Emotions Tracking</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="journaling">Journaling</SelectItem>
                    <SelectItem value="activity">Physical Activity</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateEndDate(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select challenge frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      onSelect={(date) => {
                        field.onChange(date);
                        // Update end date when start date changes
                        if (date) {
                          updateEndDate(form.getValues('frequency'));
                        }
                      }}
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
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
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
                      disabled={(date) => date < form.getValues('startDate')}
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
          name="targetValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Target</FormLabel>
              <div className="space-y-3">
                <RadioGroup
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1" className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Complete once per day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2">Complete twice per day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3">Complete three times per day</Label>
                  </div>
                </RadioGroup>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Challenge'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};