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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Add debug state to check response data
  const [debug, setDebug] = useState(true);

  // Enhanced data processing for better visualizations
  const enhanceDataForVisualization = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // If we have just one data point, enhance it with additional context
    if (sortedData.length === 1) {
      const point = sortedData[0];
      const prevDate = format(subDays(new Date(point.date), 1), 'yyyy-MM-dd');
      
      // Add a simulated previous day with slightly lower intensity
      return [
        {
          date: prevDate,
          averageIntensity: Math.max(1, point.averageIntensity * 0.8),
          dominantCategory: point.dominantCategory,
          dominantEmotion: point.dominantEmotion,
          synthetic: true // mark as synthetic data point
        },
        point
      ];
    }
    
    return sortedData;
  };

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
      
      // Fetch in parallel for better performance
      const [trends, summary, frequent, highIntensity] = await Promise.all([
        // Fetch emotion trends
        getEmotionTrends(fromDateStr, toDateStr),
        // Fetch today's summary
        getEmotionSummary(toDateStr),
        // Fetch most frequent emotions
        getMostFrequentEmotions(fromDateStr, toDateStr, 5),
        // Fetch highest intensity emotions
        getHighestIntensityEmotions(fromDateStr, toDateStr, 5)
      ]);
      
      // Log data for debugging
      if (debug) {
        console.log('Trends:', trends);
        console.log('Summary:', summary);
        console.log('Frequent:', frequent);
        console.log('High Intensity:', highIntensity);
      }
      
      // Enhance trend data for better visualization
      const enhancedTrends = enhanceDataForVisualization(trends || []);
      
      setTrendData(enhancedTrends);
      setSummaryData(summary || null);
      setFrequentEmotions(frequent || []);
      setHighIntensityEmotions(highIntensity || []);
      
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

  // Professional calendar with enhanced UI/UX
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

    const getEmotionTooltip = (day: any) => {
      if (!day.matchingDay) return "No emotions tracked";
      return `${day.matchingDay.dominantEmotion || 'Mixed emotions'}: ${day.matchingDay.averageIntensity?.toFixed(1) || '0'}/10`;
    };
    
    const handleDayClick = (date: Date, data: any) => {
      // Toggle selection
      setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date);
    };
    
    // Get color gradient based on emotion category
    const getEmotionGradient = (category?: string) => {
      switch(category) {
        case 'positive': return 'from-blue-400 to-cyan-500';
        case 'negative': return 'from-red-400 to-orange-500';
        case 'neutral': return 'from-purple-400 to-indigo-500';
        default: return 'from-gray-400 to-gray-500';
      }
    };
    
    return (
      <div className="mt-3">
        <div className="grid grid-cols-7 gap-2 pb-1.5">
          {days.map((item, idx) => {
            const isSelected = selectedDate && isSameDay(selectedDate, item.date);
            const isToday = isSameDay(item.date, today);
            const hasData = !!item.matchingDay;
            
            // Determine styling for the day
            const dayContainerClass = `
              relative group flex flex-col items-center cursor-pointer transition-all duration-200
              ${isSelected ? 'opacity-100 transform scale-105' : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'}
            `;
            
            // Styling for date circle
            const dateCircleClass = `
              w-10 h-10 rounded-full flex items-center justify-center font-medium mb-1 
              transition-all duration-200 relative
              ${isToday ? 'border-2 border-blue-500 text-blue-600' : ''}
              ${isSelected ? 'bg-blue-50 shadow' : 'bg-white shadow-sm'}
            `;
            
            // Styling for emotion indicator
            const emotionIndicatorClass = hasData 
              ? `w-6 h-6 flex items-center justify-center rounded-full shadow 
                bg-gradient-to-br ${getEmotionGradient(item.matchingDay?.dominantCategory)}`
              : "w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center";
            
            // Get intensity for progress ring
            const intensity = Math.round((item.matchingDay?.averageIntensity || 0) * 10);
            
            return (
              <div 
                key={idx} 
                className={dayContainerClass}
                onClick={() => handleDayClick(item.date, item.matchingDay)}
              >
                {/* Day of week label - smaller and subtle */}
                <div className="text-xs font-medium text-gray-500 mb-1.5">
                  {format(item.date, 'EEE')}
                </div>
                
                {/* Date circle with optional today highlight */}
                <div className={dateCircleClass}>
                  {format(item.date, 'd')}
                  
                  {/* Circular intensity indicator that wraps around for selected days */}
                  {hasData && isSelected && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        className="stroke-gray-100" 
                        strokeWidth="3"
                      />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        className={`
                          ${item.matchingDay?.dominantCategory === 'positive' ? 'stroke-blue-500' : 
                            item.matchingDay?.dominantCategory === 'negative' ? 'stroke-red-500' : 
                            'stroke-purple-500'}
                        `}
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - intensity}
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                  )}
                </div>
                
                {/* Emotion indicator with hoverable details */}
                <div 
                  className={emotionIndicatorClass}
                  title={getEmotionTooltip(item)}
                >
                  {hasData && (
                    <>
                      <div className={`text-[10px] font-bold text-white ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                        {intensity/10}
                      </div>
                      
                      {/* Hover tooltip with more details */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-1 
                        bg-white border border-gray-200 shadow-lg rounded-md px-2 py-1.5 
                        transition-opacity duration-200 z-10 whitespace-nowrap -translate-x-1/2 left-1/2
                        pointer-events-none"
                      >
                        <div className="text-xs font-medium">{item.matchingDay?.dominantEmotion || 'Mixed'}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Intensity: {item.matchingDay?.averageIntensity?.toFixed(1) || '0'}/10
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!hasData && isSelected && (
                    <span className="text-[10px] text-gray-400">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced selected day details with card-like appearance */}
        {selectedDate && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
              <div className="font-medium text-gray-900">{format(selectedDate, 'EEEE, MMMM d')}</div>
              
              {(() => {
                const selectedDay = days.find(d => isSameDay(d.date, selectedDate));
                
                if (!selectedDay?.matchingDay) {
                  return (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Info className="h-4 w-4 mr-1.5 text-gray-400" />
                      No emotions tracked on this day
                    </div>
                  );
                }
                
                // Get color for visual indicator
                const emotionColor = 
                  selectedDay.matchingDay.dominantCategory === 'positive' ? 'bg-blue-500' : 
                  selectedDay.matchingDay.dominantCategory === 'negative' ? 'bg-red-500' : 
                  'bg-purple-500';
                
                return (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <div className={`h-3 w-3 rounded-full ${emotionColor} mr-2`}></div>
                      <span className="font-medium text-gray-900">
                        {selectedDay.matchingDay.dominantEmotion || 'Mixed emotions'}
                      </span>
                      <span className="mx-1.5 text-gray-400">•</span>
                      <span className="font-semibold">
                        {selectedDay.matchingDay.averageIntensity?.toFixed(1) || '0'}/10
                      </span>
                    </div>
                    
                    {/* Visual intensity gauge */}
                    <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${emotionColor} rounded-full`}
                        style={{ width: `${(selectedDay.matchingDay.averageIntensity || 0) * 10}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-1">
                      This was your strongest emotion for the day
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
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
                  
                  {/* Check if we have tracking data based on either summary OR frequent emotions */}
                  {(!summaryData || !summaryData.dominantEmotion) && frequentEmotions.length > 0 ? (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        {frequentEmotions[0]?.emotion || "None"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        most frequent
                      </div>
                    </div>
                  ) : (!summaryData || !summaryData.dominantEmotion) && frequentEmotions.length === 0 ? (
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
                  
                  {/* Check if we have intensity data from ANY source */}
                  {highIntensityEmotions.length > 0 ? (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        {highIntensityEmotions[0]?.intensity.toFixed(1) || "0"}/10
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {getIntensityLabel(highIntensityEmotions[0]?.intensity || 0)}
                      </div>
                    </div>
                  ) : (summaryData && summaryData.averageIntensity && summaryData.averageIntensity > 0) ? (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        {summaryData.averageIntensity.toFixed(1)}/10
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {getIntensityLabel(summaryData.averageIntensity)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="text-3xl font-semibold mr-2">
                        5.0/10
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {getIntensityLabel(5.0)}
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
              
              {/* Trends visualization - Apple Health Style */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Emotion Intensity Over Time</span>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                      <span>Negative</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Neutral</span>
                    </div>
                  </div>
                </div>
                
                {trendData.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-muted-foreground">
                    Not enough data to show trends
                  </div>
                ) : (
                  <div>
                    {/* Intensity scale */}
                    <div className="flex justify-between text-xs text-muted-foreground mb-1 px-2">
                      <div>0</div>
                      <div>Intensity</div>
                      <div>10</div>
                    </div>
                    
                    {/* Enhanced professional chart area */}
                    <div className="relative h-52 border-b border-l border-gray-200 bg-white rounded-md">
                      {/* Y-axis labels - more detailed scale */}
                      <div className="absolute h-full flex flex-col justify-between text-xs text-gray-500 -ml-6 py-2">
                        <div>10</div>
                        <div>8</div>
                        <div>6</div>
                        <div>4</div>
                        <div>2</div>
                        <div>0</div>
                      </div>
                      
                      {/* Horizontal grid lines - more detailed */}
                      <div className="absolute w-full border-t border-gray-100" style={{top: '0%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '20%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '40%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '60%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '80%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '100%'}}></div>
                      
                      {/* Data area */}
                      <div className="absolute inset-0 px-6 pb-8 pt-2">
                        {/* Area under the curve - for positive emotions */}
                        <svg className="w-full h-full overflow-visible">
                          {/* Area chart for positive emotions */}
                          {trendData.filter(d => d.dominantCategory === 'positive').length > 0 && (
                            <path 
                              d={`
                                M ${trendData.map((day, i) => 
                                  day.dominantCategory === 'positive' 
                                    ? `${(i / (trendData.length - 1)) * 100}% ${100 - (day.averageIntensity * 10)}%` 
                                    : ''
                                ).filter(Boolean).join(' L ')}
                                L ${trendData.filter(d => d.dominantCategory === 'positive').length > 0 ? 100 : 0}% 100%
                                L 0% 100%
                                Z
                              `}
                              fill="url(#positiveGradient)"
                              fillOpacity="0.2"
                            />
                          )}
                          
                          {/* Define gradients */}
                          <defs>
                            <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="neutralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Connection lines and data points */}
                        <div className="absolute inset-0 flex items-end justify-between px-1">
                          {trendData.map((day, index) => {
                            // Style based on emotion category
                            const colorClass = 
                              day.dominantCategory === 'positive' ? 'bg-blue-500 border-blue-600' :
                              day.dominantCategory === 'negative' ? 'bg-red-500 border-red-600' : 
                              'bg-purple-500 border-purple-600';
                              
                            const isFirstOrLast = index === 0 || index === trendData.length - 1;
                            const percentPosition = (index / Math.max(1, trendData.length - 1)) * 100;
                            
                            // Determine point size - show larger points for key data
                            const pointSize = day.synthetic ? 'w-2 h-2' : isFirstOrLast ? 'w-5 h-5' : 'w-4 h-4';
                            const pointBorder = day.synthetic ? '' : 'border-2';
                            
                            return (
                              <div key={index} className="relative group" 
                                style={{
                                  position: 'absolute',
                                  bottom: `${day.averageIntensity * 10}%`, 
                                  left: `${percentPosition}%`,
                                  transform: 'translate(-50%, 50%)'
                                }}
                              >
                                {/* Connection line to next point */}
                                {index < trendData.length - 1 && (
                                  <div 
                                    className="absolute bg-gray-300"
                                    style={{
                                      height: '2px',
                                      width: `${100 / (trendData.length - 1)}%`,
                                      transform: `rotate(${Math.atan2(
                                        (trendData[index+1].averageIntensity - day.averageIntensity) * 10,
                                        100 / (trendData.length - 1)
                                      )}rad)`,
                                      transformOrigin: '0 0',
                                      zIndex: 1
                                    }}
                                  ></div>
                                )}
                                
                                {/* The data point */}
                                <div 
                                  className={`${pointSize} ${pointBorder} ${colorClass} rounded-full shadow-lg z-10 
                                    transform transition-all duration-300 ${day.synthetic ? 'opacity-50' : 'group-hover:scale-125'}
                                  `}
                                >
                                  {/* Pulsing animation for interactive points */}
                                  {!day.synthetic && (
                                    <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white"></span>
                                  )}
                                </div>
                                
                                {/* Professional data visualization tooltip */}
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2
                                  bg-white border border-gray-200 shadow-lg rounded-lg p-3 transform -translate-x-1/2
                                  transition-all duration-200 pointer-events-none z-20 min-w-[200px]"
                                >
                                  {/* Tooltip header with date and indicator */}
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                    <div className="text-sm font-medium text-gray-900">
                                      {format(new Date(day.date), 'MMMM d, yyyy')}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium
                                      ${day.dominantCategory === 'positive' ? 'bg-blue-100 text-blue-700' :
                                        day.dominantCategory === 'negative' ? 'bg-red-100 text-red-700' : 
                                        'bg-purple-100 text-purple-700'}
                                    `}>
                                      {day.dominantCategory?.charAt(0).toUpperCase() + day.dominantCategory?.slice(1) || 'Unknown'}
                                    </div>
                                  </div>
                                  
                                  {/* Emotion information */}
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-500 mb-1">Primary Emotion</div>
                                    <div className="text-sm font-semibold">{day.dominantEmotion || "Unknown"}</div>
                                  </div>
                                  
                                  {/* Intensity meter */}
                                  <div className="mb-1">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>Intensity</span>
                                      <span className="font-medium">{day.averageIntensity.toFixed(1)}/10</span>
                                    </div>
                                    
                                    {/* Professional gauge visualization */}
                                    <div className="h-2 w-full rounded-full overflow-hidden bg-gray-100 relative">
                                      {/* Background segments for scale visualization */}
                                      <div className="absolute inset-0 flex">
                                        <div className="w-1/3 h-full border-r border-white opacity-50"></div>
                                        <div className="w-1/3 h-full border-r border-white opacity-50"></div>
                                        <div className="w-1/3 h-full"></div>
                                      </div>
                                      
                                      {/* Intensity bar with gradient */}
                                      <div 
                                        className={`h-full relative ${
                                          day.dominantCategory === 'positive' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                          day.dominantCategory === 'negative' ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                                          'bg-gradient-to-r from-purple-400 to-purple-600'
                                        }`}
                                        style={{ width: `${day.averageIntensity * 10}%` }}
                                      >
                                        {/* Add shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                                      </div>
                                    </div>
                                    
                                    {/* Intensity scale */}
                                    <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                                      <span>Low</span>
                                      <span>Medium</span>
                                      <span>High</span>
                                    </div>
                                  </div>
                                  
                                  {/* Extra insight - only for non-synthetic data */}
                                  {!day.synthetic && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                      {getIntensityLabel(day.averageIntensity)} intensity level recorded
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* X-axis labels - more precise dates */}
                      <div className="absolute w-full bottom-0 h-8 flex justify-between px-6">
                        {trendData.map((day, index) => {
                          // Only show some date labels to avoid crowding
                          const shouldShow = index === 0 || 
                            index === trendData.length - 1 || 
                            index % Math.max(1, Math.floor(trendData.length / 4)) === 0;
                            
                          return shouldShow ? (
                            <div key={index} 
                              className="text-xs text-gray-500 text-center transform -translate-x-1/2"
                              style={{
                                position: 'absolute',
                                left: `${(index / Math.max(1, trendData.length - 1)) * 100}%`,
                                bottom: '0px'
                              }}
                            >
                              {format(new Date(day.date), day.synthetic ? 'MM/dd' : 'MMM dd')}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Distribution section - Apple Health Style */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Most Frequent Emotions</span>
                  {frequentEmotions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Total: {frequentEmotions.reduce((sum, item) => sum + item.count, 0)} tracked
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <ScrollArea className="h-[180px] pr-4">
                    {frequentEmotions.length === 0 ? (
                      <div className="text-muted-foreground text-sm py-2 flex items-center justify-center h-full">
                        No emotion data available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {frequentEmotions.map((item, index) => {
                          // Generate a color based on the emotion type (just for visualization)
                          const colors = [
                            'from-blue-500 to-blue-400',
                            'from-green-500 to-green-400',
                            'from-purple-500 to-purple-400',
                            'from-yellow-500 to-yellow-400',
                            'from-indigo-500 to-indigo-400'
                          ];
                          const colorClass = colors[index % colors.length];
                          
                          return (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass} mr-2`}></div>
                                  <span className="font-medium text-gray-900">{item.emotion}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-semibold">{item.count}</span>
                                  <span className="text-muted-foreground ml-1">occurrences</span>
                                </div>
                              </div>
                              
                              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorClass} rounded-full transform transition-all duration-500 ease-out`}
                                  style={{ 
                                    width: `${Math.min(100, (item.count / (frequentEmotions[0]?.count || 1)) * 100)}%`
                                  }}
                                >
                                  {/* Simple shimmer-like highlight */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                                </div>
                              </div>
                              
                              {/* Additional details like percentage */}
                              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {Math.round((item.count / frequentEmotions.reduce((sum, item) => sum + item.count, 0)) * 100)}% of total
                                </span>
                                <span className="text-gray-500">
                                  Average intensity: {highIntensityEmotions.find(e => e.emotion === item.emotion)?.intensity.toFixed(1) || "N/A"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                {/* Animation handled through CSS classes */}
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