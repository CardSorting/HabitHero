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
      icon: <Activity />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      value: summaryData?.dominantEmotion ? (
        <span className="flex items-center">
          <span className="mr-2 text-xl">{getEmoji(summaryData.dominantEmotion)}</span>
          <span className="capitalize">{summaryData.dominantEmotion}</span>
        </span>
      ) : 'None',
      label: 'Dominant Emotion',
      color: summaryData?.dominantEmotion ? 
        `${getCategoryClass(summaryData.dominantEmotion)} ${getCategoryClass(summaryData.dominantEmotion).replace('bg-', 'text-')}` : 
        'bg-gray-100 text-gray-600'
    },
    {
      value: getIntensity(),
      label: 'Average Intensity',
      icon: <TrendingUp />,
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
      {/* Apple Health-style metrics grid */}
      <MetricsSummary metrics={metrics} columns={3} />
      
      {/* Intensity visualization */}
      {summaryData?.averageIntensity && (
        <div className="mt-4 px-4 pb-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Intensity Scale</div>
          <Progress 
            value={Number(summaryData.averageIntensity) * 10} 
            className="h-3 bg-gray-100" 
          />
          <div className="flex justify-between text-xs mt-1 text-gray-500">
            <span>Subtle (1)</span>
            <span>Moderate (5)</span>
            <span>Intense (10)</span>
          </div>
        </div>
      )}
    </InsightCard>
  );
};