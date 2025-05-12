// EmotionTrackingTab - UI component for tracking emotions
// This component shows emotion categories and allows users to track emotions

import React, { useState, useMemo, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmotionCategory } from '../../../domain/models';
import { format } from 'date-fns';

interface EmotionTrackingTabProps {
  selectedDate: Date;
}

const EmotionTrackingTab: React.FC<EmotionTrackingTabProps> = ({ selectedDate }) => {
  const {
    emotions,
    trackedEmotions,
    selectedDate: contextDate,
    setSelectedDate,
    trackEmotion,
    getEmotionsForCategory,
    getEmotionsForDate,
    isLoading
  } = useEmotions();
  
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Update context date when prop changes
  useEffect(() => {
    setSelectedDate(selectedDate);
  }, [selectedDate, setSelectedDate]);
  
  // Get emotions for the current date
  const todaysEmotions = useMemo(() => {
    return getEmotionsForDate(contextDate);
  }, [getEmotionsForDate, contextDate]);
  
  // Get emotion categories
  const positiveEmotions = useMemo(() => getEmotionsForCategory(EmotionCategory.POSITIVE), [getEmotionsForCategory]);
  const negativeEmotions = useMemo(() => getEmotionsForCategory(EmotionCategory.NEGATIVE), [getEmotionsForCategory]);
  const neutralEmotions = useMemo(() => getEmotionsForCategory(EmotionCategory.NEUTRAL), [getEmotionsForCategory]);
  
  // Check if an emotion has been tracked today
  const isEmotionTrackedToday = (emotionId: string) => {
    return todaysEmotions.some(e => e.emotionId === emotionId);
  };
  
  // Get the intensity of a tracked emotion
  const getTrackedIntensity = (emotionId: string) => {
    const tracked = todaysEmotions.find(e => e.emotionId === emotionId);
    return tracked ? tracked.intensity : 0;
  };
  
  // Handle emotion card click
  const handleEmotionClick = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    
    // If already tracked, set the existing intensity
    if (isEmotionTrackedToday(emotionId)) {
      setIntensity(getTrackedIntensity(emotionId));
      
      // Find notes if any
      const tracked = todaysEmotions.find(e => e.emotionId === emotionId);
      setNotes(tracked?.notes || '');
    } else {
      setIntensity(5);
      setNotes('');
    }
    
    setIsDialogOpen(true);
  };
  
  // Handle tracking submission
  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    
    try {
      await trackEmotion(
        selectedEmotion,
        intensity,
        notes.trim() === '' ? undefined : notes
      );
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error tracking emotion:', error);
    }
  };
  
  // Render emotion cards for a category
  const renderEmotionCards = (categoryEmotions: any[], categoryName: string) => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{categoryName} Emotions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {categoryEmotions.map(emotion => {
            const isTracked = isEmotionTrackedToday(emotion.id);
            const intensity = isTracked ? getTrackedIntensity(emotion.id) : 0;
            
            return (
              <Card 
                key={emotion.id}
                className={`
                  cursor-pointer transition-all p-3 hover:shadow-md
                  ${isTracked ? 'bg-primary/10 border-primary' : ''}
                `}
                onClick={() => handleEmotionClick(emotion.id)}
              >
                <div className="flex flex-col items-center justify-center">
                  <div 
                    className="w-10 h-10 rounded-full mb-2 flex items-center justify-center text-white"
                    style={{ backgroundColor: emotion.color || '#888' }}
                  >
                    {isTracked && (
                      <span className="text-sm font-bold">{intensity}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{emotion.name}</span>
                  {isTracked && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Tracked
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Track Your Emotions
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            {format(contextDate, 'MMMM d, yyyy')}
          </span>
        </h2>
        <p className="text-muted-foreground">
          Click on an emotion to track its intensity and add optional notes.
        </p>
      </div>
      
      <div>
        {renderEmotionCards(positiveEmotions, 'Positive')}
        {renderEmotionCards(negativeEmotions, 'Negative')}
        {renderEmotionCards(neutralEmotions, 'Neutral')}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEmotion && emotions.find(e => e.id === selectedEmotion)?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Intensity</span>
                <Badge variant="outline">{intensity}</Badge>
              </div>
              <Slider 
                value={[intensity]} 
                min={1} 
                max={10} 
                step={1}
                onValueChange={(values) => setIntensity(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-2">
                Notes (optional)
              </label>
              <Textarea 
                placeholder="How does this emotion feel? What triggered it?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isEmotionTrackedToday(selectedEmotion || '') ? 'Update' : 'Track'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmotionTrackingTab;