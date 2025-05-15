/**
 * Component for displaying a chart of emotion recording time distribution
 * For the therapist view - adapted from client-side component
 */
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientEmotionData } from '../hooks/useClientEmotionData';
import { ID } from '../../domain/entities';

// Import time enums directly from client component for consistency
enum TimePeriod {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

const TIME_PERIOD_CONFIG = [
  { 
    label: TimePeriod.MORNING, 
    color: 'bg-amber-400',
    icon: '🌅',
    description: '5am - 11am'
  },
  { 
    label: TimePeriod.AFTERNOON, 
    color: 'bg-yellow-500',
    icon: '☀️',
    description: '12pm - 4pm'
  },
  { 
    label: TimePeriod.EVENING, 
    color: 'bg-orange-500',
    icon: '🌆',
    description: '5pm - 9pm'
  },
  { 
    label: TimePeriod.NIGHT, 
    color: 'bg-indigo-600',
    icon: '🌙',
    description: '10pm - 4am'
  }
];

interface TimeDistributionChartProps {
  clientId: ID;
  title?: string;
}

/**
 * TimeDistributionChart for the therapist view
 * Displays when a client records emotions throughout the day
 */
export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({
  clientId,
  title = "When You Record Emotions"
}) => {
  const { dateRange, isLoading, getAllEmotionEntries } = useClientEmotionData(clientId);
  
  // Calculate time distribution from emotion entries
  const getTimeDistribution = () => {
    // Get all entries that the clientEmotionData hook has access to
    const entries = getAllEmotionEntries();
    
    const distribution: { [key: string]: number } = {
      [TimePeriod.MORNING]: 0,
      [TimePeriod.AFTERNOON]: 0,
      [TimePeriod.EVENING]: 0,
      [TimePeriod.NIGHT]: 0
    };
    
    entries.forEach((entry: any) => {
      if (!entry.time) return;
      
      // Parse hour from time string (HH:MM format)
      const [hourStr] = entry.time.split(':');
      const hour = parseInt(hourStr, 10);
      
      if (isNaN(hour)) return;
      
      // Categorize by time period
      if (hour >= 5 && hour <= 11) {
        distribution[TimePeriod.MORNING]++;
      } else if (hour >= 12 && hour <= 16) {
        distribution[TimePeriod.AFTERNOON]++;
      } else if (hour >= 17 && hour <= 21) {
        distribution[TimePeriod.EVENING]++;
      } else {
        distribution[TimePeriod.NIGHT]++;
      }
    });
    
    return distribution;
  };

  // Get total entries
  const getTotalEntries = () => {
    const distribution = getTimeDistribution();
    return Object.values(distribution).reduce((sum, count) => sum + count, 0);
  };
  
  // The time distribution data
  const timeDistribution = getTimeDistribution();
  const totalEntries = getTotalEntries();
  
  // Sort time periods for display
  const timePeriods = [
    TimePeriod.MORNING,
    TimePeriod.AFTERNOON,
    TimePeriod.EVENING,
    TimePeriod.NIGHT
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          View when your client tends to record emotions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading time distribution...</div>
        ) : totalEntries === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No time data available</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {timePeriods.map(period => {
              const config = TIME_PERIOD_CONFIG.find(cfg => cfg.label === period);
              const count = timeDistribution[period] || 0;
              
              return (
                <div 
                  key={period}
                  className="rounded-lg p-4 text-center hover:shadow transition-shadow cursor-pointer"
                >
                  <div className="text-2xl mb-1">{config?.icon}</div>
                  <h4 className="font-medium text-sm">{period}{config?.description ? `(${config.description})` : ''}</h4>
                  <p className="text-xl mt-1">{count} entries</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeDistributionChart;