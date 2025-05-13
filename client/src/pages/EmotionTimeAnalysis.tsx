import React from 'react';
import TimeAnalysisPage from '../features/emotions-tracker/presentation/components/time-tracking/TimeAnalysisPage';
import { motion } from 'framer-motion';
import { EmotionsProvider } from '../features/emotions-tracker/presentation/context/EmotionsContext';
import { ApiEmotionsRepository } from '../features/emotions-tracker/infrastructure/ApiEmotionsRepository';
import { EmotionsService } from '../features/emotions-tracker/application/EmotionsService';

/**
 * Page component for time-based emotion analysis
 */
const EmotionTimeAnalysis: React.FC = () => {
  // Initialize services for EmotionsProvider
  const repository = new ApiEmotionsRepository();
  const emotionsService = new EmotionsService(repository);

  return (
    <EmotionsProvider service={emotionsService}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <TimeAnalysisPage />
      </motion.div>
    </EmotionsProvider>
  );
};

export default EmotionTimeAnalysis;