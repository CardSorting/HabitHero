// DiaryCardTabs Component - UI presentation layer
// Handles the tabs for different diary card sections

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// Import from the barrel file
import { SleepTab, EmotionsTab, UrgesTab, SkillsTab, EventsTab } from './tabs';
import { DateString } from '../../domain/models';

interface DiaryCardTabsProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const DiaryCardTabs: React.FC<DiaryCardTabsProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  return (
    <Tabs defaultValue="sleep" className="mb-6">
      <TabsList className="grid grid-cols-5 mb-4 rounded-xl">
        <TabsTrigger value="sleep" className="rounded-l-xl">Sleep</TabsTrigger>
        <TabsTrigger value="emotions">Emotions</TabsTrigger>
        <TabsTrigger value="urges">Urges</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="events" className="rounded-r-xl">Events</TabsTrigger>
      </TabsList>
      
      {/* Sleep Tab */}
      <TabsContent value="sleep">
        <SleepTab 
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* Emotions Tab */}
      <TabsContent value="emotions">
        <EmotionsTab 
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* Urges Tab */}
      <TabsContent value="urges">
        <UrgesTab 
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* Skills Tab */}
      <TabsContent value="skills">
        <SkillsTab 
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* Events Tab */}
      <TabsContent value="events">
        <EventsTab 
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DiaryCardTabs;