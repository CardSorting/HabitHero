import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmotions } from '../context/EmotionsContext';
import EmotionTrackingTab from './tabs/EmotionTrackingTab';
import { EmotionInsightsTab } from './tabs/EmotionInsightsTab';
import EmotionJournalTab from './tabs/EmotionJournalTab';
// Import as default
import EmotionHistoryTabDefault from './tabs/EmotionHistoryTab';
import { SmilePlus, BarChart2, Book, Clock } from 'lucide-react';

// Rename for convenience
const EmotionHistoryTab = EmotionHistoryTabDefault;

export const EmotionsTrackerContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('track');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Emotions Tracker</h1>
      
      <Tabs 
        defaultValue="track" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track" className="flex items-center justify-center">
            <SmilePlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Track</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center justify-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center justify-center">
            <Book className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Journal</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center justify-center">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="track">
            <EmotionTrackingTab />
          </TabsContent>
          
          <TabsContent value="insights">
            <EmotionInsightsTab />
          </TabsContent>
          
          <TabsContent value="journal">
            <EmotionJournalTab />
          </TabsContent>
          
          <TabsContent value="history">
            <EmotionHistoryTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};