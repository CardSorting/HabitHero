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
      
      setTrendData(trends || []);
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

    const getEmotionTooltip = (day: any) => {
      if (!day.matchingDay) return "No emotions tracked";
      return `${day.matchingDay.dominantEmotion || 'Mixed emotions'}: ${day.matchingDay.averageIntensity?.toFixed(1) || '0'}/10`;
    };
    
    const handleDayClick = (date: Date, data: any) => {
      // Toggle selection
      setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date);
    };
    
    return (
      <div className="mt-3">
        <div className="grid grid-cols-7 gap-1">
          {days.map((item, idx) => {
            const isSelected = selectedDate && isSameDay(selectedDate, item.date);
            const isToday = isSameDay(item.date, today);
            
            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center cursor-pointer transition-all
                  ${isSelected ? 'transform scale-110' : ''}
                  ${isSelected ? 'opacity-100' : 'opacity-90'}
                  hover:opacity-100`}
                onClick={() => handleDayClick(item.date, item.matchingDay)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(item.date, 'EEE')}
                </div>
                
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium mb-1 
                    ${isToday ? 'border-2 border-primary' : ''}
                    ${isSelected ? 'bg-blue-50 shadow-sm' : ''}`}
                >
                  {format(item.date, 'd')}
                </div>
                
                {item.matchingDay ? (
                  <div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${getEmotionColor(item.matchingDay.dominantCategory)}`}
                    title={getEmotionTooltip(item)}
                  >
                    {isSelected && (
                      <div className="text-[9px] text-white font-semibold">
                        {Math.round(item.matchingDay.averageIntensity || 0)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center" title="No data">
                    {isSelected && <span className="text-[9px] text-gray-500">-</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Selected day details */}
        {selectedDate && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-sm">
            <div className="font-medium">{format(selectedDate, 'EEEE, MMMM d')}</div>
            
            {(() => {
              const selectedDay = days.find(d => isSameDay(d.date, selectedDate));
              
              if (!selectedDay?.matchingDay) {
                return (
                  <div className="text-muted-foreground mt-1">
                    No emotions tracked on this day
                  </div>
                );
              }
              
              return (
                <div className="mt-1 text-gray-600">
                  <span className="font-medium">
                    {selectedDay.matchingDay.dominantEmotion || 'Mixed emotions'}
                  </span>
                  {' '}was your most significant emotion with an intensity of{' '}
                  <span className="font-medium">
                    {selectedDay.matchingDay.averageIntensity?.toFixed(1) || '0'}/10
                  </span>
                </div>
              );
            })()}
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
                    
                    {/* Chart area with grid */}
                    <div className="relative h-36 border-b border-l border-gray-200 bg-white">
                      {/* Horizontal grid lines */}
                      <div className="absolute w-full border-t border-gray-100" style={{top: '0%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '25%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '50%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '75%'}}></div>
                      
                      {/* Data points */}
                      <div className="absolute inset-0 flex items-end pr-2">
                        <div className="flex-1 flex items-end justify-around h-full">
                          {trendData.map((day, index) => (
                            <div key={index} className="relative group" style={{width: '12%'}}>
                              {/* Connection lines between points */}
                              {index > 0 && (
                                <div 
                                  className="absolute h-px bg-gray-300"
                                  style={{
                                    width: '100%',
                                    top: `${100 - (day.averageIntensity * 10)}%`,
                                    left: '-50%',
                                    transform: `rotate(${Math.atan2(
                                      (trendData[index-1].averageIntensity - day.averageIntensity) * 10,
                                      100
                                    )}rad)`,
                                    transformOrigin: '0 50%'
                                  }}
                                ></div>
                              )}
                              
                              {/* Data point */}
                              <div
                                className={`absolute w-4 h-4 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all
                                  ${day.dominantCategory === 'positive' ? 'bg-blue-500' :
                                    day.dominantCategory === 'negative' ? 'bg-red-500' : 'bg-purple-500'
                                  }
                                  group-hover:scale-125
                                `}
                                style={{
                                  left: '50%',
                                  bottom: `${day.averageIntensity * 10}%`,
                                  opacity: 0.8 + (index / (trendData.length * 5))
                                }}
                                title={`${format(new Date(day.date), 'MMM dd')}: ${day.averageIntensity.toFixed(1)}/10`}
                              >
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity">
                                  {format(new Date(day.date), 'MMM dd')}: {day.averageIntensity.toFixed(1)}/10
                                </div>
                              </div>
                              
                              {/* Date label */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-6 text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(day.date), 'MM/dd')}
                              </div>
                            </div>
                          ))}
                        </div>
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