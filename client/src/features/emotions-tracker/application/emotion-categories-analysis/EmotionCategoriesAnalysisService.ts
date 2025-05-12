import { EmotionTrend } from '../../domain/models';
import { EmotionCategoriesAnalysis } from '../../domain/emotion-categories-analysis';
import { 
  GetEmotionCategoriesAnalysisQuery, 
  GetEmotionCategoriesAnalysisQueryHandler 
} from './queries';

/**
 * EmotionCategoriesAnalysisService
 * Service to handle all operations related to emotion categories analysis
 */
export class EmotionCategoriesAnalysisService {
  private getCategoriesAnalysisQueryHandler: GetEmotionCategoriesAnalysisQueryHandler;
  
  constructor() {
    this.getCategoriesAnalysisQueryHandler = new GetEmotionCategoriesAnalysisQueryHandler();
  }
  
  /**
   * Analyze emotion categories from trend data
   * @param trendData Array of emotion trends to analyze
   */
  analyzeCategoriesDistribution(trendData: EmotionTrend[]): EmotionCategoriesAnalysis {
    const query = new GetEmotionCategoriesAnalysisQuery(trendData);
    return this.getCategoriesAnalysisQueryHandler.execute(query);
  }
}