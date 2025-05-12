import { useState, useEffect } from 'react';
import { EmotionTrend } from '../../domain/models';
import { EmotionCategoriesAnalysis } from '../../domain/emotion-categories-analysis';
import { EmotionCategoriesAnalysisService } from '../../application/emotion-categories-analysis/EmotionCategoriesAnalysisService';

/**
 * Hook for using emotion categories analysis functionality
 */
export const useEmotionCategoriesAnalysis = (trendData: EmotionTrend[]) => {
  const [categoriesAnalysis, setCategoriesAnalysis] = useState<EmotionCategoriesAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Create singleton instance of service
  const service = new EmotionCategoriesAnalysisService();
  
  useEffect(() => {
    if (trendData.length > 0) {
      analyzeCategoriesDistribution();
    } else {
      setCategoriesAnalysis(null);
    }
  }, [trendData]);
  
  /**
   * Analyze categories distribution from trend data
   */
  const analyzeCategoriesDistribution = () => {
    setIsAnalyzing(true);
    
    try {
      const result = service.analyzeCategoriesDistribution(trendData);
      setCategoriesAnalysis(result);
    } catch (error) {
      console.error("Error analyzing emotion categories:", error);
      setCategoriesAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    categoriesAnalysis,
    isAnalyzing,
    analyzeCategoriesDistribution
  };
};