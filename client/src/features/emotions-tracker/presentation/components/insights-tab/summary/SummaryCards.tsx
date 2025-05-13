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
import TimeDistributionChart from '../../../components/time-tracking/TimeDistributionChart';

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
    <div className="grid grid-cols-1 gap-4">
      {/* Display the heatmap component with new architecture */}
      <div className="w-full">
        <TimeDistributionChart />
      </div>
    </div>
  );
};