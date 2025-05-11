import React, { useState, useEffect } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DBTDiaryCardTrackerProps {
  weekDates: Date[];
  currentWeekStart: Date;
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

type DiaryCardData = {
  sleep: {
    [date: string]: {
      hoursSlept: string;
      troubleFalling: string;
      troubleStaying: string;
      troubleWaking: string;
    }
  };
  medication: {
    [date: string]: string;
  };
  emotions: {
    [date: string]: {
      [emotion: string]: string;
    }
  };
  urges: {
    [date: string]: {
      [urge: string]: {
        level: string;
        action: string;
      }
    }
  };
  events: {
    [date: string]: string;
  };
  skills: {
    [category: string]: {
      [skill: string]: {
        [date: string]: boolean;
      }
    }
  };
};

const defaultDiaryCardData: DiaryCardData = {
  sleep: {},
  medication: {},
  emotions: {},
  urges: {},
  events: {},
  skills: {
    mindfulness: {},
    distressTolerance: {},
    emotionRegulation: {},
    interpersonalEffectiveness: {}
  }
};

const DBTDiaryCardTracker: React.FC<DBTDiaryCardTrackerProps> = ({ 
  weekDates, 
  currentWeekStart,
  selectedDate,
  viewMode
}) => {
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  
  // Create headers based on view mode
  const dayHeaders = viewMode === 'week' 
    ? weekDates.map(date => ({
        full: format(date, "EEEE"),
        abbr: format(date, "EEE"),
        date: format(date, "yyyy-MM-dd")
      }))
    : [{ // Single day mode shows only selected date
        full: format(selectedDate, "EEEE"),
        abbr: format(selectedDate, "EEE"),
        date: format(selectedDate, "yyyy-MM-dd")
      }];
  
  // Save diary data to local storage when it changes
  useEffect(() => {
    const weekKey = format(currentWeekStart, "yyyy-MM-dd");
    localStorage.setItem(`dbt-diary-${weekKey}`, JSON.stringify(diaryData));
  }, [diaryData, currentWeekStart]);
  
  // Load diary data from local storage when the week changes
  useEffect(() => {
    const weekKey = format(currentWeekStart, "yyyy-MM-dd");
    const savedData = localStorage.getItem(`dbt-diary-${weekKey}`);
    
    if (savedData) {
      setDiaryData(JSON.parse(savedData));
    } else {
      setDiaryData(defaultDiaryCardData);
    }
  }, [currentWeekStart]);
  
  // Handle sleep data changes
  const handleSleepChange = (date: string, field: string, value: string) => {
    setDiaryData(prev => ({
      ...prev,
      sleep: {
        ...prev.sleep,
        [date]: {
          ...prev.sleep[date],
          [field]: value
        }
      }
    }));
  };
  
  // Handle medication data changes
  const handleMedicationChange = (date: string, value: string) => {
    setDiaryData(prev => ({
      ...prev,
      medication: {
        ...prev.medication,
        [date]: value
      }
    }));
  };
  
  // Handle emotion data changes
  const handleEmotionChange = (date: string, emotion: string, value: string) => {
    setDiaryData(prev => ({
      ...prev,
      emotions: {
        ...prev.emotions,
        [date]: {
          ...prev.emotions[date],
          [emotion]: value
        }
      }
    }));
  };
  
  // Handle urge data changes
  const handleUrgeChange = (date: string, urge: string, field: string, value: string) => {
    setDiaryData(prev => ({
      ...prev,
      urges: {
        ...prev.urges,
        [date]: {
          ...prev.urges[date],
          [urge]: {
            ...prev.urges[date]?.[urge],
            [field]: value
          }
        }
      }
    }));
  };
  
  // Handle events data changes
  const handleEventChange = (date: string, value: string) => {
    setDiaryData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [date]: value
      }
    }));
  };
  
  // Handle skill checkboxes
  const handleSkillChange = (category: string, skill: string, date: string, checked: boolean) => {
    setDiaryData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: {
          ...prev.skills[category],
          [skill]: {
            ...prev.skills[category]?.[skill],
            [date]: checked
          }
        }
      }
    }));
  };
  
  const getEmotionValue = (date: string, emotion: string) => {
    return diaryData.emotions[date]?.[emotion] || '';
  };
  
  const getSleepValue = (date: string, field: string) => {
    return diaryData.sleep[date]?.[field] || '';
  };
  
  const getMedicationValue = (date: string) => {
    return diaryData.medication[date] || '';
  };
  
  const getUrgeValue = (date: string, urge: string, field: string) => {
    return diaryData.urges[date]?.[urge]?.[field] || '';
  };
  
  const getSkillChecked = (category: string, skill: string, date: string) => {
    return diaryData.skills[category]?.[skill]?.[date] || false;
  };
  
  // Rating scales options
  const scaleOptions = ['0', '1', '3', '5', '7', '10'];
  const yesNoOptions = ['Yes', 'No'];
  
  return (
    <>
      {/* Sleep Tab */}
      <TabsContent value="sleep" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-primary/10 border-primary">Quality of Sleep</Badge>
                <div className="text-xs text-muted-foreground ml-auto">
                  {viewMode === 'day' 
                    ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                    : 'Record daily to track patterns'
                  }
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  {/* Hours slept section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Number of hours slept</h4>
                    {viewMode === 'day' ? (
                      // Single day view - larger input
                      <div className="flex flex-col items-center p-6 bg-muted/30 rounded-xl mb-4">
                        <div className="text-sm font-medium mb-2 text-muted-foreground">
                          {format(selectedDate, "EEEE, MMMM d")}
                        </div>
                        <Input 
                          type="text" 
                          className="h-14 text-center text-2xl font-medium w-24 mt-2"
                          placeholder="hrs"
                          value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'hoursSlept')}
                          onChange={(e) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'hoursSlept', e.target.value)}
                        />
                        <div className="text-xs text-muted-foreground mt-3">Hours of sleep</div>
                      </div>
                    ) : (
                      // Week view - grid of days
                      <div className="grid grid-cols-7 gap-2">
                        {dayHeaders.map(day => {
                          const today = new Date();
                          const isCurrentDay = isSameDay(new Date(day.date), today);
                          return (
                            <div 
                              key={day.date} 
                              className={cn(
                                "flex flex-col items-center",
                                isCurrentDay ? "bg-primary/5 rounded-lg p-1" : ""
                              )}
                            >
                              <div className="text-xs text-muted-foreground mb-1">{day.abbr}</div>
                              <Input 
                                type="text" 
                                className="h-10 text-center text-lg font-medium"
                                placeholder="hrs"
                                value={getSleepValue(day.date, 'hoursSlept')}
                                onChange={(e) => handleSleepChange(day.date, 'hoursSlept', e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Sleep issues section with Apple Health-inspired cards */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Sleep Issues</h4>
                    {viewMode === 'day' ? (
                      // Day view - vertical stacked cards
                      <div className="space-y-4">
                        {/* Trouble falling asleep */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-base font-medium">Trouble falling asleep</h5>
                              <Select 
                                value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleFalling')}
                                onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleFalling', value)}
                              >
                                <SelectTrigger className="w-24 h-9">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Trouble staying asleep */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-base font-medium">Trouble staying asleep</h5>
                              <Select 
                                value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleStaying')}
                                onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleStaying', value)}
                              >
                                <SelectTrigger className="w-24 h-9">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Trouble waking up */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-base font-medium">Trouble waking up</h5>
                              <Select 
                                value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleWaking')}
                                onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleWaking', value)}
                              >
                                <SelectTrigger className="w-24 h-9">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      // Week view - horizontal grid of cards
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Trouble falling asleep */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-3">
                            <h5 className="text-sm font-medium mb-2">Trouble falling asleep</h5>
                            <div className="grid grid-cols-7 gap-1">
                              {dayHeaders.map(day => (
                                <div key={day.date} className="flex flex-col items-center">
                                  <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                  <Select 
                                    value={getSleepValue(day.date, 'troubleFalling')}
                                    onValueChange={(value) => handleSleepChange(day.date, 'troubleFalling', value)}
                                  >
                                    <SelectTrigger className="h-8 w-full border-dashed">
                                      <SelectValue placeholder="-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {yesNoOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Trouble staying asleep */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-3">
                            <h5 className="text-sm font-medium mb-2">Trouble staying asleep</h5>
                            <div className="grid grid-cols-7 gap-1">
                              {dayHeaders.map(day => (
                                <div key={day.date} className="flex flex-col items-center">
                                  <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                  <Select 
                                    value={getSleepValue(day.date, 'troubleStaying')}
                                    onValueChange={(value) => handleSleepChange(day.date, 'troubleStaying', value)}
                                  >
                                    <SelectTrigger className="h-8 w-full border-dashed">
                                      <SelectValue placeholder="-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {yesNoOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Trouble waking up */}
                        <Card className="rounded-xl overflow-hidden">
                          <CardContent className="p-3">
                            <h5 className="text-sm font-medium mb-2">Trouble waking up</h5>
                            <div className="grid grid-cols-7 gap-1">
                              {dayHeaders.map(day => (
                                <div key={day.date} className="flex flex-col items-center">
                                  <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                  <Select 
                                    value={getSleepValue(day.date, 'troubleWaking')}
                                    onValueChange={(value) => handleSleepChange(day.date, 'troubleWaking', value)}
                                  >
                                    <SelectTrigger className="h-8 w-full border-dashed">
                                      <SelectValue placeholder="-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {yesNoOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  
                  {/* Medication section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Taking medication as prescribed</h4>
                    {viewMode === 'day' ? (
                      // Day view - single medication selector
                      <Card className="rounded-xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-base font-medium">Medication taken as prescribed?</h5>
                            <Select 
                              value={getMedicationValue(format(selectedDate, "yyyy-MM-dd"))}
                              onValueChange={(value) => handleMedicationChange(format(selectedDate, "yyyy-MM-dd"), value)}
                            >
                              <SelectTrigger 
                                className={cn(
                                  "w-24 h-9",
                                  getMedicationValue(format(selectedDate, "yyyy-MM-dd")) === 'Yes' 
                                    ? "bg-success/10 border-success text-success" 
                                    : getMedicationValue(format(selectedDate, "yyyy-MM-dd")) === 'No'
                                      ? "bg-destructive/10 border-destructive text-destructive"
                                      : ""
                                )}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {yesNoOptions.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      // Week view - grid
                      <div className="grid grid-cols-7 gap-2">
                        {dayHeaders.map(day => {
                          const medicationValue = getMedicationValue(day.date);
                          const selected = medicationValue !== '';
                          return (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{day.abbr}</div>
                              <Select 
                                value={medicationValue}
                                onValueChange={(value) => handleMedicationChange(day.date, value)}
                              >
                                <SelectTrigger 
                                  className={cn(
                                    "h-10 w-full text-center",
                                    selected && medicationValue === 'Yes' ? "bg-success/10 border-success text-success" : 
                                    selected && medicationValue === 'No' ? "bg-destructive/10 border-destructive text-destructive" : 
                                    ""
                                  )}
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
      
      {/* Emotions Tab */}
      <TabsContent value="emotions" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-secondary/10 border-secondary">Feelings and Emotions</Badge>
                <div className="text-xs text-muted-foreground ml-auto">
                  Scale: 0=none, 1=little, 3=some, 5=moderate, 7=strong, 10=very strong
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  {viewMode === 'day' ? (
                    // Day view - more focus on the selected day
                    <>
                      <div className="text-sm text-center text-muted-foreground mb-4">
                        {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
                      </div>
                      
                      {/* Positive emotions section */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-green-500 flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          Positive Emotions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {['Joy / Happiness', 'Peace / Contentment'].map(emotion => {
                            const dateStr = format(selectedDate, "yyyy-MM-dd");
                            const value = getEmotionValue(dateStr, emotion);
                            const numValue = parseInt(value || '0');
                            return (
                              <Card key={emotion} className={cn(
                                "rounded-xl overflow-hidden border",
                                numValue >= 7 ? "border-success bg-success/5" : 
                                numValue >= 3 ? "border-success/50" : ""
                              )}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-base font-medium">{emotion}</h5>
                                    <div className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded-full",
                                      numValue >= 7 ? "bg-success text-white" : 
                                      numValue >= 3 ? "bg-success/20 text-success" : 
                                      "bg-muted text-muted-foreground"
                                    )}>
                                      {value || '0'}
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs text-muted-foreground">None</span>
                                      <span className="text-xs text-muted-foreground">Very Strong</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="10" 
                                      step="1" 
                                      value={numValue} 
                                      onChange={(e) => handleEmotionChange(dateStr, emotion, e.target.value)}
                                      className="w-full accent-success"
                                    />
                                    <div className="flex justify-between mt-1">
                                      {[0, 1, 3, 5, 7, 10].map(val => (
                                        <div 
                                          key={val} 
                                          className={cn(
                                            "text-xs cursor-pointer px-1",
                                            numValue === val ? "font-bold text-success" : "text-muted-foreground"
                                          )}
                                          onClick={() => handleEmotionChange(dateStr, emotion, val.toString())}
                                        >
                                          {val}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Distressing emotions section */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-destructive flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-destructive mr-2"></span>
                          Distressing Emotions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {['Anxiety', 'Sadness', 'Guilt', 'Anger', 'Fear'].map(emotion => {
                            const dateStr = format(selectedDate, "yyyy-MM-dd");
                            const value = getEmotionValue(dateStr, emotion);
                            const numValue = parseInt(value || '0');
                            return (
                              <Card key={emotion} className={cn(
                                "rounded-xl overflow-hidden border",
                                numValue >= 7 ? "border-destructive bg-destructive/5" : 
                                numValue >= 3 ? "border-destructive/50" : ""
                              )}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-base font-medium">{emotion}</h5>
                                    <div className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded-full",
                                      numValue >= 7 ? "bg-destructive text-white" : 
                                      numValue >= 3 ? "bg-destructive/20 text-destructive" : 
                                      "bg-muted text-muted-foreground"
                                    )}>
                                      {value || '0'}
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs text-muted-foreground">None</span>
                                      <span className="text-xs text-muted-foreground">Very Strong</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="10" 
                                      step="1" 
                                      value={numValue} 
                                      onChange={(e) => handleEmotionChange(dateStr, emotion, e.target.value)}
                                      className="w-full accent-destructive"
                                    />
                                    <div className="flex justify-between mt-1">
                                      {[0, 1, 3, 5, 7, 10].map(val => (
                                        <div 
                                          key={val} 
                                          className={cn(
                                            "text-xs cursor-pointer px-1",
                                            numValue === val ? "font-bold text-destructive" : "text-muted-foreground"
                                          )}
                                          onClick={() => handleEmotionChange(dateStr, emotion, val.toString())}
                                        >
                                          {val}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Week view - grid of days
                    <>
                      {/* Positive emotions section */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-green-500">Positive Emotions</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {['Joy / Happiness', 'Peace / Contentment'].map(emotion => (
                            <Card key={emotion} className="rounded-xl overflow-hidden">
                              <CardContent className="p-3">
                                <h5 className="text-sm font-medium mb-2">{emotion}</h5>
                                <div className="grid grid-cols-7 gap-1">
                                  {dayHeaders.map(day => {
                                    const value = getEmotionValue(day.date, emotion);
                                    const numValue = parseInt(value || '0');
                                    return (
                                      <div key={day.date} className="flex flex-col items-center">
                                        <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                        <Select 
                                          value={value}
                                          onValueChange={(value) => handleEmotionChange(day.date, emotion, value)}
                                        >
                                          <SelectTrigger 
                                            className={cn(
                                              "h-9 w-full text-center",
                                              numValue >= 7 ? "bg-success/20 border-success text-success" : 
                                              numValue >= 3 ? "bg-success/10 border-success text-success" : ""
                                            )}
                                          >
                                            <SelectValue placeholder="-" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {scaleOptions.map(option => (
                                              <SelectItem key={option} value={option}>{option}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* Distressing emotions section */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-destructive">Distressing Emotions</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {['Anxiety', 'Sadness', 'Guilt', 'Anger', 'Fear'].map(emotion => (
                            <Card key={emotion} className="rounded-xl overflow-hidden">
                              <CardContent className="p-3">
                                <h5 className="text-sm font-medium mb-2">{emotion}</h5>
                                <div className="grid grid-cols-7 gap-1">
                                  {dayHeaders.map(day => {
                                    const value = getEmotionValue(day.date, emotion);
                                    const numValue = parseInt(value || '0');
                                    return (
                                      <div key={day.date} className="flex flex-col items-center">
                                        <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                        <Select 
                                          value={value}
                                          onValueChange={(value) => handleEmotionChange(day.date, emotion, value)}
                                        >
                                          <SelectTrigger 
                                            className={cn(
                                              "h-9 w-full text-center",
                                              numValue >= 7 ? "bg-destructive/20 border-destructive text-destructive" : 
                                              numValue >= 3 ? "bg-destructive/10 border-destructive text-destructive" : ""
                                            )}
                                          >
                                            <SelectValue placeholder="-" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {scaleOptions.map(option => (
                                              <SelectItem key={option} value={option}>{option}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
      
      {/* Urges Tab */}
      <TabsContent value="urges" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-destructive/10 border-destructive">Urges and Thoughts</Badge>
                <div className="text-xs text-muted-foreground ml-auto">
                  {viewMode === 'day' 
                    ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                    : 'Track intensity and whether action was taken'
                  }
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground p-3 bg-destructive/5 border border-destructive/20 rounded-lg flex items-start">
                    <div className="p-1 mr-3 bg-destructive/20 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-destructive">Important:</span>
                      <span className="ml-1 block sm:inline-block mt-1 sm:mt-0">If you're having thoughts of harming yourself, please reach out for help. Call a crisis line or speak with your therapist.</span>
                    </div>
                  </div>
                  
                  {viewMode === 'day' ? (
                    // Day view - more focus on the selected day
                    <>
                      <div className="text-sm text-center text-muted-foreground mb-4">
                        {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
                      </div>
                      
                      {/* Urge cards with sliders for day view */}
                      <div className="space-y-6">
                        {['Self-Harm', 'Suicide', 'Other'].map(urge => {
                          const dateStr = format(selectedDate, "yyyy-MM-dd");
                          const levelValue = getUrgeValue(dateStr, urge, 'level');
                          const levelNumValue = parseInt(levelValue || '0');
                          const actionValue = getUrgeValue(dateStr, urge, 'action');
                          
                          return (
                            <motion.div 
                              key={urge}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: ['Self-Harm', 'Suicide', 'Other'].indexOf(urge) * 0.1 }}
                            >
                              <Card className={cn(
                                "rounded-xl overflow-hidden border transition-all",
                                levelNumValue >= 7 ? "border-destructive bg-destructive/5" : 
                                levelNumValue >= 3 ? "border-destructive/50" : ""
                              )}>
                                <CardContent className="p-4">
                                  <h4 className="text-base font-medium mb-3 flex items-center justify-between">
                                    <span className="flex items-center">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: levelNumValue > 0 ? 1 : 0 }}
                                        className={cn(
                                          "mr-2 w-3 h-3 rounded-full",
                                          levelNumValue >= 7 ? "bg-destructive" : 
                                          levelNumValue >= 3 ? "bg-destructive/70" : 
                                          "bg-muted"
                                        )}
                                      />
                                      <span>Thoughts about {urge}</span>
                                    </span>
                                    <div className={cn(
                                      "flex items-center justify-center min-w-8 h-8 rounded-full",
                                      levelNumValue >= 7 ? "bg-destructive text-white" : 
                                      levelNumValue >= 3 ? "bg-destructive/20 text-destructive" : 
                                      "bg-muted text-muted-foreground"
                                    )}>
                                      {levelValue || '0'}
                                    </div>
                                  </h4>
                                  
                                  {/* Intensity tracking with slider */}
                                  <div className="mb-6">
                                    <h5 className="text-sm font-medium mb-2 text-muted-foreground">Intensity Level</h5>
                                    <div className="mt-1">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-muted-foreground">None</span>
                                        <span className="text-xs text-muted-foreground">Very Strong</span>
                                      </div>
                                      <input 
                                        type="range" 
                                        min="0" 
                                        max="10" 
                                        step="1" 
                                        value={levelNumValue} 
                                        onChange={(e) => handleUrgeChange(dateStr, urge, 'level', e.target.value)}
                                        className="w-full accent-destructive"
                                      />
                                      <div className="flex justify-between mt-1">
                                        {[0, 1, 3, 5, 7, 10].map(val => (
                                          <div 
                                            key={val} 
                                            className={cn(
                                              "text-xs cursor-pointer px-1",
                                              levelNumValue === val ? "font-bold text-destructive" : "text-muted-foreground"
                                            )}
                                            onClick={() => handleUrgeChange(dateStr, urge, 'level', val.toString())}
                                          >
                                            {val}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action taken with radio buttons */}
                                  <div>
                                    <h5 className="text-sm font-medium mb-3 text-muted-foreground">Did you act on this urge?</h5>
                                    <div className="flex gap-4">
                                      <div 
                                        className={cn(
                                          "flex-1 cursor-pointer py-2 px-4 rounded-md text-center border transition-colors",
                                          actionValue === 'Yes' 
                                            ? "bg-destructive/10 border-destructive text-destructive" 
                                            : "bg-muted/20 border-muted hover:bg-muted/30"
                                        )}
                                        onClick={() => handleUrgeChange(dateStr, urge, 'action', 'Yes')}
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <div className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                            actionValue === 'Yes' ? "border-destructive" : "border-muted-foreground"
                                          )}>
                                            {actionValue === 'Yes' && (
                                              <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 rounded-full bg-destructive"
                                              />
                                            )}
                                          </div>
                                          <span>Yes</span>
                                        </div>
                                      </div>
                                      <div 
                                        className={cn(
                                          "flex-1 cursor-pointer py-2 px-4 rounded-md text-center border transition-colors",
                                          actionValue === 'No' 
                                            ? "bg-success/10 border-success text-success" 
                                            : "bg-muted/20 border-muted hover:bg-muted/30"
                                        )}
                                        onClick={() => handleUrgeChange(dateStr, urge, 'action', 'No')}
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <div className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                            actionValue === 'No' ? "border-success" : "border-muted-foreground"
                                          )}>
                                            {actionValue === 'No' && (
                                              <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 rounded-full bg-success"
                                              />
                                            )}
                                          </div>
                                          <span>No</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Safety reminder for suicide urge */}
                                  {urge === 'Suicide' && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-4 bg-muted p-3 rounded-lg text-sm"
                                    >
                                      <p className="font-medium mb-1 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        Crisis Resources
                                      </p>
                                      <p className="text-muted-foreground">If in crisis, call 988 (US) for the Suicide & Crisis Lifeline or text HOME to 741741 for Crisis Text Line.</p>
                                    </motion.div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    // Week view - grid of days
                    <div className="grid grid-cols-1 gap-6">
                      {['Self-Harm', 'Suicide', 'Other'].map(urge => (
                        <Card key={urge} className="rounded-xl overflow-hidden">
                          <CardContent className="p-4">
                            <h4 className="text-base font-medium mb-3 flex items-center justify-between">
                              <span>Thoughts about {urge}</span>
                              <Badge variant="outline" className="font-normal">
                                0=none, 10=very strong
                              </Badge>
                            </h4>
                            
                            {/* Intensity tracking */}
                            <div className="mb-6">
                              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Intensity Level</h5>
                              <div className="grid grid-cols-7 gap-2">
                                {dayHeaders.map(day => {
                                  const value = getUrgeValue(day.date, urge, 'level');
                                  const numValue = parseInt(value || '0');
                                  return (
                                    <div key={`${day.date}-level`} className="flex flex-col items-center">
                                      <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "EEE")}</div>
                                      <Select 
                                        value={value}
                                        onValueChange={(value) => handleUrgeChange(day.date, urge, 'level', value)}
                                      >
                                        <SelectTrigger 
                                          className={cn(
                                            "h-10 w-full text-center",
                                            numValue >= 7 ? "bg-destructive/20 border-destructive text-destructive font-medium" : 
                                            numValue >= 3 ? "bg-amber-500/20 border-amber-500 text-amber-700 font-medium" : 
                                            numValue > 0 ? "bg-amber-300/20 border-amber-300 text-amber-600" : ""
                                          )}
                                        >
                                          <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {scaleOptions.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Action taken tracking */}
                            <div>
                              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Action Taken?</h5>
                              <div className="grid grid-cols-7 gap-2">
                                {dayHeaders.map(day => {
                                  const value = getUrgeValue(day.date, urge, 'action');
                                  return (
                                    <div key={`${day.date}-action`} className="flex flex-col items-center">
                                      <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                                      <Select 
                                        value={value}
                                        onValueChange={(value) => handleUrgeChange(day.date, urge, 'action', value)}
                                      >
                                        <SelectTrigger 
                                          className={cn(
                                            "h-10 w-full text-center",
                                            value === 'Yes' ? "bg-destructive/20 border-destructive text-destructive font-medium" : 
                                            value === 'No' ? "bg-success/10 border-success text-success font-medium" : ""
                                          )}
                                        >
                                          <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {yesNoOptions.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Safety reminder */}
                            {urge === 'Suicide' && (
                              <div className="mt-4 bg-muted p-3 rounded-lg text-sm">
                                <p className="font-medium mb-1">Crisis Resources</p>
                                <p className="text-muted-foreground">If in crisis, call 988 (US) for the Suicide & Crisis Lifeline or text HOME to 741741 for Crisis Text Line.</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
      
      {/* Skills Tab */}
      <TabsContent value="skills" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">DBT Skills Used</h3>
            <div className="text-sm text-muted-foreground mb-4">
              Place a checkmark on any skills you used the previous day.
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-8">
                {/* Mindfulness Skills */}
                <div>
                  <h4 className="text-base font-medium mb-2 text-violet-700 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-violet-500 mr-2"></span>
                    MINDFULNESS SKILLS
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Skill</TableHead>
                        {dayHeaders.map(day => (
                          <TableHead key={day.date} className="px-1 text-center">
                            <div className="font-medium">{day.abbr}</div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['Wise Mind', 'Observe: just notice', 'Describe: put words on', 'Participate', 'Non-judgmental stance', 'One-mindfully: in the moment', 'Effectiveness: focus on what works'].map(skill => (
                        <TableRow key={skill}>
                          <TableCell className="font-medium">{skill}</TableCell>
                          {dayHeaders.map(day => (
                            <TableCell key={day.date} className="text-center">
                              <Checkbox 
                                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                checked={getSkillChecked('mindfulness', skill, day.date)}
                                onCheckedChange={(checked) => handleSkillChange('mindfulness', skill, day.date, checked as boolean)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                  {/* Mindfulness Skills */}
                  <div>
                    <h4 className="text-base font-medium mb-2">MINDFULNESS SKILLS</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Skill</TableHead>
                          {dayHeaders.map(day => (
                            <TableHead key={day.date} className="px-1 text-center">
                              <div className="font-medium">{day.abbr}</div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {['Wise Mind', 'Observe: just notice', 'Describe: put words on', 'Participate', 'Non-judgmental stance', 'One-mindfully: in the moment', 'Effectiveness: focus on what works'].map(skill => (
                          <TableRow key={skill}>
                            <TableCell className="font-medium">{skill}</TableCell>
                            {dayHeaders.map(day => (
                              <TableCell key={day.date} className="text-center">
                                <Checkbox 
                                  checked={getSkillChecked('mindfulness', skill, day.date)}
                                  onCheckedChange={(checked) => handleSkillChange('mindfulness', skill, day.date, checked as boolean)}
                                />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Distress Tolerance Skills */}
                <div>
                  <h4 className="text-base font-medium mb-2">DISTRESS TOLERANCE SKILLS</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Skill</TableHead>
                        {dayHeaders.map(day => (
                          <TableHead key={day.date} className="px-1 text-center">
                            <div className="font-medium">{day.abbr}</div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['Distract', 'Self-Soothe', 'Improve the moment', 'Pros and cons', 'Radical acceptance'].map(skill => (
                        <TableRow key={skill}>
                          <TableCell className="font-medium">{skill}</TableCell>
                          {dayHeaders.map(day => (
                            <TableCell key={day.date} className="text-center">
                              <Checkbox 
                                checked={getSkillChecked('distressTolerance', skill, day.date)}
                                onCheckedChange={(checked) => handleSkillChange('distressTolerance', skill, day.date, checked as boolean)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Emotion Regulation Skills */}
                <div>
                  <h4 className="text-base font-medium mb-2">EMOTION REGULATION SKILLS</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Skill</TableHead>
                        {dayHeaders.map(day => (
                          <TableHead key={day.date} className="px-1 text-center">
                            <div className="font-medium">{day.abbr}</div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        '"I S E E M M A D"',
                        'Treat Physical Illness, Balanced Sleep, Get Exercise',
                        'Balanced Eating, Build Mastery, Avoid Mood Altering Drugs',
                        'Do something that makes you feel good about yourself',
                        'Build positive experiences',
                        'Opposite-to-Emotion action'
                      ].map(skill => (
                        <TableRow key={skill}>
                          <TableCell className="font-medium">{skill}</TableCell>
                          {dayHeaders.map(day => (
                            <TableCell key={day.date} className="text-center">
                              <Checkbox 
                                checked={getSkillChecked('emotionRegulation', skill, day.date)}
                                onCheckedChange={(checked) => handleSkillChange('emotionRegulation', skill, day.date, checked as boolean)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Interpersonal Effectiveness Skills */}
                <div>
                  <h4 className="text-base font-medium mb-2">INTERPERSONAL EFFECTIVENESS SKILLS</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Skill</TableHead>
                        {dayHeaders.map(day => (
                          <TableHead key={day.date} className="px-1 text-center">
                            <div className="font-medium">{day.abbr}</div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        'D E A R M A N',
                        'Describe, Express, Assert, Reinforce, Stay Mindful',
                        'Appear Confident, Negotiate',
                        'G I V E',
                        'Be Gentle, Act Interested, Be Validating, Use Easy-Going Manner',
                        'F A S T',
                        'Be Fair, No excessive Apologies, Stick to values, Be Truthful'
                      ].map(skill => (
                        <TableRow key={skill}>
                          <TableCell className="font-medium">{skill}</TableCell>
                          {dayHeaders.map(day => (
                            <TableCell key={day.date} className="text-center">
                              <Checkbox 
                                checked={getSkillChecked('interpersonalEffectiveness', skill, day.date)}
                                onCheckedChange={(checked) => handleSkillChange('interpersonalEffectiveness', skill, day.date, checked as boolean)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        </motion.div>
      </TabsContent>
      
      {/* Events Tab */}
      <TabsContent value="events" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-700">Daily Events</Badge>
                <div className="text-xs text-muted-foreground ml-auto">
                  {viewMode === 'day' 
                    ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                    : 'Events that influenced your emotions'
                  }
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                {viewMode === 'day' ? (
                  // Day view - more focused journal-style entry
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="text-sm text-center text-muted-foreground mb-4">
                      {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
                    </div>
                    
                    <div className="bg-muted/30 p-5 rounded-xl">
                      <div className="mb-3 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M16 13H8"/>
                            <path d="M16 17H8"/>
                            <path d="M10 9H8"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium">Events Journal</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Record important events that influenced your emotions today. This helps identify patterns between situations and feelings.
                      </p>
                      
                      <div className="relative">
                        <Textarea 
                          placeholder="Describe events that affected your emotions..."
                          className="min-h-[200px] p-4 text-base border-dashed focus-visible:ring-blue-500"
                          value={diaryData.events[format(selectedDate, "yyyy-MM-dd")] || ''}
                          onChange={(e) => handleEventChange(format(selectedDate, "yyyy-MM-dd"), e.target.value)}
                        />
                        
                        {/* Show a little animation badge when content changes */}
                        {diaryData.events[format(selectedDate, "yyyy-MM-dd")] && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-3 right-3 text-xs py-1 px-2 bg-blue-500/10 text-blue-600 rounded-full"
                          >
                            Entry saved
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Suggestions for meaningful journal entries */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-blue-50 rounded text-blue-600">
                          Tip: Note down specific situations, not just feelings
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-blue-600">
                          Tip: Include both positive and negative experiences
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Week view - grid of entries
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayHeaders.map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "overflow-hidden border transition-all hover:shadow-md",
                            isSameDay(new Date(day.date), selectedDate) && "border-blue-500/50 bg-blue-50/30"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{day.full}</h4>
                              {diaryData.events[day.date] && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                  Entry added
                                </Badge>
                              )}
                            </div>
                            <Textarea 
                              placeholder="Describe events that affected your emotions..."
                              className="min-h-[120px]"
                              value={diaryData.events[day.date] || ''}
                              onChange={(e) => handleEventChange(day.date, e.target.value)}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
    </>
  );
};

export default DBTDiaryCardTracker;