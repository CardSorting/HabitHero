import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { EmotionTrackingTab } from './tabs/EmotionTrackingTab';
import { EmotionInsightsTab } from './tabs/EmotionInsightsTab';
import { EmotionJournalTab } from './tabs/EmotionJournalTab';
import { EmotionHistoryTab } from './tabs/EmotionHistoryTab';
import { EmotionsProvider } from '../context/EmotionsContext';

/**
 * Main container component for the Emotions Tracker feature
 * This component is the entry point for the Emotions Tracker feature
 */
export const EmotionsTrackerContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  
  return (
    <EmotionsProvider>
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Emotions Tracker</h1>
            
            <Tabs defaultValue="tracking" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="tracking">Track</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tracking">
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </EmotionsProvider>
  );
};