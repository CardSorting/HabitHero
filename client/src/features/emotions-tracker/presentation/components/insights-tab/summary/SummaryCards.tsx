import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { EmotionSummary } from '../../../../domain/models';
import { EmotionTrend } from '../../../../domain/models';
import { 
  DEFAULT_CATEGORY_CLASSES, 
  DEFAULT_CATEGORY_EMOJIS 
} from '../../../../domain/emotion-categories-analysis';

interface SummaryCardsProps {
  trendData: EmotionTrend[];
  summaryData: EmotionSummary | null;
}

/**
 * Component for displaying summary cards
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
  
  return (
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
              <div className={`h-10 w-10 rounded-full ${summaryData?.dominantEmotion ? getCategoryClass(summaryData.dominantEmotion) : 'bg-gray-100'} bg-opacity-20 flex items-center justify-center mr-3`}>
                <span className="text-xl">{summaryData?.dominantEmotion ? getEmoji(summaryData.dominantEmotion) : '❓'}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Dominant Emotion</h3>
                <p className="text-sm text-gray-500">Most frequent type</p>
              </div>
            </div>
            <div className="text-xl font-bold capitalize">
              {summaryData?.dominantEmotion || 'None'}
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
  );
};