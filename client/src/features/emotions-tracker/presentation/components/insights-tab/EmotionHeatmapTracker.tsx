import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmotions } from '../../context/EmotionsContext';
import { format, subDays, parseISO } from 'date-fns';
import { EmotionEntry } from '../../../domain/models';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

// Define time blocks for the heatmap (24-hour blocks)
const TIME_BLOCKS = [
  { label: 'Morning', start: 5, end: 11, color: 'bg-amber-300' },
  { label: 'Afternoon', start: 12, end: 16, color: 'bg-orange-400' },
  { label: 'Evening', start: 17, end: 21, color: 'bg-indigo-400' },
  { label: 'Night', start: 22, end: 4, color: 'bg-violet-500' }
];

const EmotionHeatmapTracker: React.FC = () => {
  const { getEmotionsByDateRange } = useEmotions();
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeDistribution, setTimeDistribution] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        // Get entries from the last 30 days
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        
        const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');
        
        const fetchedEntries = await getEmotionsByDateRange(startDate, endDate);
        setEntries(fetchedEntries);
        
        // Calculate time distribution
        const distribution = calculateTimeDistribution(fetchedEntries);
        setTimeDistribution(distribution);
      } catch (error) {
        console.error('Error fetching emotion entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [getEmotionsByDateRange]);

  // Function to calculate the distribution of emotions by time of day
  const calculateTimeDistribution = (entries: EmotionEntry[]): {[key: string]: number} => {
    const distribution: {[key: string]: number} = {
      'Morning': 0,
      'Afternoon': 0,
      'Evening': 0,
      'Night': 0
    };
    
    entries.forEach(entry => {
      if (entry.time) {
        // Extract hour from time (format: HH:MM:SS)
        const hour = parseInt(entry.time.split(':')[0], 10);
        
        // Find which time block this hour belongs to
        for (const block of TIME_BLOCKS) {
          if (block.start <= block.end) {
            // Normal range (e.g., 9-17)
            if (hour >= block.start && hour <= block.end) {
              distribution[block.label]++;
              break;
            }
          } else {
            // Overnight range (e.g., 22-4)
            if (hour >= block.start || hour <= block.end) {
              distribution[block.label]++;
              break;
            }
          }
        }
      }
    });
    
    return distribution;
  };

  // Calculate the total number of entries
  const totalEntries = Object.values(timeDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Clock className="h-5 w-5" />
          When You Record Emotions
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
        ) : totalEntries === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No emotion data available</p>
            <p className="text-sm mt-1">Track emotions to see patterns</p>
          </div>
        ) : (
          <div className="space-y-3">
            {TIME_BLOCKS.map((block, index) => {
              const count = timeDistribution[block.label] || 0;
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
              Based on your last 30 days of emotion tracking
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionHeatmapTracker;