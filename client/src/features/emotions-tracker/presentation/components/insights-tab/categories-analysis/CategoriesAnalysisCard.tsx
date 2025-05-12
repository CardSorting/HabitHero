import React, { useState } from 'react';
import { PieChart, BarChart, BarChartHorizontal } from 'lucide-react';
import { DEFAULT_CATEGORY_COLORS } from '../../../../domain/emotion-categories-analysis';
import { PieChartRenderer } from './PieChartRenderer';
import { useEmotionCategoriesAnalysis } from '../../../hooks/useEmotionCategoriesAnalysis';
import { EmotionTrend } from '../../../../domain/models';
import { InsightCard } from '../ui/InsightCard';
import { InsightCardHeader, InsightCardContent } from '../ui/InsightCard';
import { SegmentedControl } from '../ui/SegmentedControl';
import { DataBadge } from '../ui/DataBadge';

interface CategoriesAnalysisCardProps {
  trendData: EmotionTrend[];
}

/**
 * Component for displaying emotion categories analysis in a card
 * Using Apple Health-inspired UI components
 */
export const CategoriesAnalysisCard: React.FC<CategoriesAnalysisCardProps> = ({
  trendData
}) => {
  const { categoriesAnalysis, isAnalyzing } = useEmotionCategoriesAnalysis(trendData);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [visualizationType, setVisualizationType] = useState('pie');

  // Handle mouse enter on pie chart segments
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Chart type options
  const chartOptions = [
    { value: 'pie', label: 'Pie Chart' },
    { value: 'bar', label: 'Bar Chart' }
  ];

  // Render category legend badges
  const renderCategoryLegend = () => {
    const badges = [
      { name: 'Positive', color: 'bg-blue-500' },
      { name: 'Negative', color: 'bg-red-500' },
      { name: 'Neutral', color: 'bg-purple-500' }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-4">
        {badges.map((badge, index) => (
          <DataBadge 
            key={index}
            value=""
            label={badge.name}
            className={`${badge.color} w-2 h-2 rounded-full`}
            size="sm"
          />
        ))}
      </div>
    );
  };

  // Calculate percentage for categories
  const getCategoryPercentage = (category: any) => {
    if (!category.percentage) return '0%';
    return `${Math.round(category.percentage)}%`;
  };

  return (
    <InsightCard 
      title="Emotion Categories Analysis" 
      icon={<PieChart />}
      iconBackground="bg-green-100"
      iconColor="text-green-500"
      fullWidth
    >
      <InsightCardContent>
        <InsightCardHeader 
          title="Emotion Categories Distribution"
          action={
            <SegmentedControl 
              options={chartOptions}
              value={visualizationType}
              onChange={setVisualizationType}
              size="sm"
            />
          }
        />
        
        {isAnalyzing ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {/* Category legend at top */}
            {trendData.length > 0 && renderCategoryLegend()}
            
            {/* Category distribution chart */}
            <div className="flex flex-col md:flex-row items-center mt-4">
              {/* Left side - Chart */}
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
                <div className="text-sm font-medium text-gray-700 mb-3">Distribution Breakdown</div>
                <div className="space-y-3">
                  {categoriesAnalysis?.categoriesDistribution
                    .filter(category => category.value > 0)
                    .map((category, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: DEFAULT_CATEGORY_COLORS[category.name] || '#ccc' }}
                            />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="text-sm font-medium">
                            {category.value} ({getCategoryPercentage(category)})
                          </div>
                        </div>
                        {/* Apple Health style progress bar */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: getCategoryPercentage(category),
                              backgroundColor: DEFAULT_CATEGORY_COLORS[category.name] || '#ccc' 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {categoriesAnalysis?.dominantCategory && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Dominant Category</div>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </InsightCardContent>
    </InsightCard>
  );
};