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
  Activity, TrendingUp, Calendar, Info, ChevronRight 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip, Sector, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';

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
    
    // Transform data for the bar chart
    const chartData = trendData.map(day => {
      // Ensure intensity is a proper number by converting explicitly
      const intensity = parseFloat((day.averageIntensity || 0).toString());
      
      return {
        date: format(new Date(day.date), 'MMM d'),
        fullDate: format(new Date(day.date), 'MMM d, yyyy'),
        intensity: isNaN(intensity) ? 0 : intensity, // Fallback to 0 if NaN
        category: day.dominantCategory || 'unknown',
        emotion: day.dominantEmotion || 'Unknown'
      };
    });

    // Define colors for different emotion categories
    const categoryColors = {
      positive: "#4CAF50",
      negative: "#F44336", 
      neutral: "#9E9E9E",
      unknown: "#BDBDBD"
    };
    
    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        
        // Determine color for the emotion category
        const categoryColor = categoryColors[data.category as keyof typeof categoryColors];
        const emotionCategoryLabel = data.category.charAt(0).toUpperCase() + data.category.slice(1);
        
        return (
          <div className="p-4 bg-white shadow-lg rounded-md border border-gray-200 max-w-xs">
            <div className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: categoryColor }}
              ></div>
              <p className="font-bold text-sm">{data.fullDate}</p>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Primary Emotion</p>
                <p className="font-medium">{data.emotion}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-medium">{emotionCategoryLabel}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Intensity</p>
                <div className="flex items-center">
                  <span className="font-bold text-lg">{data.intensity.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1 text-sm">/10</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${data.intensity * 10}%`,
                      backgroundColor: categoryColor
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };
    
    // Add additional debugging for chart data
    if (debug) {
      console.log('Chart Data for Bar Chart:', chartData);
    }
    
    return (
      <div className="w-full h-72">
        <h3 className="font-medium mb-2 text-gray-700">Emotion Intensity Over Time</h3>
        <div className="flex mb-2 text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: categoryColors.positive }}></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: categoryColors.negative }}></div>
            <span>Negative</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: categoryColors.neutral }}></div>
            <span>Neutral</span>
          </div>
        </div>
        
        <div className="flex flex-col h-4/5">
          {/* Chart Header with Timeline Selector */}
          <div className="mb-3 flex justify-center">
            <div className="inline-flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
              {chartData.map((day, index) => (
                <div 
                  key={index} 
                  className={`text-xs py-1 px-3 rounded-md cursor-pointer transition-all
                  ${index === 0 ? 'bg-white shadow-sm font-medium' : 'hover:bg-gray-100'}`}
                >
                  {day.date}
                </div>
              ))}
            </div>
          </div>
          
          {/* Pie/Circle Chart */}
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  dataKey="intensity"
                  nameKey="date"
                  animationDuration={800}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={categoryColors[entry.category as keyof typeof categoryColors]} 
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                
                {/* Add a center circle with info */}
                <text 
                  x="50%" 
                  y="45%" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="font-bold"
                  fontSize={16}
                >
                  {chartData.length > 0 ? chartData[0].intensity.toFixed(1) : '0.0'}
                </text>
                <text 
                  x="50%" 
                  y="55%" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="fill-gray-500"
                  fontSize={12}
                >
                  Latest intensity
                </text>
                
                <Tooltip 
                  content={<CustomTooltip />}
                  formatter={(value: any) => [value.toFixed(1), 'Intensity']} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Add emotion type labels around the pie chart */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-center font-medium text-gray-600">
              Positive
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-xs text-center font-medium text-gray-600">
              Negative
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-xs text-center font-medium text-gray-600">
              Neutral
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-xs text-center font-medium text-gray-600">
              Mixed
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-1">
          Hover over sections to see detailed information
        </p>
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
      <div className="bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {/* Radial Intensity Chart */}
          <div className="relative w-full md:w-1/3 flex items-center justify-center pb-8">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circles for scale */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#f9fafb" strokeWidth="10" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="#f9fafb" strokeWidth="10" />
                <circle cx="50" cy="50" r="5" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                
                {/* Scale markers */}
                <text x="50" y="10" fontSize="6" textAnchor="middle" fill="#9ca3af">10</text>
                <text x="50" y="20" fontSize="6" textAnchor="middle" fill="#9ca3af">8</text>
                <text x="50" y="30" fontSize="6" textAnchor="middle" fill="#9ca3af">6</text>
                <text x="50" y="40" fontSize="6" textAnchor="middle" fill="#9ca3af">4</text>
                <text x="50" y="50" fontSize="6" textAnchor="middle" fill="#9ca3af">2</text>
                
                {/* Intensity arcs */}
                {highIntensityEmotions.map((item, index) => {
                  // Calculate position parameters
                  const total = highIntensityEmotions.length;
                  const angleSlice = (Math.PI * 2) / total;
                  const startAngle = index * angleSlice;
                  const endAngle = (index + 0.8) * angleSlice; // 0.8 to leave gap between slices
                  
                  // Convert intensity to radius (0-10 scale to 0-45 radius)
                  const radius = (item.intensity / 10) * 45;
                  
                  // Generate colors array
                  const colors = [
                    '#3b82f6', // blue
                    '#10b981', // green
                    '#8b5cf6', // purple
                    '#f59e0b', // yellow
                    '#6366f1'  // indigo
                  ];
                  
                  // Calculate arc path
                  // We'll reverse the angles for a clockwise orientation
                  const startX = 50 + radius * Math.cos(2 * Math.PI - startAngle);
                  const startY = 50 + radius * Math.sin(2 * Math.PI - startAngle);
                  const endX = 50 + radius * Math.cos(2 * Math.PI - endAngle);
                  const endY = 50 + radius * Math.sin(2 * Math.PI - endAngle);
                  
                  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
                  
                  // Calculate label position
                  const labelAngle = (startAngle + endAngle) / 2;
                  const labelRadius = radius + 5;
                  const labelX = 50 + labelRadius * Math.cos(2 * Math.PI - labelAngle);
                  const labelY = 50 + labelRadius * Math.sin(2 * Math.PI - labelAngle);
                  
                  return (
                    <g key={index}>
                      {/* Intensity arc */}
                      <path
                        d={`M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                        fill={colors[index % colors.length]}
                        opacity="0.7"
                        className="hover:opacity-90 transition-opacity cursor-pointer"
                      />
                      
                      {/* Emotion label */}
                      <text 
                        x={labelX} 
                        y={labelY}
                        fontSize="6" 
                        textAnchor="middle"
                        fill="#1f2937"
                        fontWeight="bold"
                      >
                        {item.intensity.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle cx="50" cy="50" r="5" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Legend at the bottom */}
                <text x="50" y="95" fontSize="6" textAnchor="middle" fill="#6b7280">
                  Intensity Scale: 0-10
                </text>
              </svg>
            </div>
          </div>
          
          {/* Bar section - traditional representation */}
          <div className="w-full md:w-2/3 pl-0 md:pl-4">
            <div className="space-y-3">
              {highIntensityEmotions.map((item, index) => {
                // Generate colors
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-yellow-500',
                  'bg-indigo-500'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.emotion}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">{item.intensity.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">/10</span>
                      </div>
                    </div>
                    
                    {/* Enhanced progress bar with gradient */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                      {/* Scale markers */}
                      <div className="absolute inset-y-0 left-0 right-0 flex justify-between px-1">
                        {[...Array(11)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-px h-full bg-gray-200"
                            style={{ left: `${i * 10}%` }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* Actual progress bar */}
                      <div 
                        className={`h-full ${colorClass} rounded-full`} 
                        style={{ width: `${item.intensity * 10}%` }}
                      >
                        {/* Add shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                      </div>
                    </div>
                    
                    {/* Intensity label */}
                    <div className="mt-1 text-xs text-gray-500">
                      {getIntensityLabel(item.intensity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
                <h3 className="text-lg font-semibold">Emotion Intensity Over Time</h3>
              </div>
              
              {/* Bar Chart for Emotion Intensity Over Time */}
              <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Emotion Intensity Over Time</span>
                </div>
                
                {trendData.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-muted-foreground">
                    Not enough data to show trends
                  </div>
                ) : (
                  <div>
                    {/* Category legend at top */}
                    <div className="flex items-center justify-center space-x-4 mb-4 text-xs">
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
                    
                    {/* Simplified Emotions Trend Chart (Column Bar Style) */}
                    <div className="relative h-48 flex items-end space-x-1 mx-4 border-b border-gray-200 pt-2">
                      {/* Y-axis labels and gridlines */}
                      <div className="absolute inset-y-0 left-0 w-8 -ml-10 flex flex-col justify-between">
                        <div className="text-xs text-gray-500">10</div>
                        <div className="text-xs text-gray-500">5</div>
                        <div className="text-xs text-gray-500">0</div>
                      </div>
                      
                      {/* Horizontal grid lines */}
                      <div className="absolute w-full border-t border-gray-100" style={{top: '0%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '50%'}}></div>
                      <div className="absolute w-full border-t border-gray-100" style={{top: '100%'}}></div>
                      
                      {/* Column bars */}
                      {trendData.map((day, index) => {
                        // Determine color based on emotion category
                        let barColor;
                        let textColor;
                        if (day.dominantCategory === 'positive') {
                          barColor = 'bg-gradient-to-t from-blue-600 to-blue-400';
                          textColor = 'text-blue-600';
                        } else if (day.dominantCategory === 'negative') {
                          barColor = 'bg-gradient-to-t from-red-600 to-red-400';
                          textColor = 'text-red-600';
                        } else {
                          barColor = 'bg-gradient-to-t from-purple-600 to-purple-400';
                          textColor = 'text-purple-600';
                        }
                        
                        const height = `${day.averageIntensity * 10}%`;
                        const isToday = isSameDay(new Date(day.date), new Date());
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Bar */}
                            <div 
                              className={`w-full ${barColor} rounded-t-md shadow-sm relative group-hover:opacity-80 transition-all`}
                              style={{ height }}
                            >
                              {/* Add shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-30"></div>
                              
                              {/* Intensity label on hover */}
                              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {day.averageIntensity.toFixed(1)}/10
                              </div>
                            </div>
                            
                            {/* Date label */}
                            <div className={`text-[10px] mt-1.5 ${textColor} font-medium ${isToday ? 'font-bold' : ''}`}>
                              {format(new Date(day.date), 'MMM d')}
                            </div>
                            
                            {/* Information overlay on hover */}
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-lg p-2.5 w-44 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              <div className="text-xs font-semibold mb-1">
                                {format(new Date(day.date), 'MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center text-xs">
                                <div className={`h-2 w-2 rounded-full ${day.dominantCategory === 'positive' ? 'bg-blue-500' : day.dominantCategory === 'negative' ? 'bg-red-500' : 'bg-purple-500'} mr-1.5`}></div>
                                <span className="font-medium">{day.dominantEmotion || 'Unknown'}</span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-xs">
                                <span className="text-gray-500">Intensity:</span>
                                <span className="font-bold">{day.averageIntensity.toFixed(1)}/10</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full ${day.dominantCategory === 'positive' ? 'bg-blue-500' : day.dominantCategory === 'negative' ? 'bg-red-500' : 'bg-purple-500'}`} style={{width: `${day.averageIntensity * 10}%`}}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Legend at bottom */}
                    <div className="text-center text-xs text-gray-500 mt-4 bg-gray-50 py-1 rounded">
                      Hover over bars to see detailed information
                    </div>
                  </div>
                )}
              </div>
              
              {/* Distribution section with Circle Graph */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Most Frequent Emotions</span>
                  {frequentEmotions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Total: {frequentEmotions.reduce((sum, item) => sum + item.count, 0)} tracked
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  {frequentEmotions.length === 0 ? (
                    <div className="text-muted-foreground text-sm py-8 flex items-center justify-center h-full">
                      No emotion data available
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row">
                      {/* Recharts Pie Chart Visualization */}
                      <div className="relative w-full md:w-1/3 flex items-center justify-center pb-8">
                        <div className="relative w-64 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={frequentEmotions.map(item => ({
                                  name: item.emotion,
                                  value: item.count
                                }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {frequentEmotions.map((_, index) => {
                                  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1'];
                                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />;
                                })}
                              </Pie>
                              <Tooltip
                                formatter={(value, name) => [`${value} occurrences`, name]}
                                contentStyle={{ borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                iconType="circle" 
                                layout="horizontal"
                                wrapperStyle={{ paddingTop: '10px' }}
                              />
                              <text 
                                x="50%" 
                                y="50%" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fill="#111"
                                fontSize={14}
                                fontWeight="bold"
                              >
                                {frequentEmotions.reduce((sum, item) => sum + item.count, 0)}
                              </text>
                              <text 
                                x="50%" 
                                y="37%" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fill="#666"
                                fontSize={10}
                              >
                                TOTAL
                              </text>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Bar Chart - right side */}
                      <div className="w-full md:w-2/3 pl-0 md:pl-4">
                        <ScrollArea className="h-[180px] pr-4">
                          <div className="space-y-4">
                            {frequentEmotions.map((item, index) => {
                              // Generate a color based on the emotion type
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
                                  
                                  {/* Additional details like percentage and intensity */}
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
                        </ScrollArea>
                      </div>
                    </div>
                  )}
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