import React, { useState, useEffect } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmotionEntry } from '../../../domain/models';
import { Trash2, Calendar as CalendarIcon, Info } from 'lucide-react';

const EmotionHistoryTab = () => {
  const { getEmotionsByDate, deleteEmotionEntry } = useEmotions();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [selectedDate]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const fetchedEntries = await getEmotionsByDate(dateString);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Error fetching emotion entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    
    try {
      await deleteEmotionEntry(entryToDelete);
      setEntries(entries.filter(entry => entry.id !== entryToDelete));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Error deleting emotion entry:', error);
    }
  };

  const confirmDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-background">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border shadow mx-auto"
        />
      </div>

      <div className="py-2">
        <h3 className="text-lg font-medium">
          Emotions for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No emotions tracked for this date</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => window.history.pushState(null, '', '/emotions')}
            >
              Track a new emotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
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
                    <CardTitle className="text-lg">{entry.emotionName}</CardTitle>
                  </div>
                  <Badge variant={
                    entry.categoryId === 'positive' ? 'default' : 
                    entry.categoryId === 'negative' ? 'destructive' : 
                    'secondary'
                  }>
                    {entry.categoryId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Intensity</span>
                    <span className="text-sm font-medium">{entry.intensity}/10</span>
                  </div>
                  <Progress value={entry.intensity * 10} className="h-2" />
                </div>
                
                {entry.notes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  </div>
                )}
                
                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Triggers</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.triggers.map((trigger, idx) => (
                        <Badge variant="outline" key={idx}>{trigger}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {entry.copingMechanisms && entry.copingMechanisms.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Coping Strategies</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.copingMechanisms.map((strategy, idx) => (
                        <Badge variant="outline" key={idx}>{strategy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    <CalendarIcon size={12} className="inline mr-1" /> 
                    {format(new Date(entry.date), 'h:mm a')}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => confirmDelete(entry.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this emotion entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmotionHistoryTab;