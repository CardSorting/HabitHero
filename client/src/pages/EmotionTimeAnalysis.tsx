import React from 'react';
import TimeAnalysisPage from '../features/emotions-tracker/presentation/components/time-tracking/TimeAnalysisPage';
import { motion } from 'framer-motion';

/**
 * Page component for time-based emotion analysis
 */
const EmotionTimeAnalysis: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <TimeAnalysisPage />
    </motion.div>
  );
};

export default EmotionTimeAnalysis;