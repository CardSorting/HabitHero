import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subDays } from 'date-fns';
import { useEmotions } from '../../context/EmotionsContext';
import { SummaryCards } from './summary/SummaryCards';
import { CategoriesAnalysisCard } from './categories-analysis/CategoriesAnalysisCard';
import { FrequentEmotionsCard } from './categories-analysis/FrequentEmotionsCard';
import { HighIntensityEmotionsCard } from './categories-analysis/HighIntensityEmotionsCard';

/**
 * Container component for emotion insights
 * Handles data fetching and timeframe selection
 */
export const EmotionInsightsContainer: React.FC = () => {
  const { getEmotionTrends, getEmotionSummary, getMostFrequentEmotions, getHighestIntensityEmotions } = useEmotions();
  const [timeframe, setTimeframe] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [frequentEmotions, setFrequentEmotions] = useState<{emotion: string; count: number}[]>([]);
  const [highIntensityEmotions, setHighIntensityEmotions] = useState<{emotion: string; intensity: number}[]>([]);
  
  // Fetch data on component mount and timeframe change
  useEffect(() => {
    fetchData();
  }, [timeframe]);
  
  // Enhanced data processing for better visualizations
  const enhanceDataForVisualization = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedData;
  };
  
  // Fetch all required data
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
        // Fetch emotion trends for the selected period
        getEmotionTrends(fromDateStr, toDateStr),
        
        // Fetch summary data - First try for today, but API will check previous day
        getEmotionSummary(fromDateStr),
        
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
          <SummaryCards 
            trendData={trendData} 
            summaryData={summaryData} 
          />
          
          {/* Categories Analysis Section */}
          <CategoriesAnalysisCard 
            trendData={trendData} 
          />
          
          {/* Frequent Emotions Section */}
          <FrequentEmotionsCard 
            frequentEmotions={frequentEmotions} 
          />
          
          {/* Highest Intensity Emotions Section */}
          <HighIntensityEmotionsCard 
            highIntensityEmotions={highIntensityEmotions} 
          />
        </div>
      )}
    </div>
  );
};