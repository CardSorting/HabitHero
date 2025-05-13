import React from 'react';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { EmotionSummary } from '../../../../domain/models';
import { EmotionTrend } from '../../../../domain/models';
import { 
  DEFAULT_CATEGORY_CLASSES, 
  DEFAULT_CATEGORY_EMOJIS 
} from '../../../../domain/emotion-categories-analysis';
import { InsightCard } from '../ui/InsightCard';
import { MetricsSummary, Metric } from '../ui/MetricsSummary';
import EmotionHeatmapTracker from '../EmotionHeatmapTracker';

interface SummaryCardsProps {
  trendData: EmotionTrend[];
  summaryData: EmotionSummary | null;
}

/**
 * Component for displaying summary cards with Apple Health-like metrics
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  trendData,
  summaryData
}) => {
  // Helper to get CSS class for category
  const getCategoryClass = (category?: string) => {
    const categoryKey = category ? 
      category.charAt(0).toUpperCase() + category.slice(1) : 
      'Unknown';
    return DEFAULT_CATEGORY_CLASSES[categoryKey] || 'bg-gray-400';
  };
  
  // Helper to get emoji for category
  const getEmoji = (category?: string) => {
    const categoryKey = category ? 
      category.charAt(0).toUpperCase() + category.slice(1) : 
      'Unknown';
    return DEFAULT_CATEGORY_EMOJIS[categoryKey] || '❓';
  };
  
  // Get average intensity with appropriate formatting
  const getIntensity = () => {
    if (!summaryData?.averageIntensity) return 'N/A';
    const value = Number(summaryData.averageIntensity);
    return value.toFixed(1);
  };
  
  // Calculate period trend (simple implementation)
  const getPeriodData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get count of entries for today
    const todayEntries = trendData.filter(entry => 
      entry.date === todayStr
    ).length;
    
    return {
      count: todayEntries,
      label: 'Today'
    };
  };
  
  const periodData = getPeriodData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Display the heatmap component */}
      <div className="md:col-span-2">
        <EmotionHeatmapTracker />
      </div>
      
      {/* Display emotion counts data */}
      <div className="flex flex-col space-y-4">
        <InsightCard 
          title="Emotion Counts" 
          icon={<Calendar />}
          iconBackground="bg-indigo-100"
          iconColor="text-indigo-600"
        >
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total tracked:</span>
              <span className="font-medium text-lg">{summaryData?.emotionCount || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Dominant emotion:</span>
              <span className="font-medium capitalize">
                {summaryData?.dominantEmotion || 'None'}
              </span>
            </div>
            
            {summaryData?.averageIntensity && summaryData.averageIntensity > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average intensity:</span>
                  <span className="font-medium">{getIntensity()}/10</span>
                </div>
                <Progress 
                  value={Number(summaryData.averageIntensity) * 10} 
                  className="h-2 bg-gray-100" 
                />
              </div>
            )}
          </div>
        </InsightCard>
      </div>
    </div>
  );
};