import React from 'react';
import { EmotionInsightsContainer } from '../insights-tab/EmotionInsightsContainer';

/**
 * EmotionInsightsTab component
 * Uses the EmotionInsightsContainer which implements the refactored architecture
 * following SOLID principles and Clean Architecture patterns
 */
const EmotionInsightsTab: React.FC = () => {
  return <EmotionInsightsContainer />;
};

export default EmotionInsightsTab;