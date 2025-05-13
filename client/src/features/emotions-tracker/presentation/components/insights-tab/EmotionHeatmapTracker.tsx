import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { TimePeriod, TIME_PERIOD_CONFIG } from '../../../domain/entities/EmotionTrackingTime';
import TimeDistributionChart from '../time-tracking/TimeDistributionChart';

interface EmotionHeatmapTrackerProps {
  userId?: number;
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
}

/**
 * Component for displaying the emotion heatmap
 * This is a simple wrapper around the TimeDistributionChart component
 * Following the Adapter Pattern to maintain compatibility with existing code
 */
const EmotionHeatmapTracker: React.FC<EmotionHeatmapTrackerProps> = ({
  userId = 1,
  dateRange
}) => {
  // Simply pass through to the new architecture component
  return (
    <TimeDistributionChart 
      userId={userId}
      dateRange={dateRange}
      title="When You Record Emotions"
    />
  );
};

export default EmotionHeatmapTracker;