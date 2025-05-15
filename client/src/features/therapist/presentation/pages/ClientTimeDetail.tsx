/**
 * Time period detail page for showing comprehensive emotion information
 * for a specific time of day (Morning, Afternoon, Evening, Night)
 */
import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Activity, TrendingUp } from 'lucide-react';
import { useClientEmotionData } from '../hooks/useClientEmotionData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Import time enums for consistency
enum TimePeriod {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

// Time period configuration with detailed info
const TIME_PERIOD_CONFIG = [
  { 
    id: 'morning',
    label: TimePeriod.MORNING, 
    color: 'bg-amber-400',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    fillColor: '#F59E0B',
    icon: '🌅',
    description: '5am - 11am',
    range: [5, 11]
  },
  { 
    id: 'afternoon',
    label: TimePeriod.AFTERNOON, 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    fillColor: '#EAB308',
    icon: '☀️',
    description: '12pm - 4pm',
    range: [12, 16]
  },
  { 
    id: 'evening',
    label: TimePeriod.EVENING, 
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    fillColor: '#F97316',
    icon: '🌆',
    description: '5pm - 9pm',
    range: [17, 21]
  },
  { 
    id: 'night',
    label: TimePeriod.NIGHT, 
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    fillColor: '#4F46E5',
    icon: '🌙',
    description: '10pm - 4am',
    range: [22, 4]
  }
];

// Colors for pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

/**
 * Client Time Detail Page component
 * Shows detailed information about emotions recorded during a specific time period
 */
const ClientTimeDetail: React.FC = () => {
  const params = useParams<{ clientId: string; periodId: string }>();
  const [, navigate] = useLocation();
  const clientId = parseInt(params.clientId);
  const periodId = params.periodId;
  
  // Find the time period configuration
  const timePeriodConfig = TIME_PERIOD_CONFIG.find(config => config.id === periodId);
  
  if (!timePeriodConfig) {
    // If no valid time period is found, redirect back to client details
    useEffect(() => {
      navigate(`/therapist/clients/${clientId}`);
    }, [navigate, clientId]);
    return null;
  }
  
  const timePeriod = timePeriodConfig.label;
  
  // Get emotion data using the therapist hook
  const { 
    dateRange, 
    isLoading, 
    getAllEmotionEntries,
    getEmotionIntensityTrend,
    getTopEmotionsByFrequency
  } = useClientEmotionData(clientId);
  
  // Filter entries for this time period
  const getEntriesForTimePeriod = () => {
    const entries = getAllEmotionEntries();
    const timeRangeEntries = entries.filter((entry: any) => {
      if (!entry.time) return false;
      
      const [hourStr] = entry.time.split(':');
      const hour = parseInt(hourStr, 10);
      
      if (isNaN(hour)) return false;
      
      // Check if this hour belongs to the selected period
      if (timePeriod === TimePeriod.NIGHT) {
        return (hour >= 22 && hour <= 23) || (hour >= 0 && hour <= 4);
      } else {
        const [startHour, endHour] = timePeriodConfig.range;
        return hour >= startHour && hour <= endHour;
      }
    });
    
    return timeRangeEntries;
  };
  
  // Get hourly distribution for this time period
  const getHourlyDistribution = () => {
    if (!timePeriodConfig) return [];
    
    const entries = getEntriesForTimePeriod();
    const hourCounts: { [key: number]: number } = {};
    
    // Initialize all hours in the range with 0
    const [startHour, endHour] = timePeriodConfig.range;
    
    // Handle the special case for night (wraps around 24-hour clock)
    if (timePeriod === TimePeriod.NIGHT) {
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
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Convert to an array format for the chart
    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    }));
  };
  
  // Get emotion distribution for this time period
  const getEmotionDistribution = () => {
    const entries = getEntriesForTimePeriod();
    const emotionCounts: { [key: string]: number } = {};
    
    entries.forEach((entry: any) => {
      const emotion = entry.emotionName;
      if (!emotion) return;
      
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // Convert to array format for chart
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count
    }));
  };
  
  // Get typical time (most common hour) for this period
  const getTypicalTime = () => {
    const hourlyDistribution = getHourlyDistribution();
    if (hourlyDistribution.length === 0) return 'N/A';
    
    const mostCommonHour = hourlyDistribution.reduce(
      (max, hour) => hour.count > max.count ? hour : max, 
      { hour: 'N/A', count: 0 }
    );
    
    // Convert 24h format to 12h
    if (mostCommonHour.hour === 'N/A') return 'N/A';
    
    const hourNum = parseInt(mostCommonHour.hour.split(':')[0]);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    
    return `${hour12} ${period}`;
  };
  
  // Get average intensity for this time period
  const getAverageIntensity = () => {
    const entries = getEntriesForTimePeriod();
    if (entries.length === 0) return 0;
    
    const totalIntensity = entries.reduce((sum, entry: any) => sum + (entry.intensity || 0), 0);
    return (totalIntensity / entries.length).toFixed(1);
  };
  
  // Get recent entries for this time period (limit to 5)
  const getRecentEntries = () => {
    const entries = getEntriesForTimePeriod();
    return entries
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };
  
  // Computed data
  const timeRangeEntries = getEntriesForTimePeriod();
  const hourlyDistribution = getHourlyDistribution();
  const emotionDistribution = getEmotionDistribution();
  const typicalTime = getTypicalTime();
  const averageIntensity = getAverageIntensity();
  const recentEntries = getRecentEntries();
  const totalEntries = timeRangeEntries.length;

  const formatEntryTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy \'at\' HH:mm:ss');
  };
  
  return (
    <div className={`p-4 pb-16 ${timePeriodConfig.bgColor}`}>
      {/* Header with back button */}
      <div className="mb-4">
        <Link href={`/therapist/clients/${clientId}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={16} />
            Back to Client Dashboard
          </Button>
        </Link>
      </div>
      
      {/* Title section */}
      <div className={`flex items-center gap-3 mb-6 ${timePeriodConfig.textColor}`}>
        <div className="text-3xl">{timePeriodConfig.icon}</div>
        <div>
          <h1 className="text-2xl font-bold">{timePeriod} Emotions</h1>
          <p className="text-muted-foreground">{timePeriodConfig.description}</p>
        </div>
      </div>
      
      <p className="mb-6 text-muted-foreground">
        Analysis of emotions tracked during the {timePeriod.toLowerCase()} hours over the last {dateRange.startDate !== dateRange.endDate ? `${Math.round((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : 'day'}.
      </p>
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading time period data...</div>
      ) : totalEntries === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No emotion data available for this time period
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className={`${timePeriodConfig.borderColor} border-2`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Activity className="h-8 w-8 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">ENTRIES</h3>
                  <p className="text-3xl font-bold">{totalEntries}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`${timePeriodConfig.borderColor} border-2`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">TYPICAL TIME</h3>
                  <p className="text-3xl font-bold">{typicalTime}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`${timePeriodConfig.borderColor} border-2`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-8 w-8 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">AVG INTENSITY</h3>
                  <p className="text-3xl font-bold">{averageIntensity}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Hourly breakdown chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hourly Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      name="Entries" 
                      fill={timePeriodConfig.fillColor} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Emotion breakdown section */}
          <h2 className="text-xl font-bold mb-4">{timePeriod} Emotions Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pie chart of emotions */}
            <Card>
              <CardContent className="pt-6">
                {emotionDistribution.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emotionDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {emotionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No emotion data to display
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* List of top emotions */}
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {emotionDistribution.map((emotion, index) => {
                    const percentage = (emotion.value / totalEntries * 100).toFixed(0);
                    return (
                      <li key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{emotion.name}</span>
                          <span className="text-sm text-muted-foreground">{percentage}% of {timePeriod.toLowerCase()} emotions</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length] 
                            }} 
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">{emotion.value}</div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent entries */}
          <h2 className="text-xl font-bold mb-4">Recent {timePeriod} Entries</h2>
          <div className="space-y-3">
            {recentEntries.map((entry: any, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div 
                    className={`w-full md:w-1/4 p-4 flex items-center justify-center ${timePeriodConfig.bgColor} ${timePeriodConfig.textColor}`}
                  >
                    <span className="text-xl font-bold">{entry.emotionName}</span>
                  </div>
                  <div className="p-4 w-full md:w-3/4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatEntryTimestamp(entry.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span>Intensity: {entry.intensity}/10</span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm mt-2 italic">"{entry.notes}"</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientTimeDetail;