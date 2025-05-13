import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { format, subDays } from 'date-fns';

import { GetTimeDistributionQuery, GetTimeDistributionQueryHandler } from '../../../application/queries/GetTimeDistributionQuery';
import { ApiTimeTrackingRepository } from '../../../infrastructure/repositories/ApiTimeTrackingRepository';
import { TimeDistributionData } from '../../../domain/repositories/ITimeTrackingRepository';
import { TimePeriod, TIME_PERIOD_CONFIG } from '../../../domain/entities/EmotionTrackingTime';

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
  userId = 1, // Default user ID
  title = 'When You Record Emotions'
}) => {
  const [distribution, setDistribution] = useState<TimeDistributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeDistribution = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create date range if not provided
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        
        const fromDate = dateRange?.fromDate || format(thirtyDaysAgo, 'yyyy-MM-dd');
        const toDate = dateRange?.toDate || format(today, 'yyyy-MM-dd');
        
        // Set up the query and handler with repository (Dependency Injection)
        const repository = new ApiTimeTrackingRepository();
        const queryHandler = new GetTimeDistributionQueryHandler(repository);
        const query = new GetTimeDistributionQuery(userId, fromDate, toDate);
        
        // Execute the query to get time distribution data
        const data = await queryHandler.execute(query);
        setDistribution(data);
      } catch (err) {
        console.error('Error fetching time distribution:', err);
        setError('Failed to load time distribution data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeDistribution();
  }, [dateRange, userId]);

  // Calculate the total number of entries
  const totalEntries = distribution 
    ? Object.values(distribution).reduce((sum, count) => sum + count, 0) 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-destructive">
            <p>{error}</p>
            <p className="text-sm mt-1">Please try again later</p>
          </div>
        ) : totalEntries === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No emotion time data available</p>
            <p className="text-sm mt-1">Record emotions to see when you track them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {TIME_PERIOD_CONFIG.map((block, index) => {
              const count = distribution?.[block.label] || 0;
              const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{block.label}</span>
                    <span className="text-muted-foreground">{count} entries ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${block.color} rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            <div className="pt-2 text-xs text-muted-foreground text-center">
              Based on your emotion tracking patterns
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeDistributionChart;