import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
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
import { BarChart, PieChart, LineChart } from 'lucide-react';

const EmotionInsightsTab = () => {
  const { getEmotionTrends, getEmotionSummary, getMostFrequentEmotions, getHighestIntensityEmotions } = useEmotions();
  const [timeframe, setTimeframe] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [frequentEmotions, setFrequentEmotions] = useState([]);
  const [highIntensityEmotions, setHighIntensityEmotions] = useState([]);
  
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Emotion Insights</h3>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Today's Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Emotion Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {!summaryData || !summaryData.dominantEmotion ? (
                <p className="text-muted-foreground text-center py-2">No emotions tracked today</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Dominant Emotion</p>
                    <p className="text-lg font-medium">{summaryData.dominantEmotion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Average Intensity</p>
                    <p className="text-lg font-medium">{summaryData.averageIntensity.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest Intensity</p>
                    <p className="text-lg font-medium">{summaryData.highestIntensity.emotion} ({summaryData.highestIntensity.value}/10)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emotions Tracked</p>
                    <p className="text-lg font-medium">{summaryData.emotionCount}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Charts Tabs */}
          <Card>
            <CardHeader className="pb-0">
              <Tabs defaultValue="intensity">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="intensity" className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    <span>Intensity</span>
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="flex items-center">
                    <PieChart className="h-4 w-4 mr-2" />
                    <span>Distribution</span>
                  </TabsTrigger>
                  <TabsTrigger value="ranking" className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2" />
                    <span>Ranking</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="intensity" className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Emotion Intensity Over Time</h4>
                  {renderEmotionIntensityChart()}
                </TabsContent>
                
                <TabsContent value="distribution" className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Most Frequent Emotions</h4>
                  {renderEmotionDistributionChart()}
                </TabsContent>
                
                <TabsContent value="ranking" className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Highest Intensity Emotions</h4>
                  {renderIntensityRankingChart()}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
          
          {/* Key Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {!trendData || trendData.length === 0 ? (
                <p className="text-muted-foreground text-center py-2">No data available for analysis</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {highIntensityEmotions && highIntensityEmotions.length > 0 && (
                    <li>
                      <span className="font-medium">{highIntensityEmotions[0].emotion}</span> is your most intense emotion, averaging {highIntensityEmotions[0].intensity.toFixed(1)}/10.
                    </li>
                  )}
                  
                  {frequentEmotions && frequentEmotions.length > 0 && (
                    <li>
                      <span className="font-medium">{frequentEmotions[0].emotion}</span> is your most frequent emotion, tracked {frequentEmotions[0].count} times.
                    </li>
                  )}
                  
                  {/* Determine the overall trend (improving, worsening, stable) */}
                  {trendData.length > 1 && (() => {
                    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
                    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
                    
                    const firstHalfPositive = firstHalf.filter(d => d.dominantCategory === 'positive').length;
                    const secondHalfPositive = secondHalf.filter(d => d.dominantCategory === 'positive').length;
                    
                    const positiveChange = secondHalfPositive / secondHalf.length - firstHalfPositive / firstHalf.length;
                    
                    let trendMessage;
                    if (positiveChange > 0.2) {
                      trendMessage = <li>Your emotions are <span className="font-medium text-green-600">improving</span> over time.</li>;
                    } else if (positiveChange < -0.2) {
                      trendMessage = <li>Your emotions are <span className="font-medium text-red-600">declining</span> over time.</li>;
                    } else {
                      trendMessage = <li>Your emotions are <span className="font-medium">relatively stable</span> over time.</li>;
                    }
                    
                    return trendMessage;
                  })()}
                  
                  {/* Check for patterns in emotions */}
                  {trendData.length > 3 && (() => {
                    const positives = trendData.filter(d => d.dominantCategory === 'positive').length;
                    const negatives = trendData.filter(d => d.dominantCategory === 'negative').length;
                    const neutrals = trendData.filter(d => d.dominantCategory === 'neutral').length;
                    
                    let patternMessage;
                    if (positives > negatives && positives > neutrals) {
                      patternMessage = <li>Your emotions have been <span className="font-medium text-green-600">predominantly positive</span> during this period.</li>;
                    } else if (negatives > positives && negatives > neutrals) {
                      patternMessage = <li>Your emotions have been <span className="font-medium text-red-600">predominantly negative</span> during this period.</li>;
                    } else {
                      patternMessage = <li>Your emotions have been <span className="font-medium">mixed or neutral</span> during this period.</li>;
                    }
                    
                    return patternMessage;
                  })()}
                </ul>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/emotions/journal'}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmotionInsightsTab;