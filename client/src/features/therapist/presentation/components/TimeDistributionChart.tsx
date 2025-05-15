/**
 * Component for displaying a chart of emotion recording time distribution
 * For the therapist view - adapted from client-side component
 */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    fillColor: '#F59E0B',
    icon: '🌅',
    description: '5am - 11am',
    range: [5, 11]
  },
  { 
    label: TimePeriod.AFTERNOON, 
    color: 'bg-yellow-500',
    fillColor: '#EAB308',
    icon: '☀️',
    description: '12pm - 4pm',
    range: [12, 16]
  },
  { 
    label: TimePeriod.EVENING, 
    color: 'bg-orange-500',
    fillColor: '#F97316',
    icon: '🌆',
    description: '5pm - 9pm',
    range: [17, 21]
  },
  { 
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
 */
export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({
  clientId,
  title = "When Your Client Records Emotions"
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
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
  
  // Get detailed hour distribution for a specific time period
  const getHourlyDistribution = (period: TimePeriod) => {
    const config = TIME_PERIOD_CONFIG.find(cfg => cfg.label === period);
    if (!config) return [];
    
    const entries = getAllEmotionEntries();
    const hourCounts: { [key: number]: number } = {};
    
    // Initialize all hours in the range with 0
    const startHour = config.range[0];
    const endHour = config.range[1];
    
    // Handle the special case for night (wraps around 24-hour clock)
    if (period === TimePeriod.NIGHT) {
      // Night is 22-23 and 0-4
      for (let hour = 22; hour <= 23; hour++) {
        hourCounts[hour] = 0;
      }
      for (let hour = 0; hour <= 4; hour++) {
        hourCounts[hour] = 0;
      }
    } else {
      // Normal case for other periods
      for (let hour = startHour; hour <= endHour; hour++) {
        hourCounts[hour] = 0;
      }
    }
    
    // Count entries for each hour
    entries.forEach((entry: any) => {
      if (!entry.time) return;
      
      const [hourStr] = entry.time.split(':');
      const hour = parseInt(hourStr, 10);
      
      if (isNaN(hour)) return;
      
      // Check if this hour belongs to the selected period
      if (period === TimePeriod.NIGHT) {
        if ((hour >= 22 && hour <= 23) || (hour >= 0 && hour <= 4)) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      } else if (hour >= startHour && hour <= endHour) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    // Convert to an array format for the chart
    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    }));
  };
  
  // Handle card click
  const handlePeriodClick = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setDetailDialogOpen(true);
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

  // Get detailed data for the selected period
  const detailedData = selectedPeriod ? getHourlyDistribution(selectedPeriod) : [];
  const selectedConfig = TIME_PERIOD_CONFIG.find(cfg => cfg.label === selectedPeriod);

  return (
    <>
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
      
      {/* Detailed Time Period Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig?.icon} {selectedPeriod} Emotion Entries
            </DialogTitle>
            <DialogDescription>
              Detailed hourly breakdown for {selectedPeriod?.toLowerCase()} ({selectedConfig?.description}) emotion entries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[400px] w-full py-4">
            {detailedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={detailedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Entries" 
                    fill={selectedConfig?.fillColor || '#8884d8'} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No detailed data available for this time period
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeDistributionChart;