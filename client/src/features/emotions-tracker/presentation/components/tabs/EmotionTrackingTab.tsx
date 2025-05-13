import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Emotion, EmotionCategory } from '../../../domain/models';
import { SendHorizontal, Plus, X } from 'lucide-react';

const EmotionTrackingTab = () => {
  const { 
    getAllEmotions, 
    getEmotionsByCategory,
    trackEmotion
  } = useEmotions();
  
  const { toast } = useToast();
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EmotionCategory>(EmotionCategory.POSITIVE);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadEmotions();
  }, [selectedCategory]);
  
  const loadEmotions = async () => {
    setIsLoading(true);
    try {
      const emotionsByCategory = await getEmotionsByCategory(selectedCategory);
      setEmotions(emotionsByCategory || []);
    } catch (error) {
      console.error('Error loading emotions:', error);
      toast({
        title: 'Error loading emotions',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryChange = (category: EmotionCategory) => {
    setSelectedCategory(category);
    setSelectedEmotion(null);
  };
  
  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };
  
  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
  };
  
  const handleAddTrigger = () => {
    if (triggerInput.trim() && !triggers.includes(triggerInput.trim())) {
      setTriggers([...triggers, triggerInput.trim()]);
      setTriggerInput('');
    }
  };
  
  const handleRemoveTrigger = (trigger: string) => {
    setTriggers(triggers.filter(t => t !== trigger));
  };
  
  const handleSubmit = async () => {
    if (!selectedEmotion) {
      toast({
        title: 'Please select an emotion',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const now = new Date();
      const date = format(now, 'yyyy-MM-dd');
      const time = format(now, 'HH:mm:ss');
      await trackEmotion(
        selectedEmotion.id,
        selectedEmotion.name,
        intensity,
        date,
        notes,
        triggers,
        [], // empty coping mechanisms to be suggested by AI
        selectedEmotion.category,
        time
      );
      
      // Reset form
      setSelectedEmotion(null);
      setIntensity(5);
      setNotes('');
      setTriggers([]);
      
      toast({
        title: 'Emotion tracked successfully',
        description: 'Your emotion has been recorded',
      });
    } catch (error) {
      console.error('Error tracking emotion:', error);
      toast({
        title: 'Error tracking emotion',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Track Your Emotion</CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue={EmotionCategory.POSITIVE}
            value={selectedCategory}
            onValueChange={(value) => handleCategoryChange(value as EmotionCategory)}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={EmotionCategory.POSITIVE}>Positive</TabsTrigger>
              <TabsTrigger value={EmotionCategory.NEGATIVE}>Negative</TabsTrigger>
              <TabsTrigger value={EmotionCategory.NEUTRAL}>Neutral</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {emotions.map(emotion => (
                <Button
                  key={emotion.id}
                  type="button"
                  variant={selectedEmotion?.id === emotion.id ? "default" : "outline"}
                  className="h-auto py-3 px-4 justify-start"
                  onClick={() => handleEmotionSelect(emotion)}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: emotion.color }}
                  ></div>
                  <span className="text-left">{emotion.name}</span>
                </Button>
              ))}
            </div>
          )}
          
          {selectedEmotion && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="intensity" className="mb-2 block">
                    Intensity: <span className="font-bold">{intensity}/10</span>
                  </Label>
                  <Slider
                    id="intensity"
                    min={1}
                    max={10}
                    step={1}
                    value={[intensity]}
                    onValueChange={handleIntensityChange}
                    className="mb-6"
                  />
                </div>
                
                <div>
                  <Label htmlFor="triggers" className="mb-2 block">Triggers</Label>
                  <div className="flex mb-2">
                    <Input
                      id="triggers"
                      placeholder="What triggered this emotion?"
                      value={triggerInput}
                      onChange={(e) => setTriggerInput(e.target.value)}
                      className="flex-1 mr-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTrigger();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTrigger}
                      size="icon"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {triggers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {triggers.map(trigger => (
                        <div
                          key={trigger}
                          className="flex items-center bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {trigger}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 hover:bg-transparent"
                            onClick={() => handleRemoveTrigger(trigger)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes" className="mb-2 block">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this emotion..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <Button
                className="w-full mt-6"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background rounded-full"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="mr-2 h-4 w-4" />
                    Track {selectedEmotion.name}
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {selectedEmotion && intensity >= 7 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">High Intensity Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You're tracking {selectedEmotion.name} with high intensity. 
              After submitting, we'll suggest some coping strategies that might help.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmotionTrackingTab;