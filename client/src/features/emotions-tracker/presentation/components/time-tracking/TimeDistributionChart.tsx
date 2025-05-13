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
    <Card className="w-full bg-white shadow-sm border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-gray-800">
          <Clock className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
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
          <div>
            {/* Apple-style grid layout */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {TIME_PERIOD_CONFIG.map((block, index) => {
                const count = distribution?.[block.label] || 0;
                const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
                
                // Apple Health-style card for each time period
                return (
                  <div 
                    key={index} 
                    className="rounded-2xl overflow-hidden border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header with icon and label */}
                      <div className="flex items-center mb-3">
                        <div 
                          className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 bg-opacity-10 ${block.color}`}
                        >
                          <span className="text-lg" role="img" aria-label={block.label}>
                            {block.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-base text-gray-800">{block.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{block.description}</p>
                        </div>
                      </div>
                      
                      {/* Statistics */}
                      <div className="mt-auto pt-2">
                        <div className="text-3xl font-semibold mb-2 text-gray-800">{count}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">entries</span>
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
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