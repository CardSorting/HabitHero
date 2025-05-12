// EmotionJournalTab - UI component for journaling about emotions
// This component allows users to write detailed entries about their emotions

import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface EmotionJournalTabProps {
  selectedDate: Date;
}

const EmotionJournalTab: React.FC<EmotionJournalTabProps> = ({ selectedDate }) => {
  const { 
    trackedEmotions, 
    selectedDate: contextDate, 
    setSelectedDate,
    getEmotionsForDate
  } = useEmotions();
  
  const { toast } = useToast();
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Update context date when prop changes
  useEffect(() => {
    setSelectedDate(selectedDate);
  }, [selectedDate, setSelectedDate]);
  
  // Get emotions for the current date
  const todaysEmotions = getEmotionsForDate(contextDate);
  
  // Handle saving the journal entry
  const handleSaveJournal = async () => {
    setIsSaving(true);
    
    // For now, just simulate saving with a toast message
    // In a real implementation, this would save to the API
    setTimeout(() => {
      toast({
        title: "Journal Entry Saved",
        description: "Your reflection has been saved successfully."
      });
      setIsSaving(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Emotion Journal</h2>
        <p className="text-muted-foreground">
          Reflect on your emotions and experiences
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reflection for {format(contextDate, 'MMMM d, yyyy')}</CardTitle>
          <CardDescription>
            Write about how you felt today and what triggered your emotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysEmotions.length > 0 ? (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Tracked emotions today:</h3>
              <div className="flex flex-wrap gap-2">
                {todaysEmotions.map(emotion => (
                  <div 
                    key={emotion.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${emotion.categoryId === 'positive' ? '#4ade80' : 
                                        emotion.categoryId === 'negative' ? '#ef4444' : 
                                        '#f59e0b'}20`, 
                      color: emotion.categoryId === 'positive' ? '#22c55e' : 
                             emotion.categoryId === 'negative' ? '#dc2626' : 
                             '#d97706'
                    }}
                  >
                    {emotion.emotionName} ({emotion.intensity})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 text-sm text-muted-foreground">
              No emotions tracked for today yet. Track some emotions to reflect on them here.
            </div>
          )}
          
          <Textarea
            placeholder="Write your reflections here... How did your emotions affect your day? What patterns do you notice?"
            className="min-h-[200px]"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Discard</Button>
          <Button onClick={handleSaveJournal} disabled={isSaving || journalEntry.trim() === ''}>
            {isSaving ? 'Saving...' : 'Save Reflection'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Journaling Prompts</CardTitle>
          <CardDescription>
            Use these prompts to help with your reflection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>What was the strongest emotion you felt today?</li>
            <li>Was there a pattern to when certain emotions appeared?</li>
            <li>How did your emotions influence your decisions today?</li>
            <li>Did any emotions surprise you or feel out of proportion?</li>
            <li>How did you respond to challenging emotions?</li>
            <li>What are you grateful for today?</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionJournalTab;