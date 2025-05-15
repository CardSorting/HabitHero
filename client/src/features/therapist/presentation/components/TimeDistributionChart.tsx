/**
 * Component for displaying a chart of emotion recording time distribution
 * For the therapist view - adapted from client-side component
 */
import React from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
    id: 'morning',
    label: TimePeriod.MORNING, 
    color: 'bg-amber-400',
    fillColor: '#F59E0B',
    icon: '🌅',
    description: '5am - 11am',
    range: [5, 11]
  },
  { 
    id: 'afternoon',
    label: TimePeriod.AFTERNOON, 
    color: 'bg-yellow-500',
    fillColor: '#EAB308',
    icon: '☀️',
    description: '12pm - 4pm',
    range: [12, 16]
  },
  { 
    id: 'evening',
    label: TimePeriod.EVENING, 
    color: 'bg-orange-500',
    fillColor: '#F97316',
    icon: '🌆',
    description: '5pm - 9pm',
    range: [17, 21]
  },
  { 
    id: 'night',
    label: TimePeriod.NIGHT, 
    color: 'bg-indigo-600',
    fillColor: '#4F46E5',
    icon: '🌙',
    description: '10pm - 4am',
    range: [22, 4]
  }
];

interface TimeDistributionChartProps {
  clientId: ID;
  title?: string;
}

/**
 * TimeDistributionChart for the therapist view
 * Displays when a client records emotions throughout the day
 * Clicking a time period navigates to a detailed view page
 */
export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({
  clientId,
  title = "When Your Client Records Emotions"
}) => {
  const [, navigate] = useLocation();
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
  
  // Handle card click - navigate to time detail page
  const handlePeriodClick = (period: TimePeriod) => {
    const periodConfig = TIME_PERIOD_CONFIG.find(cfg => cfg.label === period);
    if (!periodConfig) return;
    
    navigate(`/therapist/clients/${clientId}/time/${periodConfig.id}`);
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
          View when your client tends to record emotions throughout the day
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
                  className="rounded-lg p-4 text-center hover:shadow transition-shadow cursor-pointer border hover:border-primary"
                  onClick={() => handlePeriodClick(period)}
                >
                  <div className="text-2xl mb-1">{config?.icon}</div>
                  <h4 className="font-medium text-sm">
                    {period} <span className="text-xs text-muted-foreground">{config?.description}</span>
                  </h4>
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