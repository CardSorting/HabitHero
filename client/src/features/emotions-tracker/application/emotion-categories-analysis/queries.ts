import { EmotionTrend } from '../../domain/models';
import { 
  EmotionCategoriesAnalysis,
  CategoryDistribution
} from '../../domain/emotion-categories-analysis';

/**
 * Query to get emotion categories analysis 
 */
export class GetEmotionCategoriesAnalysisQuery {
  constructor(public readonly trendData: EmotionTrend[]) {}
}

/**
 * Handler for GetEmotionCategoriesAnalysisQuery
 * Processes trend data to produce categories analysis
 */
export class GetEmotionCategoriesAnalysisQueryHandler {
  /**
   * Execute the query to analyze emotion categories
   */
  execute(query: GetEmotionCategoriesAnalysisQuery): EmotionCategoriesAnalysis {
    const { trendData } = query;
    
    // Initialize categories
    const categories: {[key: string]: number} = {
      'positive': 0,
      'negative': 0,
      'neutral': 0,
      'unknown': 0
    };
    
    // Count occurrences of each category
    trendData.forEach(day => {
      const category = day.dominantEmotion || 'unknown';
      const categoryLower = category.toLowerCase();
      categories[categoryLower] = (categories[categoryLower] || 0) + 1;
    });
    
    // Prepare distribution data
    const categoriesDistribution: CategoryDistribution[] = Object.entries(categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        percentage: trendData.length > 0 ? (count / trendData.length) * 100 : 0
      }));
    
    // Find the dominant category
    let dominantCategory: string | null = null;
    let maxCount = 0;
    
    Object.entries(categories).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantCategory = category;
      }
    });
    
    return {
      categoriesDistribution,
      dominantCategory: dominantCategory ? 
        dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1) : 
        null,
      totalCount: trendData.length
    };
  }
}