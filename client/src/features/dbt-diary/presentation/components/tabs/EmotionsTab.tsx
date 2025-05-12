// EmotionsTab Component - UI presentation layer
// Handles the emotions section of the diary card

import React from 'react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDiary } from '../../context/DiaryContext';
import { DateString } from '../../../domain/models';

interface EmotionsTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const EmotionsTab: React.FC<EmotionsTabProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  const { handleEmotionChange, getEmotionValue } = useDiary();
  
  // Common emotions for tracking
  const emotions = [
    'Joy', 'Sadness', 'Fear', 'Anger', 
    'Disgust', 'Shame', 'Guilt', 'Loneliness', 
    'Anxiety', 'Jealousy', 'Love', 'Pride'
  ];
  
  // Rating scales options
  const intensityOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 border-primary">Emotion Tracking</Badge>
            <div className="text-xs text-muted-foreground ml-auto">
              {viewMode === 'day' 
                ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                : 'Rate intensity from 0-10'
              }
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            {viewMode === 'day' ? (
              // Day view - vertical list of emotions
              <div className="space-y-4">
                {emotions.map(emotion => (
                  <Card key={emotion} className="rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-base font-medium">{emotion}</h5>
                        <Select 
                          value={getEmotionValue(format(selectedDate, "yyyy-MM-dd"), emotion)}
                          onValueChange={(value) => handleEmotionChange(format(selectedDate, "yyyy-MM-dd"), emotion, value)}
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue placeholder="Rate" />
                          </SelectTrigger>
                          <SelectContent>
                            {intensityOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Week view - grid of emotions by day
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-medium text-sm p-2 w-36">Emotion</th>
                      {dayHeaders.map(day => (
                        <th key={day.date} className="text-center font-medium text-xs p-2">
                          <div>{day.abbr}</div>
                          <div className="text-muted-foreground">{format(new Date(day.date), "d")}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emotions.map(emotion => (
                      <tr key={emotion} className="border-t border-muted">
                        <td className="p-2 text-sm font-medium">{emotion}</td>
                        {dayHeaders.map(day => (
                          <td key={day.date} className="p-1 text-center">
                            <Select 
                              value={getEmotionValue(day.date, emotion)}
                              onValueChange={(value) => handleEmotionChange(day.date, emotion, value)}
                            >
                              <SelectTrigger className="h-8 w-14 mx-auto">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                {intensityOptions.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmotionsTab;