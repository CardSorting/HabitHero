import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmotionEntry } from '../../../domain/models';
import { Save, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

const EmotionJournalTab = () => {
  const { getEmotionsByDate, updateEmotionEntry } = useEmotions();
  const [date, setDate] = useState(new Date());
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [journalText, setJournalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchEntries();
  }, [date]);
  
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const fetchedEntries = await getEmotionsByDate(dateString);
      setEntries(fetchedEntries);
      
      // Reset entry selection and journal text
      setSelectedEntryId(null);
      setJournalText('');
    } catch (error) {
      console.error('Error fetching emotion entries:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEntryChange = (entryId: string) => {
    setSelectedEntryId(entryId);
    const entry = entries.find(e => e.id === entryId);
    setJournalText(entry?.notes || '');
  };
  
  const handleSaveJournal = async () => {
    if (!selectedEntryId) return;
    
    setIsSaving(true);
    try {
      await updateEmotionEntry(selectedEntryId, { notes: journalText });
      
      // Update the local entries array with the new note
      setEntries(entries.map(entry => 
        entry.id === selectedEntryId
          ? { ...entry, notes: journalText }
          : entry
      ));
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Emotion Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Select a date and emotion to add journal notes
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'MMMM d, yyyy')}
              </Button>
              
              <Select
                value={selectedEntryId || ''}
                onValueChange={handleEntryChange}
                disabled={isLoading || entries.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an emotion" />
                </SelectTrigger>
                <SelectContent>
                  {entries.map(entry => (
                    <SelectItem key={entry.id} value={entry.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: 
                              entry.categoryId === 'positive' ? '#10b981' : 
                              entry.categoryId === 'negative' ? '#ef4444' : 
                              entry.categoryId === 'neutral' ? '#6b7280' : '#888'
                          }}  
                        />
                        {entry.emotionName} ({entry.intensity}/10)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No emotions tracked for this date</p>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Write your thoughts, reflections, and insights about this emotion..."
                className="min-h-[200px]"
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                disabled={!selectedEntryId || isSaving}
              />
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSaveJournal}
                  disabled={!selectedEntryId || isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-background rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Journal
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {selectedEntryId && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Emotion Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const entry = entries.find(e => e.id === selectedEntryId);
              if (!entry) return null;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ 
                          backgroundColor: 
                            entry.categoryId === 'positive' ? '#10b981' : 
                            entry.categoryId === 'negative' ? '#ef4444' : 
                            entry.categoryId === 'neutral' ? '#6b7280' : '#888'
                        }}  
                      />
                      <span className="font-medium">{entry.emotionName}</span>
                    </div>
                    
                    <Badge variant={
                      entry.categoryId === 'positive' ? 'default' : 
                      entry.categoryId === 'negative' ? 'destructive' : 
                      'secondary'
                    }>
                      {entry.categoryId}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Intensity</p>
                    <p className="text-sm">{entry.intensity}/10</p>
                  </div>
                  
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Triggers</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.triggers.map((trigger, idx) => (
                          <Badge variant="outline" key={idx}>{trigger}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entry.copingMechanisms && entry.copingMechanisms.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Coping Strategies</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.copingMechanisms.map((strategy, idx) => (
                          <Badge variant="outline" key={idx}>{strategy}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmotionJournalTab;