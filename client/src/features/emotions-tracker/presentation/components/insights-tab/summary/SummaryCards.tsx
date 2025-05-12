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
  
  // Prepare metrics for modern Apple Health style
  const metrics = [
    {
      value: trendData.length || 0,
      label: 'Total Emotions Tracked',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      value: summaryData?.dominantEmotion ? 
        <span className="capitalize">{summaryData.dominantEmotion}</span>
        : 'None',
      label: 'Dominant Emotion',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      value: getIntensity(),
      label: 'Average Intensity',
      color: 'bg-orange-100 text-orange-500'
    }
  ];

  return (
    <InsightCard 
      title="Emotion Summary" 
      icon={<Calendar />}
      iconBackground="bg-indigo-100"
      iconColor="text-indigo-600"
      fullWidth
    >
      {/* Simplified metrics grid */}
      <MetricsSummary metrics={metrics} columns={3} />
      
      {/* Simplified intensity visualization - only show when there's data */}
      {summaryData?.averageIntensity && summaryData.averageIntensity > 0 && (
        <div className="mt-2 px-3 pb-3">
          <Progress 
            value={Number(summaryData.averageIntensity) * 10} 
            className="h-2 bg-gray-100" 
          />
          <div className="flex justify-between text-[10px] mt-1 text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </InsightCard>
  );
};