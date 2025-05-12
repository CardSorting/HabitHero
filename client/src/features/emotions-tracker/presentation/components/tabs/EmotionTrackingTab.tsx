import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';
import { useEmotions } from '../../context/EmotionsContext';
import { EmotionCategory } from '../../../domain/models';

export const EmotionTrackingTab: React.FC = () => {
  const {
    emotions,
    loadingEmotions,
    selectedDate,
    setSelectedDate,
    trackEmotion
  } = useEmotions();

  // Selected emotion state
  const [selectedEmotion, setSelectedEmotion] = useState<{
    id: string;
    name: string;
    category: EmotionCategory;
  } | null>(null);
  
  // Intensity state
  const [intensity, setIntensity] = useState<number>(5);
  
  // Notes state
  const [notes, setNotes] = useState<string>('');
  
  // Triggers state
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState<string>('');
  
  // Coping mechanisms state
  const [copingMechanisms, setCopingMechanisms] = useState<string[]>([]);
  const [copingInput, setCopingInput] = useState<string>('');

  // Function to handle emotion selection
  const handleEmotionSelect = (emotion: {
    id: string;
    name: string;
    category: EmotionCategory;
  }) => {
    setSelectedEmotion(emotion);
  };

  // Function to handle intensity change
  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
  };

  // Function to add a trigger
  const handleAddTrigger = () => {
    if (triggerInput.trim()) {
      setTriggers([...triggers, triggerInput.trim()]);
      setTriggerInput('');
    }
  };

  // Function to remove a trigger
  const handleRemoveTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  // Function to add a coping mechanism
  const handleAddCoping = () => {
    if (copingInput.trim()) {
      setCopingMechanisms([...copingMechanisms, copingInput.trim()]);
      setCopingInput('');
    }
  };

  // Function to remove a coping mechanism
  const handleRemoveCoping = (index: number) => {
    setCopingMechanisms(copingMechanisms.filter((_, i) => i !== index));
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!selectedEmotion) {
      return;
    }

    await trackEmotion(
      selectedEmotion.id,
      selectedEmotion.name,
      selectedEmotion.category,
      intensity,
      notes,
      triggers,
      copingMechanisms
    );

    // Reset form
    setSelectedEmotion(null);
    setIntensity(5);
    setNotes('');
    setTriggers([]);
    setCopingMechanisms([]);
  };

  // Group emotions by category
  const positiveEmotions = emotions.filter(
    (emotion) => emotion.category === EmotionCategory.POSITIVE
  );
  const negativeEmotions = emotions.filter(
    (emotion) => emotion.category === EmotionCategory.NEGATIVE
  );
  const neutralEmotions = emotions.filter(
    (emotion) => emotion.category === EmotionCategory.NEUTRAL
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Track Emotion</h2>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Emotion selection */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">1. What are you feeling?</h3>
          
          <Tabs defaultValue="positive">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
              <TabsTrigger value="neutral">Neutral</TabsTrigger>
            </TabsList>
            
            <TabsContent value="positive" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {positiveEmotions.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotion?.id === emotion.id ? "default" : "outline"}
                    onClick={() => handleEmotionSelect(emotion)}
                    className="h-auto py-2"
                    style={{ 
                      borderColor: selectedEmotion?.id === emotion.id ? undefined : emotion.color,
                      background: selectedEmotion?.id === emotion.id ? emotion.color : undefined
                    }}
                  >
                    {emotion.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="negative" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {negativeEmotions.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotion?.id === emotion.id ? "default" : "outline"}
                    onClick={() => handleEmotionSelect(emotion)}
                    className="h-auto py-2"
                    style={{ 
                      borderColor: selectedEmotion?.id === emotion.id ? undefined : emotion.color,
                      background: selectedEmotion?.id === emotion.id ? emotion.color : undefined
                    }}
                  >
                    {emotion.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="neutral" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {neutralEmotions.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotion?.id === emotion.id ? "default" : "outline"}
                    onClick={() => handleEmotionSelect(emotion)}
                    className="h-auto py-2"
                    style={{ 
                      borderColor: selectedEmotion?.id === emotion.id ? undefined : emotion.color,
                      background: selectedEmotion?.id === emotion.id ? emotion.color : undefined
                    }}
                  >
                    {emotion.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Intensity selection */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">2. How intense is this feeling?</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Strong</span>
            </div>
            
            <Slider
              defaultValue={[5]}
              min={1}
              max={10}
              step={1}
              value={[intensity]}
              onValueChange={handleIntensityChange}
            />
            
            <div className="text-center">
              <span className="font-medium text-lg">{intensity}/10</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">3. Notes (optional)</h3>
          
          <Textarea
            placeholder="Add any additional thoughts or reflections about this emotion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      {/* Triggers */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">4. What triggered this emotion? (optional)</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a trigger..."
                value={triggerInput}
                onChange={(e) => setTriggerInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrigger()}
              />
              <Button onClick={handleAddTrigger} type="button">Add</Button>
            </div>
            
            {triggers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {triggers.map((trigger, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {trigger}
                    <button
                      className="ml-2 text-xs hover:text-destructive"
                      onClick={() => handleRemoveTrigger(index)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Coping Mechanisms */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">5. Coping strategies (optional)</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a coping strategy..."
                value={copingInput}
                onChange={(e) => setCopingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCoping()}
              />
              <Button onClick={handleAddCoping} type="button">Add</Button>
            </div>
            
            {copingMechanisms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {copingMechanisms.map((mechanism, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {mechanism}
                    <button
                      className="ml-2 text-xs hover:text-destructive"
                      onClick={() => handleRemoveCoping(index)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedEmotion}
        >
          Record Emotion
        </Button>
      </div>
    </div>
  );
};