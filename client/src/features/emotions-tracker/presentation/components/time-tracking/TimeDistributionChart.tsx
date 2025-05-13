import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useEmotions } from '../../context/EmotionsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { TimePeriod, TIME_PERIOD_CONFIG } from '../../../domain/entities/EmotionTrackingTime';
import { EmotionEntry } from '../../../domain/models';

/**
 * TimeDistributionChart props
 */
interface TimeDistributionChartProps {
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
  userId?: number;
  title?: string;
}

/**
 * Component for displaying a chart of emotion recording time distribution
 * Follows the Presentation Layer pattern in Clean Architecture
 */
const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({
  dateRange,
  userId = 1,
  title = "When You Record Emotions"
}) => {
  const [, setLocation] = useLocation();
  const { isLoading, getEmotionsByDateRange } = useEmotions();
  const [timeDistribution, setTimeDistribution] = useState<{ [key: string]: number }>({});
  const [totalEntries, setTotalEntries] = useState<number>(0);
  
  // Set default date range to current month if not provided
  const today = new Date();
  const defaultFromDate = format(startOfMonth(today), 'yyyy-MM-dd');
  const defaultToDate = format(endOfMonth(today), 'yyyy-MM-dd');
  
  const fromDate = dateRange?.fromDate || defaultFromDate;
  const toDate = dateRange?.toDate || defaultToDate;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch emotions for the date range
        const entries = await getEmotionsByDateRange(fromDate, toDate);
        
        // Calculate time distribution
        const distribution = calculateTimeDistribution(entries);
        setTimeDistribution(distribution);
        setTotalEntries(entries.length);
      } catch (error) {
        console.error('Error fetching time distribution data:', error);
      }
    };
    
    fetchData();
  }, [fromDate, toDate, getEmotionsByDateRange]);
  
  /**
   * Calculate time distribution from emotion entries
   */
  const calculateTimeDistribution = (entries: EmotionEntry[]): { [key: string]: number } => {
    const distribution: { [key: string]: number } = {
      [TimePeriod.MORNING]: 0,
      [TimePeriod.AFTERNOON]: 0,
      [TimePeriod.EVENING]: 0,
      [TimePeriod.NIGHT]: 0
    };
    
    entries.forEach(entry => {
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
  
  const handleTimeCardClick = (period: string) => {
    // Navigate to the time analysis page
    setLocation(`/emotions/time-analysis/${period.toLowerCase()}`);
  };
  
  // Sort time periods for display
  const timePeriods = [
    TimePeriod.MORNING,
    TimePeriod.AFTERNOON,
    TimePeriod.EVENING,
    TimePeriod.NIGHT
  ];
  
  // Get maximum count for percentage calculation
  const maxCount = Math.max(
    ...Object.values(timeDistribution),
    1  // Ensure we don't divide by zero
  );
  
  return (
    <Card className="shadow-sm hover:shadow transition-shadow border-none bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription>
          View when you tend to record your emotions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : totalEntries === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No emotions recorded yet</p>
            <p className="text-sm mt-2">Track your emotions to see patterns in when you record them</p>
          </div>
        ) : (
          <div className="space-y-4 mt-3">
            {timePeriods.map((period) => {
              const config = TIME_PERIOD_CONFIG.find(cfg => cfg.label === period);
              const count = timeDistribution[period] || 0;
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div
                  key={period}
                  className="cursor-pointer group"
                  onClick={() => handleTimeCardClick(period)}
                >
                  <div className="flex items-center mb-1">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${config?.color} mr-3`}
                    >
                      <span className="text-lg" role="img" aria-label={period}>
                        {config?.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium group-hover:text-blue-600 transition-colors">
                          {period}
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            ({config?.description})
                          </span>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {count} entries
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 bg-gray-100 rounded-full h-2.5 w-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${config?.color}`}
                          style={{
                            width: `${percentage}%`,
                            opacity: 0.7
                          }}
                        />
                      </div>
                    </div>
                  </div>
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