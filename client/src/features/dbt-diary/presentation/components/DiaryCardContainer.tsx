// DiaryCardContainer Component - Main container component for DBT diary card
// Acts as the composition root for the diary card feature

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import DiaryCardTabs from './DiaryCardTabs';
import { DiaryProvider, useDiary } from '../context/DiaryContext';
import { DateString } from '../../domain/models';

interface DiaryCardProps {
  userId: number;
}

// Inner component that uses the diary context
const DiaryCardContent: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const { toast } = useToast();
  
  // Use the diary context
  const { 
    diaryData, 
    isLoading, 
    saveChanges, 
    hasPendingChanges,
    loadInitialData,
    loadDay,
    serverData
  } = useDiary();
  
  // Load initial cached data when component mounts
  useEffect(() => {
    loadInitialData();
    
    // Load only today's data on first render
    const today = format(new Date(), 'yyyy-MM-dd') as DateString;
    
    // Only load data for today, not for future dates
    const currentDate = new Date();
    const selectedDateObj = new Date(today);
    
    if (selectedDateObj <= currentDate) {
      loadDay(today);
    }
  }, [loadInitialData, loadDay]);
  
  // Generate dates for the week (Saturday to Friday)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });
  
  // Generate day headers
  const dayHeaders = viewMode === 'week' 
    ? weekDates.map(date => ({
        full: format(date, "EEEE"),
        abbr: format(date, "EEE"),
        date: format(date, "yyyy-MM-dd") as DateString
      }))
    : [{ // Single day mode shows only selected date
        full: format(selectedDate, "EEEE"),
        abbr: format(selectedDate, "EEE"),
        date: format(selectedDate, "yyyy-MM-dd") as DateString
      }];
  
  const weekRangeText = `${format(weekDates[0], "MMM d")} - ${format(weekDates[6], "MMM d, yyyy")}`;
  
  // Only load data for the selected date if it's not a future date
  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd") as DateString;
    
    // Only load data for past or current dates, not future dates
    const currentDate = new Date();
    const selectedDateObj = new Date(dateStr);
    
    // Check if the selected date is in the past or today
    if (selectedDateObj <= currentDate) {
      // Check if we already have data for this date
      if (!serverData[dateStr]) {
        loadDay(dateStr);
      }
    }
  }, [selectedDate, loadDay, serverData]);
  
  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentWeekStart(prevWeekStart => addDays(prevWeekStart, -7));
  };
  
  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentWeekStart(prevWeekStart => addDays(prevWeekStart, 7));
  };
  
  // Toggle between day and week view
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'day' ? 'week' : 'day');
    
    // If switching to week view, only load data for past and present dates
    if (viewMode === 'day') {
      const currentDate = new Date();
      
      weekDates.forEach(date => {
        // Only load data for non-future dates
        if (date <= currentDate) {
          const dateStr = format(date, "yyyy-MM-dd") as DateString;
          
          // Only load if not already loaded
          if (!serverData[dateStr]) {
            loadDay(dateStr);
          }
        }
      });
    }
  };
  
  // Handle date selection from calendar
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // If changing to a date outside current week, update the week
      const startOfSelectedWeek = startOfWeek(date, { weekStartsOn: 6 });
      if (!isSameDay(startOfSelectedWeek, currentWeekStart)) {
        setCurrentWeekStart(startOfSelectedWeek);
      }
    }
  };
  
  // Handle saving all changes
  const handleSaveChanges = async () => {
    try {
      await saveChanges();
      toast({
        title: "Success",
        description: "Your diary entries have been saved to the database.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your entries. Your changes are still stored locally.",
        variant: "destructive"
      });
    }
  };
  
  // Load data for all days in current view
  const handleLoadData = () => {
    // Get all dates to load based on view mode
    const datesToLoad = viewMode === 'day' 
      ? [format(selectedDate, "yyyy-MM-dd") as DateString]
      : weekDates.map(date => format(date, "yyyy-MM-dd") as DateString);
    
    // Load each date
    datesToLoad.forEach(date => {
      loadDay(date);
    });
    
    toast({
      title: "Data Loading",
      description: `Loading diary data for ${viewMode === 'day' ? 'selected day' : 'week'}.`,
      variant: "default"
    });
  };
  
  // Calculate completion rate for selected day or week
  const calculateCompletion = (): number => {
    if (viewMode === 'day') {
      // Focus on completion for selected day only
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const totalFields = 5; // 5 categories for a single day
      let filledFields = 0;
      
      // Check sleep entry
      if (diaryData.sleep[dateStr] && Object.values(diaryData.sleep[dateStr]).some(val => val)) {
        filledFields++;
      }
      
      // Check emotion entries
      if (diaryData.emotions[dateStr] && Object.keys(diaryData.emotions[dateStr]).length > 0) {
        filledFields++;
      }
      
      // Check urge entries
      if (diaryData.urges[dateStr] && Object.keys(diaryData.urges[dateStr]).length > 0) {
        filledFields++;
      }
      
      // Check skills entries for this day
      let hasSkillsForDay = false;
      for (const category in diaryData.skills) {
        for (const skill in diaryData.skills[category]) {
          if (diaryData.skills[category][skill][dateStr]) {
            hasSkillsForDay = true;
            break;
          }
        }
        if (hasSkillsForDay) break;
      }
      if (hasSkillsForDay) {
        filledFields++;
      }
      
      // Check event entry
      if (diaryData.events[dateStr]) {
        filledFields++;
      }
      
      return (filledFields / totalFields) * 100;
    } else {
      // Calculate average completion across the week
      return weekDates
        .map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const totalFields = 5;
          let filledFields = 0;
          
          if (diaryData.sleep[dateStr] && Object.values(diaryData.sleep[dateStr]).some(val => val)) {
            filledFields++;
          }
          if (diaryData.emotions[dateStr] && Object.keys(diaryData.emotions[dateStr]).length > 0) {
            filledFields++;
          }
          if (diaryData.urges[dateStr] && Object.keys(diaryData.urges[dateStr]).length > 0) {
            filledFields++;
          }
          
          let hasSkillsForDay = false;
          for (const category in diaryData.skills) {
            for (const skill in diaryData.skills[category]) {
              if (diaryData.skills[category][skill][dateStr]) {
                hasSkillsForDay = true;
                break;
              }
            }
            if (hasSkillsForDay) break;
          }
          if (hasSkillsForDay) {
            filledFields++;
          }
          
          if (diaryData.events[dateStr]) {
            filledFields++;
          }
          
          return filledFields / totalFields;
        })
        .reduce((sum, completionRate) => sum + completionRate, 0) / 7 * 100;
    }
  };
  
  const completionRate = calculateCompletion();
  
  // Function to get color based on completion rate
  function getColorByCompletion(rate: number): string {
    if (rate < 30) return "text-red-500";
    if (rate < 70) return "text-yellow-500";
    return "text-green-500";
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 pt-8 pb-20">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diary Card</h1>
          <p className="text-muted-foreground">Track your emotions, behaviors and skills practice</p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0 gap-2 flex-wrap justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Select Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            onClick={toggleViewMode}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{viewMode === 'day' ? 'Week View' : 'Day View'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            onClick={handleLoadData}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Load Data</span>
          </Button>
          
          <Button
            variant={hasPendingChanges ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1"
            onClick={handleSaveChanges}
            disabled={!hasPendingChanges || isLoading}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Changes</span>
          </Button>
        </div>
      </motion.header>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handlePrevWeek}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-medium">{weekRangeText}</h2>
          <div className="text-xs text-muted-foreground">
            {viewMode === 'day' ? format(selectedDate, "MMMM d, yyyy") : 'Week View'}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleNextWeek}
          className="gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <h3 className="text-lg font-medium">Completion Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'day' 
                    ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                    : 'Weekly average'
                  }
                </p>
                {hasPendingChanges && (
                  <Badge variant="outline" className="mt-1">
                    Unsaved changes
                  </Badge>
                )}
                {isLoading && (
                  <Badge variant="outline" className="mt-1 ml-2">
                    Loading...
                  </Badge>
                )}
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-2xl font-bold ${getColorByCompletion(completionRate)}`}>
                    {Math.round(completionRate)}%
                  </span>
                  <Badge 
                    variant="outline" 
                    className="ml-2"
                  >
                    {completionRate < 30 ? 'Needs attention' : 
                     completionRate < 70 ? 'Making progress' : 'Great job!'}
                  </Badge>
                </div>
                <ProgressRing 
                  value={completionRate} 
                  size={60} 
                  strokeWidth={6}
                  className={getColorByCompletion(completionRate)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <DiaryCardTabs
          dayHeaders={dayHeaders}
          selectedDate={selectedDate}
          viewMode={viewMode}
        />
      </motion.main>
      
      {/* Floating action buttons for mobile */}
      <motion.div 
        className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Load data button */}
        <Button 
          onClick={handleLoadData}
          size="icon"
          className="rounded-full shadow-lg h-14 w-14"
          disabled={isLoading}
          variant="outline"
        >
          <Download className="h-6 w-6" />
        </Button>
        
        {/* Save changes button, only shown when there are pending changes */}
        {hasPendingChanges && (
          <Button 
            onClick={handleSaveChanges}
            size="icon"
            className="rounded-full shadow-lg h-14 w-14"
            disabled={isLoading}
          >
            <Save className="h-6 w-6" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};

// Outer component that provides the diary context
const DiaryCardContainer: React.FC<DiaryCardProps> = ({ userId }) => {
  return (
    <DiaryProvider userId={userId}>
      <DiaryCardContent />
    </DiaryProvider>
  );
};

export default DiaryCardContainer;