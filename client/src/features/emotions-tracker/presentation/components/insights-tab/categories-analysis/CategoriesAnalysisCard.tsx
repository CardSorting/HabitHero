import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { DEFAULT_CATEGORY_COLORS } from '../../../../domain/emotion-categories-analysis';
import { PieChartRenderer } from './PieChartRenderer';
import { useEmotionCategoriesAnalysis } from '../../../hooks/useEmotionCategoriesAnalysis';
import { EmotionTrend } from '../../../../domain/models';

interface CategoriesAnalysisCardProps {
  trendData: EmotionTrend[];
}

/**
 * Component for displaying emotion categories analysis in a card
 */
export const CategoriesAnalysisCard: React.FC<CategoriesAnalysisCardProps> = ({
  trendData
}) => {
  const { categoriesAnalysis, isAnalyzing } = useEmotionCategoriesAnalysis(trendData);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Handle mouse enter on pie chart segments
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
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
          
          {isAnalyzing ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div>
              {/* Category legend at top */}
              {trendData.length > 0 && (
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
              )}
              
              {/* Category distribution pie chart */}
              <div className="flex flex-col md:flex-row items-center">
                {/* Left side - Pie Chart */}
                <div className="w-full md:w-1/2 h-60 relative">
                  <PieChartRenderer 
                    data={categoriesAnalysis?.categoriesDistribution || []}
                    colors={DEFAULT_CATEGORY_COLORS}
                    totalCount={categoriesAnalysis?.totalCount}
                    activeIndex={activeIndex}
                    onPieEnter={onPieEnter}
                  />
                </div>
                
                {/* Right side - Category Stats */}
                <div className="w-full md:w-1/2 p-4">
                  <h4 className="text-sm font-semibold mb-2">Distribution Breakdown</h4>
                  <div className="space-y-2">
                    {categoriesAnalysis?.categoriesDistribution
                      .filter(category => category.value > 0)
                      .map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: DEFAULT_CATEGORY_COLORS[category.name] || '#ccc' }}
                            />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="text-sm font-medium">
                            {category.value} ({category.percentage?.toFixed(0)}%)
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {categoriesAnalysis?.dominantCategory && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-semibold mb-2">Dominant Category</div>
                      <div className="flex items-center">
                        <div 
                          className="h-4 w-4 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: DEFAULT_CATEGORY_COLORS[categoriesAnalysis.dominantCategory] || '#ccc'
                          }}
                        />
                        <span className="text-base font-medium">{categoriesAnalysis.dominantCategory}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};