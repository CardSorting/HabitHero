// EmotionHistoryTab - UI component for displaying history of tracked emotions
// This component shows a list of emotions tracked over time

import React, { useState } from 'react';
import { useEmotions } from '../../context/EmotionsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';

const EmotionHistoryTab: React.FC = () => {
  const { 
    trackedEmotions,
    deleteEmotionEntry,
    isLoading
  } = useEmotions();
  
  const [selectedEmotion, setSelectedEmotion] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Sort emotions by date, most recent first
  const sortedEmotions = [...trackedEmotions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Group emotions by date
  const groupedEmotions = sortedEmotions.reduce((groups: Record<string, any[]>, emotion) => {
    const date = format(new Date(emotion.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(emotion);
    return groups;
  }, {});
  
  // Handle view details
  const handleViewDetails = (emotion: any) => {
    setSelectedEmotion(emotion);
    setIsDialogOpen(true);
  };
  
  // Handle delete emotion
  const handleDeleteEmotion = async () => {
    if (!selectedEmotion || !selectedEmotion.id) return;
    
    try {
      await deleteEmotionEntry(selectedEmotion.id);
      setIsDialogOpen(false);
      setSelectedEmotion(null);
    } catch (error) {
      console.error('Error deleting emotion:', error);
    }
  };
  
  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive':
        return '#4ade80';
      case 'negative':
        return '#ef4444';
      case 'neutral':
        return '#f59e0b';
      default:
        return '#888888';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Emotion History</h2>
        <p className="text-muted-foreground">
          View and manage your tracked emotions
        </p>
      </div>
      
      {Object.keys(groupedEmotions).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                You haven't tracked any emotions yet.
              </p>
              <Button>Track Your First Emotion</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-260px)]">
          {Object.entries(groupedEmotions).map(([date, emotions]) => (
            <Card key={date} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {emotions.length} emotion{emotions.length !== 1 ? 's' : ''} tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotions.map(emotion => (
                    <div 
                      key={emotion.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewDetails(emotion)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
                          style={{ backgroundColor: getCategoryColor(emotion.categoryId) }}
                        >
                          <span className="text-xs font-bold">{emotion.intensity}</span>
                        </div>
                        <div>
                          <div className="font-medium">{emotion.emotionName}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(emotion.date), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          color: getCategoryColor(emotion.categoryId),
                          borderColor: getCategoryColor(emotion.categoryId)
                        }}
                      >
                        {emotion.categoryId.charAt(0).toUpperCase() + emotion.categoryId.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmotion?.emotionName}
            </DialogTitle>
            <DialogDescription>
              {selectedEmotion && format(new Date(selectedEmotion.date), 'EEEE, MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmotion && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
                  style={{ backgroundColor: getCategoryColor(selectedEmotion.categoryId) }}
                >
                  <span className="font-bold">{selectedEmotion.intensity}</span>
                </div>
                <div>
                  <div className="text-lg font-medium">{selectedEmotion.emotionName}</div>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      color: getCategoryColor(selectedEmotion.categoryId),
                      borderColor: getCategoryColor(selectedEmotion.categoryId)
                    }}
                  >
                    {selectedEmotion.categoryId.charAt(0).toUpperCase() + selectedEmotion.categoryId.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {selectedEmotion.notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-1">Notes:</h4>
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {selectedEmotion.notes}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEmotion}
                  disabled={isLoading}
                >
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmotionHistoryTab;