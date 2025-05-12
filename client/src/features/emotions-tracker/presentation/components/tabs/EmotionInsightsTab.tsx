import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, subDays, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, PieChart, LineChart, 
  Activity, TrendingUp, Calendar, Info, ChevronRight 
} from 'lucide-react';

const EmotionInsightsTab = () => {
  const { getEmotionTrends, getEmotionSummary, getMostFrequentEmotions, getHighestIntensityEmotions } = useEmotions();
  const [timeframe, setTimeframe] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [frequentEmotions, setFrequentEmotions] = useState<{emotion: string; count: number}[]>([]);
  const [highIntensityEmotions, setHighIntensityEmotions] = useState<{emotion: string; intensity: number}[]>([]);
  
  useEffect(() => {
    fetchData();
  }, [timeframe]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      let startDate;
      
      // Calculate start date based on selected timeframe
      switch (timeframe) {
        case '7days':
          startDate = subDays(today, 7);
          break;
        case '30days':
          startDate = subDays(today, 30);
          break;
        case '90days':
          startDate = subDays(today, 90);
          break;
        default:
          startDate = subDays(today, 7);
      }
      
      const fromDateStr = format(startDate, 'yyyy-MM-dd');
      const toDateStr = format(today, 'yyyy-MM-dd');
      
      // Fetch emotion trends
      const trends = await getEmotionTrends(fromDateStr, toDateStr);
      setTrendData(trends);
      
      // Fetch today's summary
      const summary = await getEmotionSummary(toDateStr);
      setSummaryData(summary);
      
      // Fetch most frequent emotions
      const frequent = await getMostFrequentEmotions(fromDateStr, toDateStr, 5);
      setFrequentEmotions(frequent);
      
      // Fetch highest intensity emotions
      const highIntensity = await getHighestIntensityEmotions(fromDateStr, toDateStr, 5);
      setHighIntensityEmotions(highIntensity);
      
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderEmotionIntensityChart = () => {
    // If we have no data, show a placeholder
    if (!trendData || trendData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for selected timeframe</p>
        </div>
      );
    }
    
    // Render a simple bar chart of average intensities by date
    return (
      <div className="h-64 flex items-end space-x-2">
        {trendData.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full rounded-t"
              style={{
                height: `${day.averageIntensity * 10}%`,
                backgroundColor: day.dominantCategory === 'positive' ? '#4CAF50' :
                                day.dominantCategory === 'negative' ? '#F44336' : '#9E9E9E'
              }}
            />
            <div className="text-xs mt-1 text-muted-foreground">
              {format(new Date(day.date), 'MM/dd')}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderEmotionDistributionChart = () => {
    // If we have no data, show a placeholder
    if (!frequentEmotions || frequentEmotions.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for selected timeframe</p>
        </div>
      );
    }
    
    // Calculate total for percentage
    const total = frequentEmotions.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="space-y-3">
        {frequentEmotions.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.emotion}</span>
              <span>{Math.round((item.count / total) * 100)}%</span>
            </div>
            <Progress value={(item.count / total) * 100} className="h-2" />
          </div>
        ))}
      </div>
    );
  };
  
  const renderIntensityRankingChart = () => {
    // If we have no data, show a placeholder
    if (!highIntensityEmotions || highIntensityEmotions.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for selected timeframe</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {highIntensityEmotions.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.emotion}</span>
              <span>{item.intensity.toFixed(1)}/10</span>
            </div>
            <Progress value={item.intensity * 10} className="h-2" />
          </div>
        ))}
      </div>
    );
  };
  
  // Helper to get emotion color
  const getEmotionColor = (category: string): string => {
    switch(category) {
      case 'positive': return 'bg-blue-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  // Helper to get intensity level label
  const getIntensityLabel = (intensity: number): string => {
    if (intensity >= 8) return 'Very High';
    if (intensity >= 6) return 'High';
    if (intensity >= 4) return 'Moderate';
    if (intensity >= 2) return 'Low';
    return 'Very Low';
  };

  // New calendar emotion representation
  const renderCalendarView = () => {
    const today = new Date();
    const days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      
      // Find matching trend data
      const matchingDay = trendData.find(day => 
        day.date && isSameDay(new Date(day.date), date)
      );
      
      days.push({
        date,
        matchingDay
      });
    }
    
    return (
      <div className="grid grid-cols-7 gap-1 mt-3">
        {days.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">
              {format(item.date, 'EEE')}
            </div>
            
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 
                ${isSameDay(item.date, today) ? 'border-2 border-primary' : ''}`}
            >
              {format(item.date, 'd')}
            </div>
            
            {item.matchingDay ? (
              <div 
                className={`w-4 h-4 rounded-full ${getEmotionColor(item.matchingDay.dominantCategory)}`}
                title={`Average intensity: ${item.matchingDay.averageIntensity.toFixed(1)}/10`}
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-200" title="No data" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with timeframe selector */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Emotions</h2>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px] border-0 bg-gray-100 text-sm">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground mt-1">
          {timeframe === '7days' ? 'Past Week' : 
           timeframe === '30days' ? 'Past Month' : 'Past 3 Months'}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Header - Apple Health Style */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Emotion Summary</h3>
              </div>

              {/* Calendar week view */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  This Week
                </div>
                {renderCalendarView()}
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-6">
                {/* Today's summary */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Today
                  </div>
                  
                  {!summaryData || !summaryData.dominantEmotion ? (
                    <div className="text-muted-foreground text-sm py-1">No emotions tracked yet</div>
                  ) : (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        {summaryData.dominantEmotion}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        dominant
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Average intensity */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Average Intensity
                  </div>
                  
                  {!summaryData ? (
                    <div className="text-muted-foreground text-sm py-1">No data</div>
                  ) : (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        {summaryData.averageIntensity?.toFixed(1) || "0"}/10
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {getIntensityLabel(summaryData.averageIntensity || 0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* View details button */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <button 
                  className="flex items-center justify-between w-full text-sm text-blue-500 font-medium"
                  onClick={() => window.location.href = '/emotions/history'}
                >
                  <span>View Detailed History</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Trends Section - Apple Health Style */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Emotion Trends</h3>
              </div>
              
              {/* Trends visualization */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm font-medium text-gray-700 mb-4">
                  Emotion Intensity Over Time
                </div>
                
                {trendData.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    Not enough data to show trends
                  </div>
                ) : (
                  <div className="h-32 flex items-end space-x-1">
                    {trendData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full rounded-t transition-all ${
                            day.dominantCategory === 'positive' ? 'bg-blue-500' :
                            day.dominantCategory === 'negative' ? 'bg-red-500' : 'bg-purple-500'
                          }`}
                          style={{
                            height: `${Math.max(5, day.averageIntensity * 10)}%`,
                            opacity: 0.7 + (index / (trendData.length * 2))
                          }}
                        />
                        <div className="text-xs mt-1 text-muted-foreground">
                          {format(new Date(day.date), 'MM/dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Distribution section */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Most Frequent Emotions
                </div>
                
                <ScrollArea className="h-[160px] pr-4">
                  {frequentEmotions.length === 0 ? (
                    <div className="text-muted-foreground text-sm py-2">No data available</div>
                  ) : (
                    <div className="space-y-3">
                      {frequentEmotions.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-24 text-sm">{item.emotion}</div>
                          <div className="flex-1 mx-2">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (item.count / (frequentEmotions[0]?.count || 1)) * 100)}%`,
                                  opacity: 1 - (index * 0.15)
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-sm text-right w-12">{item.count}x</div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              {/* View more button */}
              <div className="pt-4 border-t border-gray-100">
                <button 
                  className="flex items-center justify-between w-full text-sm text-blue-500 font-medium"
                  onClick={() => window.location.href = '/emotions/insights'}
                >
                  <span>View Advanced Analytics</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Insights Section - Apple Health Style */}
          {(highIntensityEmotions.length > 0 || frequentEmotions.length > 0 || trendData.length > 1) && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Key Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {highIntensityEmotions.length > 0 && (
                    <div className="flex">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 shrink-0">
                        <Activity className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Highest Intensity</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{highIntensityEmotions[0]?.emotion}</span> is your most intense emotion 
                          ({highIntensityEmotions[0]?.intensity.toFixed(1)}/10)
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {frequentEmotions.length > 0 && (
                    <div className="flex">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 shrink-0">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Most Frequent</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{frequentEmotions[0]?.emotion}</span> appears {frequentEmotions[0]?.count} times 
                          in your emotion logs
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {trendData.length > 1 && (() => {
                    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
                    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
                    
                    const firstHalfPositive = firstHalf.filter(d => d.dominantCategory === 'positive').length;
                    const secondHalfPositive = secondHalf.filter(d => d.dominantCategory === 'positive').length;
                    
                    const positiveChange = secondHalfPositive / secondHalf.length - firstHalfPositive / firstHalf.length;
                    
                    let trendIcon = <TrendingUp className="h-5 w-5 text-gray-600" />;
                    let trendTitle = 'Stable Emotions';
                    let trendMessage = 'Your emotions have been relatively stable';
                    
                    if (positiveChange > 0.2) {
                      trendTitle = 'Improving Trend';
                      trendMessage = 'Your emotional wellbeing is improving';
                      trendIcon = <TrendingUp className="h-5 w-5 text-green-600" />;
                    } else if (positiveChange < -0.2) {
                      trendTitle = 'Declining Trend';
                      trendMessage = 'Your emotional wellbeing needs attention';
                      trendIcon = <TrendingUp className="h-5 w-5 text-red-600" />;
                    }
                    
                    return (
                      <div className="flex">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 shrink-0">
                          {trendIcon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{trendTitle}</div>
                          <div className="text-sm text-gray-600">{trendMessage}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* View more button */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <button 
                    className="flex items-center justify-between w-full text-sm text-blue-500 font-medium"
                    onClick={() => window.location.href = '/emotions/journal'}
                  >
                    <span>View Emotional Journal</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionInsightsTab;