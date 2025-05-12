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
        
        // Fetch today's summary data
        getEmotionSummary(format(today, 'yyyy-MM-dd')),
        
        // Get most frequent emotions
        getMostFrequentEmotions(fromDateStr, toDateStr, 5),
        
        // Get highest intensity emotions
        getHighestIntensityEmotions(fromDateStr, toDateStr, 5)
      ]);
      
      // Set trend data with enhanced visualization
      setTrendData(enhanceDataForVisualization(trends));
      
      // Set summary data
      setSummaryData(summary);
      
      // Set frequent emotions
      setFrequentEmotions(frequent || []);
      
      // Set high intensity emotions
      setHighIntensityEmotions(highIntensity || []);
      
    } catch (error) {
      console.error('Error fetching emotion insights:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get proper color for emotion category
  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'positive':
        return 'bg-blue-500';
      case 'negative':
        return 'bg-red-500';
      case 'neutral':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getCategoryFill = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'positive':
        return '#3B82F6';
      case 'negative':
        return '#EF4444';
      case 'neutral':
        return '#8B5CF6';
      default:
        return '#9CA3AF';
    }
  };
  
  const getEmoji = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      case 'neutral':
        return '😐';
      default:
        return '❓';
    }
  };
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
          {payload.emotion}
        </text>
        <text x={cx} y={cy} dy={18} textAnchor="middle" fill="#666" fontSize={12}>
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Prepare pie chart data for emotion categories
  const prepareCategoryData = () => {
    const categories: {[key: string]: number} = {
      'positive': 0,
      'negative': 0,
      'neutral': 0,
      'unknown': 0
    };
    
    trendData.forEach(day => {
      const category = day.dominantCategory || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count
      }));
  };

  // Get color for pie chart sections
  const getCategoryPieColor = (name: string) => {
    switch (name) {
      case 'Positive': return '#4CAF50';
      case 'Negative': return '#F44336';
      case 'Neutral': return '#9E9E9E';
      default: return '#BDBDBD';
    }
  };

  // Render custom labels for the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill={getCategoryPieColor(name)}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    ) : null;
  };

  return (
    <div className="container mx-auto pb-16">
      {/* Top Controls Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Emotion Insights</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Past 7 days</SelectItem>
              <SelectItem value="30days">Past 30 days</SelectItem>
              <SelectItem value="90days">Past 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading emotion insights...</div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Emotions Logged */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Total Entries</h3>
                      <p className="text-sm text-gray-500">All emotions logged</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {trendData.length || 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dominant Category */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${summaryData?.dominantCategory ? getCategoryColor(summaryData.dominantCategory) : 'bg-gray-100'} bg-opacity-20 flex items-center justify-center mr-3`}>
                      <span className="text-xl">{summaryData?.dominantCategory ? getEmoji(summaryData.dominantCategory) : '❓'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dominant Emotion</h3>
                      <p className="text-sm text-gray-500">Most frequent type</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold capitalize">
                    {summaryData?.dominantCategory || 'None'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Average Intensity */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Avg Intensity</h3>
                      <p className="text-sm text-gray-500">Overall feeling strength</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {summaryData?.averageIntensity ? 
                      Number(summaryData.averageIntensity).toFixed(1) : 
                      'N/A'
                    }
                  </div>
                </div>
                
                {summaryData?.averageIntensity && (
                  <div className="mt-2">
                    <Progress 
                      value={Number(summaryData.averageIntensity) * 10} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                )}
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
                <h3 className="text-lg font-semibold">Emotion Categories Analysis</h3>
              </div>
              
              {/* Pie Chart for Emotion Categories */}
              <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Emotion Categories Distribution</span>
                </div>
                
                {trendData.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-muted-foreground">
                    Not enough data to show category distribution
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
                    
                    {/* Category distribution pie chart */}
                    <div className="flex flex-col md:flex-row items-center">
                      {/* Left side - Pie Chart */}
                      <div className="w-full md:w-1/2 h-60 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareCategoryData()}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              innerRadius={30}
                              paddingAngle={2}
                              dataKey="value"
                              label={renderCustomizedLabel}
                            >
                              {prepareCategoryData().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getCategoryPieColor(entry.name)} 
                                  stroke="#fff"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} occurrences`, 'Count']}
                            />
                            {/* Center text */}
                            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize={18}>
                              {trendData.length}
                            </text>
                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize={12}>
                              TOTAL
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Right side - Category list */}
                      <div className="w-full md:w-1/2 pl-0 md:pl-4 mt-4 md:mt-0">
                        <div className="space-y-3">
                          {prepareCategoryData().map((item, index) => {
                            const percentage = (item.value / trendData.length) * 100;
                            return (
                              <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2" 
                                      style={{ backgroundColor: getCategoryPieColor(item.name) }}
                                    ></div>
                                    <span>{item.name}</span>
                                  </div>
                                  <span>{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full" 
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: getCategoryPieColor(item.name)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 mt-4 bg-gray-50 py-1 rounded">
                      Emotion category distribution over the selected period
                    </div>
                  </div>
                )}
              </div>
              
              {/* Distribution section with Circle Graph */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Most Frequent Emotions</span>
                  {frequentEmotions.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Top {frequentEmotions.length} emotions
                    </span>
                  )}
                </div>
                
                {frequentEmotions.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-muted-foreground">
                    Not enough data to show frequent emotions
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row">
                    {/* Circle chart on the left */}
                    <div className="w-full md:w-1/2 h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={0}
                            activeShape={renderActiveShape}
                            data={frequentEmotions.map(item => ({
                              emotion: item.emotion,
                              value: item.count
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {frequentEmotions.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'][index % 5]} />
                            ))}
                          </Pie>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl">
                            {frequentEmotions.reduce((sum, item) => sum + item.count, 0)}
                          </text>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Horizontal bar chart on the right */}
                    <div className="w-full md:w-1/2 pl-0 md:pl-8 mt-4 md:mt-0">
                      <ScrollArea className="h-60">
                        <div className="space-y-3">
                          {frequentEmotions.map((item, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{item.emotion}</span>
                                <span>{item.count}x</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${(item.count / frequentEmotions[0].count) * 100}%`,
                                    backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'][index % 5]
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Highest Intensity Section */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>Highest Intensity Emotions</span>
                  {highIntensityEmotions.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Top {highIntensityEmotions.length} by intensity
                    </span>
                  )}
                </div>
                
                {highIntensityEmotions.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-muted-foreground">
                    Not enough data to show intensity patterns
                  </div>
                ) : (
                  <div className="space-y-3">
                    {highIntensityEmotions.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-100 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">
                              {item.emotion === 'Happy' ? '😊' : 
                               item.emotion === 'Sad' ? '😢' :
                               item.emotion === 'Angry' ? '😠' :
                               item.emotion === 'Anxious' ? '😰' :
                               item.emotion === 'Content' ? '😌' : '😶'}
                            </span>
                            <span className="font-medium">{item.emotion}</span>
                          </div>
                          <Badge variant="outline" className="bg-orange-50">
                            Intensity {Number(item.intensity).toFixed(1)}/10
                          </Badge>
                        </div>
                        <Progress value={Number(item.intensity) * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* View more button */}
              <div className="pt-4 border-t border-gray-100">
                <button 
                  className="flex items-center justify-between w-full text-sm text-blue-500 font-medium"
                  onClick={() => console.log('View detailed analytics')}
                >
                  <span>View detailed analytics</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Calendar View - Most Recent Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Calendar View</h3>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = subDays(new Date(), 6 - i);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const matchingDay = trendData.find(day => day.date === dateStr);
                  
                  let bgColor = 'bg-gray-100';
                  if (matchingDay) {
                    bgColor = matchingDay.dominantCategory === 'positive' ? 'bg-blue-100' :
                              matchingDay.dominantCategory === 'negative' ? 'bg-red-100' :
                              'bg-purple-100';
                  }
                  
                  return (
                    <div 
                      key={i} 
                      className={`p-3 ${bgColor} rounded-lg cursor-pointer transition-all hover:opacity-80 text-center`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="text-xs mb-1">{format(date, 'EEE')}</div>
                      <div className="text-lg font-medium">{format(date, 'd')}</div>
                      {matchingDay && (
                        <div className="mt-1 truncate text-xs">
                          {matchingDay.dominantEmotion || 'Unknown'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {selectedDate && (
                <div className="mt-4 p-4 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h4>
                    <button 
                      className="text-xs text-gray-500"
                      onClick={() => setSelectedDate(null)}
                    >
                      Clear
                    </button>
                  </div>
                  
                  {(() => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const dayData = trendData.find(day => day.date === dateStr);
                    
                    if (!dayData) {
                      return (
                        <div className="text-gray-500 text-sm">
                          No emotions logged for this day
                        </div>
                      );
                    }
                    
                    return (
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500">Dominant Emotion</div>
                            <div className="font-medium">{dayData.dominantEmotion || 'Unknown'}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500">Average Intensity</div>
                            <div className="font-medium">{Number(dayData.averageIntensity).toFixed(1)}/10</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Category</div>
                          <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full ${getCategoryColor(dayData.dominantCategory)} mr-2`}></div>
                            <div className="font-medium capitalize">{dayData.dominantCategory || 'Unknown'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

