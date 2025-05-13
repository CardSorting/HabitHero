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
      'Positive': 0,
      'Negative': 0,
      'Neutral': 0,
      'Unknown': 0
    };
    
    // Count occurrences of each category based on the overallMood property
    trendData.forEach(day => {
      if (!day.overallMood) {
        categories['Unknown'] += 1;
        return;
      }
      
      // Map overallMood to capitalized category names
      switch (day.overallMood) {
        case 'positive':
          categories['Positive'] += 1;
          break;
        case 'negative':
          categories['Negative'] += 1;
          break;
        case 'neutral':
          categories['Neutral'] += 1;
          break;
        case 'mixed':
          // For mixed emotions, determine primary category based on dominantEmotion
          if (day.dominantEmotion) {
            const lowerCaseDominant = day.dominantEmotion.toLowerCase();
            if (lowerCaseDominant.includes('happy') || 
                lowerCaseDominant.includes('joy') || 
                lowerCaseDominant.includes('excited') || 
                lowerCaseDominant.includes('grateful')) {
              categories['Positive'] += 1;
            } else if (lowerCaseDominant.includes('sad') || 
                      lowerCaseDominant.includes('angry') || 
                      lowerCaseDominant.includes('fear') || 
                      lowerCaseDominant.includes('disgust')) {
              categories['Negative'] += 1;
            } else {
              categories['Neutral'] += 1;
            }
          } else {
            categories['Unknown'] += 1;
          }
          break;
        default:
          categories['Unknown'] += 1;
      }
    });
    
    // Prepare distribution data
    const categoriesDistribution: CategoryDistribution[] = Object.entries(categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category,
        value: count,
        percentage: trendData.length > 0 ? (count / trendData.length) * 100 : 0
      }));
    
    // Find the dominant category (excluding Unknown)
    let dominantCategory: string | null = null;
    let maxCount = 0;
    
    Object.entries(categories).forEach(([category, count]) => {
      // Only consider real emotion categories (not Unknown) as dominant
      if (category !== 'Unknown' && count > maxCount) {
        maxCount = count;
        dominantCategory = category;
      }
    });
    
    // If we have no dominant category but have Unknown entries, check if there's any data at all
    if (!dominantCategory && categories['Unknown'] > 0) {
      const totalCount = Object.values(categories).reduce((a, b) => a + b, 0);
      if (trendData.length > 0 && totalCount === categories['Unknown']) {
        // All data is Unknown, so mark Unknown as dominant
        dominantCategory = 'Unknown';
      }
    }
    
    return {
      categoriesDistribution,
      dominantCategory,
      totalCount: trendData.length
    };
  }
}