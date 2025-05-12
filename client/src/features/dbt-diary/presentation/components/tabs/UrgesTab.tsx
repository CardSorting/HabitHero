// UrgesTab Component - This component has been simplified and is kept for compatibility

import React from 'react';
import { DateString } from '../../../domain/models';

interface UrgesTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const UrgesTab: React.FC<UrgesTabProps> = () => {
  // Removed urges functionality per client request
  return null;
};

export default UrgesTab;