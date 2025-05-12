// Main container component for the Emotions Tracker feature
// This component provides the context and main layout

import React, { useState } from 'react';
import { EmotionsProvider } from '../context/EmotionsContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import EmotionTrackingTab from './tabs/EmotionTrackingTab';
import EmotionInsightsTab from './tabs/EmotionInsightsTab';
import EmotionJournalTab from './tabs/EmotionJournalTab';
import EmotionHistoryTab from './tabs/EmotionHistoryTab';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EmotionsTrackerContainerProps {
  userId: number;
}

const EmotionsTrackerContainer: React.FC<EmotionsTrackerContainerProps> = ({ userId }) => {
  const [date, setDate] = useState<Date>(new Date());
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };
  
  return (
    <EmotionsProvider userId={userId}>
      <div className="container px-2 py-4 mx-auto">
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Emotions & Feelings Tracker</CardTitle>
                <CardDescription>Track, analyze, and understand your emotional patterns</CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-[240px]",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="track" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="track" className="mt-0">
            <EmotionTrackingTab selectedDate={date} />
          </TabsContent>
          
          <TabsContent value="insights" className="mt-0">
            <EmotionInsightsTab />
          </TabsContent>
          
          <TabsContent value="journal" className="mt-0">
            <EmotionJournalTab selectedDate={date} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <EmotionHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </EmotionsProvider>
  );
};

export default EmotionsTrackerContainer;