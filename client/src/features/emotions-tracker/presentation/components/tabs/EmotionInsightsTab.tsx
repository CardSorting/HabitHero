// EmotionInsightsTab - UI component for displaying emotion insights and analytics
// This component shows charts and summaries of emotional patterns

import React, { useState } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarIcon, TrendingUpIcon, BarChart3Icon, PieChartIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const EmotionInsightsTab: React.FC = () => {
  const {
    summaryData,
    trendData,
    dateRange,
    setDateRange,
    refreshData,
    isLoading,
    emotions
  } = useEmotions();
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });
  
  // Apply date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDate(range);
      setDateRange(range.from, range.to);
      refreshData();
    }
  };
  
  // Predefined date range options
  const handlePredefinedRange = (period: 'week' | 'month' | 'quarter') => {
    let from: Date, to: Date;
    const today = new Date();
    
    switch (period) {
      case 'week':
        from = subDays(today, 7);
        to = today;
        break;
      case 'month':
        from = subDays(today, 30);
        to = today;
        break;
      case 'quarter':
        from = subDays(today, 90);
        to = today;
        break;
    }
    
    setDate({ from, to });
    setDateRange(from, to);
    refreshData();
  };
  
  // Prepare chart data
  const getEmotionTrendsData = () => {
    // Group trend data by date and category
    const trendsWithLabels = trendData.map(trend => ({
      ...trend,
      emotion: trend.emotion,
      categoryName: trend.category === 'positive' ? 'Positive' : 
                  trend.category === 'negative' ? 'Negative' : 'Neutral'
    }));
    
    return trendsWithLabels;
  };
  
  // Colors for charts
  const categoryColors = {
    positive: '#4ade80',
    negative: '#ef4444',
    neutral: '#f59e0b'
  };
  
  // Get chart color based on emotion category
  const getChartColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '#888888';
  };
  
  // Format emotion summary for display
  const formatEmotionSummary = () => {
    if (!summaryData) return null;
    
    // Build summary data elements
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dominant Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full mr-3"
                style={{ 
                  backgroundColor: getEmotionColorById(getDominantEmotionId())
                }}
              />
              <div>
                <div className="text-xl font-medium">{summaryData.dominantEmotion || 'None'}</div>
                <div className="text-sm text-muted-foreground">
                  Tracked {getEmotionCount(summaryData.dominantEmotion) || 0} times today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Highest Intensity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
                style={{ 
                  backgroundColor: getEmotionColorById(getHighestIntensityEmotionId())
                }}
              >
                <span className="text-sm font-bold">{summaryData.highestIntensity.value}</span>
              </div>
              <div>
                <div className="text-xl font-medium">{summaryData.highestIntensity.emotion || 'None'}</div>
                <div className="text-sm text-muted-foreground">
                  Intensity level {summaryData.highestIntensity.value}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Emotional Balance</CardTitle>
            <CardDescription>
              Average intensity: {summaryData.averageIntensity}/10
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(getCategoryCounts()).map(([category, count]) => (
                <div key={category} className="text-center p-2">
                  <div className="text-2xl font-medium">{count}</div>
                  <div 
                    className="text-sm"
                    style={{ 
                      color: category === 'Positive' ? '#4ade80' : 
                             category === 'Negative' ? '#ef4444' : '#f59e0b' 
                    }}
                  >
                    {category}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Helper functions for summary display
  const getEmotionCount = (emotionName: string) => {
    if (!summaryData || !emotionName) return 0;
    return summaryData.emotionCounts[emotionName] || 0;
  };
  
  const getDominantEmotionId = (): string => {
    if (!summaryData || !summaryData.dominantEmotion) return '';
    const emotion = emotions.find(e => e.name === summaryData.dominantEmotion);
    return emotion?.id || '';
  };
  
  const getHighestIntensityEmotionId = (): string => {
    if (!summaryData || !summaryData.highestIntensity.emotion) return '';
    const emotion = emotions.find(e => e.name === summaryData.highestIntensity.emotion);
    return emotion?.id || '';
  };
  
  const getEmotionColorById = (id: string): string => {
    const emotion = emotions.find(e => e.id === id);
    return emotion?.color || '#888888';
  };
  
  const getCategoryCounts = () => {
    if (!summaryData) return { Positive: 0, Negative: 0, Neutral: 0 };
    
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    
    Object.keys(summaryData.emotionCounts).forEach(emotionName => {
      const count = summaryData.emotionCounts[emotionName];
      const emotion = emotions.find(e => e.name === emotionName);
      
      if (emotion) {
        if (emotion.category === 'positive') {
          counts.Positive += count;
        } else if (emotion.category === 'negative') {
          counts.Negative += count;
        } else {
          counts.Neutral += count;
        }
      }
    });
    
    return counts;
  };
  
  // Prepare line chart data
  const prepareLineChartData = () => {
    // Create a mapping of date to emotions
    const dateMap: Record<string, any> = {};
    
    trendData.forEach(trend => {
      trend.dataPoints.forEach(point => {
        if (!dateMap[point.date]) {
          dateMap[point.date] = { date: point.date };
        }
        dateMap[point.date][trend.emotion] = point.intensity;
      });
    });
    
    // Convert map to array
    return Object.values(dateMap);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Emotion Insights</h2>
        <p className="text-muted-foreground">
          Analyze and understand your emotional patterns
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Date Range</CardTitle>
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handlePredefinedRange('week')}
              >
                Week
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handlePredefinedRange('month')}
              >
                Month
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handlePredefinedRange('quarter')}
              >
                Quarter
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">
                  {date?.from ? format(date.from, "LLL dd, y") : "Start date"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">
                  {date?.to ? format(date.to, "LLL dd, y") : "End date"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {summaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>
              Overview of your emotions for {format(new Date(summaryData.date), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formatEmotionSummary()}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Emotion Trends</CardTitle>
          <CardDescription>
            Your emotional patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="mb-4">
              <TabsTrigger value="line"><TrendingUpIcon className="h-4 w-4 mr-2" /> Line</TabsTrigger>
              <TabsTrigger value="bar"><BarChart3Icon className="h-4 w-4 mr-2" /> Bar</TabsTrigger>
              <TabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" /> Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareLineChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {trendData.slice(0, 5).map((trend) => (
                      <Line 
                        key={trend.emotion}
                        type="monotone" 
                        dataKey={trend.emotion} 
                        name={trend.emotion}
                        stroke={getChartColor(trend.category)}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="bar">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getEmotionTrendsData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis label={{ value: 'Average Intensity', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageIntensity" name="Average Intensity" fill="#8884d8">
                      {getEmotionTrendsData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColor(entry.category)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="pie">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(getCategoryCounts()).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell key="positive" fill="#4ade80" />
                      <Cell key="negative" fill="#ef4444" />
                      <Cell key="neutral" fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionInsightsTab;