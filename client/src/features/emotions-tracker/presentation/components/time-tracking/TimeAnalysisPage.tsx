import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, CalendarDays, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { 
  TimePeriod, 
  TIME_PERIOD_CONFIG 
} from '../../../domain/entities/EmotionTrackingTime';
import { useEmotions } from '../../context/EmotionsContext';
import { EmotionEntry } from '../../../domain/models';

/**
 * Component for displaying detailed analytics for a specific time period
 * Follows Apple's Health app design philosophy
 */
const TimeAnalysisPage: React.FC = () => {
  const { timePeriod } = useParams<{ timePeriod: string }>();
  const [, setLocation] = useLocation();
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get time period configuration
  const periodConfig = TIME_PERIOD_CONFIG.find(
    (period) => period.label.toLowerCase() === timePeriod
  );
  
  // Use the context to fetch emotion entries
  const { 
    getEmotionEntriesForDateRange, 
    isLoading: contextIsLoading 
  } = useEmotions();
  
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      
      // Get entries for the last 30 days
      const today = new Date();
      const startDate = format(subDays(today, 30), 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');
      
      try {
        // Fetch all entries for the date range
        const allEntries = await getEmotionEntriesForDateRange(startDate, endDate);
        
        // Filter entries by time period
        const timeFilteredEntries = allEntries.filter(entry => {
          if (!entry.time) return false;
          
          // Parse time (HH:MM format)
          const [hours] = entry.time.split(':').map(Number);
          
          // Check if the entry belongs to the requested time period
          if (timePeriod === 'morning' && hours >= 5 && hours <= 11) {
            return true;
          } else if (timePeriod === 'afternoon' && hours >= 12 && hours <= 16) {
            return true;
          } else if (timePeriod === 'evening' && hours >= 17 && hours <= 21) {
            return true;
          } else if (timePeriod === 'night' && (hours >= 22 || hours <= 4)) {
            return true;
          }
          
          return false;
        });
        
        setEntries(timeFilteredEntries);
      } catch (error) {
        console.error('Error fetching entries for time period:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [timePeriod, getEmotionEntriesForDateRange]);
  
  // Get emotion counts by type
  const getEmotionCounts = () => {
    const counts: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (!counts[entry.emotionName]) {
        counts[entry.emotionName] = 0;
      }
      counts[entry.emotionName]++;
    });
    
    // Convert to array and sort
    return Object.entries(counts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);
  };
  
  // Get average intensity
  const getAverageIntensity = () => {
    if (entries.length === 0) return 0;
    
    const sum = entries.reduce((acc, entry) => acc + entry.intensity, 0);
    return (sum / entries.length).toFixed(1);
  };
  
  // Get most common time
  const getMostCommonTime = () => {
    if (entries.length === 0) return 'N/A';
    
    const timeCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (!entry.time) return;
      
      // Round to the hour for better grouping
      const hour = entry.time.split(':')[0];
      const timeKey = `${hour}:00`;
      
      if (!timeCounts[timeKey]) {
        timeCounts[timeKey] = 0;
      }
      timeCounts[timeKey]++;
    });
    
    // Find the most common time
    let mostCommonTime = '';
    let maxCount = 0;
    
    Object.entries(timeCounts).forEach(([time, count]) => {
      if (count > maxCount) {
        mostCommonTime = time;
        maxCount = count;
      }
    });
    
    // Format the time for display
    const hour = parseInt(mostCommonTime.split(':')[0]);
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12} ${amPm}`;
  };
  
  const emotionCounts = getEmotionCounts();
  
  if (!periodConfig) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">Invalid time period</h2>
            <p className="text-gray-500 mb-4">The requested time period does not exist.</p>
            <Button onClick={() => setLocation('/emotions')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Emotions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <Button 
          variant="ghost"
          onClick={() => setLocation('/emotions')}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Emotions
        </Button>
      </div>
      
      {/* Header Card */}
      <Card className="mb-6 bg-white shadow-sm border-none">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <div 
              className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${periodConfig.color}`}
            >
              <span className="text-2xl" role="img" aria-label={periodConfig.label}>
                {periodConfig.icon}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl">{periodConfig.label} Emotions</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{periodConfig.description}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading || contextIsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Analysis of emotions tracked during the {periodConfig.label.toLowerCase()} hours 
                over the last 30 days.
              </p>
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-muted-foreground text-xs mb-1 flex justify-center items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    ENTRIES
                  </div>
                  <div className="text-3xl font-semibold">{entries.length}</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-muted-foreground text-xs mb-1 flex justify-center items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    TYPICAL TIME
                  </div>
                  <div className="text-3xl font-semibold">{getMostCommonTime()}</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-muted-foreground text-xs mb-1 flex justify-center items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    AVG INTENSITY
                  </div>
                  <div className="text-3xl font-semibold">{getAverageIntensity()}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Emotions List */}
      <Card className="mb-6 bg-white shadow-sm border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {periodConfig.label} Emotions Breakdown
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading || contextIsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No emotions recorded during {periodConfig.label.toLowerCase()} hours.</p>
              <p className="text-sm mt-2">Track more emotions during this time period to see insights.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top emotions */}
              <div className="space-y-4 mt-4">
                {emotionCounts.slice(0, 5).map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{item.emotion}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.count / entries.length) * 100).toFixed(0)}% of {periodConfig.label.toLowerCase()} emotions
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-semibold">{item.count}</div>
                  </div>
                ))}
              </div>
              
              {/* Empty state if no emotions */}
              {emotionCounts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No emotions recorded during {periodConfig.label.toLowerCase()} hours.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Entries */}
      <Card className="bg-white shadow-sm border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Recent {periodConfig.label} Entries
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading || contextIsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No emotions recorded during {periodConfig.label.toLowerCase()} hours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-100 rounded-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: entry.categoryId === 'positive' ? '#10b981' : 
                                         entry.categoryId === 'negative' ? '#ef4444' : 
                                         entry.categoryId === 'neutral' ? '#6b7280' : '#888'
                          }}
                        />
                        <span className="font-medium">{entry.emotionName}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.date), 'MMM d, yyyy')} at {entry.time || 'unknown time'}
                      </div>
                      
                      {entry.notes && (
                        <p className="mt-2 text-sm">{entry.notes}</p>
                      )}
                    </div>
                    
                    <div className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                      Intensity: {entry.intensity}/10
                    </div>
                  </div>
                </div>
              ))}
              
              {entries.length > 5 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/emotions/history')}
                  >
                    View All Entries
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeAnalysisPage;