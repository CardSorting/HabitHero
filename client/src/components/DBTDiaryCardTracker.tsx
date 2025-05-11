import React, { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
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

const DBTDiaryCardTracker: React.FC<DBTDiaryCardTrackerProps> = ({ weekDates, currentWeekStart }) => {
  const [diaryData, setDiaryData] = useState<DiaryCardData>(defaultDiaryCardData);
  
  // Create day abbreviations for the table headers
  const dayHeaders = weekDates.map(date => ({
    full: format(date, "EEEE"),
    abbr: format(date, "EEE"),
    date: format(date, "yyyy-MM-dd")
  }));
  
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
                <div className="text-xs text-muted-foreground ml-auto">Record daily to track patterns</div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  {/* Hours slept section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Number of hours slept</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {dayHeaders.map(day => {
                        const today = new Date();
                        const isToday = isSameDay(new Date(day.date), today);
                        return (
                          <div 
                            key={day.date} 
                            className={cn(
                              "flex flex-col items-center",
                              isToday ? "bg-primary/5 rounded-lg p-1" : ""
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
                  </div>
                  
                  {/* Sleep issues section with Apple Health-inspired cards */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Sleep Issues</h4>
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
                  </div>
                  
                  {/* Medication section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-primary">Taking medication as prescribed</h4>
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
                  Track intensity and whether action was taken
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded font-medium">Important</span>
                    <span className="ml-2">If you're having thoughts of harming yourself, please reach out for help. Call a crisis line or speak with your therapist.</span>
                  </div>
                  
                  {/* Urges cards */}
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
      </TabsContent>
      
      {/* Events Tab */}
      <TabsContent value="events" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">EVENTS since yesterday that influenced my emotions</h3>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayHeaders.map(day => (
                  <Card key={day.date}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{day.full}</h4>
                      <Textarea 
                        placeholder="Describe events that affected your emotions..."
                        className="min-h-[120px]"
                        value={diaryData.events[day.date] || ''}
                        onChange={(e) => handleEventChange(day.date, e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default DBTDiaryCardTracker;