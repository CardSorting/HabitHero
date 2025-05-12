// EventsTab Component - UI presentation layer
// Handles the events section of the diary card

import React from 'react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDiary } from '../../../presentation/context/DiaryContext';
import { DateString } from '../../../domain/models';

interface EventsTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const EventsTab: React.FC<EventsTabProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  const { handleEventChange, getEventValue } = useDiary();
  
  // For week view, we'll show a tab for each day
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 border-primary">Daily Events</Badge>
            <div className="text-xs text-muted-foreground ml-auto">
              {viewMode === 'day' 
                ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                : 'Record significant events each day'
              }
            </div>
          </div>
          
          {viewMode === 'day' ? (
            // Day view - single textarea
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground">What significant events happened today?</div>
              <Textarea 
                placeholder="Describe any significant events, triggers, or situations that affected your emotions today..."
                className="min-h-[200px]"
                value={getEventValue(selectedDateStr)}
                onChange={(e) => handleEventChange(selectedDateStr, e.target.value)}
              />
            </div>
          ) : (
            // Week view - tabs for each day
            <Tabs defaultValue={selectedDateStr}>
              <TabsList className="grid grid-cols-7">
                {dayHeaders.map(day => (
                  <TabsTrigger 
                    key={day.date} 
                    value={day.date}
                    className="text-xs"
                  >
                    {day.abbr}
                    <span className="hidden md:inline ml-1">{format(new Date(day.date), "d")}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <ScrollArea className="h-[calc(100vh-380px)] mt-4">
                {dayHeaders.map(day => (
                  <TabsContent key={day.date} value={day.date} className="pt-2">
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        What significant events happened on {format(new Date(day.date), "MMMM d")}?
                      </div>
                      <Textarea 
                        placeholder="Describe any significant events, triggers, or situations that affected your emotions this day..."
                        className="min-h-[180px]"
                        value={getEventValue(day.date)}
                        onChange={(e) => handleEventChange(day.date, e.target.value)}
                      />
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventsTab;