// UrgesTab Component - UI presentation layer
// Handles the urges section of the diary card

import React from 'react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDiary } from '../../../presentation/context/DiaryContext';
import { DateString } from '../../../domain/models';
import { AlertCircle } from 'lucide-react';

interface UrgesTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const UrgesTab: React.FC<UrgesTabProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  const { handleUrgeChange, getUrgeValue } = useDiary();
  
  // Common urges for tracking
  const urges = [
    'Self-harm', 'Suicide', 'Substance use', 'Binge eating', 
    'Restricting food', 'Purging', 'Aggression', 'Impulsive spending'
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
            <Badge variant="outline" className="bg-primary/10 border-primary">Urge Tracking</Badge>
            <div className="text-xs text-muted-foreground ml-auto">
              {viewMode === 'day' 
                ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                : 'Rate intensity from 0-10'
              }
            </div>
          </div>
          
          <div className="text-sm mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
            <span className="ml-1 block sm:inline-block mt-1 sm:mt-0">If you're having thoughts of harming yourself, please reach out for help. Call a crisis line or speak with your therapist.</span>
          </div>
          
          <ScrollArea className="h-[calc(100vh-360px)]">
            {viewMode === 'day' ? (
              // Day view - vertical list of urges
              <div className="space-y-4">
                {urges.map(urge => (
                  <Card key={urge} className="rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h5 className="text-base font-medium">{urge}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Intensity</div>
                            <Select 
                              value={getUrgeValue(format(selectedDate, "yyyy-MM-dd"), urge, 'level')}
                              onValueChange={(value) => handleUrgeChange(format(selectedDate, "yyyy-MM-dd"), urge, 'level', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Rate" />
                              </SelectTrigger>
                              <SelectContent>
                                {intensityOptions.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Action taken</div>
                            <Input 
                              placeholder="What did you do?"
                              value={getUrgeValue(format(selectedDate, "yyyy-MM-dd"), urge, 'action')}
                              onChange={(e) => handleUrgeChange(format(selectedDate, "yyyy-MM-dd"), urge, 'action', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Week view - tabular view
              <div className="space-y-8">
                {urges.map(urge => (
                  <div key={urge}>
                    <h5 className="text-base font-medium mb-3">{urge}</h5>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Intensity table */}
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Intensity</div>
                        <div className="grid grid-cols-7 gap-1">
                          {dayHeaders.map(day => (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                              <Select 
                                value={getUrgeValue(day.date, urge, 'level')}
                                onValueChange={(value) => handleUrgeChange(day.date, urge, 'level', value)}
                              >
                                <SelectTrigger className="h-8 w-full border-dashed">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {intensityOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action table */}
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Action taken</div>
                        <div className="grid grid-cols-7 gap-1">
                          {dayHeaders.map(day => (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                              <Input 
                                className="h-8 text-xs"
                                placeholder="What did you do?"
                                value={getUrgeValue(day.date, urge, 'action')}
                                onChange={(e) => handleUrgeChange(day.date, urge, 'action', e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-6" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UrgesTab;