// EmotionsTrackerContainer - Main container component for the Emotions Tracker feature
// This component wraps and manages the different tabs of the emotions tracker

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import EmotionTrackingTab from './tabs/EmotionTrackingTab';
import EmotionInsightsTab from './tabs/EmotionInsightsTab';
import EmotionJournalTab from './tabs/EmotionJournalTab';
import EmotionHistoryTab from './tabs/EmotionHistoryTab';
import { EmotionsProvider } from '../context/EmotionsContext';

interface EmotionsTrackerContainerProps {
  userId: number;
}

const EmotionsTrackerContainer: React.FC<EmotionsTrackerContainerProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };
  
  return (
    <EmotionsProvider userId={userId}>
      <div className="container px-4 py-6 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Emotions Tracker</h1>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                aria-label="Pick a date"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Tabs defaultValue="track" className="mb-6">
          <TabsList className="mb-4 grid grid-cols-4 w-full">
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <Card className="p-4 sm:p-6">
            <TabsContent value="track" className="mt-0">
              <EmotionTrackingTab selectedDate={selectedDate} />
            </TabsContent>
            
            <TabsContent value="insights" className="mt-0">
              <EmotionInsightsTab />
            </TabsContent>
            
            <TabsContent value="journal" className="mt-0">
              <EmotionJournalTab selectedDate={selectedDate} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <EmotionHistoryTab />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </EmotionsProvider>
  );
};

export default EmotionsTrackerContainer;